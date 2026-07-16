(function () {
  const contentUrl = "site-content.json?v=editor-ready-v1";
  const previewMode = new URLSearchParams(window.location.search).get("preview") === "editor";
  const editorHints = [
    [".hero-copy .eyebrow", "首页首屏 > 英文小标题"],
    ["#hero-title", "首页首屏 > 姓名 / 岗位"],
    [".hero-lede", "首页首屏 > 三句话"],
    [".photo-card", "首页首屏 > 个人照片名片"],
    [".timeline-heading", "首页时间轴 > 标题与说明"],
    [".growth-timeline", "首页时间轴 > 节点列表"],
    ["#panel-skills .screen-heading", "能力 Tab > 顶部标题与说明"],
    ["#panel-skills .skill-metrics", "能力 Tab > 下方 4 个数据"],
    ["#panel-skills .skill-stack", "能力 Tab > 6 个能力卡片"],
    ["#panel-experience .experience-overview .screen-heading", "经历 Tab > 顶部标题与说明"],
    ["#panel-experience .experience-list", "经历 Tab > 横向经历卡片"],
    ["#panel-contact .screen-heading", "联系 Tab > 顶部标题与说明"],
    ["#panel-contact .contact-grid", "联系 Tab > 联系方式卡片"]
  ];

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element && value !== undefined) element.textContent = value;
  }

  function setLines(selector, lines) {
    const element = document.querySelector(selector);
    if (!element || !Array.isArray(lines)) return;
    element.replaceChildren();
    lines.forEach((line, index) => {
      if (index > 0) element.appendChild(document.createElement("br"));
      element.appendChild(document.createTextNode(line));
    });
  }

  function setHeading(selector, lines) {
    const element = document.querySelector(selector);
    if (!element || !Array.isArray(lines)) return;
    element.replaceChildren();
    lines.forEach((line) => {
      const span = document.createElement("span");
      span.textContent = line;
      element.appendChild(span);
    });
  }

  function applyTimeline(items) {
    if (!Array.isArray(items)) return;
    document.querySelectorAll(".growth-timeline li").forEach((item, index) => {
      const data = items[index];
      if (!data) return;
      setElementText(item.querySelector("time"), data.time);
      setElementText(item.querySelector("h3"), data.company);
      setElementText(item.querySelector(".timeline-role"), data.role);
      setElementText(item.querySelector("p"), data.description);
    });
  }

  function applySkills(skills) {
    if (!skills) return;
    setText("#panel-skills .screen-heading .eyebrow", skills.eyebrow);
    setHeading("#panel-skills .screen-heading h2", skills.title);
    setLines("#panel-skills .screen-lede", skills.description);

    document.querySelectorAll(".skill-metrics div").forEach((item, index) => {
      const data = skills.metrics?.[index];
      if (!data) return;
      setElementText(item.querySelector("strong"), data.value);
      setElementText(item.querySelector("span"), data.label);
    });

    document.querySelectorAll(".skill-row").forEach((item, index) => {
      const data = skills.items?.[index];
      if (!data) return;
      setElementText(item.querySelector("h3"), data.title);
      setElementText(item.querySelector("p"), data.description);
      setElementText(item.querySelector("em"), data.tags);
    });
  }

  function applyExperience(experience) {
    if (!experience) return;
    setText("#panel-experience .experience-overview .screen-heading .eyebrow", experience.eyebrow);
    setHeading("#panel-experience .experience-overview .screen-heading h2", experience.title);
    setText("#panel-experience .experience-overview .screen-lede", experience.description);

    document.querySelectorAll(".experience-list .experience-card").forEach((item, index) => {
      const data = experience.cards?.[index];
      if (!data) return;
      setElementText(item.querySelector("small"), data.time);
      setElementText(item.querySelector("strong"), data.company);
      setElementText(item.querySelector(".experience-role"), data.role);
      setElementText(item.querySelector("span"), data.summary);
    });
  }

  function applyContact(contact) {
    if (!contact) return;
    setText("#panel-contact .screen-heading .eyebrow", contact.eyebrow);
    setHeading("#panel-contact .screen-heading h2", contact.title);
    setText("#panel-contact .screen-lede", contact.description);

    document.querySelectorAll(".contact-card").forEach((item, index) => {
      const data = contact.cards?.[index];
      if (!data) return;
      setElementText(item.querySelector("span"), data.label);
      setElementText(item.querySelector("strong"), data.value);
      setElementText(item.querySelector("em"), data.note);
      if (data.label === "邮箱") item.setAttribute("href", `mailto:${data.value}`);
      if (data.label === "电话") item.setAttribute("href", `tel:${data.value}`);
    });
  }

  function setElementText(element, value) {
    if (element && value !== undefined) element.textContent = value;
  }

  function applyContent(data) {
    if (!data) return;
    setText(".hero-copy .eyebrow", data.hero?.eyebrow);
    setHeading("#hero-title", [data.hero?.name, data.hero?.role].filter(Boolean));
    setLines(".hero-lede", data.hero?.lines);
    setText(".hero-actions .button", data.hero?.cta);

    setText(".profile-name-row strong", data.profile?.name);
    setText(".profile-card-body p", data.profile?.summary);
    setText(".profile-stat strong", data.profile?.status);
    setText(".profile-contact", data.profile?.contactLabel);

    setText(".timeline-heading .eyebrow", data.timelineHeading?.eyebrow);
    setHeading("#timeline-title", data.timelineHeading?.title);
    setText(".timeline-heading p", data.timelineHeading?.description);
    applyTimeline(data.timeline);
    applySkills(data.skills);
    applyExperience(data.experience);
    applyContact(data.contact);
  }

  function applyEditorHints() {
    if (!previewMode || document.querySelector("[data-editor-hints-style]")) return;
    const style = document.createElement("style");
    style.dataset.editorHintsStyle = "true";
    style.textContent = `
      [data-editor-label] {
        position: relative !important;
        outline: 2px solid rgba(0, 113, 227, 0.48);
        outline-offset: 6px;
      }
      [data-editor-label]::after {
        position: absolute;
        top: -30px;
        left: 0;
        z-index: 80;
        border-radius: 999px;
        background: rgba(0, 113, 227, 0.92);
        box-shadow: 0 10px 28px rgba(0, 113, 227, 0.22);
        color: #fff;
        content: attr(data-editor-label);
        font: 800 12px/1 -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
        letter-spacing: 0;
        padding: 8px 10px;
        pointer-events: none;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
    editorHints.forEach(([selector, label]) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.dataset.editorLabel = label;
      });
    });
  }

  async function loadContent() {
    if (previewMode) {
      const draft = window.localStorage.getItem("felixSiteContentDraft");
      if (draft) {
        applyContent(JSON.parse(draft));
        applyEditorHints();
        return;
      }
    }

    try {
      const response = await fetch(contentUrl, { cache: "no-store" });
      if (!response.ok) return;
      applyContent(await response.json());
      applyEditorHints();
    } catch (error) {
      console.warn("Site content config was not loaded.", error);
    }
  }

  loadContent();
})();
