const contentPath = "site-content.json";
const contentDraftKey = "felixSiteContentDraft";

const form = document.querySelector("#editor-form");
const statusLine = document.querySelector("[data-status]");
const previewFrame = document.querySelector("iframe");

let siteContent = null;
let currentPreviewHash = "#top";

function setStatus(message) {
  statusLine.textContent = message;
}

function getValue(path) {
  return path.split(".").reduce((value, key) => value?.[key], siteContent);
}

function setValue(path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => current[key], siteContent);
  target[last] = value;
}

function field(label, path, options = {}) {
  const element = document.createElement("label");
  element.textContent = label;
  const input = options.multiline ? document.createElement("textarea") : document.createElement("input");
  input.value = getValue(path) ?? "";
  input.dataset.path = path;
  input.addEventListener("input", () => setValue(path, input.value));
  element.appendChild(input);
  return element;
}

function section(title, children, open = false) {
  const details = document.createElement("details");
  details.open = open;
  const summary = document.createElement("summary");
  summary.textContent = title;
  const body = document.createElement("div");
  body.className = "section-body";
  children.forEach((child) => body.appendChild(child));
  details.append(summary, body);
  return details;
}

function group(title, children) {
  const wrapper = document.createElement("div");
  wrapper.className = "group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  heading.style.margin = "0";
  heading.style.fontSize = "14px";
  children.forEach((child) => wrapper.appendChild(child));
  wrapper.prepend(heading);
  return wrapper;
}

function grid(children) {
  const wrapper = document.createElement("div");
  wrapper.className = "grid-2";
  children.forEach((child) => wrapper.appendChild(child));
  return wrapper;
}

function renderEditor() {
  form.replaceChildren();

  form.appendChild(section("首页首屏", [
    field("英文小标题", "hero.eyebrow"),
    field("姓名", "hero.name"),
    field("岗位", "hero.role"),
    field("第一句话", "hero.lines.0"),
    field("第二句话", "hero.lines.1"),
    field("第三句话", "hero.lines.2"),
    field("按钮文字", "hero.cta"),
    field("名片姓名", "profile.name"),
    field("名片介绍", "profile.summary", { multiline: true }),
    grid([field("状态", "profile.status"), field("联系按钮", "profile.contactLabel")])
  ], true));

  form.appendChild(section("首页时间轴", [
    field("时间轴小标题", "timelineHeading.eyebrow"),
    grid([field("时间轴标题 1", "timelineHeading.title.0"), field("时间轴标题 2", "timelineHeading.title.1")]),
    field("时间轴说明", "timelineHeading.description", { multiline: true }),
    ...siteContent.timeline.map((_, index) => group(`节点 ${index + 1}`, [
      grid([field("时间", `timeline.${index}.time`), field("公司/学校", `timeline.${index}.company`)]),
      field("专业/岗位", `timeline.${index}.role`),
      field("详细信息", `timeline.${index}.description`, { multiline: true })
    ]))
  ]));

  form.appendChild(section("能力 Tab", [
    field("小标题", "skills.eyebrow"),
    grid([field("标题 1", "skills.title.0"), field("标题 2", "skills.title.1")]),
    field("说明第一行", "skills.description.0"),
    field("说明第二行", "skills.description.1"),
    group("下方 4 个数据", siteContent.skills.metrics.flatMap((_, index) => [
      grid([field(`数字 ${index + 1}`, `skills.metrics.${index}.value`), field(`说明 ${index + 1}`, `skills.metrics.${index}.label`)])
    ])),
    ...siteContent.skills.items.map((_, index) => group(`能力 ${index + 1}`, [
      field("标题", `skills.items.${index}.title`),
      field("描述", `skills.items.${index}.description`, { multiline: true }),
      field("蓝色关键词", `skills.items.${index}.tags`)
    ]))
  ]));

  form.appendChild(section("经历 Tab 卡片", [
    field("小标题", "experience.eyebrow"),
    grid([field("标题 1", "experience.title.0"), field("标题 2", "experience.title.1")]),
    field("说明", "experience.description", { multiline: true }),
    ...siteContent.experience.cards.map((_, index) => group(`卡片 ${index + 1}`, [
      grid([field("时间", `experience.cards.${index}.time`), field("公司", `experience.cards.${index}.company`)]),
      field("岗位", `experience.cards.${index}.role`),
      field("简介", `experience.cards.${index}.summary`, { multiline: true })
    ]))
  ]));

  form.appendChild(section("联系 Tab", [
    field("小标题", "contact.eyebrow"),
    grid([field("标题 1", "contact.title.0"), field("标题 2", "contact.title.1")]),
    field("说明", "contact.description", { multiline: true }),
    ...siteContent.contact.cards.map((_, index) => group(`联系方式 ${index + 1}`, [
      grid([field("名称", `contact.cards.${index}.label`), field("内容", `contact.cards.${index}.value`)]),
      field("备注", `contact.cards.${index}.note`)
    ]))
  ]));

}

function paragraph(text) {
  const node = document.createElement("p");
  node.className = "field-note";
  node.textContent = text;
  return node;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function overwriteLocalFile(filename, content, type) {
  if (!window.showSaveFilePicker) {
    download(filename, content, type);
    setStatus("当前浏览器不支持直接写入文件，已改为下载配置文件。");
    return;
  }

  const handle = await window.showSaveFilePicker({
    suggestedName: filename,
    types: [{ description: filename, accept: { [type]: [`.${filename.split(".").pop()}`] } }]
  });
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
  setStatus(`已保存 ${filename}。刷新首页即可看到正式效果。`);
}

function applyPreview() {
  window.localStorage.setItem(contentDraftKey, JSON.stringify(siteContent, null, 2));
  previewFrame.src = `index.html?preview=editor&t=${Date.now()}${currentPreviewHash}`;
  setStatus("临时预览已更新。它不会自动写入网站文件，确认后请点击保存文案。");
}

async function load() {
  const contentResponse = await fetch(`${contentPath}?t=${Date.now()}`);
  siteContent = await contentResponse.json();
  renderEditor();
  applyPreview();
}

document.querySelector("[data-action='preview']").addEventListener("click", applyPreview);
document.querySelectorAll("[data-preview-hash]").forEach((button) => {
  button.addEventListener("click", () => {
    currentPreviewHash = button.dataset.previewHash;
    applyPreview();
  });
});
document.querySelector("[data-action='open-site']").addEventListener("click", () => {
  window.open("index.html", "_blank", "noopener");
});
document.querySelector("[data-action='download-content']").addEventListener("click", () => {
  download("site-content.json", JSON.stringify(siteContent, null, 2), "application/json");
});
document.querySelector("[data-action='save-content']").addEventListener("click", async () => {
  await overwriteLocalFile("site-content.json", JSON.stringify(siteContent, null, 2), "application/json");
});

load().catch((error) => {
  console.error(error);
  setStatus("配置读取失败。请通过本地服务器打开 editor.html。");
});
