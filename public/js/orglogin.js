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

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('organizer-login-form');

    if (!form) {
        return;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        showMessage('');

        // Basic validation
        if (!username) {
            showMessage('Please enter your organization username.');
            usernameInput.focus();
            return;
        }

        if (!password) {
            showMessage('Please enter your password.');
            passwordInput.focus();
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
                    username,
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
