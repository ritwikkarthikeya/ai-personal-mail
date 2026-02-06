export const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
  const magB = Math.sqrt(b.reduce((s, x) => s + x * x, 0));

  return dot / (magA * magB);
};
