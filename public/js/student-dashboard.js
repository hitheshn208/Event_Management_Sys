document.addEventListener("DOMContentLoaded", () => {
    const logoutButton = document.getElementById("student-logout-btn");
    const messageDialog = document.getElementById("student-message-dialog");
    const messageTitle = document.getElementById("student-message-title");
    const messageText = document.getElementById("student-message-text");
    const categoryFilter = document.getElementById("student-category-filter");
    const eventCards = Array.from(document.querySelectorAll("[data-event-card]"));
    const filterEmptyState = document.querySelector("[data-filter-empty-state]");

    document.querySelectorAll(".student-progress-fill[data-registration-percent]").forEach((fill) => {
        const percent = Number(fill.dataset.registrationPercent || 0);
        fill.style.width = `${percent}%`;
    });

    const applyCategoryFilter = () => {
        if (!categoryFilter || eventCards.length === 0) {
            return;
        }

        const selectedCategory = categoryFilter.value.trim().toLowerCase();
        let visibleCount = 0;

        eventCards.forEach((card) => {
            const cardCategory = String(card.dataset.category || "").trim().toLowerCase();
            const shouldShow = selectedCategory === "all" || cardCategory === selectedCategory;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount += 1;
            }
        });

        if (filterEmptyState) {
            filterEmptyState.hidden = visibleCount !== 0;
            filterEmptyState.classList.toggle("is-visible", visibleCount === 0);
        }
    };

    if (categoryFilter) {
        categoryFilter.addEventListener("change", applyCategoryFilter);
        applyCategoryFilter();
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            window.location.href = "/auth/logout";
        });
    }

    if (messageDialog && messageTitle && messageText) {
        messageDialog.addEventListener("close", () => {
            messageTitle.textContent = "Notice";
            messageText.textContent = "";
        });
    }
});
