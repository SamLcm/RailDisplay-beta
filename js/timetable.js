// v0.1/v0.2 - Handmatig gekozen flapstanden
//
// Een echte dienstregeling-engine (v0.6) leest per trein de bijpassende
// vertrektijd, bestemmingstekst en spoor. Zolang die er niet is, kiezen we
// hier per "vertrek" handmatig een flapnummer per cassette. Dat flapnummer
// wijst naar bestaande tekst in data/cta.json (dus rechtstreeks uit Excel) -
// er wordt geen tekst zelf verzonnen of hardcoded.

function hourFlap(hour) {
  return 40 + hour; // UUR-cassette: flap 40..63 = uur 0..23
}

function minuteFlap(minute) {
  return 4 + minute; // MIN-cassette: flap 04..63 = minuut 00..59
}

// SPOOR is geen cassette (vaste paneeltekst, handmatig ingesteld).
export const DEPARTURES = [
  {
    label: "1 / 4",
    row: 1,
    uur: hourFlap(7),
    min: minuteFlap(12),
    spoor: "5b",
  },
  {
    label: "2 / 4",
    row: 10,
    uur: hourFlap(15),
    min: minuteFlap(47),
    spoor: "12",
  },
  {
    label: "3 / 4",
    row: 27,
    uur: hourFlap(22),
    min: minuteFlap(5),
    spoor: "3",
  },
  {
    label: "4 / 4",
    row: 58,
    uur: hourFlap(5),
    min: minuteFlap(0),
    spoor: "7a",
  },
].map((d) => ({
  ...d,
  kop: d.row,
  l1: d.row,
  r1: d.row,
  l2: d.row,
  r2: d.row,
  l3: d.row,
  r3: d.row,
}));
