# RailDisplay CTA — voortgang v2.5

## Vastgelegd

- [x] NS AMF CTA Type 1 als eerste doel.
- [x] Negen afzonderlijke cassettes: UUR, MIN, KOP, L1, R1, L2, R2, L3 en R3.
- [x] VERTREK en SPOOR zijn vaste delen.
- [x] Iedere cassette krijgt 64 fysieke posities.
- [x] Cassettes draaien uitsluitend vooruit.
- [x] Onbevestigde tekst wordt niet als feit in de officiële flapset geplaatst.

## Technische basis

- [x] Renderer, opmaak en brondata zijn als losse bestanden opgeslagen.
- [x] JSON-manifest laadt de gegevensblokken automatisch.
- [x] Validator controleert dubbele posities, ontbrekende cassettes, regel-aantallen en kleuren.
- [x] Project is direct testbaar via VS Code Live Server.
- [x] Schaalbare CTA-kast en voorwaartse proefanimatie aanwezig.
- [ ] Mechanische animatie met afzonderlijke boven- en onderhelft verfijnen.
- [ ] Visuele regressietest met vaste schermafmetingen toevoegen.

## Foto-audit

- [x] Lege beginstand en getoonde standen 00–15 verwerkt.
- [x] Stand 06: onbevestigde invulling København verwijderd; L3 blijft leeg.
- [x] Stand 13: R1/R2 blijven gemarkeerd voor foto-hercontrole.
- [ ] Standen 16–23 inventariseren en toevoegen.
- [ ] Standen 24–31 inventariseren en toevoegen.
- [ ] Standen 32–39 inventariseren en toevoegen.
- [ ] Standen 40–47 inventariseren en toevoegen.
- [ ] Standen 48–55 inventariseren en toevoegen.
- [ ] Standen 56–63 inventariseren en toevoegen.

## Visuele kalibratie

- [ ] Gemengde rood/blauwe tekstsegmenten exact kalibreren.
- [ ] Lettergrootte en horizontale schaal per cassette vastleggen.
- [ ] Verticale tekstpositie per cassette vastleggen.
- [ ] Kast, rand, spoorvlak en bevestigingspunten tegen bronfoto’s valideren.
- [ ] Testen op iPhone, iPad en desktop-landscape.
- [ ] Geluid pas toevoegen nadat beeld en timing zijn vastgelegd.

## Eerstvolgende stap

Foto-audit **16–23**, daarna toevoegen als nieuw JSON-gegevensblok zonder de renderer te wijzigen.
