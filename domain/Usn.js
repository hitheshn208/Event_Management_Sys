const { ValidationError } = require("../core/errors");

/**
 * Value object for a university seat number, e.g. 1MS24CS001.
 *   1MS = college prefix, 24 = joining year, CS = department, 001 = roll number.
 * Normalises case/whitespace once, so the rest of the code never re-checks it.
 */
class Usn {
    static PATTERN = /^1MS\d{2}[A-Z]{2}\d{3}$/;
    static COURSE_YEARS = 4;

    #value;

    constructor(raw) {
        const value = Usn.normalize(raw);
        if (!Usn.PATTERN.test(value)) {
            throw new ValidationError("Invalid USN Format");
        }
        this.#value = value;
    }

    static normalize(raw) {
        return String(raw ?? "").trim().toUpperCase();
    }

    static isValid(raw) {
        return Usn.PATTERN.test(Usn.normalize(raw));
    }

    get value() {
        return this.#value;
    }

    /** Two-letter department code, e.g. "CS". */
    get departmentCode() {
        return this.#value.slice(5, 7);
    }

    /** Expected graduation year, e.g. 1MS24... -> 2028. */
    get graduationYear() {
        return 2000 + Number(this.#value.slice(3, 5)) + Usn.COURSE_YEARS;
    }

    equals(other) {
        return String(other) === this.#value;
    }

    toString() {
        return this.#value;
    }
}

module.exports = Usn;
