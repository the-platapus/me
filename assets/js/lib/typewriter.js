/**
 * Types text into an element one character at a time, erasing whatever is
 * already there first.
 *
 *   const typewriter = new Typewriter(span, { typeDelay: 75, eraseDelay: 27 });
 *   await typewriter.write("Hello");
 */
export class Typewriter {
  #output;
  #typeDelay;
  #eraseDelay;

  #text = "";
  #target = "";
  #erasing = false;
  #paused = false;
  #timer = null;
  #resolveWrite = null;

  /**
   * @param {HTMLElement} output Element whose text content is typed into.
   * @param {{ typeDelay: number, eraseDelay: number }} delays Milliseconds per character.
   */
  constructor(output, { typeDelay, eraseDelay }) {
    this.#output = output;
    this.#typeDelay = typeDelay;
    this.#eraseDelay = eraseDelay;
  }

  /**
   * Erases the current text, then types `text`. Calling it again mid-way
   * switches to the new text.
   * @returns {Promise<void>} Resolves once `text` is fully typed, or once it is replaced by a newer write.
   */
  write(text) {
    this.#resolveWrite?.();
    this.#target = text;
    this.#erasing = this.#text.length > 0;
    return new Promise((resolve) => {
      this.#resolveWrite = resolve;
      this.#schedule();
    });
  }

  pause() {
    this.#paused = true;
    clearTimeout(this.#timer);
    this.#timer = null;
  }

  resume() {
    this.#paused = false;
    this.#schedule();
  }

  #schedule() {
    if (this.#paused || this.#timer !== null) return;
    const delay = this.#erasing ? this.#eraseDelay : this.#typeDelay;
    this.#timer = setTimeout(this.#step, delay);
  }

  #step = () => {
    this.#timer = null;

    if (this.#erasing && this.#text.length === 0) {
      this.#erasing = false;
    }

    if (this.#erasing) {
      this.#render(this.#text.slice(0, -1));
    } else if (this.#text.length < this.#target.length) {
      this.#render(this.#target.slice(0, this.#text.length + 1));
    } else {
      this.#resolveWrite?.();
      this.#resolveWrite = null;
      return;
    }

    this.#schedule();
  };

  #render(text) {
    this.#text = text;
    this.#output.textContent = text;
  }
}
