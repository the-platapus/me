# me

a damn portfolio — the plain HTML/CSS/JS edition of [the-platapus/mee](https://github.com/the-platapus/mee).

No build step: the files in this repo are served as-is (GitHub Pages).

## Running locally

The scripts are ES modules, which browsers won't load from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
```

then open <http://localhost:8000>.

## Layout

```
index.html                 page markup (all static copy lives here)
assets/
  css/
    base.css               design tokens, document defaults, shared utilities
    background.css         loader, backdrop photo, fireflies, vignette, page scroller
    hero.css               landing section
    about.css              intro, quote/aim panel, bio
    projects.css           projects showcase
  js/
    main.js                entry point: wires the features together
    data/
      taglines.js          phrases typed under the name
      projects.js          projects shown in the showcase
    features/
      background.js        progressive background loading + scroll blur
      fireflies.js         randomly wandering fireflies
      hero.js              tagline typewriter, email easter egg
      sections.js          hidden sections revealed by [data-reveal] buttons
      projects.js          projects showcase (gallery, carousel, gestures, keys)
    lib/                   small helpers (DOM, typewriter, utils)
  images/
    background-*.{webp,png}
    projects/<project id>/ project screenshots
oneko/                     the cat that chases your cursor (oneko.js, MIT)
```

The About and Projects sections start hidden and are unlocked by the arrow buttons, so
visitors can't scroll past the landing section until they ask for more.

## Adding a project

1. Put its images in `assets/images/projects/<id>/`.
2. Add an entry to `assets/js/data/projects.js`.

The slide, nav dot and photo dots are generated from that entry.
