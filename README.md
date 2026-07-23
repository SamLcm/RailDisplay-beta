# RailDisplay-beta

Een digitale reconstructie van de Nederlandse NS AMF CTA Type 1
split-flap vertrekborden — HTML/JavaScript-prototype voor wat uiteindelijk
een iPhone/iPad/Mac-app moet worden.

Zie [`docs/project-summary.md`](docs/project-summary.md) voor het volledige
projectdoel, de filosofie en de langetermijnplanning.

## Uitgangspunt

Alle tekst op het bord komt rechtstreeks uit `data/CTA_AMF.xlsx` — dat is de
enige bron van waarheid. Er wordt nergens tekst hardcoded. Iedere cassette
draait mechanisch, uitsluitend vooruit, door alle tussenliggende flappen.

## Bord bekijken

```
python3 -m http.server 8080
```

en open <http://localhost:8080/index.html>. (Moet via een http-server
draaien, niet als `file://`, omdat `data/cta.json` via `fetch` wordt
geladen.)

Met de knoppen onder het bord wissel je tussen een klein setje handmatig
gekozen demo-vertrekken, zodat je de cassettes mechanisch ziet doorklappen.

## Excel opnieuw naar JSON omzetten

Wijzig je `data/CTA_AMF.xlsx`, regenereer dan `data/cta.json`:

```
npm install
npm run build:data
```

## Status

v0.1 t/m v0.5 van het [ontwikkelplan](docs/project-summary.md#ontwikkelfases):
layout, Excel-parser, cassette-engine, renderer en mechanische
flip-animatie. De dienstregeling-engine (v0.6) volgt later.
