// v0.3 - Cassette-engine
//
// Een Cassette bewaart de actuele flappositie (0..63) van één fysieke
// cassette. Bij het instellen van een nieuwe positie draait de cassette
// uitsluitend vooruit: van 03 naar 02 gaat via 04, 05, ... 63, 00, 01, 02.
// Alle tussenliggende flappen worden opgeleverd zodat ze zichtbaar gemaakt
// kunnen worden tijdens het draaien.

export const FLAP_COUNT = 64;

export class Cassette {
  constructor(name, flaps) {
    this.name = name;
    this.flaps = flaps; // array van 64 { top, bottom }, index = flapnummer
    this.position = 0;
  }

  current() {
    return this.flaps[this.position];
  }

  flapAt(index) {
    return this.flaps[((index % FLAP_COUNT) + FLAP_COUNT) % FLAP_COUNT];
  }

  /**
   * Berekent de reeks flapposities om, uitsluitend vooruit draaiend,
   * van de huidige positie naar `target` te komen. Bevat elke tussenliggende
   * flap, eindigend met `target`. Bij target === huidige positie is de
   * reeks leeg (de cassette staat al goed).
   */
  stepsTo(target) {
    const normalizedTarget = ((target % FLAP_COUNT) + FLAP_COUNT) % FLAP_COUNT;
    const steps = [];
    let pos = this.position;
    while (pos !== normalizedTarget) {
      pos = (pos + 1) % FLAP_COUNT;
      steps.push(pos);
    }
    return steps;
  }

  /** Zet de cassette direct op `index`, zonder te draaien (bv. bij opstarten). */
  setImmediate(index) {
    this.position = ((index % FLAP_COUNT) + FLAP_COUNT) % FLAP_COUNT;
  }

  /** Registreert dat de cassette één stap vooruit heeft gedraaid. */
  advanceTo(index) {
    this.position = index;
  }
}
