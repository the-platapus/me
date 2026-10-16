import { el, syncHeight } from "../lib/dom.js";
import { Typewriter } from "../lib/typewriter.js";
import { clamp } from "../lib/utils.js";

const PHOTO_INTERVAL_MS = 4200;
const TYPE_DELAY_MS = 20;
const ERASE_DELAY_MS = 3;

/** After a programmatic scroll starts, the scroll position can't override the chosen project for this long. */
const SCROLL_LOCK_MS = 850;
/** Within this fraction of a slide from a snap point, the gallery counts as settled. */
const SETTLED_FRACTION = 0.15;
const SWIPE_THRESHOLD_PX = 50;
/** Wheel events closer together than this belong to the same gesture. */
const WHEEL_GESTURE_GAP_MS = 200;
const VISIBILITY_THRESHOLD = 0.25;

/**
 * Projects showcase: a vertical snap-scrolling gallery (one slide per project,
 * each with a photo carousel) next to the project's title and typed-out
 * description, plus a nav pill on the far right.
 *
 * Wheel and touch gestures anywhere in the section step the gallery, and the
 * arrow keys step between projects while the section is on screen.
 */
export class ProjectShowcase {
  #root;
  #projects;
  #onVisibilityChange;
  #ui;
  #slides;
  #navDots;
  #photoDots = [];
  #typewriter;

  /** Project the gallery is on. */
  #active = 0;
  /** Project whose text is shown; catches up with #active once scrolling settles. */
  #displayed = -1;
  #photo = 0;
  /** Project a programmatic scroll is heading to, or null. */
  #scrollTarget = null;
  #hovered = false;
  #visible = false;

  #photoTimer = null;
  #scrollLockTimer = null;

  /**
   * @param {HTMLElement} root The #projects section.
   * @param {import("../data/projects.js").Project[]} projects
   * @param {{ onVisibilityChange?: (visible: boolean) => void }} [options]
   */
  constructor(root, projects, { onVisibilityChange = () => {} } = {}) {
    this.#root = root;
    this.#projects = projects;
    this.#onVisibilityChange = onVisibilityChange;
    this.#ui = {
      headingFrame: root.querySelector(".projects__heading-frame"),
      heading: root.querySelector(".projects__heading"),
      title: root.querySelector(".projects__title"),
      subtitle: root.querySelector(".projects__subtitle"),
      photoDots: root.querySelector(".projects__photo-dots"),
      description: root.querySelector(".projects__description"),
      descriptionGhost: root.querySelector(".projects__description-ghost"),
      scroller: root.querySelector(".projects__scroller"),
      category: root.querySelector(".projects__category"),
    };

