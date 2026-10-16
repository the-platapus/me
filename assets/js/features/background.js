import { sleep } from "../lib/utils.js";

const PREVIEW_SRC = "assets/images/background-preview.webp";
const FULL_SRC = "assets/images/background-full.png";

const PREVIEW_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;
/** Gives the preview a chance to paint before the heavy download starts competing for bandwidth. */
const FULL_IMAGE_DELAY_MS = 100;

/** Blur reaches its maximum after scrolling this fraction of the viewport. */
const BLUR_SCROLL_FRACTION = 0.1;
const MAX_BLUR = 10;

/**
 * Shows a small preview of the background as soon as possible, then swaps in
 * the full-resolution image once it has downloaded.
 * @param {HTMLElement} layer Element whose background-image is set.
 * @returns {Promise<void>} Resolves once something is ready to fade in.
 */
export async function loadBackground(layer) {
  try {
    await withRetries(() => preload(PREVIEW_SRC), PREVIEW_ATTEMPTS, RETRY_DELAY_MS);
  } catch {
    console.warn("Background preview failed to load; waiting for the full image instead.");
    await upgradeToFull(layer);
    return;
  }

  showImage(layer, PREVIEW_SRC);
  requestAnimationFrame(() => setTimeout(() => upgradeToFull(layer), FULL_IMAGE_DELAY_MS));
}

/** Blurs and slightly zooms the backdrop as the page scrolls away from the top. */
export function bindScrollBlur(scroller, backdrop) {
  let frame = null;

  const update = () => {
    frame = null;
    const blur = Math.min(scroller.scrollTop / (window.innerHeight * BLUR_SCROLL_FRACTION), MAX_BLUR);
    backdrop.style.setProperty("--backdrop-blur", blur.toFixed(2));
  };

  scroller.addEventListener(
    "scroll",
    () => {
      frame ??= requestAnimationFrame(update);
    },
    { passive: true },
  );
}

async function upgradeToFull(layer) {
  try {
    await preload(FULL_SRC);
    showImage(layer, FULL_SRC);
  } catch {
    console.error("Failed to load the full-resolution background image.");
  }
}

function showImage(layer, src) {
  layer.style.backgroundImage = `url("${src}")`;
}

function preload(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = reject;
    image.src = src;
  });
}

async function withRetries(task, attempts, delayMs) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= attempts) throw error;
      await sleep(delayMs);
    }
  }
}
