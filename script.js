/*
  script.js — Freek van Rijn
  ---------------------------------------------------------------
  1. Footer year.
  2. Topbar border on scroll.
  3. Hero name slow line-reveal.
  4. IntersectionObserver fade-up for [data-reveal] (first reveal only).
  5. Cursor-follower glow (desktop only; smoothly trails the pointer).
*/

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* 1. Footer year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 2. Topbar border on scroll */
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const onScroll = () => {
      topbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* 3. Hero reveal */
  const heroName = document.querySelector(".hero__name");
  if (heroName) {
    if (prefersReducedMotion) {
      heroName.classList.add("is-revealed");
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => heroName.classList.add("is-revealed"));
      });
    }
  }

  /* 4. Reveal on scroll */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || "0", 10);
          if (delay > 0) {
            window.setTimeout(() => el.classList.add("is-in"), delay);
          } else {
            el.classList.add("is-in");
          }
          io.unobserve(el);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* 5. Cursor-follower glow
     Desktop only — touch devices skip this entirely so it doesn't fight
     touch-scrolling or burn battery on phones. */
  const glow = document.querySelector(".cursor-glow");
  const isTouch =
    window.matchMedia("(hover: none)").matches ||
    "ontouchstart" in window;

  if (glow && !isTouch && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    document.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add("is-on");
    });

    document.addEventListener("pointerleave", () => {
      glow.classList.remove("is-on");
    });

    const tick = () => {
      // Lerp toward target — gives the glow a soft, lazy trail.
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.setProperty("--mx", currentX + "px");
      glow.style.setProperty("--my", currentY + "px");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
