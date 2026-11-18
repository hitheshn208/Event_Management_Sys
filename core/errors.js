/**
 * Error hierarchy. Services throw these; one Express error handler turns
 * them into HTTP responses, so no layer below the controllers knows about
 * status codes or `res`.
 */
class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = this.constructor.name;
        this.status = status;
    }
}

class ValidationError extends AppError {
    constructor(message) { super(message, 400); }
}

class AuthenticationError extends AppError {
    constructor(message = "Please log in to continue") { super(message, 401); }
}

class ForbiddenError extends AppError {
    constructor(message) { super(message, 403); }
}

class NotFoundError extends AppError {
    constructor(message = "Not found") { super(message, 404); }
}

class ConflictError extends AppError {
    constructor(message) { super(message, 409); }
}

module.exports = { AppError, ValidationError, AuthenticationError, ForbiddenError, NotFoundError, ConflictError };
