// scripts/raidRewardExtractor.ts
// Fetches and parses raid reward data from a public Google Sheet
// Usage: bun run scripts/raidRewardExtractor.ts
import { raids } from "@/lib/raids";
import { parse } from "csv-parse/sync";

const SHEET_ID = "1YQpWt8iOK6yO5_7r3rvZZKkoRy8Z0aEAPHy11gYZZQ8";
const SHEET_GID = "582062442"; // Updated to target the correct sheet
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

async function fetchSheetCSV(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
  return await res.text();
}

const raidMatch: Record<string, keyof typeof raids> = {
  "Act 1: Aegir": "aegir",
  "Act 2: Brelshaza": "brelshaza2",
  "Act 3: Mordum": "mordum",
  "Akkan": "akkan",
  "Behemoth": "behemoth",
  "Brelshaza": "brel",
  "Ivory  Tower": "voldis",
  "Kakul- Saydon": "kakul",
  "Kayangel": "kayangel",
  "Overture: Echidna": "echidna",
  "Thaemine": "thaemine",
  "Valtan": "valtan",
  "Vykas": "vykas",
}

async function main() {
  try {
    const csv = await fetchSheetCSV(CSV_URL);
    // Parse without headers, get all rows
    const rows: string[][] = parse(csv, {
      columns: false,
      skip_empty_lines: true,
      trim: true,
    });
    // Slice from row 5 (index 4), and columns C (2) to H (7)
    const data = rows.slice(4).map(row => row.slice(2, 8));
    // Filter out rows where all cells are empty
    const filtered = data.filter(row => row.some(cell => cell && cell.trim() !== ""));
    let raidName = "";
    let diff = "";
    let itemLevel = 0;
    const raidDifficultyGate = [];
    for (const row of filtered) {
      const [raid, difficulty, iLvl, gate, gold, boundGold] = row.map(cell => cell.trim().replaceAll("\n", ' '));
      if (gate === "Total")
        continue; // Skip total rows

      if (raid) {
        raidName = raid;
      }

      if (difficulty) {
        diff = difficulty;
      }

      if (iLvl) {
        itemLevel = Number.parseInt(iLvl, 10);
      }

      raidDifficultyGate.push({
        raid: raidName,
        difficulty: diff,
        itemLevel: itemLevel,
        gate: gate,
        gold: {
          bound: Number.parseInt(boundGold, 10) || 0,
          unbound: Number.parseInt(gold, 10) || 0,
        },
      });
    }

    raidDifficultyGate.sort((a, b) => {
      if (a.raid < b.raid) return -1;
      if (a.raid > b.raid) return 1;
      if (a.gate < b.gate) return -1;
      if (a.gate > b.gate) return 1;
      if (a.difficulty < b.difficulty) return -1;
      if (a.difficulty > b.difficulty) return 1;
      return 0;
    });

    raidDifficultyGate.forEach(({ raid, difficulty, itemLevel, gate, gold }) => {
      const raidKey = raidMatch[raid];
      if (!raidKey) {
        console.warn(`Raid "${raid}" not found in match map`);
        return;
      }
      const raidData = raids[raidKey];
      if (!raidData) {
        console.warn(`Raid "${raidKey}" not found in local data`);
        return;
      }
      const gateId = `G${gate.replace("Gate ", "")}`;
      const gateData = raidData.gates[gateId];
      if (!gateData) {
        console.warn(`Gate "${gateId}" not found for raid "${raidKey}"`);
        return;
      }
      const diffData = gateData.difficulties[difficulty as keyof typeof gateData.difficulties];
      if (!diffData) {
        console.warn(`Difficulty "${difficulty}" not found for raid "${raidKey}"`);
        return;
      }
      if (diffData.itemlevel !== itemLevel) {
        console.warn(`Item level mismatch for "${raidKey}" at "${gateId}" on "${difficulty}": expected ${itemLevel}, got ${diffData.itemlevel}`);
      }
      if (diffData.rewards.gold.bound !== gold.bound || diffData.rewards.gold.unbound !== gold.unbound) {
        console.warn(`Gold rewards mismatch for "${raidKey}" at "${gateId}" on "${difficulty}": expected { bound: ${gold.bound}, unbound: ${gold.unbound} }, got { bound: ${diffData.rewards.gold.bound}, unbound: ${diffData.rewards.gold.unbound} }`);
      }
    });


  } catch (err) {
    console.error("Error extracting raid rewards:", err);
    process.exit(1);
  }
}

main();
