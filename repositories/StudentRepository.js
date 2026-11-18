const BaseRepository = require("./BaseRepository");
const Student = require("../domain/Student");

class StudentRepository extends BaseRepository {
    /** @returns {Promise<Student|null>} including the password hash */
    async findByUsn(usn) {
        const row = await this.one("SELECT * FROM student WHERE usn = $1", [String(usn)]);
        return row ? Student.fromRow(row) : null;
    }

    async exists(usn) {
        return (await this.one("SELECT 1 FROM student WHERE usn = $1", [String(usn)])) !== null;
    }

    /** Public profile only — never selects the password column. */
    getProfile(usn) {
        return this.one("SELECT usn, name, email FROM student WHERE usn = $1", [String(usn)]);
    }

    async create(student, passwordHash) {
        await this.run(
            "INSERT INTO student (usn, name, phone, email, password, dept, year_out) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [student.usn.value, student.name, student.phone, student.email, passwordHash, student.department, student.graduationYear]
        );
        return student;
    }

    /** USNs from the list that have no account. */
    async findMissing(usns, client) {
        if (!usns.length) return [];
        const rows = await this.many("SELECT usn FROM student WHERE usn = ANY($1)", [usns], client);
        const existing = new Set(rows.map((row) => row.usn));
        return usns.filter((usn) => !existing.has(usn));
    }
}

module.exports = StudentRepository;
