/**
 * Creates an element with the given attributes and children.
 * @param {string} tag
 * @param {Record<string, string>} [attributes]
 * @param {(Node | string)[]} [children]
 */
export function el(tag, attributes = {}, children = []) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value);
  }
  node.append(...children);
  return node;
}

/**
 * Keeps `frame`'s explicit height equal to `content`'s rendered height, so a CSS
 * `transition: height` on the frame animates whenever the content reflows.
 * @returns {() => void} Stops observing.
 */
export function syncHeight(frame, content) {
  const observer = new ResizeObserver(() => {
    frame.style.height = `${content.getBoundingClientRect().height}px`;
  });
  observer.observe(content);
  return () => observer.disconnect();
}
