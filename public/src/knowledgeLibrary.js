/**
 * Medical Knowledge Library Module
 * Handles loading, search ranking, citation resolution, and source reader view rendering.
 */

let manifestCache = null;
let searchIndexCache = null;
let evidenceCache = null;
const topicCache = new Map();

export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function initKnowledgeLibrary() {
  if (manifestCache && searchIndexCache) {
    return { manifest: manifestCache, index: searchIndexCache, evidence: evidenceCache };
  }

  try {
    const [manifestRes, indexRes, evidenceRes] = await Promise.all([
      fetch('/data/medical/manifest.json').catch(() => null),
      fetch('/data/medical/search-index.json').catch(() => null),
      fetch('/data/medical/evidence.json').catch(() => null)
    ]);

    if (manifestRes && manifestRes.ok) {
      manifestCache = await manifestRes.json();
    }
    if (indexRes && indexRes.ok) {
      searchIndexCache = await indexRes.json();
    }
    if (evidenceRes && evidenceRes.ok) {
      evidenceCache = await evidenceRes.json();
    }
  } catch (err) {
    console.warn('[knowledgeLibrary] Failed to fetch medical library assets:', err);
  }

  return { manifest: manifestCache, index: searchIndexCache, evidence: evidenceCache };
}

export function getManifest() {
  return manifestCache;
}

export function getSearchIndex() {
  return searchIndexCache;
}

export function getEvidence() {
  return evidenceCache;
}

export async function loadTopic(topicId) {
  if (!topicId) return null;
  if (topicCache.has(topicId)) {
    return topicCache.get(topicId);
  }

  try {
    const res = await fetch(`/data/medical/topics/${topicId}.json`);
    if (res.ok) {
      const topicData = await res.json();
      topicCache.set(topicId, topicData);
      return topicData;
    }
  } catch (err) {
    console.warn(`[knowledgeLibrary] Failed to load topic ${topicId}:`, err);
  }
  return null;
}

export function searchSources(query, limit = 25) {
  const items = (searchIndexCache && searchIndexCache.items) ? searchIndexCache.items : [];
  return searchSourceItems(items, query, limit);
}

