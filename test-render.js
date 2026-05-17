const ejs = require('ejs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

const mockOrg = { name: "Test Org" };
const mockEvent = {
    name: "Test Event",
    event_date: "2023-12-01",
    event_time: "10:00",
    category: "Tech",
    isindividual: true,
    imgurl: "https://placehold.co/600",
    hall: "Main_Hall"
};

async function runTests() {
    console.log("--- Testing 'all' mode ---");
    try {
        const htmlAll = await ejs.renderFile(path.join(viewsDir, 'orgEventRegistrations.ejs'), {
            registrationsViewMode: 'all',
            events: [mockEvent],
            event: mockEvent, // Template refers to event.name in title regardless of mode
            org: mockOrg,
            root: viewsDir,
            settings: { views: viewsDir }
        });
        console.log("SUCCESS: 'all' mode rendered.");
    } catch (err) {
        console.error("ERROR: 'all' mode failed:");
        console.error(err.message);
    }

    console.log("\n--- Testing 'single' mode ---");
    try {
        const htmlSingle = await ejs.renderFile(path.join(viewsDir, 'orgEventRegistrations.ejs'), {
            registrationsViewMode: 'single',
            event: mockEvent,
            registrations: [{ usn: "123", name: "John Doe" }],
            totalRegistrations: 1,
            capacity: 50,
            registrationPercent: 2,
            org: mockOrg,
            root: viewsDir,
            settings: { views: viewsDir }
        });
        console.log("SUCCESS: 'single' mode rendered.");
    } catch (err) {
        console.error("ERROR: 'single' mode failed:");
        console.error(err.message);
    }
}

runTests();
