import { projects } from "./data/projects.js";
import { taglines } from "./data/taglines.js";
import { bindScrollBlur, loadBackground } from "./features/background.js";
import { spawnFireflies } from "./features/fireflies.js";
import { initHero } from "./features/hero.js";
import { ProjectShowcase } from "./features/projects.js";
import { REVEAL_EVENT, bindRevealTriggers, revealSection } from "./features/sections.js";
import { sleep } from "./lib/utils.js";

/** Lets the background brighten (3s fade) before the hero's entrance animations play. */
const HERO_DELAY_MS = 2000;

const page = document.querySelector(".page");
const backdrop = document.querySelector(".backdrop");
const vignette = document.querySelector(".vignette");
const hero = document.getElementById("home");
const projectsSection = document.getElementById("projects");

spawnFireflies(backdrop);
bindScrollBlur(page, backdrop);
bindRevealTriggers(page);

// Sections start hidden; each feature initialises the first time its section is revealed.
hero.addEventListener(REVEAL_EVENT, () => initHero(hero, taglines), { once: true });
projectsSection.addEventListener(
  REVEAL_EVENT,
  () =>
    new ProjectShowcase(projectsSection, projects, {
      onVisibilityChange: (visible) => vignette.classList.toggle("is-active", visible),
    }),
  { once: true },
);

await loadBackground(backdrop.querySelector(".backdrop__image"));
document.documentElement.classList.add("is-ready");

await sleep(HERO_DELAY_MS);
revealSection(hero);
