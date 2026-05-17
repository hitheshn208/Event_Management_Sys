// Hall mappings
const hallMappings = {
    esb: [
        { value: 'esb_seminar_1', label: 'SEMINAR HALL 1' },
        { value: 'esb_seminar_2', label: 'SEMINAR HALL 2' }
    ],
    des: [
        { value: 'des_hitech_1', label: 'HITECH SEMINAR HALL 1' },
        { value: 'des_hitech_2', label: 'HITECH SEMINAR HALL 2' }
    ]
};

let coordinatorCount = 1;
let uploadedFiles = [];

// Update halls based on selected block
function updateHalls() {
    const blockSelect = document.getElementById('eventBlock');
    const hallSelect = document.getElementById('eventHall');
    const selectedBlock = blockSelect.value;

    // Clear existing options
    hallSelect.innerHTML = '<option value="">Select a hall</option>';

    if (selectedBlock && hallMappings[selectedBlock]) {
        hallMappings[selectedBlock].forEach(hall => {
            const option = document.createElement('option');
            option.value = hall.value;
            option.textContent = hall.label;
            hallSelect.appendChild(option);
        });
    }
}

// Toggle event type fields
function toggleEventTypeFields() {
    const eventType = document.querySelector('input[name="eventType"]:checked').value;
    const individualFields = document.getElementById('individual-fields');
    const teamFields = document.getElementById('team-fields');

    if (eventType === 'individual') {
        individualFields.style.display = 'block';
        teamFields.style.display = 'none';
        document.getElementById('totalCapacity').required = true;
        document.getElementById('minTeamSize').required = false;
        document.getElementById('maxTeamSize').required = false;
        document.getElementById('totalTeams').required = false;
    } else {
        individualFields.style.display = 'none';
        teamFields.style.display = 'block';
        document.getElementById('totalCapacity').required = false;
        document.getElementById('minTeamSize').required = true;
        document.getElementById('maxTeamSize').required = true;
        document.getElementById('totalTeams').required = true;
    }
}

// Add coordinator
function addCoordinator(event) {
    event.preventDefault();

    const container = document.getElementById('coordinators-container');
    const newId = coordinatorCount;

    const coordinatorCard = document.createElement('div');
    coordinatorCard.className = 'coordinator-card';
    coordinatorCard.setAttribute('data-coordinator-id', newId);

    coordinatorCard.innerHTML = `
        <div class="coordinator-header">
            <h3>Coordinator ${newId + 1}</h3>
            <button type="button" class="remove-btn" onclick="removeCoordinator(event, ${newId})">Remove</button>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="coordinatorName-${newId}">Name <span style="color: red">*</span></label>
                <input type="text" id="coordinatorName-${newId}" class="coordinator-name" placeholder="Full name">
            </div>

            <div class="form-group">
                <label for="coordinatorEmail-${newId}">Email <span style="color: red">*</span></label>
                <input type="email" id="coordinatorEmail-${newId}" class="coordinator-email" placeholder="email@example.com">
            </div>
        </div>

        <div class="form-group">
            <label for="coordinatorPhone-${newId}">Phone Number <span style="color: red">*</span></label>
            <input type="tel" id="coordinatorPhone-${newId}" class="coordinator-phone" placeholder="+91 XXXXX XXXXX">
        </div>
    `;

    container.appendChild(coordinatorCard);
    coordinatorCount++;
    updateCoordinatorNumbers();
}

// Remove coordinator
function removeCoordinator(event, id) {
    event.preventDefault();

    const card = document.querySelector(`[data-coordinator-id="${id}"]`);
    if (card) {
        card.remove();
    }

    updateCoordinatorNumbers();
}

// Update coordinator numbers
function updateCoordinatorNumbers() {
    const cards = document.querySelectorAll('.coordinator-card');
    cards.forEach((card, index) => {
        const h3 = card.querySelector('h3');
        h3.textContent = `Coordinator ${index + 1}`;

        const removeBtn = card.querySelector('.remove-btn');
        if (cards.length > 1) {
            removeBtn.style.display = 'block';
        } else {
            removeBtn.style.display = 'none';
        }
    });
}

// File upload handling
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('eventPhotos');
const fileList = document.getElementById('file-list');
const imagePreview = document.getElementById('image-preview');

