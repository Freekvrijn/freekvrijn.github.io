/*
  script.js — Freek van Rijn
  ---------------------------------------------------------------
  What this file does (in order):

    1. Sets the current year in the footer.
    2. Adds a border under the sticky topbar once the page has scrolled.
    3. Runs the hero name's slow line-reveal on load.
    4. Uses IntersectionObserver to fade-up any element with
       [data-reveal] on its first time entering the viewport.
       Per-element delay can be set with data-reveal-delay="ms".

  No frameworks. No build step. Drop-in.
*/

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* 1. Footer year ------------------------------------------------ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 2. Topbar border on scroll ------------------------------------ */
  const topbar = document.querySelector(".topbar");
  if (topbar) {
    const onScroll = () => {
      topbar.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* 3. Hero reveal ------------------------------------------------ */
  // The hero name has two lines that translateY up from a clipped row.
  // Trigger immediately after first paint so it feels intentional.
  const heroName = document.querySelector(".hero__name");
  if (heroName) {
    if (prefersReducedMotion) {
      heroName.classList.add("is-revealed");
    } else {
      requestAnimationFrame(() => {
        // small extra rAF so the browser has applied initial styles
        requestAnimationFrame(() => heroName.classList.add("is-revealed"));
      });
    }
  }

  /* 4. Reveal on scroll ------------------------------------------- */
  // First-reveal only — once visible, the observer disconnects from
  // that element so scrolling back up doesn't re-trigger.
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
        // Trigger a bit before the element fully enters — feels less abrupt.
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    revealEls.forEach((el) => io.observe(el));
  }
})();
