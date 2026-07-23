// v0.1-v0.5 - RailDisplay bootstrap
//
// Laadt de flapdata (rechtstreeks uit Excel gegenereerd), bouwt het bord op
// en koppelt de demo-bediening. De inhoud komt uitsluitend uit
// data/cta.json; hier wordt geen tekst hardcoded.

import { Cassette } from "./cassette.js";
import { renderBoard, setSpoor } from "./renderer.js";
import { animateCassetteTo, showImmediate } from "./animation.js";
import { DEPARTURES } from "./timetable.js";

const CASSETTE_NAMES = ["KOP", "L1", "R1", "L2", "R2", "L3", "R3", "UUR", "MIN"];

async function loadCtaData() {
  const response = await fetch("data/cta.json");
  if (!response.ok) {
    throw new Error(`Kon data/cta.json niet laden (${response.status})`);
  }
  return response.json();
}

function buildCassettes(data) {
  const cassettes = {};
  for (const name of CASSETTE_NAMES) {
    cassettes[name] = new Cassette(name, data.cassettes[name]);
  }
  return cassettes;
}

async function main() {
  const data = await loadCtaData();
  const cassettes = buildCassettes(data);

  const board = document.getElementById("board");
  const { cassettes: handles, spoorValue } = renderBoard(board);

  let departureIndex = 0;
  let animating = false;

  const prevBtn = document.getElementById("prev-departure");
  const nextBtn = document.getElementById("next-departure");
  const label = document.getElementById("departure-label");

  function applyDeparture(departure, { immediate }) {
    label.textContent = departure.label;
    setSpoor(spoorValue, departure.spoor);

    const jobs = CASSETTE_NAMES.map((name) => {
      const key = name.toLowerCase();
      const target = departure[key];
      const cassette = cassettes[name];
      const handle = handles[name];
      if (immediate) {
        showImmediate(handle, cassette, target);
        return Promise.resolve();
      }
      return animateCassetteTo(handle, cassette, target);
    });

    return Promise.all(jobs);
  }

  async function goTo(index, { immediate = false } = {}) {
    if (animating) return;
    animating = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;

    departureIndex = ((index % DEPARTURES.length) + DEPARTURES.length) % DEPARTURES.length;
    await applyDeparture(DEPARTURES[departureIndex], { immediate });

    animating = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }

  prevBtn.addEventListener("click", () => goTo(departureIndex - 1));
  nextBtn.addEventListener("click", () => goTo(departureIndex + 1));

  await goTo(0, { immediate: true });
}

main().catch((err) => {
  console.error(err);
  const board = document.getElementById("board");
  board.textContent = `Fout bij laden RailDisplay: ${err.message}`;
});
