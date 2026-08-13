(() => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const tabBar = document.querySelector(".tab-bar");
  const largeTitle = document.querySelector("[data-large-title]");
  const toTop = document.querySelector(".to-top");
  const form = document.getElementById("quote-form");
  const status = document.getElementById("form-status");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lastY = window.scrollY;
  let ticking = false;

  /* Navigation bar: condense on scroll, swap in the centered title once the
     large title has scrolled past, and drive the reading-progress hairline. */
  const updateChrome = () => {
    const y = window.scrollY;
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
      header.style.setProperty(
        "--progress",
        `${scrollable > 0 ? Math.min(100, (y / scrollable) * 100) : 0}%`
      );

      const threshold = largeTitle
        ? largeTitle.getBoundingClientRect().bottom + y - 70
        : 120;
      header.classList.toggle("is-condensed", y > threshold);
    }

    if (tabBar) {
      tabBar.classList.toggle("is-compact", y > lastY && y > 90);
    }

    if (toTop) {
      toTop.classList.toggle("is-visible", y > 600);
    }

    lastY = y;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateChrome);
  };

  updateChrome();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateChrome);

  if (toTop) {
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* Burger menu */
  if (navToggle && siteNav) {
    const setMenu = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      siteNav.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      setMenu(navToggle.getAttribute("aria-expanded") !== "true");
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("click", (event) => {
      if (siteNav.contains(event.target) || navToggle.contains(event.target)) return;
      setMenu(false);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (navToggle.getAttribute("aria-expanded") !== "true") return;
      setMenu(false);
      navToggle.focus();
    });

    window.addEventListener("scroll", () => setMenu(false), { passive: true });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 900px)").matches) setMenu(false);
    });
  }

  /* Staggered section reveals */
  const revealItems = document.querySelectorAll(".reveal");
  revealItems.forEach((item) => {
    const siblings = Array.from(item.parentElement?.children || []);
    const index = siblings.filter((el) => el.classList.contains("reveal")).indexOf(item);
    item.style.setProperty("--i", String(Math.max(0, Math.min(index, 6))));
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* Tab bar tap feedback */
  document.querySelectorAll(".tab-bar a").forEach((tab) => {
    tab.addEventListener("pointerdown", () => {
      tab.classList.add("is-tapped");
      window.setTimeout(() => tab.classList.remove("is-tapped"), 450);
    });
  });

  /* Gallery filtering with a re-entry animation */
  if (filterButtons.length && galleryItems.length) {
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter || "all";
        filterButtons.forEach((btn) => btn.classList.remove("is-active"));
        button.classList.add("is-active");

        galleryItems.forEach((item, index) => {
          const show = filter === "all" || item.dataset.category === filter;
          item.classList.toggle("is-hidden", !show);
          item.classList.remove("is-filtering");

          if (show && !reduceMotion) {
            item.style.animationDelay = `${Math.min(index, 8) * 45}ms`;
            void item.offsetWidth;
            item.classList.add("is-filtering");
          }
        });
      });
    });
  }

  /* Gallery cards open an iOS-style detail sheet */
  if (galleryItems.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Installation photo");
    lightbox.innerHTML = `
      <div class="lightbox-card">
        <button class="lightbox-close" type="button" aria-label="Close">✕</button>
        <img alt="" />
        <div class="lightbox-body">
          <h3></h3>
          <p></p>
          <a class="btn btn-primary" href="contact.html">Get a quote like this</a>
        </div>
      </div>`;
    document.body.appendChild(lightbox);

    const card = lightbox.querySelector(".lightbox-card");
    const lightboxImg = lightbox.querySelector("img");
    const lightboxTitle = lightbox.querySelector("h3");
    const lightboxText = lightbox.querySelector("p");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    let lastFocused = null;

    const openLightbox = (item) => {
      const img = item.querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxTitle.textContent = item.querySelector("h3")?.textContent || "";
      lightboxText.textContent = item.querySelector("figcaption p")?.textContent || "";
      lastFocused = item;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      document.body.style.overflow = "";
      lastFocused?.focus();
    };

    galleryItems.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "view-chip";
      chip.textContent = "View";
      item.appendChild(chip);

      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute(
        "aria-label",
        `View ${item.querySelector("h3")?.textContent || "installation photo"}`
      );

      item.addEventListener("click", () => openLightbox(item));
      item.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openLightbox(item);
      });
    });

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (!card.contains(event.target)) closeLightbox();
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  if (form && status) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = "Please complete the required fields.";
        form.reportValidity();
        return;
      }
      const name = String(new FormData(form).get("name") || "").trim();
      status.textContent = `Thanks${name ? `, ${name}` : ""}. We’ll follow up shortly.`;
      form.reset();
    });
  }
})();
