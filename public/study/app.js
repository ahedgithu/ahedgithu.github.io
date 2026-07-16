(function () {
  "use strict";

  const app = document.getElementById("app");
  window.addEventListener("hashchange", renderRoute);
  renderRoute();

  function topics() {
    return Array.isArray(window.MEDMAP_TOPICS) ? window.MEDMAP_TOPICS : [];
  }

  function parseRoute() {
    const parts = (window.location.hash || "#/library")
      .replace(/^#\/?/, "")
      .split("/")
      .filter(Boolean)
      .map(decodeURIComponent);

    if (!parts.length || parts[0] === "library") return { name: "library" };
    if (parts[0] === "topic" && parts[1] && parts[2] === "section" && parts[3]) {
      return { name: "topic", topicId: parts[1], openSectionId: parts[3] };
    }
    if (parts[0] === "topic" && parts[1]) {
      return { name: "topic", topicId: parts[1], openSectionId: "" };
    }
    return { name: "not-found" };
  }

  function renderRoute() {
    const route = parseRoute();
    window.scrollTo({ top: 0, behavior: "instant" });

    if (route.name === "library") renderLibrary();
    else if (route.name === "topic") renderTopic(route.topicId, route.openSectionId);
    else renderNotFound();

    app.focus({ preventScroll: true });
  }

  function renderLibrary() {
    const allTopics = topics();
    app.innerHTML = `
      <div class="page library-page">
        <section class="library-heading" aria-labelledby="library-title">
          <div>
            <p class="eyebrow">Your library</p>
            <h1 id="library-title">Medical topics</h1>
          </div>
          <p>${allTopics.length} ${allTopics.length === 1 ? "topic" : "topics"}</p>
        </section>
        <section class="topic-grid" aria-label="Medical topics">
          ${allTopics.length ? allTopics.map(renderTopicCard).join("") : renderEmptyLibrary()}
        </section>
      </div>`;
  }

  function renderTopicCard(topic) {
    return `
      <a class="topic-card" href="#/topic/${encodeURIComponent(topic.id)}">
        <h2>${escapeHTML(topic.title)}</h2>
        ${topic.subtitle ? `<p>${escapeHTML(topic.subtitle)}</p>` : ""}
        <span>${topic.sections.length} cards <b aria-hidden="true">→</b></span>
      </a>`;
  }

  function renderEmptyLibrary() {
    return `
      <div class="empty-state">
        <h2>No topics yet</h2>
        <p>Add a ready-extracted topic with the build-medical-study-cards skill.</p>
      </div>`;
  }

  function renderTopic(topicId, openSectionId = "") {
    const topic = topics().find((item) => item.id === topicId);
    if (!topic) return renderNotFound("That topic is not in this library.");

    app.innerHTML = `
      <div class="page topic-page">
        <section class="topic-heading" aria-labelledby="topic-title">
          <h1 id="topic-title">${escapeHTML(topic.title)}</h1>
        </section>
        <section class="topic-section-grid" aria-label="${escapeAttr(topic.title)} study sections">
          ${topic.sections.map((section) => renderSectionCard(section, section.id === openSectionId)).join("")}
        </section>
      </div>`;
  }

  function renderSectionCard(section, isOpen) {
    const sourceBlocks = section.sourceBlocks || [];
    const explanationBlocks = section.explanationBlocks || [];

    return `
      <details class="study-card" id="card-${escapeAttr(section.id)}" ${isOpen ? "open" : ""}>
        <summary>
          <h3>${escapeHTML(section.title)}</h3>
          <span class="expand-icon" aria-hidden="true">+</span>
        </summary>
        <div class="card-content">
          ${renderPanel(sourceBlocks, "source", "Extracted source — unchanged")}
          ${renderPanel(explanationBlocks, "explanation", "الشرح بالمصري", true)}
        </div>
      </details>`;
  }

  function renderPanel(blocks, panelKind, fallbackLabel, arabic = false) {
    const panelLabel = blocks.find((block) => block.label)?.label || fallbackLabel;
    const renderedBlocks = blocks
      .map((block) => renderBlock(block, panelKind === "source" ? "source" : block.type || "explanation", false))
      .join("");

    return `
      <section class="content-panel content-panel--${escapeAttr(panelKind)}" ${arabic ? 'lang="ar" dir="rtl"' : ""}>
        <span class="block-label">${escapeHTML(panelLabel)}</span>
        <div class="content-panel__blocks">${renderedBlocks}</div>
      </section>`;
  }

  function renderBlock(block, kind, showLabel = true) {
    const paragraphs = (block.paragraphs || [])
      .map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`)
      .join("");
    const items = (block.items || []).length
      ? `<ul>${block.items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`
      : "";
    const note = block.note ? `<p class="block-note">${escapeHTML(block.note)}</p>` : "";
    const arabic = block.lang === "ar";

    return `
      <section class="content-block" data-kind="${escapeAttr(kind)}" ${arabic ? 'lang="ar" dir="rtl"' : ""}>
        ${showLabel && block.label ? `<span class="block-label">${escapeHTML(block.label)}</span>` : ""}
        ${block.title ? `<h4>${escapeHTML(block.title)}</h4>` : ""}
        ${paragraphs}${items}${note}
      </section>`;
  }

  function renderNotFound(message = "This page does not exist.") {
    app.innerHTML = `
      <div class="page not-found">
        <h1>Topic not found</h1>
        <p>${escapeHTML(message)}</p>
        <a href="#/library">Return to library</a>
      </div>`;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHTML(value);
  }
})();
