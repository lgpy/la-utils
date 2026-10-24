// scripts/raidRewardExtractor.ts
// Fetches and parses raid reward data from a public Google Sheet
// Usage: bun run scripts/raidRewardExtractor.ts
import { writeFileSync } from "node:fs";
import { Difficulty } from "@/prisma/generated/enums";
import { raidData as raids, raidsSchema } from "@/lib/game-info";
import raidsJson from "@/lib/game-info/raids.json";
import { parse } from "csv-parse/sync";
import * as v from "valibot";

const raidsDataToUpdate = v.parse(raidsSchema, raidsJson);

const SHEET_ID = "1z63hd2RolhcT6UMoSbuWejYi6dxBJ2wiWnz-AUNNEpQ";
const SHEET_GID = "972540646";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

// Boss names come from loa-logs. The encounters.ts file is the source it is
// authored in, and the JSON file is generated from it in the same commit, so
// the JSON is the safer one to fetch and parse.
const BOSS_NAMES_URL =
	"https://raw.githubusercontent.com/snoww/loa-logs/master/src-tauri/meter-data/encounters.json";

// Rows 1-3 hold the title and header rows, data starts at row 4 (index 3)
const FIRST_DATA_ROW = 3;

// Column layout of the sheet:
// A=Tier, B=Content, C=Difficulty, D=min ilvl, E=max ilvl, F=Gate,
// G=Gold, H=Roster-Bound Gold, I=Character-Bound Gold
const COLUMN = {
	content: 1,
	difficulty: 2,
	itemLevel: 3,
	gate: 5,
	gold: 6,
	rosterBoundGold: 7,
	characterBoundGold: 8,
} as const;

type RaidRewardRow = {
	raid: string;
	difficulty: string;
	itemLevel: number;
	gate: string;
	gold: {
		bound: number;
		unbound: number;
	};
};

async function fetchSheetCSV(url: string): Promise<string> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
	return await res.text();
}

function normalizeName(name: string): string {
	return name.replace(/\s+/g, " ").trim();
}

const raidMatch: Record<string, string> = {
	// T4.1 / T4 content on the sheet
	"Shadow Raid: Belgardin": "belgardin",
	"Abyssal Dungeon: Belgardin (KR only)": "belgardin",
	"Abyssal Dungeon: Horizon Cathedral": "horizon-cathedral",
	"Shadow Raid: Serca": "serca",
	"Kazeros Raid: Denouement Final Day": "kazeros",
	"Kazeros Raid: Act 4 Armoche": "armoche",
	"Kazeros Raid: Act 3 Mordum": "mordum",
	"Kazeros Raid: Act 2 Brelshaza": "brelshaza2",
	"Kazeros Raid: Act 1 Aegir": "aegir",
	"Kazeros Raid: Overture Echidna": "echidna",
	"Legion Raid: Thaemine": "thaemine",
	Behemoth: "behemoth",
	// Older naming still used by previous versions of the sheet
	"Act 4: Armoche": "armoche",
	"Denouement: Final Day": "kazeros",
	"Strike Raid (1-4p)": "strike-raid-4p",
	"Strike Raid (8p)": "strike-raid-8p",
	"Act 1: Aegir": "aegir",
	"Act 2: Brelshaza": "brelshaza2",
	"Act 3: Mordum": "mordum",
	Akkan: "akkan",
	Brelshaza: "brel",
	"Ivory  Tower": "voldis",
	"Kakul- Saydon": "kakul",
	Kayangel: "kayangel",
	"Overture: Echidna": "echidna",
	Thaemine: "thaemine",
	Valtan: "valtan",
	Vykas: "vykas",
};

// Difficulty labels used on the sheet that do not match a Difficulty value
const difficultyAliases: Record<string, Record<string, Difficulty>> = {
	"horizon-cathedral": {
		"Level 1": Difficulty.Normal,
		"Level 2": Difficulty.Hard,
		"Level 3": Difficulty.Nightmare,
	},
};

