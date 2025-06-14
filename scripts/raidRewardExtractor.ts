// scripts/raidRewardExtractor.ts
// Fetches and parses raid reward data from a public Google Sheet
// Usage: bun run scripts/raidRewardExtractor.ts
import { parse } from "csv-parse/sync";

const SHEET_ID = "1YQpWt8iOK6yO5_7r3rvZZKkoRy8Z0aEAPHy11gYZZQ8";
const SHEET_GID = "582062442"; // Updated to target the correct sheet
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

async function fetchSheetCSV(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${res.status}`);
  return await res.text();
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

      const totalGold = (Number.parseInt(gold, 10) || 0) + (Number.parseInt(boundGold, 10) || 0);

      raidDifficultyGate.push({
        raid: raidName,
        difficulty: diff,
        itemLevel: itemLevel,
        gate: gate,
        gold: totalGold,
      });
    }

    const uniqueRaids = new Set(raidDifficultyGate.map(g => g.raid));
    const result = {};
    for (const raid of uniqueRaids) {
      const raidGates = raidDifficultyGate.filter(g => g.raid === raid);
      const uniqueGates = new Set(raidGates.map(g => g.gate));
      // @ts-ignore
      result[raid] = {
        gates: Object.fromEntries(
          Array.from(uniqueGates).map(gate => {
            const gateData = raidGates.filter(g => g.gate === gate);
            const difficulties = {};
            for (const g of gateData) {
              // @ts-ignore
              difficulties[g.difficulty] = {
                itemLevel: g.itemLevel,
                gold: g.gold,
              };
            }
            return [gate, { difficulties }];
          })
        )
      };
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Error extracting raid rewards:", err);
    process.exit(1);
  }
}

main();
