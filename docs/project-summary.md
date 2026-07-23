# RailDisplay – Projectsamenvatting

## Doel

Een zo realistisch mogelijke emulator van de Nederlandse NS AMF CTA Type 1
split-flap vertrekborden. Niet een grafische imitatie, maar een digitale
reconstructie die zich gedraagt alsof het een echte CTA-installatie is.

Het project wordt uiteindelijk een iPhone/iPad/Mac-app, maar begint als een
HTML/JavaScript prototype.

## Filosofie

Alles is gebaseerd op de originele CTA-installatie:

- geen vrije tekst invoer
- geen letter voor letter rendering
- uitsluitend originele flappen
- uitsluitend bestaande cassettecombinaties
- mechanisch realistisch gedrag

## Hardware

Eerste versie: **NS AMF CTA Type 1**.

Indeling:

```
VERTREK | UUR | MIN | TREINTYPE
L1 | R1 | SPOOR
L2 | R2 |
L3 | R3 |
```

7 beweegbare cassettes voor tekst (KOP, L1, R1, L2, R2, L3, R3) plus een
uurcassette en een minuutcassette. SPOOR is geen cassette; VERTREK is vaste
tekst.

## Cassette-opbouw

Iedere cassette bevat exact 64 flappen, genummerd 00 t/m 63. Iedere flap
bestaat uit een bovenste en onderste helft; in Excel staan dit twee
opeenvolgende rijen.

## Excelbestand — de enige bron van waarheid

`data/CTA_AMF.xlsx` bevat de kolommen `FLAP NR, UUR, MIN, KOP, L1, R1, L2,
R2, L3, R3`. Iedere flap beslaat twee worksheet-rijen (boven/onder). Alle
tekst komt uitsluitend uit dit bestand — nooit hardcoded in de app.

`js/excel.js` zet dit bestand om naar `data/cta.json` (9 cassettes x 64
flappen, elk met `top`/`bottom`). Regenereren via:

```
npm install
npm run build:data
```

## Mechaniek

Iedere cassette kent een actuele flappositie en draait bij het wisselen
uitsluitend vooruit (bv. van 03 naar 02 gaat via 04, 05, ... 63, 00, 01,
02). Alle tussenliggende flappen zijn zichtbaar tijdens het draaien.

## Weergave

Originele AMF Type 1 verhoudingen: donkerblauwe kast, witte flappen,
donkerblauwe tekst, rode vertragingsteksten.

## Ontwikkelfases

- **v0.1** — werkende CTA: juiste layout, alle cassettes zichtbaar
- **v0.2** — Excel parser: Excel inlezen, database opbouwen
- **v0.3** — Cassette-engine: flappositie, vooruit draaien, tussenflappen
- **v0.4** — Renderer: juiste kleuren, lettergroottes, uitlijning
- **v0.5** — Animatie: mechanische flip, meerdere cassettes tegelijk
- **v0.6** — Dienstregeling: complete CTA logisch vullen
- **v1.0** — Eerste volledige simulator

Deze repository bevat op dit moment v0.1 t/m v0.5: een werkend, mechanisch
animerend bord met data rechtstreeks uit Excel en een klein, handmatig
samengesteld setje demo-vertrekken (zie `js/timetable.js`) totdat de
dienstregeling-engine (v0.6) er is.

## Architectuur

```
RailDisplay
  index.html
  css/
    cta.css
  js/
    app.js
    renderer.js
    cassette.js
    animation.js
    excel.js
    timetable.js
  data/
    CTA_AMF.xlsx
    cta.json
  assets/
    logos/
    fonts/
    images/
  docs/
```

## Belangrijk uitgangspunt

De renderer bepaalt uitsluitend hoe een flap wordt weergegeven (lettergrootte,
positie, kleur, uitlijning). De inhoud komt volledig uit Excel.

## Langetermijndoel

RailDisplay wordt uiteindelijk een complete emulator van historische
Nederlandse CTA-systemen: meerdere CTA-types (Type 1, 2 en 3), historische
dienstregelingen per jaar, live vertrekinformatie via API, service- en
onderhoudsmodus, handmatige flapbediening, schermbeveiligingsmodus voor
iPhone/iPad, meerdere CTA-bakken tegelijk, een CTA Studio om zelf
configuraties en historische datasets samen te stellen, export/import van
CTA-configuraties, en een volledig realistische mechanische simulatie.
