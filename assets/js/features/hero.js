import { Typewriter } from "../lib/typewriter.js";
import { sleep } from "../lib/utils.js";

const TYPE_DELAY_MS = 75;
const ERASE_DELAY_MS = 27;
const HOLD_MS = 1500;

/** Opened right after the mail client, as a little surprise. */
const EMAIL_EASTER_EGG_URL = "https://cristurm.github.io/nyan-cat/";
const EASTER_EGG_DELAY_MS = 10;

/**
 * @param {HTMLElement} hero
 * @param {string[]} taglines
 */
export function initHero(hero, taglines) {
  const typewriter = new Typewriter(hero.querySelector("[data-typewriter]"), {
    typeDelay: TYPE_DELAY_MS,
    eraseDelay: ERASE_DELAY_MS,
  });
  cycleTaglines(typewriter, taglines);

  hero.querySelector("[data-email-link]").addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = event.currentTarget.href;
    setTimeout(() => window.open(EMAIL_EASTER_EGG_URL, "_self"), EASTER_EGG_DELAY_MS);
  });
}

async function cycleTaglines(typewriter, taglines) {
  for (let i = 0; ; i = (i + 1) % taglines.length) {
    await typewriter.write(taglines[i]);
    await sleep(HOLD_MS);
  }
}
