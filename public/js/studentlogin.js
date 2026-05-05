function showMessage(message, isSuccess = false) {
    const errorContainer = document.getElementById('error-message');

    if (!errorContainer) {
        return;
    }

    if (!message) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
        errorContainer.classList.remove('is-success');
        return;
    }

    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    errorContainer.classList.toggle('is-success', isSuccess);
}

function isValidUSN(usn) {
    const trimmedUSN = usn.trim().toUpperCase();
    const usnRegex = /^1MS\d{2}[A-Z]{2}\d{3}$/;
    return usnRegex.test(trimmedUSN);
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('student-login-form');

    if (!form) {
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const usnInput = document.getElementById('usn');
        const passwordInput = document.getElementById('password');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        const usn = usnInput.value.trim().toUpperCase();
        const password = passwordInput.value;

        showMessage('');

        if (!isValidUSN(usn)) {
            showMessage('Enter a valid USN format (e.g., 1MS24CS001).');
            usnInput.focus();
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usn,
                    password
                })
            });

            let responseData = {};

            try {
                responseData = await response.json();
            } catch (error) {
                responseData = {};
            }

            if (!response.ok) {
                showMessage(responseData.message || 'Unable to log in. Please try again.');
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }

            if (responseData.redirecturl) {
                form.reset();
                window.location.href = responseData.redirecturl;
                submitButton.disabled = false;
                submitButton.textContent = originalText;
                return;
            }

            showMessage(responseData.message || 'Login successful', true);
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please check your connection and try again.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
});