#!/usr/bin/env node
// v0.2 - Excel parser
//
// Leest het CTA-Excelbestand (de enige bron van waarheid) en zet iedere
// cassette om naar een array van 64 flappen ([00..63]), elk met een
// bovenste en onderste helft. Niets uit dit bestand wordt hardcoded:
// alle tekst komt letterlijk uit de spreadsheet.
//
// Gebruik: node js/excel.js <input.xlsx> <output.json>

import XLSX from "xlsx";
import { writeFileSync } from "node:fs";

const FLAP_COUNT = 64;

// Kolomvolgorde in het Excelbestand.
const COLUMNS = ["FLAP NR", "UUR", "MIN", "KOP", "L1", "R1", "L2", "R2", "L3", "R3"];

// Cassettes die daadwerkelijk bewegen (FLAP NR is geen cassette).
const CASSETTES = COLUMNS.slice(1);

function cell(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseWorkbook(inputPath) {
  const workbook = XLSX.readFile(inputPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });

  const header = rows[0].map((v) => cell(v));
  COLUMNS.forEach((name, i) => {
    if (header[i] !== name) {
      throw new Error(`Onverwachte kolom op positie ${i}: "${header[i]}" (verwacht "${name}")`);
    }
  });

  const cassettes = {};
  for (const name of CASSETTES) {
    cassettes[name] = Array.from({ length: FLAP_COUNT }, () => ({ top: "", bottom: "" }));
  }

  // Iedere flap beslaat exact twee opeenvolgende worksheet-rijen:
  // rij A (bovenste helft, met FLAP NR ingevuld) en rij B (onderste helft).
  let dataRow = 1;
  for (let flapNr = 0; flapNr < FLAP_COUNT; flapNr++) {
    const top = rows[dataRow] || [];
    const bottom = rows[dataRow + 1] || [];

    const flapNrInSheet = top[0];
    if (flapNrInSheet === null || Number(flapNrInSheet) !== flapNr) {
      throw new Error(
        `Flapvolgorde klopt niet: verwachtte FLAP NR ${flapNr} op rij ${dataRow + 1}, kreeg "${flapNrInSheet}"`
      );
    }

    COLUMNS.forEach((name, colIndex) => {
      if (name === "FLAP NR") return;
      cassettes[name][flapNr] = {
        top: cell(top[colIndex]),
        bottom: cell(bottom[colIndex]),
      };
    });

    dataRow += 2;
  }

  return { flapCount: FLAP_COUNT, cassettes };
}

function main() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error("Gebruik: node js/excel.js <input.xlsx> <output.json>");
    process.exit(1);
  }

  const data = parseWorkbook(inputPath);
  writeFileSync(outputPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`OK: ${outputPath} geschreven (${CASSETTES.length} cassettes x ${FLAP_COUNT} flappen)`);
}

main();
