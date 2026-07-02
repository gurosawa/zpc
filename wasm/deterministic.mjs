function toWords(input) {
  const bytes = new TextEncoder().encode(input);
  const words = [];

  for (let index = 0; index < bytes.length; index += 4) {
    let word = 0;
    for (let offset = 0; offset < 4; offset += 1) {
      word |= (bytes[index + offset] ?? 0) << (offset * 8);
    }
    words.push(word >>> 0);
  }

  if (words.length === 0) {
    words.push(0);
  }

  words.push(bytes.length >>> 0);
  return words;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d) >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b) >>> 0;
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function rotateLeft(value, shift) {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}

function toHex(value) {
  return (value >>> 0).toString(16).padStart(8, "0");
}

export function wordsForInput(input) {
  return toWords(input);
}

export function poseidonHashToy(input) {
  const words = toWords(input);
  const state = [0x243f6a88, 0x85a308d3, 0x13198a2e, 0x03707344];

  words.forEach((word, index) => {
    const round = Math.imul(index + 1, 0x9e3779b9) >>> 0;
    const value = mix32((word + round) >>> 0);
    state[0] = mix32((state[0] ^ value) >>> 0);
    state[1] = mix32((state[1] + Math.imul(value, 0x85ebca6b)) >>> 0);
    state[2] = mix32((state[2] ^ rotateLeft(value, (index % 31) + 1)) >>> 0);
    state[3] = mix32((state[3] + word + value) >>> 0);
  });

  return state.map(toHex).join("");
}

export const TEST_VECTORS = [
  { input: "", output: "55796ad172fbb3ae4776a54eb8c06432" },
  { input: "zkTLS", output: "6b6bf63e3fab55534e8dee89ab2f5363" },
  {
    input: "zkTLS deterministic demo with a longer local-only input",
    output: "bd80adb9f7922df6cecec8f411da557d",
  },
];
