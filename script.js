(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector("#mobile-nav");
  const progress = document.querySelector("#progress-fill");
  const progressRadial = document.querySelector("#progress-radial");
  const processMeter = document.querySelector("#process-meter");
  const processSection = document.querySelector("#process");
  const processVisual = document.querySelector(".process-visual");
  const processStage = document.querySelector("#process-stage");
  const year = document.querySelector("#year");
  const heroScroll = document.querySelector(".hero-scroll");
  const processSteps = [...document.querySelectorAll(".process-steps li")];
  const stackStage = document.querySelector("#stack-stage");
  const stackCards = [...document.querySelectorAll(".stack-card")];
  const stackDots = document.querySelector("#stack-dots");

  if (year) year.textContent = String(new Date().getFullYear());

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  if (stackDots && stackCards.length) {
    stackCards.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", `Solution ${i + 1}`);
      stackDots.appendChild(btn);
    });
  }
  const dots = [...(stackDots?.querySelectorAll("button") || [])];

  /* Kinetic word stagger */
  document.querySelectorAll("[data-kinetic]").forEach((el) => {
    if (el.dataset.kineticReady) return;
    const text = el.textContent.trim();
    el.textContent = "";
    el.classList.add("kinetic");
    text.split(/\s+/).forEach((token, i) => {
      const word = document.createElement("span");
      word.className = "word";
      word.style.setProperty("--i", String(i));
      word.textContent = token;
      el.appendChild(word);
      el.appendChild(document.createTextNode(" "));
    });
    el.dataset.kineticReady = "1";
  });

  document.querySelectorAll(".project").forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? "reveal--left" : "reveal--right");
  });

  const updateStack = () => {
    if (!stackStage || !stackCards.length) return;
    const rect = stackStage.getBoundingClientRect();
    const total = stackStage.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    const n = stackCards.length;
    const raw = p * (n - 0.001);
    const active = Math.min(n - 1, Math.floor(raw));
    const local = raw - active;

    stackCards.forEach((card, i) => {
      const offset = i - active;
      let scale = 1;
      let y = 0;
      let opacity = 1;
      let z = n - Math.abs(offset);

      if (reduceMotion) {
        card.style.zIndex = String(i === active ? n : 1);
        card.style.opacity = i === active ? "1" : "0";
        card.style.transform = "none";
        card.classList.toggle("is-active", i === active);
        return;
      }

      if (offset < 0) {
        // past cards exit upward
        const t = clamp(active - i + local, 0, 1);
        y = -120 * t;
        scale = lerp(1, 0.92, t);
        opacity = 1 - t;
        z = 1;
      } else if (offset === 0) {
        y = local * -28;
        scale = lerp(1, 0.97, local);
        opacity = 1;
        z = n + 2;
      } else {
        // upcoming cards sit behind
        const depth = offset - local;
        y = 28 * depth;
        scale = 1 - 0.045 * depth;
        opacity = clamp(1 - 0.18 * depth, 0.35, 1);
        z = n - offset;
      }

      card.style.zIndex = String(Math.round(z * 10));
      card.style.opacity = String(opacity);
      card.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      card.classList.toggle("is-active", i === active);
    });

    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === active));
  };

  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 16);
    if (heroScroll) heroScroll.style.opacity = String(clamp(1 - y / 260, 0, 1));

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pageP = max > 0 ? y / max : 0;
    if (progress) progress.style.width = `${pageP * 100}%`;
    if (progressRadial) progressRadial.style.strokeDashoffset = String(97.4 * (1 - pageP));

    let current = "";
    document.querySelectorAll("section[id]").forEach((section) => {
      if (y >= section.offsetTop - 130) current = section.id;
    });
    document.querySelectorAll('.nav a[href^="#"]').forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
    });

    if (!reduceMotion) {
      document.querySelectorAll("[data-speed]").forEach((layer) => {
        const speed = Number(layer.dataset.speed || 0);
        layer.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });

      document.querySelectorAll(".project.is-visible .project-media img").forEach((img) => {
        const parent = img.closest(".project");
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const mid = rect.top + rect.height / 2 - window.innerHeight / 2;
        img.style.translate = `0 ${clamp(mid * -0.04, -18, 18)}px`;
      });
    }

    /* Stacked solutions lookbook */
    updateStack();

    /* Process pin + scrollytelling + clip expand */
    if (processSection && processMeter) {
      const rect = processSection.getBoundingClientRect();
      const total = processSection.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
      processMeter.style.width = `${p * 100}%`;
      if (processVisual && !reduceMotion) {
        const inset = 12 * (1 - p);
        processVisual.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}% round 0)`;
      }
    }

    let activeStep = processSteps[0];
    processSteps.forEach((step) => {
      const rect = step.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const active = mid > window.innerHeight * 0.18 && mid < window.innerHeight * 0.72;
      step.classList.toggle("is-active", active);
      if (active) activeStep = step;
    });
    if (processStage && activeStep) {
      const num = activeStep.dataset.num || "01";
      const label = activeStep.dataset.label || "";
      processStage.innerHTML = `<span class="process-stage__num">${num}</span><p class="process-stage__label">${label}</p>`;
    }
  };

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    onScroll();
  });

  onScroll();

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      mobileNav.hidden = open;
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  const reveals = [...document.querySelectorAll(".reveal")];
  reveals.forEach((el) => {
    const siblings = [...(el.parentElement?.children || [])].filter((c) =>
      c.classList.contains("reveal")
    );
    const i = Math.max(0, siblings.indexOf(el));
    el.style.setProperty("--delay", `${Math.min(i, 4) * 80}ms`);
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("kinetic")) {
            entry.target.classList.add("is-inview");
          }
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    const kineticIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-inview");
        });
      },
      { threshold: 0.35 }
    );
    document.querySelectorAll(".kinetic").forEach((el) => kineticIo.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".kinetic").forEach((el) => el.classList.add("is-inview"));
  }
})();
