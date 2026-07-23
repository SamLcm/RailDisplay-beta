// v0.5 - Animatie
//
// Speelt de mechanische flip van een cassette af: per tussenliggende flap
// klapt de bovenste helft weg en verschijnt de onderste helft, exact zoals
// een echte AMF-cassette. Cassettes draaien onafhankelijk van elkaar en
// kunnen dus gelijktijdig lopen (elke animatie is een eigen async-lus).

import { setZoneImmediate, isWarningText, formatFlapText } from "./renderer.js";

const STEP_MS = 90; // tijd per flap-klik
const SETTLE_MS = 10; // korte rust na het klappen, voor het "mechanische" gevoel

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function flipZone(zone, nextText) {
  zone.backText.textContent = formatFlapText(nextText, zone.digits);
  zone.back.classList.toggle("flap__face--warn", Boolean(zone.warn) && isWarningText(nextText));
  zone.inner.classList.add("flap--flipped");
}

async function playStep(handle, flap) {
  flipZone(handle.top, flap.top);
  flipZone(handle.bottom, flap.bottom);

  await wait(STEP_MS);

  // Val de geklapte flap terug in rust, nu met de nieuwe tekst als "front",
  // zonder dat dit zelf zichtbaar animeert (het klappen is al gebeurd).
  handle.top.inner.classList.remove("flap--flipped");
  handle.bottom.inner.classList.remove("flap--flipped");
  handle.top.inner.classList.add("flap--no-transition");
  handle.bottom.inner.classList.add("flap--no-transition");
  setZoneImmediate(handle.top, flap.top);
  setZoneImmediate(handle.bottom, flap.bottom);
  await nextFrame();
  handle.top.inner.classList.remove("flap--no-transition");
  handle.bottom.inner.classList.remove("flap--no-transition");

  await wait(SETTLE_MS);
}

/**
 * Draait `cassette` (uitsluitend vooruit) naar `targetIndex`, en speelt
 * voor elke tussenliggende flap de klap-animatie af op `handle`.
 * Retourneert een Promise die resolvet zodra de cassette stilstaat.
 */
export async function animateCassetteTo(handle, cassette, targetIndex) {
  const steps = cassette.stepsTo(targetIndex);
  for (const stepIndex of steps) {
    const flap = cassette.flapAt(stepIndex);
    await playStep(handle, flap);
    cassette.advanceTo(stepIndex);
  }
}

/** Zet een cassette direct op een flap, zonder animatie (initiële opbouw). */
export function showImmediate(handle, cassette, index) {
  cassette.setImmediate(index);
  const flap = cassette.current();
  setZoneImmediate(handle.top, flap.top);
  setZoneImmediate(handle.bottom, flap.bottom);
}
