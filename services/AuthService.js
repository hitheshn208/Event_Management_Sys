const Usn = require("../domain/Usn");
const Student = require("../domain/Student");
const Organization = require("../domain/Organization");
const { AuthenticationError, ConflictError, ValidationError } = require("../core/errors");

const UNIQUE_VIOLATION = "23505";

/** Sign-up, login and "who am I" for both kinds of users. */
class AuthService {
    #students;
    #organizations;
    #hasher;

    constructor({ studentRepository, organizationRepository, passwordHasher }) {
        this.#students = studentRepository;
        this.#organizations = organizationRepository;
        this.#hasher = passwordHasher;
    }

    // ---- students ------------------------------------------------------------

    /** @returns {Promise<Student>} */
    async registerStudent({ usn, name, phone, email, password } = {}) {
        const id = new Usn(usn);
        AuthService.#require({ name, phone, email, password }, "Name, phone, email and password are required");

        if (await this.#students.exists(id)) {
            throw new ConflictError("USN already registered");
        }

        const student = new Student({ usn: id, name: String(name).trim(), phone: String(phone).trim(), email: String(email).trim() });
        const hash = await this.#hasher.hash(password);
        await this.#saveUnique(() => this.#students.create(student, hash), "Phone number or email is already registered");
        return student;
    }

    /** @returns {Promise<Student>} */
    async loginStudent({ usn, password } = {}) {
        if (!Usn.normalize(usn) || !password) {
            throw new ValidationError("USN and password are required");
        }
        const student = await this.#students.findByUsn(new Usn(usn));
        if (!student || !(await student.checkPassword(password, this.#hasher))) {
            throw new AuthenticationError("Invalid USN or password");
        }
        return student;
    }

    // ---- organizations -------------------------------------------------------

    /** @returns {Promise<Organization>} */
    async registerOrganization({ name, username, email, password } = {}) {
        AuthService.#require({ name, username, email, password }, "Name, username, email and password are required");
        const organization = new Organization({ name: String(name).trim(), username: String(username).trim(), email: String(email).trim() });

        if (await this.#organizations.existsByUsernameOrName(organization.username, organization.name)) {
            throw new ConflictError("Organization already registered");
        }

        const hash = await this.#hasher.hash(password);
        await this.#saveUnique(() => this.#organizations.create(organization, hash), "Organization already registered");
        return organization;
    }

    /** @returns {Promise<Organization>} */
    async loginOrganization({ username, password } = {}) {
        if (!username || !password) {
            throw new ValidationError("Username and password are required");
        }
        const organization = await this.#organizations.findByUsername(String(username).trim());
        if (!organization) {
            throw new AuthenticationError("Username not found");
        }
        if (!(await organization.checkPassword(password, this.#hasher))) {
            throw new AuthenticationError("Invalid password");
        }
        return organization;
    }

    // ---- session -------------------------------------------------------------

    /**
     * Resolves a verified token payload to the current user.
     * @returns {Promise<{role: string, user: object} | null>} null if the account no longer exists
     */
    async getSession({ id, role }) {
        if (role === "student") {
            const profile = await this.#students.getProfile(id);
            return profile ? { role, user: profile } : null;
        }
        if (role === "organization") {
            const profile = await this.#organizations.getProfile(id);
            return profile ? { role, user: { id, ...profile } } : null;
        }
        return null;
    }

    // ---- helpers -------------------------------------------------------------

    static #require(fields, message) {
        if (Object.values(fields).some((value) => !String(value ?? "").trim())) {
            throw new ValidationError(message);
        }
    }

    async #saveUnique(save, conflictMessage) {
        try {
            await save();
        } catch (error) {
            if (error.code === UNIQUE_VIOLATION) throw new ConflictError(conflictMessage);
            throw error;
        }
    }
}

module.exports = AuthService;
