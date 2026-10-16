import { sleep } from "../lib/utils.js";

/** Fired on a section the first time it is un-hidden. */
export const REVEAL_EVENT = "section:reveal";

/** Long enough for two full flashes of the trigger, so the click always feels acknowledged. */
const MIN_FLASH_MS = 650;
/** Keeps the trigger flashing until the smooth scroll is well underway. */
const SCROLL_START_MS = 300;

/** Un-hides a section and announces it, so features can initialise lazily. */
export function revealSection(section) {
  if (!section.hidden) return;
  section.hidden = false;
  section.dispatchEvent(new CustomEvent(REVEAL_EVENT));
}

/**
 * Wires up every `[data-reveal="<section id>"]` trigger inside `root`: clicking
 * one reveals that section and scrolls to it. Sections stay hidden until then,
 * so the page can't be scrolled past content that hasn't been unlocked yet.
 */
export function bindRevealTriggers(root) {
  root.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-reveal]");
    if (trigger) revealAndScroll(trigger);
  });
}

async function revealAndScroll(trigger) {
  const section = document.getElementById(trigger.dataset.reveal);
  if (!section || trigger.classList.contains("is-loading")) return;

  trigger.classList.add("is-loading");
  revealSection(section);

  await sleep(MIN_FLASH_MS);
  section.scrollIntoView({ behavior: "smooth" });
  await sleep(SCROLL_START_MS);

  trigger.classList.remove("is-loading");
}
