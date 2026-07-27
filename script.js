// Fade-in animaatiot
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll(
    ".service-card,.portfolio-card,.price-card,.hero-stats div,.dashboard,.cta"
).forEach(el => {
    el.classList.add("fade-up");
    observer.observe(el);
});

// Pehmeä scrollaus
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// Navbar tausta scrollatessa
const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {

        header.style.background = "rgba(5,8,22,.85)";
        header.style.backdropFilter = "blur(30px)";
        header.style.borderBottom = "1px solid rgba(255,255,255,.08)";

    } else {

        header.style.background = "rgba(5,8,22,.55)";
        header.style.borderBottom = "1px solid rgba(255,255,255,.05)";
    }

});

// Hero-kortin pieni 3D-liike hiirellä
const dashboard = document.querySelector(".dashboard");

if (dashboard) {

    dashboard.addEventListener("mousemove", (e) => {

        const rect = dashboard.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 12;
        const rotateX = ((y / rect.height) - 0.5) * -12;

        dashboard.style.transform =
            `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    });

    dashboard.addEventListener("mouseleave", () => {

        dashboard.style.transform =
            "perspective(1200px) rotateX(0deg) rotateY(0deg)";

    });

}