function resolveDifficulty(
	raidKey: string,
	label: string
): Difficulty | undefined {
	const aliased = difficultyAliases[raidKey]?.[label];
	if (aliased) return aliased;
	return (Object.values(Difficulty) as string[]).includes(label)
		? (label as Difficulty)
		: undefined;
}

// Raid names used by loa-logs and the matching key in raids.json
const bossRaidMatch: Record<string, string> = {
	Valtan: "valtan",
	Vykas: "vykas",
	Clown: "kakul",
	Brelshaza: "brel",
	Kayangel: "kayangel",
	Akkan: "akkan",
	"Ivory Tower": "voldis",
	Thaemine: "thaemine",
	Echidna: "echidna",
	Behemoth: "behemoth",
	Aegir: "aegir",
	"Act 2: Brelshaza": "brelshaza2",
	"Act 3: Mordum": "mordum",
	"Act 4: Armoche": "armoche",
	"Final Act: Kazeros": "kazeros",
	Serca: "serca",
	"Horizon Cathedral": "horizon-cathedral",
	Belgardin: "belgardin",
};

type EncounterMap = Record<string, Record<string, string[]>>;

async function fetchEncounters(url: string): Promise<EncounterMap> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch boss names: ${res.status}`);
	return (await res.json()) as EncounterMap;
}

// Copies boss names into gates that already exist in raids.json. Gates that
// only exist in loa-logs are reported and skipped, because adding a gate also
// needs item levels and rewards.
function updateBossNames(encounters: EncounterMap): boolean {
	let didUpdate = false;

	for (const [loaRaid, gates] of Object.entries(encounters)) {
		const raidKey = bossRaidMatch[loaRaid];
		if (!raidKey) continue;
		const raidJson = raidsDataToUpdate[raidKey];
		if (!raidJson) {
			console.warn(`Raid "${loaRaid}" not found in local data`);
			continue;
		}

		for (const [loaGate, bossNames] of Object.entries(gates)) {
			const gateMatch = /G(\d+)$/.exec(loaGate);
			if (!gateMatch) {
				console.warn(`Gate "${loaGate}" has no gate number`);
				continue;
			}
			const gateId = `G${gateMatch[1]}`;
			const gateJson = raidJson.gates[gateId];
			if (!gateJson) {
				console.warn(
					`Gate "${gateId}" for raid "${raidKey}" not found in local data, skipping boss names (loa-logs may list a gate the game removed)`
				);
				continue;
			}

			const unchanged =
				gateJson.bossName.length === bossNames.length &&
				gateJson.bossName.every((name, i) => name === bossNames[i]);
			if (unchanged) continue;

			// loa-logs keeps the original gate numbers, but this app renumbers
			// gates when the game removes one. Existing names are therefore left
			// alone and only empty gates are filled.
			if (gateJson.bossName.length > 0) {
				console.log(
					`Boss names for raid "${raidKey}", gate "${gateId}" differ from loa-logs, keeping local names`
				);
				continue;
			}

			gateJson.bossName = [...bossNames];
			didUpdate = true;
			console.log(`Added boss names for raid "${raidKey}", gate "${gateId}"`);
		}
	}

	return didUpdate;
}

// Matchmaking rows are a game mode, not a Difficulty. They can split the gold
// between bound and unbound, and the app has no Matching difficulty, so they
// are skipped in favour of the Normal rows.
const ignoredDifficultyLabels = new Set(["Matching"]);

function parseRows(rows: string[][]): RaidRewardRow[] {
	const rewards: RaidRewardRow[] = [];
	let raidName = "";
	let difficulty = "";
	let itemLevel = 0;

	for (const row of rows) {
		const content = row[COLUMN.content]?.trim() ?? "";
		const difficultyLabel = row[COLUMN.difficulty]?.trim() ?? "";
		const itemLevelCell = row[COLUMN.itemLevel]?.trim() ?? "";
		const gate = row[COLUMN.gate]?.trim().replaceAll("\n", " ") ?? "";

		if (content) raidName = normalizeName(content);
		if (difficultyLabel) difficulty = normalizeName(difficultyLabel);
		if (itemLevelCell) itemLevel = Number.parseInt(itemLevelCell, 10) || 0;

		if (!gate.startsWith("Gate ")) continue; // Skip Total rows and notes
		if (!raidName || !difficulty) continue;

		const gold = Number.parseInt(row[COLUMN.gold]?.trim() ?? "", 10) || 0;
		const rosterBound =
			Number.parseInt(row[COLUMN.rosterBoundGold]?.trim() ?? "", 10) || 0;
		const characterBound =
			Number.parseInt(row[COLUMN.characterBoundGold]?.trim() ?? "", 10) || 0;

		rewards.push({
			raid: raidName,
			difficulty,
			itemLevel,
			gate,
			gold: {
				bound: rosterBound + characterBound,
				unbound: gold,
			},
		});
	}

	return rewards;
}

async function main() {
	try {
		const csv = await fetchSheetCSV(CSV_URL);
		const rows: string[][] = parse(csv, {
			columns: false,
			skip_empty_lines: true,
			trim: true,
		});

		const rewards = parseRows(rows.slice(FIRST_DATA_ROW));

		let didUpdate = false;
		const warned = new Set<string>();

		for (const {
			raid,
			difficulty: difficultyLabel,
			itemLevel,
			gate,
			gold,
		} of rewards) {
			const raidKey = raidMatch[raid];
			if (!raidKey) {
				if (!warned.has(raid)) {
					console.warn(`Raid "${raid}" not found in match map`);
					warned.add(raid);
				}
				continue;
			}

			const raidData = raids.get(raidKey);
			if (!raidData) {
				console.warn(`Raid "${raidKey}" not found in local data`);
				continue;
			}

			if (ignoredDifficultyLabels.has(difficultyLabel)) continue;

			const difficulty = resolveDifficulty(raidKey, difficultyLabel);
			if (!difficulty) {
				console.warn(
					`Difficulty "${difficultyLabel}" not found for raid "${raidKey}" and gate "${gate}"`
				);
				continue;
			}

			const gateId = `G${gate.replace("Gate ", "")}`;
			const gateJson = (raidsDataToUpdate[raidKey].gates[gateId] ??= {
				bossName: [],
				difficulties: {},
			});

			const diffJson = gateJson.difficulties[difficulty];
			if (!diffJson) {
				gateJson.difficulties[difficulty] = {
					itemlevel: itemLevel,
					rewards: { gold: { ...gold } },
				};
				didUpdate = true;
				console.log(
					`Added Difficulty "${difficulty}" to raid "${raidKey}", gate "${gateId}"`
				);
				continue;
			}

			if (diffJson.itemlevel !== itemLevel) {
				diffJson.itemlevel = itemLevel;
				didUpdate = true;
			}

			if (
				diffJson.rewards.gold.bound !== gold.bound ||
				diffJson.rewards.gold.unbound !== gold.unbound
			) {
				diffJson.rewards.gold = { ...gold };
				didUpdate = true;
			}
		}

		try {
			const encounters = await fetchEncounters(BOSS_NAMES_URL);
			if (updateBossNames(encounters)) didUpdate = true;
		} catch (err) {
			console.warn("Could not update boss names:", err);
		}

		if (didUpdate) {
			v.parse(raidsSchema, raidsDataToUpdate); // Validate the updated data
			writeFileSync(
				"lib/game-info/raids.json",
				JSON.stringify(raidsDataToUpdate, null, 2)
			);
			console.log("Updated lib/game-info/raids.json");
		} else {
			console.log("No changes needed");
		}
	} catch (err) {
		console.error("Error extracting raid rewards:", err);
		process.exit(1);
	}
}

main();
