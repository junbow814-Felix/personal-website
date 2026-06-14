const pageShell = document.querySelector(".page-panels");
const siteHeader = document.querySelector(".site-header");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const revealItems = document.querySelectorAll(".reveal");
const timelineItems = document.querySelectorAll(".growth-timeline li");
const experienceButtons = document.querySelectorAll("[data-experience-target]");
const experienceBackButtons = document.querySelectorAll("[data-experience-back]");
const experienceReturnButtons = document.querySelectorAll("[data-experience-return]");
const returnTabButtons = document.querySelectorAll("[data-return-tab]");
const openTabButtons = document.querySelectorAll("[data-open-tab]");
const openExperienceButtons = document.querySelectorAll("[data-open-experience]");
const experienceViews = document.querySelectorAll("[data-experience-view]");
const journeyCue = document.querySelector(".journey-cue");
const timelineBlock = document.querySelector("#timeline");
const portfolioCue = document.querySelector(".portfolio-cue");
const portfolioMedia = document.querySelector("#meitu-media");
const experienceCue = document.querySelector(".experience-cue");
const lightbox = document.querySelector("[data-lightbox]");
const lightboxImage = document.querySelector("[data-lightbox-image]");
const lightboxTriggers = document.querySelectorAll("[data-lightbox-src]");
const lightboxCloseButton = document.querySelector("[data-lightbox-close]");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));
timelineItems.forEach((item) => revealObserver.observe(item));

window.setTimeout(() => {
  timelineItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.8) {
      item.classList.add("visible");
    }
  });
}, 300);

function setActiveTab(button) {
  const targetId = button.getAttribute("aria-controls");

  tabButtons.forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  tabPanels.forEach((panel) => {
    const isActive = panel.id === targetId;
    panel.classList.toggle("active", isActive);
    panel.hidden = !isActive;
    if (isActive) {
      panel.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
    }
  });

  updateJourneyCue();
}

function updateJourneyCue() {
  if (journeyCue && timelineBlock) {
    const overviewIsActive = document.querySelector("#panel-overview")?.classList.contains("active");
    const timelineTop = timelineBlock.getBoundingClientRect().top;
    const shouldHide = !overviewIsActive || timelineTop < window.innerHeight * 0.48;
    journeyCue.classList.toggle("is-hidden", shouldHide);
  }

  if (portfolioCue && portfolioMedia) {
    const portfolioView = document.querySelector('[data-experience-view="meitu-portfolio"]');
    const portfolioIsActive = portfolioView && !portfolioView.hidden;
    const mediaTop = portfolioMedia.getBoundingClientRect().top;
    const shouldHide = !portfolioIsActive || mediaTop < window.innerHeight * 0.64;
    portfolioCue.classList.toggle("is-hidden", shouldHide);
  }

  if (experienceCue) {
    const filledExperienceNames = new Set(["kawasaki", "changli", "redbook", "meitu"]);
    const activeExperienceView = Array.from(experienceViews).find((view) => !view.hidden);
    const isFilledExperience = filledExperienceNames.has(activeExperienceView?.dataset.experienceView);
    const remainingScroll = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
    experienceCue.classList.toggle("is-hidden", !isFilledExperience || remainingScroll < 180);
  }
}

experienceCue?.addEventListener("click", () => {
  window.scrollBy({
    top: Math.max(window.innerHeight * 0.72, 420),
    behavior: "smooth",
  });
});

function showExperienceView(viewName, options = {}) {
  const hasView = Array.from(experienceViews).some((view) => view.dataset.experienceView === viewName);
  const safeViewName = hasView ? viewName : "overview";

  experienceViews.forEach((view) => {
    const isActive = view.dataset.experienceView === safeViewName;
    view.classList.toggle("active", isActive);
    view.hidden = !isActive;
  });

  if (!options.skipHistory) {
    const nextHash = safeViewName === "overview" ? "#panel-experience" : `#experience-${safeViewName}`;
    if (window.location.hash !== nextHash) {
      history.pushState(null, "", nextHash);
    }
  }

  updateJourneyCue();
}

function activateExperienceHash() {
  const experienceTab = document.querySelector("#tab-experience");

  if (experienceTab && window.location.hash.startsWith("#experience-")) {
    setActiveTab(experienceTab);
    showExperienceView(window.location.hash.replace("#experience-", ""), { skipHistory: true });
    return;
  }

  if (window.location.hash.startsWith("#panel-")) {
    const tabName = window.location.hash.replace("#panel-", "");
    const targetTab = document.querySelector(`#tab-${tabName}`);
    if (!targetTab) return;
    setActiveTab(targetTab);
    if (tabName === "experience") {
      showExperienceView("overview", { skipHistory: true });
    }
  }
}

experienceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showExperienceView(button.dataset.experienceTarget);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

experienceBackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showExperienceView("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

experienceReturnButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showExperienceView(button.dataset.experienceReturn);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

returnTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = document.querySelector(`#tab-${button.dataset.returnTab}`);
    if (!targetTab) return;
    setActiveTab(targetTab);
    history.pushState(null, "", `#panel-${button.dataset.returnTab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

openTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetTab = document.querySelector(`#tab-${button.dataset.openTab}`);
    if (!targetTab) return;
    setActiveTab(targetTab);
    history.pushState(null, "", `#panel-${button.dataset.openTab}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

openExperienceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const experienceTab = document.querySelector("#tab-experience");
    if (!experienceTab) return;
    setActiveTab(experienceTab);
    showExperienceView(button.dataset.openExperience);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.hidden = true;
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.classList.remove("lightbox-open");
}

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = trigger.dataset.lightboxAlt || "";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    lightboxCloseButton?.focus();
  });
});

lightboxCloseButton?.addEventListener("click", closeLightbox);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) {
    closeLightbox();
  }
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("active")) return;

    pageShell.classList.add("switching");

    window.setTimeout(() => {
      setActiveTab(button);
      if (button.id === "tab-experience") {
        showExperienceView("overview", { skipHistory: true });
      }
      window.scrollTo({ top: 0, behavior: "auto" });
      pageShell.classList.remove("switching");
    }, 160);
  });
});

window.addEventListener("scroll", () => {
  siteHeader.classList.toggle("scrolled", window.scrollY > 36);
  updateJourneyCue();
});

window.addEventListener("popstate", activateExperienceHash);
window.addEventListener("hashchange", activateExperienceHash);

document.addEventListener("click", (event) => {
  const ripple = document.createElement("span");
  ripple.className = "click-ripple";
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  document.body.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 700);
});

activateExperienceHash();
updateJourneyCue();
