/**
 * Composition root: the one place where concrete classes are created and
 * wired together. Every other class receives its collaborators through its
 * constructor, so layers only depend on the layer directly below them.
 */
const Database = require("./core/Database");
const PasswordHasher = require("./core/PasswordHasher");
const TokenService = require("./core/TokenService");

const StudentRepository = require("./repositories/StudentRepository");
const OrganizationRepository = require("./repositories/OrganizationRepository");
const EventRepository = require("./repositories/EventRepository");
const VenueRepository = require("./repositories/VenueRepository");
const CoordinatorRepository = require("./repositories/CoordinatorRepository");
const RegistrationRepository = require("./repositories/RegistrationRepository");

const AuthService = require("./services/AuthService");
const EventService = require("./services/EventService");
const RegistrationService = require("./services/RegistrationService");

const AuthController = require("./controllers/AuthController");
const StudentController = require("./controllers/StudentController");
const OrganizationController = require("./controllers/OrganizationController");
const createAuthGuard = require("./middleware/authGuard");

function buildContainer() {
    const database = Database.getInstance();
    const passwordHasher = new PasswordHasher();
    const tokenService = new TokenService();

    const repositories = {
        studentRepository: new StudentRepository(database),
        organizationRepository: new OrganizationRepository(database),
        eventRepository: new EventRepository(database),
        venueRepository: new VenueRepository(database),
        coordinatorRepository: new CoordinatorRepository(database),
        registrationRepository: new RegistrationRepository(database),
    };

    const authService = new AuthService({ ...repositories, passwordHasher });
    const eventService = new EventService({ ...repositories, database });
    const registrationService = new RegistrationService({ ...repositories, database });

    return {
        requireRole: createAuthGuard(tokenService),
        authController: new AuthController({ authService, tokenService }),
        studentController: new StudentController({ eventService, registrationService }),
        organizationController: new OrganizationController({ eventService }),
    };
}

module.exports = buildContainer;
