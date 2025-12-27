export const log = {
  info: (msg, meta = {}) =>
    console.log(JSON.stringify({ level: "info", msg, ...meta })),

  error: (msg, meta = {}) =>
    console.error(JSON.stringify({ level: "error", msg, ...meta })),
};
