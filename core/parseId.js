const { NotFoundError } = require("./errors");

/** Route ids must be positive integers; anything else simply doesn't exist. */
module.exports = function parseId(raw, message = "Not found") {
    const value = String(raw ?? "");
    if (!/^\d{1,9}$/.test(value)) throw new NotFoundError(message);
    return Number(value);
};
