// USN Format Validation: 1MSyyddxxx
// 1MS = prefix (fixed)
// yy = joining year (2 digits, like 24 for 2024)
// dd = department (2 letters)
// xxx = student number (3 digits)

function validateUSN(usn) {
  // Remove any spaces and convert to uppercase
    usn = usn.trim().toUpperCase();
    
    // USN Format regex: 1MS followed by 2 digits, 2 letters, 3 digits
    const usnRegex = /^1MS\d{2}[A-Z]{2}\d{3}$/;
    
    if (!usnRegex.test(usn)) {
        return {
        valid: false,
        message: 'Invalid USN format.'
        };
    }
    
    return { valid: true, message: '' };
    }

function validateForm() {
    const usn = document.getElementById('usn').value.trim();
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Clear previous errors
    clearErrors();

    // Validate USN
    const usnValidation = validateUSN(usn);
    if (!usnValidation.valid) {
        showError(usnValidation.message);
        document.getElementById('usn').focus();
        return false;
    }

    // Validate name
    if (name.length < 2) {
        showError('Name must be at least 2 characters long');
        document.getElementById('name').focus();
        return false;
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(phone)) {
        showError('Phone number must be exactly 10 digits');
        document.getElementById('phone').focus();
        return false;
    }

    // Validate email
    if (!email.includes('@')) {
        showError('Please enter a valid email address');
        document.getElementById('email').focus();
        return false;
    }

    // Validate password
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        document.getElementById('password').focus();
        return false;
    }

    return true;
}

function showError(message) {
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }
    }

function clearErrors() {
    const errorContainer = document.getElementById('error-message');
    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    }
}

    // Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('student-register-form');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        // Collect form data
        const formData = new FormData(form);
        const data = {
            usn: formData.get('usn').toUpperCase(),
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';

            // Submit to backend
            const response = await fetch('/auth/student-register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            // Parse response
            let responseData = {};
            try {
            responseData = await response.json();
            } catch (e) {
            responseData = { message: 'An error occurred. Please try again.' };
            }

            // Handle errors (40x status codes)
            if (!response.ok) {
                showError(responseData.message || `Error: ${response.status}`);
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }

            // Success - redirect or show success message
            showError(''); // Clear any errors
            // alert('Registration successful! Redirecting...');
            // Redirect to dashboard
            form.reset();
            window.location.href = responseData.redirecturl;
            submitButton.disabled = false;
            submitButton.textContent = originalText;

        } catch (error) {
            console.error('Registration error:', error);
            showError('Network error. Please check your connection and try again.');
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
        });
    }
});
