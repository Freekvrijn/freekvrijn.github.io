/*
  script.js — Freek van Rijn
  ---------------------------------------------------------------
  1. Footer year + live local time (Netherlands).
  2. Reveal on scroll for [data-reveal] (first reveal only).
  3. Sidebar nav: highlight the link for the section currently in view.
*/

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* 1. Year + live time */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const timeEl = document.getElementById("now-time");
  if (timeEl) {
    const fmt = new Intl.DateTimeFormat("nl-NL", {
      timeZone: "Europe/Amsterdam",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const update = () => {
      timeEl.textContent = fmt.format(new Date());
    };
    update();
    // Update at the top of every minute (and again every 30s as a safety).
    setInterval(update, 30 * 1000);
  }

  /* 2. Reveal on scroll */
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* 3. Active-section indicator in sidebar nav */
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navLinks = new Map();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    navLinks.set(id, a);
  });

  if (sections.length && navLinks.size && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((link, key) => {
        link.classList.toggle("is-active", key === id);
      });
    };

    const visibility = new Map();
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });
        let bestId = null;
        let bestRatio = 0;
        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
        });
        if (bestId) setActive(bestId);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => navIO.observe(s));
  }
})();
