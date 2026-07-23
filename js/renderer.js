// v0.4 - Renderer
//
// De renderer bepaalt uitsluitend HOE een flap wordt weergegeven:
// lettergrootte, positie, kleur, uitlijning. De inhoud (welke tekst op
// welke flap staat) komt volledig uit data/cta.json, dat op zijn beurt
// rechtstreeks uit het Excelbestand is gegenereerd. Er wordt hier nooit
// tekst hardcoded.

// Vertragings- en waarschuwingsteksten op de KOP-cassette worden rood
// weergegeven, net als op de echte AMF-installatie. Dit is een
// weergaveregel op basis van de bestaande teksten, geen nieuwe inhoud.
const WARNING_PATTERNS = [
  /vertraging/i,
  /^±?\s*\d+\s*minuten$/i,
  /niet instappen/i,
  /geen treinverkeer/i,
  /let op omroepbericht/i,
  /rijdt vandaag niet/i,
  /trein blijft in/i,
];

export function isWarningText(text) {
  return Boolean(text) && WARNING_PATTERNS.some((re) => re.test(text.trim()));
}

// UUR-cijfers staan in Excel als "0".."23" (niet opgevuld); de klok op een
// echte AMF-installatie toont twee cijfers. MIN staat al als "00".."59".
export function formatFlapText(text, digits) {
  if (digits && /^\d$/.test(text || "")) return `0${text}`;
  return text || "";
}

const CASSETTE_LAYOUT = [
  { name: "KOP", area: "kop", warn: true },
  { name: "L1", area: "l1" },
  { name: "R1", area: "r1" },
  { name: "L2", area: "l2" },
  { name: "R2", area: "r2" },
  { name: "L3", area: "l3" },
  { name: "R3", area: "r3" },
  { name: "UUR", area: "uur", digits: true },
  { name: "MIN", area: "min", digits: true },
];

function el(tag, className) {
  const node = document.createElement("div");
  node.className = className;
  if (tag) node.dataset.tag = tag;
  return node;
}

function buildZone(warn, digits) {
  const zone = el(null, "flap__zone");
  const inner = el(null, "flap__inner");
  const front = el(null, "flap__face flap__face--front");
  const back = el(null, "flap__face flap__face--back");
  const frontText = document.createElement("span");
  frontText.className = "flap__text";
  const backText = document.createElement("span");
  backText.className = "flap__text";
  front.appendChild(frontText);
  back.appendChild(backText);
  inner.appendChild(front);
  inner.appendChild(back);
  zone.appendChild(inner);
  return { zone, inner, front, back, frontText, backText, warn, digits };
}

function applyText(faceTextEl, faceEl, text, warn, digits) {
  faceTextEl.textContent = formatFlapText(text, digits);
  // classList.toggle(token, force) treats an explicit `undefined` force as
  // "no force given" (plain toggle) instead of "false" - always pass a real
  // boolean here, or an unset `warn` flag ends up permanently flipping the
  // class on for every cassette instead of leaving it off.
  faceEl.classList.toggle("flap__face--warn", Boolean(warn) && isWarningText(text));
}

/** Bouwt de DOM voor één cassette-flap en geeft een handle terug voor animatie/updates. */
function buildFlapElement({ name, area, warn, digits }) {
  const root = el(null, "flap");
  root.dataset.name = name;
  root.style.gridArea = area;
  if (digits) root.classList.add("flap--digits");

  const top = buildZone(warn, digits);
  const seam = el(null, "flap__seam");
  const bottom = buildZone(warn, digits);

  root.appendChild(top.zone);
  root.appendChild(seam);
  root.appendChild(bottom.zone);

  return { name, root, top, bottom };
}

/** Zet een zone (top/bottom) direct op nieuwe tekst, zonder animatie. */
export function setZoneImmediate(zone, text) {
  applyText(zone.frontText, zone.front, text, zone.warn, zone.digits);
  applyText(zone.backText, zone.back, text, zone.warn, zone.digits);
  zone.inner.classList.remove("flap--flipped");
}

/** Bouwt het volledige bord (vaste panelen + alle cassettes) in `root`. */
export function renderBoard(root) {
  root.innerHTML = "";
  root.classList.add("cta__grid");

  const vertrek = el(null, "static-panel static-panel--vertrek");
  vertrek.style.gridArea = "vertrek";
  vertrek.textContent = "VERTREK";
  root.appendChild(vertrek);

  const spoor = el(null, "static-panel static-panel--spoor");
  spoor.style.gridArea = "spoor";
  const spoorLabel = document.createElement("span");
  spoorLabel.className = "static-panel__label";
  spoorLabel.textContent = "SPOOR";
  const spoorValue = document.createElement("span");
  spoorValue.className = "static-panel__value";
  spoorValue.id = "spoor-value";
  spoor.appendChild(spoorLabel);
  spoor.appendChild(spoorValue);
  root.appendChild(spoor);

  const cassettes = {};
  for (const def of CASSETTE_LAYOUT) {
    const handle = buildFlapElement(def);
    root.appendChild(handle.root);
    cassettes[def.name] = handle;
  }

  return { cassettes, spoorValue };
}

export function setSpoor(spoorValueEl, text) {
  spoorValueEl.textContent = text || "";
}