export function searchSourceItems(items, query, limit = 25) {
  if (!query || typeof query !== 'string') return [];
  const qClean = query.trim().toLowerCase();
  if (!qClean) return [];

  const qTokens = qClean.split(/\s+/).filter(Boolean);

  const scored = [];

  (Array.isArray(items) ? items : []).forEach(item => {
    let score = 0;
    const titleLower = (item.title || '').toLowerCase();
    const textLower = (item.text || '').toLowerCase();
    const keywordsStr = Array.isArray(item.keywords) ? item.keywords.join(' ').toLowerCase() : '';

    if (titleLower === qClean) {
      score += 100;
    } else if (titleLower.startsWith(qClean)) {
      score += 60;
    } else if (titleLower.includes(qClean)) {
      score += 30;
    }

    if (item.type === 'topic') {
      score += 15;
    } else if (item.type === 'section') {
      score += 10;
    }

    qTokens.forEach(token => {
      if (titleLower.includes(token)) score += 10;
      if (keywordsStr.includes(token)) score += 8;
      if (textLower.includes(token)) score += 2;
    });

    if (score > 0) {
      let snippet = '';
      if (item.type === 'passage' && item.text) {
        const idx = textLower.indexOf(qTokens[0]);
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(item.text.length, idx + 120);
          snippet = (start > 0 ? '…' : '') + item.text.slice(start, end) + (end < item.text.length ? '…' : '');
        } else {
          snippet = item.text.slice(0, 140) + (item.text.length > 140 ? '…' : '');
        }
      } else {
        snippet = item.text ? item.text.slice(0, 140) : item.title;
      }

      scored.push({
        ...item,
        score,
        snippet: escapeHtml(snippet)
      });
    }
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function resolveCitation(questionId) {
  if (!questionId || !evidenceCache || !evidenceCache.records) return null;

  const rec = evidenceCache.records.find(r => r.questionId === questionId && (r.reviewStatus === 'verified' || r.reviewStatus === 'published'));
  if (!rec) return null;

  return {
    verified: true,
    questionId: rec.questionId,
    topicId: rec.topicId,
    sectionId: rec.sectionId || null,
    passageIds: rec.passageIds || [],
    explanation: rec.explanation || null,
    sourceVersion: rec.sourceVersion || '',
    subjectTitle: rec.subjectTitle || '',
    topicTitle: rec.topicTitle || '',
    sectionTitle: rec.sectionTitle || ''
  };
}

export async function resolvePassage(topicId, sectionId, passageId) {
  const topic = await loadTopic(topicId);
  if (!topic) return null;

  let foundSection = null;
  let foundPassage = null;

  if (sectionId && topic.sections) {
    foundSection = topic.sections.find(sec => sec.id === sectionId);
  }

  if (passageId && topic.passages) {
    foundPassage = topic.passages.find(p => p.id === passageId);
  }

  const breadcrumb = `Gastroenterology › ${topic.title}${foundSection ? ' › ' + foundSection.title : ''}`;

  return {
    topic,
    section: foundSection,
    passage: foundPassage,
    breadcrumb
  };
}

export function renderSourceReaderMarkup(resolvedData, targetPassageId = null) {
  if (!resolvedData || !resolvedData.topic) {
    return '<div class="source-reader__error">Source topic content unavailable.</div>';
  }

  const { topic, section, passage, breadcrumb } = resolvedData;

  let html = `
    <div class="source-reader__header">
      <nav class="source-reader__breadcrumb" aria-label="Source location">${escapeHtml(breadcrumb)}</nav>
      <h2 class="source-reader__topic-title">${escapeHtml(topic.title)}</h2>
      <p class="source-reader__intro">Clean medical text extracted from the verified course source.</p>
    </div>
  `;

  // Section navigation uses source IDs without exposing page or provenance metadata.
  if (topic.sections && topic.sections.length > 0) {
    html += `<nav class="source-reader__section-tabs" aria-label="Topic sections">`;
    topic.sections.forEach(s => {
      const activeClass = (section && section.id === s.id) ? 'source-reader__tab--active' : '';
      html += `
        <button type="button" class="source-reader__tab ${activeClass}"
          data-topic-id="${escapeHtml(topic.id)}"
          data-section-id="${escapeHtml(s.id)}">${escapeHtml(s.title)}</button>
      `;
    });
    html += `</nav>`;

    const visibleSections = section ? [section] : topic.sections;
    html += `<div class="source-reader__sections">`;
    visibleSections.forEach(s => {
      html += `
        <section class="source-reader__section ${section?.id === s.id ? 'source-reader__section--active' : ''}"
          id="sec-${escapeHtml(s.id)}" data-section-id="${escapeHtml(s.id)}">
          <div class="source-reader__section-heading">
            ${s.category ? `<span class="source-reader__badge">${escapeHtml(s.category)}</span>` : ''}
            <h3>${escapeHtml(s.title)}</h3>
          </div>
          <div class="source-reader__medical-content">${s.contentHtml || ''}</div>
        </section>
      `;
    });
    html += `</div>`;
  }

  // Detailed text is rendered as normal semantic HTML, never as pages or slides.
  if (topic.passages && topic.passages.length > 0) {
    html += `<div class="source-reader__passages-heading"><h3>Detailed source content</h3></div>`;
    html += `<div class="source-reader__passages">`;
    topic.passages.forEach(p => {
      const isTarget = (targetPassageId && p.id === targetPassageId) || (passage && p.id === passage.id);
      const highlightClass = isTarget ? 'source-reader__passage--highlight' : '';
      html += `
        <section class="source-reader__passage ${highlightClass}" id="p-${escapeHtml(p.id)}" data-passage-id="${escapeHtml(p.id)}">
          <h4 class="source-reader__passage-title">${escapeHtml(p.title || 'Source detail')}</h4>
          <div class="source-reader__passage-text">${renderPassageBlocks(p.blocks, p.text)}</div>
        </section>
      `;
    });
    html += `</div>`;
  }

  return html;
}

function renderPassageBlocks(blocks, fallbackText = '') {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return `<p>${escapeHtml(fallbackText)}</p>`;
  }

  return blocks.map(block => {
    if (block.type === 'heading') {
      return `<h5>${escapeHtml(block.text)}</h5>`;
    }
    if (block.type === 'list') {
      const items = Array.isArray(block.items) ? block.items : [];
      return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }
    return `<p>${escapeHtml(block.text)}</p>`;
  }).join('');
}
