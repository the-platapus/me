import { randomBetween } from "../lib/utils.js";

const DEFAULT_COUNT = 7;

/** One leg of the flight path is this long; the path then plays back in reverse. */
const FLIGHT_DURATION_MS = 200_000;
const WAYPOINTS = { min: 16, max: 28 };
const SCALE = { min: 0.25, max: 1 };

/** Glow cycle length and initial offset; see @keyframes firefly-flash. */
const FLASH_DURATION_MS = { min: 9000, max: 18000 };
const FLASH_DELAY_MS = { min: 0, max: 8000 };

/**
 * Adds fireflies that wander across the viewport and glow at random intervals.
 * @param {HTMLElement} container
 */
export function spawnFireflies(container, count = DEFAULT_COUNT) {
  for (let i = 0; i < count; i++) {
    const firefly = document.createElement("div");
    firefly.className = "firefly";
    firefly.style.setProperty("--flash-duration", `${randomMs(FLASH_DURATION_MS)}ms`);
    firefly.style.setProperty("--flash-delay", `${randomMs(FLASH_DELAY_MS)}ms`);
    container.append(firefly);

    firefly.animate(randomFlightPath(), {
      duration: FLIGHT_DURATION_MS,
      direction: "alternate",
      iterations: Infinity,
    });
  }
}

/** Keyframes that hop between random points, easing into and out of each one. */
function randomFlightPath() {
  const waypoints = Math.round(randomBetween(WAYPOINTS.min, WAYPOINTS.max));
  return Array.from({ length: waypoints }, () => {
    const x = randomBetween(-50, 50).toFixed(1);
    const y = randomBetween(-50, 50).toFixed(1);
    const scale = randomBetween(SCALE.min, SCALE.max).toFixed(2);
    return { transform: `translate(${x}vw, ${y}vh) scale(${scale})`, easing: "ease" };
  });
}

const randomMs = ({ min, max }) => Math.round(randomBetween(min, max));
