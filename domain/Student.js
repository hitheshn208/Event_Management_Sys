const User = require("./User");
const Usn = require("./Usn");

class Student extends User {
    constructor({ usn, name, email, phone = null, department = null, graduationYear = null, passwordHash = null }) {
        super({ name, email, passwordHash });
        this.usn = usn instanceof Usn ? usn : new Usn(usn);
        this.phone = phone;
        this.department = department ?? this.usn.departmentCode;
        this.graduationYear = graduationYear ?? this.usn.graduationYear;
    }

    static fromRow(row) {
        return new Student({
            usn: row.usn,
            name: row.name,
            email: row.email,
            phone: row.phone,
            department: row.dept,
            graduationYear: row.year_out,
            passwordHash: row.password,
        });
    }

    get role() {
        return "student";
    }

    get tokenId() {
        return this.usn.value;
    }

    get homeRoute() {
        return "/student/dashboard";
    }

    toProfile() {
        return { usn: this.usn.value, name: this.name, email: this.email };
    }
}

module.exports = Student;
