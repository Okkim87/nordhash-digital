// Smooth fade-in animation

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll(".card").forEach(card => {
    card.classList.add("hidden");
    observer.observe(card);
});

// Smooth scrolling for navigation

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// Hero title animation

window.addEventListener("load", () => {
    document.querySelector(".hero-content").classList.add("loaded");
});
