document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('org-logout-btn');
    if (!logoutButton) return;

    logoutButton.addEventListener('click', () => {
        window.location.href = '/auth/logout';
    });
});
