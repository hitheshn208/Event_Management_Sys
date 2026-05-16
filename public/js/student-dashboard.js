// Load events on page load
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
});

// Load registered events
function loadEvents() {
    fetch('/api/student/registered-events', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const eventsGrid = document.getElementById('eventsGrid');
        const emptyState = document.getElementById('emptyState');

        if (data.events && data.events.length > 0) {
            emptyState.style.display = 'none';
            eventsGrid.innerHTML = '';
            
            data.events.forEach(event => {
                const eventCard = createEventCard(event);
                eventsGrid.appendChild(eventCard);
            });
        } else {
            eventsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Error loading events:', error);
        document.getElementById('emptyState').style.display = 'flex';
    });
}

// Create event card element
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';

    let rulesHTML = '';
    if (event.rules && event.rules.length > 0) {
        rulesHTML = `
            <div class="event-rules">
                <h4>Rules:</h4>
                <ul>
                    ${event.rules.map(rule => `<li>${rule}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    card.innerHTML = `
        <div class="event-header">
            <h2>${event.eventName}</h2>
            <span class="event-status ${event.status.toLowerCase()}">
                ${event.status}
            </span>
        </div>

        <div class="event-details">
            <div class="detail-item">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${new Date(event.eventDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${event.eventTime}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">${event.location}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Organizer:</span>
                <span class="detail-value">${event.organizerName}</span>
            </div>
        </div>

        <div class="event-description">
            <p>${event.description.substring(0, 150)}...</p>
        </div>

        ${rulesHTML}

        <div class="event-actions">
            <button class="btn btn-primary" onclick="viewEventDetails('${event._id}')">
                View Details
            </button>
            <button class="btn btn-danger" onclick="unregisterEvent('${event._id}', '${event.eventName}')">
                Unregister
            </button>
        </div>
    `;

    return card;
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                window.location.href = '/auth/student-login';
            }
        })
        .catch(error => console.error('Logout error:', error));
    }
}

// View event details
function viewEventDetails(eventId) {
    window.location.href = `/event/${eventId}`;
}

// Unregister from event
function unregisterEvent(eventId, eventName) {
    if (confirm(`Are you sure you want to unregister from "${eventName}"?`)) {
        fetch(`/event/${eventId}/unregister`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Successfully unregistered from the event');
                loadEvents();
            } else {
                alert('Error unregistering from event: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error unregistering from event');
        });
    }
}