    this.#typewriter = new Typewriter(root.querySelector("[data-typewriter]"), {
      typeDelay: TYPE_DELAY_MS,
      eraseDelay: ERASE_DELAY_MS,
    });
    this.#typewriter.pause(); // until the section scrolls into view

    this.#slides = projects.map(renderSlide);
    this.#ui.scroller.append(...this.#slides.map((slide) => slide.element));

    this.#navDots = projects.map((project, index) =>
      dotButton(`Switch to ${project.title}`, () => this.#scrollTo(index), "dot--vertical"),
    );
    this.#ui.category.before(...this.#navDots);

    syncHeight(this.#ui.headingFrame, this.#ui.heading);
    syncHeight(this.#ui.description, this.#ui.descriptionGhost);

    this.#bindEvents();
    this.#setActive(0);
    this.#syncToScroll();
  }

  #bindEvents() {
    const { scroller } = this.#ui;

    scroller.addEventListener("scroll", () => this.#syncToScroll(), { passive: true });
    window.addEventListener("resize", () => this.#syncToScroll());
    window.addEventListener("keydown", (event) => this.#onKeyDown(event));

    this.#root.addEventListener("mouseenter", () => this.#setHovered(true));
    this.#root.addEventListener("mouseleave", () => this.#setHovered(false));

    new IntersectionObserver(([entry]) => this.#setVisible(entry.isIntersecting), {
      threshold: VISIBILITY_THRESHOLD,
    }).observe(this.#root);

    this.#forwardGesturesToGallery();
  }

  // ---- State changes ----

  #setActive(index) {
    this.#paintSlide(this.#active, 0);
    this.#active = index;
    this.#ui.category.textContent = this.#projects[index].category;
    this.#navDots.forEach((dot, i) => setDotActive(dot, i === index));
    this.#showPhoto(0);
  }

  #showPhoto(index) {
    this.#photo = index;
    this.#paintSlide(this.#active, index);
    this.#photoDots.forEach((dot, i) => setDotActive(dot, i === index));
    this.#schedulePhotoAdvance();
  }

  /** Swaps the title, subtitle, photo dots and description over to `index`. */
  #showDetails(index) {
    if (index === this.#displayed) return;
    this.#displayed = index;

    const project = this.#projects[index];
    this.#ui.title.textContent = project.title;
    this.#ui.subtitle.textContent = project.subtitle;
    this.#ui.descriptionGhost.textContent = project.description;
    this.#typewriter.write(project.description);

    this.#photoDots = project.images.map((_, i) =>
      dotButton(`Show photo ${i + 1}`, () => {
        if (this.#displayed === this.#active) this.#showPhoto(i);
      }),
    );
    this.#photoDots.forEach((dot, i) => setDotActive(dot, i === this.#photo));
    this.#ui.photoDots.replaceChildren(...this.#photoDots);
  }

  #setHovered(hovered) {
    this.#hovered = hovered;
    this.#schedulePhotoAdvance();
  }

  #setVisible(visible) {
    this.#visible = visible;
    if (visible) this.#typewriter.resume();
    else this.#typewriter.pause();
    this.#schedulePhotoAdvance();
    this.#onVisibilityChange(visible);
  }

  /** Auto-advances the active project's photos unless the user is hovering or it's off screen. */
  #schedulePhotoAdvance() {
    clearTimeout(this.#photoTimer);
    const photoCount = this.#projects[this.#active].images.length;
    if (this.#hovered || !this.#visible || photoCount <= 1) return;

    this.#photoTimer = setTimeout(() => this.#showPhoto((this.#photo + 1) % photoCount), PHOTO_INTERVAL_MS);
  }

  // ---- Scrolling ----

  #scrollTo(index) {
    const { scroller, heading } = this.#ui;

    this.#scrollTarget = index;
    clearTimeout(this.#scrollLockTimer);
    this.#scrollLockTimer = setTimeout(() => this.#releaseScrollLock(), SCROLL_LOCK_MS);

    if (index !== this.#active) heading.classList.add("is-leaving");
    scroller.scrollTo({ top: index * scroller.clientHeight, behavior: "smooth" });
    this.#setActive(index);
  }

  #releaseScrollLock() {
    this.#scrollTarget = null;
    clearTimeout(this.#scrollLockTimer);
  }

  /** Derives the active project, slide zoom/shade and heading visibility from the gallery's scroll position. */
  #syncToScroll() {
    const { scrollTop, clientHeight } = this.#ui.scroller;
    if (clientHeight <= 0) return;

    const position = scrollTop / clientHeight; // in slides: 0 = first, 1 = second, ...
    const nearest = clamp(Math.round(position), 0, this.#projects.length - 1);
    const offset = Math.abs(position - nearest);

    if (this.#scrollTarget === null) {
      if (nearest !== this.#active) this.#setActive(nearest);
    } else if (nearest === this.#scrollTarget && offset * clientHeight < 5) {
      this.#releaseScrollLock();
    }

    this.#slides.forEach((slide, i) => {
      const progress = clamp(Math.abs(position - i), 0, 1);
      slide.frame.style.setProperty("--progress", progress.toFixed(3));
    });

    const settled = offset < SETTLED_FRACTION;
    this.#ui.heading.classList.toggle("is-leaving", !settled);
    if (settled) this.#showDetails(nearest);
  }

  #onKeyDown(event) {
    if (!this.#isCentredInViewport()) return;

    const target = this.#projectForKey(event.key);
    if (target === null) return;

    event.preventDefault();
    this.#scrollTo(target);
  }

  /** Left/right wrap around; up/down stop at the ends so the page itself can scroll on. */
  #projectForKey(key) {
    const count = this.#projects.length;
    const current = this.#active;
    switch (key) {
      case "ArrowRight":
        return (current + 1) % count;
      case "ArrowLeft":
        return (current - 1 + count) % count;
      case "ArrowDown":
        return this.#neighbour(1);
      case "ArrowUp":
        return this.#neighbour(-1);
      default:
        return null;
    }
  }

  #isCentredInViewport() {
    const { top, bottom } = this.#root.getBoundingClientRect();
    const middle = window.innerHeight / 2;
    return top <= middle && bottom >= middle;
  }

  /**
   * Wheel and touch gestures outside the gallery step it to the neighbouring
   * project, one project per gesture, like scrolling the gallery itself would.
   * Past the first or last project they fall through and scroll the page.
   *
   * (Nudging scrollTop by the gesture's delta doesn't work here: mandatory
   * scroll snapping pulls the gallery straight back to the current slide.)
   */
  #forwardGesturesToGallery() {
    const { scroller } = this.#ui;
    const isInGallery = (event) => scroller.contains(event.target);

    let lastWheelTime = -Infinity;
    let wheelGestureStepped = false;

    this.#root.addEventListener(
      "wheel",
      (event) => {
        if (isInGallery(event)) {
          this.#releaseScrollLock(); // native scrolling takes over
          return;
        }

        if (event.timeStamp - lastWheelTime > WHEEL_GESTURE_GAP_MS) wheelGestureStepped = false;
        lastWheelTime = event.timeStamp;

        // Swallow the rest of a gesture that already stepped, including trackpad inertia.
        if (wheelGestureStepped) {
          event.preventDefault();
          return;
        }

        const target = this.#neighbour(Math.sign(event.deltaY));
        if (target === null) return;

        event.preventDefault();
        wheelGestureStepped = true;
        this.#scrollTo(target);
      },
      { passive: false },
    );

    let touchStart = { x: 0, y: 0 };

    this.#root.addEventListener(
      "touchstart",
      (event) => {
        this.#releaseScrollLock();
        if (event.touches.length !== 1) return;
        touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      },
      { passive: true },
    );

    // Keep the page still while a vertical swipe is heading for another project.
    this.#root.addEventListener(
      "touchmove",
      (event) => {
        if (event.touches.length !== 1 || isInGallery(event)) return;
        const swipeX = touchStart.x - event.touches[0].clientX;
        const swipeY = touchStart.y - event.touches[0].clientY;
        if (Math.abs(swipeY) > Math.abs(swipeX) && this.#neighbour(Math.sign(swipeY)) !== null) {
          event.preventDefault();
        }
      },
      { passive: false },
    );

    this.#root.addEventListener(
      "touchend",
      (event) => {
        if (event.changedTouches.length !== 1 || isInGallery(event)) return;
        const swipeY = touchStart.y - event.changedTouches[0].clientY;
        if (Math.abs(swipeY) < SWIPE_THRESHOLD_PX) return;

        const target = this.#neighbour(Math.sign(swipeY));
        if (target !== null) this.#scrollTo(target);
      },
      { passive: true },
    );
  }

  /** The project `direction` (+1 or -1) steps away from the active one, or null past either end. */
  #neighbour(direction) {
    const index = this.#active + direction;
    return direction !== 0 && index >= 0 && index < this.#projects.length ? index : null;
  }

  // ---- Rendering ----

  /** Shows photo `photo` on slide `index` (sharp image + blurred ambient copy). */
  #paintSlide(index, photo) {
    const { photos, ambient, images } = this.#slides[index];
    photos.forEach((image, i) => image.classList.toggle("is-active", i === photo));
    ambient.style.backgroundImage = `url("${images[photo]}")`;
  }
}

function renderSlide(project) {
  const ambient = el("div", { class: "slide__ambient" });
  const photos = project.images.map((src, i) =>
    el("img", { class: "slide__photo", src, alt: `${project.title} screenshot ${i + 1}`, decoding: "async" }),
  );
  const shade = el("div", { class: "slide__shade" });
  const frame = el("div", { class: "slide__frame" }, [ambient, ...photos, shade]);

  return {
    element: el("div", { class: "slide" }, [frame]),
    frame,
    ambient,
    photos,
    images: project.images,
  };
}

function dotButton(label, onClick, modifier = "") {
  const button = el("button", { type: "button", class: `dot ${modifier}`.trim(), "aria-label": label });
  button.addEventListener("click", onClick);
  return button;
}

function setDotActive(dot, active) {
  dot.classList.toggle("is-active", active);
  dot.toggleAttribute("aria-current", active);
}