// Drag and drop
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#0F766E';
    fileUploadArea.style.backgroundColor = 'rgba(20, 184, 166, 0.04)';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#e0f7f3';
    fileUploadArea.style.backgroundColor = '#ffffff';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#e0f7f3';
    fileUploadArea.style.backgroundColor = '#ffffff';

    const files = e.dataTransfer.files;
    uploadedFiles = Array.from(files);
    handleFileSelect(uploadedFiles);
});

// File input change
fileInput.addEventListener('change', (e) => {
    uploadedFiles = Array.from(e.target.files);
    handleFileSelect(uploadedFiles);
});

function handleFileSelect(files) {
    if (files.length === 0) {
        fileList.innerHTML = '';
        imagePreview.innerHTML = '';
        return;
    }

    fileList.innerHTML = '';
    imagePreview.innerHTML = '';

    files.forEach((file, index) => {
        // Add file item to list
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span title="${file.name}">${file.name}</span>
            <button type="button" class="file-remove" data-index="${index}">✕</button>
        `;
        fileList.appendChild(fileItem);

        // Add image preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'image-item';
                previewDiv.innerHTML = `<img src="${e.target.result}" alt="Preview ${index}">`;
                imagePreview.appendChild(previewDiv);
            };
            reader.readAsDataURL(file);
        }
    });

    attachRemoveListeners();
}

function attachRemoveListeners() {
    const removeButtons = document.querySelectorAll('.file-remove');
    removeButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(btn.getAttribute('data-index'));
            removeFile(index);
        });
    });
}

function removeFile(index) {
    uploadedFiles.splice(index, 1);

    const dt = new DataTransfer();
    uploadedFiles.forEach((file) => {
        dt.items.add(file);
    });

    fileInput.files = dt.files;
    handleFileSelect(uploadedFiles);
}

// Show message
function showMessage(message, isError = false) {
    const errorContainer = document.getElementById('error-message');
    const successContainer = document.getElementById('success-message');

    if (isError) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        successContainer.style.display = 'none';
    } else {
        successContainer.textContent = message;
        successContainer.style.display = 'block';
        errorContainer.style.display = 'none';
    }

    // Auto-hide success message after 4 seconds
    if (!isError) {
        setTimeout(() => {
            successContainer.style.display = 'none';
        }, 4000);
    }
}

// Validate form data
function validateFormData() {
    const eventName = document.getElementById('eventName').value.trim();
    const eventCategory = document.getElementById('eventCategory').value;
    const eventDescription = document.getElementById('eventDescription').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const eventTime = document.getElementById('eventTime').value;
    const eventBlock = document.getElementById('eventBlock').value;
    const eventHall = document.getElementById('eventHall').value;
    const groupChatLink = document.getElementById('groupChatLink').value.trim();
    const eventType = document.querySelector('input[name="eventType"]:checked');
    const departmentRestriction = document.getElementById('departmentRestriction').value;
    const eventInstructions = document.getElementById('eventInstructions').value.trim();

    // Basic validations
    if (!eventName) {
        showMessage('Event name is required', true);
        return null;
    }

    if (!eventCategory) {
        showMessage('Category is required', true);
        return null;
    }

    if (!eventDescription) {
        showMessage('Description is required', true);
        return null;
    }

    if (!eventDate) {
        showMessage('Event date is required', true);
        return null;
    }

    if (!eventTime) {
        showMessage('Event time is required', true);
        return null;
    }

    if (!eventBlock) {
        showMessage('Block is required', true);
        return null;
    }

    if (!eventHall) {
        showMessage('Hall is required', true);
        return null;
    }

    // if (!groupChatLink) {
    //     showMessage('WhatsApp group link is required', true);
    //     return null;
    // }

    if (!eventType) {
        showMessage('Event type is required', true);
        return null;
    }

    const selectedEventType = eventType.value;
    let eventTypeData = {};

    if (selectedEventType === 'individual') {
        const totalCapacity = document.getElementById('totalCapacity').value;
        if (!totalCapacity || totalCapacity < 1) {
            showMessage('Total capacity must be at least 1', true);
            return null;
        }
        eventTypeData = { type: 'individual', capacity: parseInt(totalCapacity) };
    } else {
        const minTeamSize = document.getElementById('minTeamSize').value;
        const maxTeamSize = document.getElementById('maxTeamSize').value;
        const totalTeams = document.getElementById('totalTeams').value;

        if (!minTeamSize || minTeamSize < 1) {
            showMessage('Minimum team size must be at least 1', true);
            return null;
        }

        if (!maxTeamSize || maxTeamSize < 1) {
            showMessage('Maximum team size must be at least 1', true);
            return null;
        }

        if (parseInt(minTeamSize) > parseInt(maxTeamSize)) {
            showMessage('Minimum team size cannot be greater than maximum team size', true);
            return null;
        }

        if (!totalTeams || totalTeams < 1) {
            showMessage('Total teams must be at least 1', true);
            return null;
        }

        eventTypeData = {
            type: 'team',
            minSize: parseInt(minTeamSize),
            maxSize: parseInt(maxTeamSize),
            totalTeams: parseInt(totalTeams)
        };
    }

    // Validate coordinators
    const coordinatorCards = document.querySelectorAll('.coordinator-card');
    if (coordinatorCards.length === 0) {
        showMessage('At least one coordinator is required', true);
        return null;
    }

    const coordinators = [];
    coordinatorCards.forEach((card) => {
        const name = card.querySelector('.coordinator-name').value.trim();
        const email = card.querySelector('.coordinator-email').value.trim();
        const phone = card.querySelector('.coordinator-phone').value.trim();

        if (!name) {
            showMessage('Coordinator name is required', true);
            throw new Error('validation-failed');
        }

        if (!email) {
            showMessage('Coordinator email is required', true);
            throw new Error('validation-failed');
        }

        if (!phone) {
            showMessage('Coordinator phone is required', true);
            throw new Error('validation-failed');
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Invalid coordinator email format', true);
            throw new Error('validation-failed');
        }

        coordinators.push({ name, email, phone });
    });

    return {
        eventName,
        eventCategory,
        eventDescription,
        eventDate,
        eventTime,
        eventBlock,
        eventHall,
        groupChatLink,
        departmentRestriction: departmentRestriction || null,
        eventInstructions: eventInstructions || null,
        eventType: eventTypeData,
        coordinators,
        images: uploadedFiles
    };
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('event-form');
    const scrollProgress = document.getElementById('scroll-progress');
    const isEditMode = form?.dataset.mode === 'edit';
    const submitUrl = form?.dataset.submitUrl || '/organization/organise-event';

    function updateScrollProgress() {
        if (!scrollProgress) {
            return;
        }

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    coordinatorCount = Math.max(1, document.querySelectorAll('.coordinator-card').length);
    updateCoordinatorNumbers();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        try {
            // Validate and collect data
            const formData = validateFormData();
            if (!formData) return;

            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            submitButton.disabled = true;
            submitButton.textContent = isEditMode ? 'Updating Event...' : 'Creating Event...';

            // Create FormData for file upload
            const requestFormData = new FormData();
            requestFormData.append('data', JSON.stringify({
                eventName: formData.eventName,
                category: formData.eventCategory,
                description: formData.eventDescription,
                date: formData.eventDate,
                time: formData.eventTime,
                block: formData.eventBlock,
                hall: formData.eventHall,
                groupChatLink: formData.groupChatLink.length === 0? null : formData.groupChatLink,
                departmentRestriction: formData.departmentRestriction,
                eventInstructions: formData.eventInstructions,
                eventType: formData.eventType,
                coordinators: formData.coordinators
            }));

            // Add a single image file named 'image' to match multer.single('image') on the server
            if (formData.images && formData.images.length > 0) {
                requestFormData.append('image', formData.images[0]);
            }

            const response = await fetch(submitUrl, {
                method: isEditMode ? 'PUT' : 'POST',
                body: requestFormData
            });

            let responseData = {};
            try {
                responseData = await response.json();
            } catch (error) {
                responseData = {};
            }

            if (!response.ok) {
                showMessage(responseData.message || 'Failed to create event. Please try again.', true);
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }

            showMessage(responseData.message || 'Event created successfully!', false);
            
            // Redirect after success
            if (responseData.redirectUrl) {
                setTimeout(() => {
                    window.location.href = responseData.redirectUrl;
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }, 1500);
            } else {
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '/organization/dashboard';
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }, 1500);
            }

        } catch (error) {
            if (error.message !== 'validation-failed') {
                console.error('Form submission error:', error);
                showMessage('An error occurred. Please try again.', true);
            }
            
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = isEditMode ? 'Update Event' : 'Create Event';
        }
    });

    // Initialize coordinators display
    updateCoordinatorNumbers();
});