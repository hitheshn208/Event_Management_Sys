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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('organizer-register-form');

    if (!form) {
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const nameInput = document.getElementById('name');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        const name = nameInput.value.trim();
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        showMessage('');

        // Validation
        if (!name) {
            showMessage('Please enter your organization name.');
            nameInput.focus();
            return;
        }

        if (!username) {
            showMessage('Please enter a username for your organization.');
            usernameInput.focus();
            return;
        }

        if (!email) {
            showMessage('Please enter your organization email.');
            emailInput.focus();
            return;
        }

        // if (!isValidEmail(email)) {
        //     showMessage('Please enter a valid email address.');
        //     emailInput.focus();
        //     return;
        // }

        if (!password) {
            showMessage('Please enter a password.');
            passwordInput.focus();
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long.');
            passwordInput.focus();
            return;
        }

        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';

            const response = await fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    username,
                    email,
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
                showMessage(responseData.message || 'Unable to register. Please try again.');
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

            showMessage(responseData.message || 'Registration successful', true);
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        } catch (error) {
            console.error('Registration error:', error);
            showMessage('Network error. Please check your connection and try again.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    });
});
