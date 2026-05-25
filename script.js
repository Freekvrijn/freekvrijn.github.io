/*
  script.js — Freek van Rijn
  ---------------------------------------------------------------
  1. Taal-toggle (NL/EN) — bewaard in localStorage, default NL.
  2. Footer year.
  3. Reveal on scroll for [data-reveal] (first reveal only).
  4. Sidebar nav: highlight the link for the section currently in view.
*/

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* 1. Taal-toggle */
  const LANG_KEY = "lang";
  const SUPPORTED = ["nl", "en"];

  const readLang = () => {
    try {
      const v = localStorage.getItem(LANG_KEY);
      return SUPPORTED.includes(v) ? v : "nl";
    } catch {
      return "nl";
    }
  };

  const applyLang = (lang) => {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);

    // Wissel aria-label op elementen met data-aria-nl / data-aria-en
    document
      .querySelectorAll("[data-aria-nl][data-aria-en]")
      .forEach((el) => {
        const label = lang === "en" ? el.dataset.ariaEn : el.dataset.ariaNl;
        if (label) el.setAttribute("aria-label", label);
      });

    // Update toggle-knoppen
    document.querySelectorAll("[data-lang-set]").forEach((btn) => {
      const active = btn.dataset.langSet === lang;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  applyLang(readLang());

  document.querySelectorAll("[data-lang-set]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.langSet;
      if (!SUPPORTED.includes(lang)) return;
      try { localStorage.setItem(LANG_KEY, lang); } catch {}
      applyLang(lang);
    });
  });

  /* 2. Year */
  document.querySelectorAll(".year").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* 3. Reveal on scroll */
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

  /* 4. Active-section indicator in sidebar nav */
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
