const pageShell = document.querySelector(".page-panels");
const siteHeader = document.querySelector(".site-header");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const revealItems = document.querySelectorAll(".reveal");
const timelineItems = document.querySelectorAll(".growth-timeline li");
const experienceButtons = document.querySelectorAll("[data-experience-target]");
const experienceBackButtons = document.querySelectorAll("[data-experience-back]");
const experienceViews = document.querySelectorAll("[data-experience-view]");
const journeyCue = document.querySelector(".journey-cue");
const timelineBlock = document.querySelector("#timeline");

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
  });

  updateJourneyCue();
}

function updateJourneyCue() {
  if (!journeyCue || !timelineBlock) return;

  const overviewIsActive = document.querySelector("#panel-overview")?.classList.contains("active");
  const timelineTop = timelineBlock.getBoundingClientRect().top;
  const shouldHide = !overviewIsActive || timelineTop < window.innerHeight * 0.48;
  journeyCue.classList.toggle("is-hidden", shouldHide);
}

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
}

function activateExperienceHash() {
  const experienceTab = document.querySelector("#tab-experience");
  if (!experienceTab) return;

  if (window.location.hash.startsWith("#experience-")) {
    setActiveTab(experienceTab);
    showExperienceView(window.location.hash.replace("#experience-", ""), { skipHistory: true });
  }

  if (window.location.hash === "#panel-experience") {
    setActiveTab(experienceTab);
    showExperienceView("overview", { skipHistory: true });
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
