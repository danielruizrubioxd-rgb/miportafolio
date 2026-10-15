/* ==========================================================================
   Portafolio de Daniel Ruiz-Orejón Rubio
   JavaScript mínimo: la página funciona sin él, esto solo añade mejoras.
   ========================================================================== */
(() => {
    "use strict";

    const root = document.documentElement;

    /* ---------- Tema claro / oscuro ---------- */
    const themeBtn = document.querySelector("[data-theme-toggle]");

    const syncThemeButton = () => {
        themeBtn?.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    };

    themeBtn?.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        root.dataset.theme = next;
        try { localStorage.setItem("theme", next); } catch (_) { /* modo privado: se ignora */ }
        syncThemeButton();
    });
    syncThemeButton();

    /* ---------- Menú móvil ---------- */
    const menuBtn = document.querySelector("[data-menu-toggle]");
    const navLinks = document.querySelectorAll(".nav a");

    const setMenu = (open) => menuBtn?.setAttribute("aria-expanded", String(open));
    const menuIsOpen = () => menuBtn?.getAttribute("aria-expanded") === "true";

    menuBtn?.addEventListener("click", () => setMenu(!menuIsOpen()));
    navLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuIsOpen()) {
            setMenu(false);
            menuBtn.focus();
        }
    });

    /* ---------- Enlace activo según la sección visible ---------- */
    const byId = new Map([...navLinks].map((a) => [a.getAttribute("href").slice(1), a]));

    const spy = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((a) => a.removeAttribute("aria-current"));
                byId.get(entry.target.id)?.setAttribute("aria-current", "true");
            });
        },
        { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((section) => {
        if (byId.has(section.id)) spy.observe(section);
    });

    /* ---------- Foco de luz que sigue al cursor en los proyectos ---------- */
    if (matchMedia("(hover: hover)").matches) {
        document.querySelectorAll(".project").forEach((card) => {
            card.addEventListener("pointermove", (e) => {
                const r = card.getBoundingClientRect();
                card.style.setProperty("--mx", `${e.clientX - r.left}px`);
                card.style.setProperty("--my", `${e.clientY - r.top}px`);
            });
        });
    }

    /* ---------- Formulario (Netlify Forms) sin recargar la página ---------- */
    const form = document.querySelector("#contact-form");
    const status = form?.querySelector(".form-status");

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');

        button.disabled = true;
        status.dataset.state = "";
        status.textContent = "Enviando…";

        try {
            const body = new URLSearchParams(new FormData(form)).toString();
            const res = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            form.reset();
            status.dataset.state = "ok";
            status.textContent = "Mensaje enviado. Gracias, te respondo lo antes posible.";
        } catch (_) {
            status.dataset.state = "error";
            status.textContent =
                "No se ha podido enviar el mensaje. Inténtalo de nuevo o escríbeme a daniel.ruizorejon@gmail.com.";
        } finally {
            button.disabled = false;
        }
    });

    /* ---------- Año del pie ---------- */
    const year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
})();
