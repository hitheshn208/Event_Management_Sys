let coordinatorCount = 1;

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
                <label for="coordinatorName-${newId}">Coordinator Name *</label>
                <input type="text" id="coordinatorName-${newId}" name="coordinatorName[]" required placeholder="Full name">
            </div>

            <div class="form-group">
                <label for="coordinatorEmail-${newId}">Email *</label>
                <input type="email" id="coordinatorEmail-${newId}" name="coordinatorEmail[]" required placeholder="email@example.com">
            </div>
        </div>

        <div class="form-group">
            <label for="coordinatorPhone-${newId}">Phone Number *</label>
            <input type="tel" id="coordinatorPhone-${newId}" name="coordinatorPhone[]" required placeholder="+91 XXXXX XXXXX">
        </div>
    `;
    
    container.appendChild(coordinatorCard);
    coordinatorCount++;
}

function removeCoordinator(event, id) {
    event.preventDefault();
    
    const card = document.querySelector(`[data-coordinator-id="${id}"]`);
    if (card) {
        card.remove();
    }
    
    updateCoordinatorNumbers();
}

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

// File Upload Handling
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('eventPhotos');
const fileList = document.getElementById('file-list');
const imagePreview = document.getElementById('image-preview');

// Store files separately
let uploadedFiles = [];

// Drag and drop events
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#e88db3';
    fileUploadArea.style.backgroundColor = '#fdf0f5';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#e0b0c8';
    fileUploadArea.style.backgroundColor = '#fefbfd';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#e0b0c8';
    fileUploadArea.style.backgroundColor = '#fefbfd';
    
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
    
    // Clear previous previews
    fileList.innerHTML = '';
    imagePreview.innerHTML = '';
    
    files.forEach((file, index) => {
        // Add file item to list with remove button
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
    
    // Add event listeners to remove buttons
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
    
    // Create a new DataTransfer object and update the input
    const dt = new DataTransfer();
    uploadedFiles.forEach((file) => {
        dt.items.add(file);
    });
    
    fileInput.files = dt.files;
    handleFileSelect(uploadedFiles);
}

// Form validation
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.event-form');
    
    form.addEventListener('submit', (e) => {
        const minTeamSize = parseInt(document.getElementById('minTeamSize').value);
        const maxTeamSize = parseInt(document.getElementById('maxTeamSize').value);
        
        if (minTeamSize > maxTeamSize) {
            e.preventDefault();
            alert('Minimum team size cannot be greater than maximum team size');
            return false;
        }
    });
    
    updateCoordinatorNumbers();
});
