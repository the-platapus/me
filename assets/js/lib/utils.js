export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const randomBetween = (min, max) => min + Math.random() * (max - min);

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
