import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export const DEFAULT_SOURCE_PATH = 'C:\\Users\\ahmed\\Downloads\\MUST401_GIT_Interactive_Study_Platform.html';
const EXPECTED_SHA256 = '36CA1A86B9C4E1E1D0F42F8D90858F2D72584DD2BCC53BEECEB69ED97A0C3688';
const STABLE_ISO_DATE = '2026-07-27T00:00:00.000Z';
const STABLE_DATE = '2026-07-27';

const TOPIC_SLUG_MAP = {
  'topic-acute': 'med401-git-acute-hepatitis',
  'topic-aih': 'med401-git-autoimmune-hepatitis',
  'topic-nafld': 'med401-git-nafld-nash',
  'topic-pancreas': 'med401-git-diseases-of-the-pancreas',
  'topic-portal': 'med401-git-portal-hypertension-cirrhosis',
  'topic-small': 'med401-git-small-intestinal-diseases'
};

export function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => decodeCodePoint(parseInt(hex, 16), _))
    .replace(/&#([0-9]+);/g, (_, dec) => decodeCodePoint(parseInt(dec, 10), _))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function decodeCodePoint(value, fallback) {
  if (!Number.isInteger(value) || value < 0 || value > 0x10FFFF || (value >= 0xD800 && value <= 0xDFFF)) {
    return fallback;
  }
  return String.fromCodePoint(value);
}

function normalizeText(str) {
  if (!str) return '';
  const decoded = decodeHtmlEntities(str);
  return decoded
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function escapeHtmlText(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function findBalancedElement(html, startIndex, tagName) {
  const openingEnd = html.indexOf('>', startIndex);
  if (openingEnd === -1) return null;

  const tagRegex = new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi');
  tagRegex.lastIndex = openingEnd + 1;
  let depth = 1;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    if (match[0].startsWith('</')) {
      depth -= 1;
    } else {
      depth += 1;
    }
    if (depth === 0) {
      return {
        inner: html.slice(openingEnd + 1, match.index),
        endIndex: tagRegex.lastIndex
      };
    }
  }

  return null;
}

function removeDivsByClass(html, className) {
  let output = html;
  const classRegex = new RegExp(`<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'i');
  let match;

  while ((match = classRegex.exec(output)) !== null) {
    const balanced = findBalancedElement(output, match.index, 'div');
    if (!balanced) break;
    output = `${output.slice(0, match.index)}${output.slice(balanced.endIndex)}`;
  }

  return output;
}

export function sanitizeCoreContentHtml(rawHtml) {
  if (!rawHtml) return '';

  const withoutVisualReproductions = removeDivsByClass(rawHtml, 'visual-card');
  const allowedTags = new Set([
    'div', 'p', 'h4', 'ul', 'ol', 'li', 'table', 'thead', 'tbody',
    'tr', 'th', 'td', 'strong', 'b', 'em', 'small', 'span', 'br'
  ]);
  const output = [];
  const tagRegex = /<\/?([A-Za-z][A-Za-z0-9-]*)\b[^>]*>/g;
  let cursor = 0;
  let match;

  while ((match = tagRegex.exec(withoutVisualReproductions)) !== null) {
    output.push(escapeHtmlText(decodeHtmlEntities(withoutVisualReproductions.slice(cursor, match.index))));
    cursor = tagRegex.lastIndex;

    const rawTag = match[0];
    const isClosing = rawTag.startsWith('</');
    const originalTag = match[1].toLowerCase();
    if (originalTag === 'img' || originalTag === 'script' || originalTag === 'style') continue;

    const tag = originalTag === 'button' ? 'div' : originalTag;
    if (!allowedTags.has(tag)) continue;
    if (isClosing) {
      if (tag !== 'br') output.push(`</${tag}>`);
      continue;
    }

    let safeAttributes = '';
    if (tag === 'td' || tag === 'th') {
      const colspan = rawTag.match(/\bcolspan=["']?(\d{1,2})/i);
      const rowspan = rawTag.match(/\browspan=["']?(\d{1,2})/i);
      if (colspan) safeAttributes += ` colspan="${colspan[1]}"`;
      if (rowspan) safeAttributes += ` rowspan="${rowspan[1]}"`;
    }
    output.push(tag === 'br' ? '<br>' : `<${tag}${safeAttributes}>`);
  }

  output.push(escapeHtmlText(decodeHtmlEntities(withoutVisualReproductions.slice(cursor))));
  return output.join('')
    .replace(/<div>\s*<\/div>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function stripStudentFacingMetadata(text) {
  const metadataPatterns = [
    /\bdr\.?\s+kamal\s+mokbel\b/i,
    /\bmust\s*401\b/i,
    /^page\s+\d+\s*$/i,
    /^©/,
    /uploaded lecture visual/i,
    /^gastroenterology\s*&\s*hepatology\s*$/i
  ];

  return String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !metadataPatterns.some(pattern => pattern.test(line)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function structureMedicalText(text) {
  const lines = String(text || '').split('\n').map(line => line.trim()).filter(Boolean);
  const blocks = [];
  let list = null;

  const flushList = () => {
    if (!list) return;
    blocks.push(list);
    list = null;
  };

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^(?:[•▪✓›-]|[A-Za-z]\)|\d+[.)])\s*(.+)$/);
    if (bulletMatch) {
      if (!list) list = { type: 'list', items: [] };
      list.items.push(bulletMatch[1].trim());
      return;
    }

    flushList();
    const wordCount = line.split(/\s+/).length;
    const isAllCaps = wordCount <= 12 && /[A-Z]/.test(line) && line === line.toUpperCase();
    const isNumberedHeading = /^\d+(?:\.\d+)*\s+[A-Z]/.test(line) && wordCount <= 12;
    const isShortLabel = line.endsWith(':') && wordCount <= 8;
    const isFirstTopicHeading = index === 0 && wordCount <= 10;

    if (isAllCaps || isNumberedHeading || isShortLabel || isFirstTopicHeading) {
      blocks.push({ type: 'heading', text: line.replace(/:$/, '') });
    } else {
      blocks.push({ type: 'paragraph', text: line });
    }
  });

  flushList();
  return blocks;
}

function extractCoreContent(sectionHtml) {
  const coreMatch = /<div\b[^>]*class=["'][^"']*\bcore-content\b[^"']*["'][^>]*>/i.exec(sectionHtml);
  if (!coreMatch) return '';
  const balanced = findBalancedElement(sectionHtml, coreMatch.index, 'div');
  return balanced ? sanitizeCoreContentHtml(balanced.inner) : '';
}

function derivePassageTitle(summaryText, cleanedText, topicTitle, order) {
  const explicitTitle = summaryText
    .replace(/^Source page\s+\d+\s*:\s*/i, '')
    .replace(/^Lecture page\s+\d+\s*$/i, '')
    .trim();
  if (explicitTitle) return explicitTitle;

  const candidates = cleanedText.split('\n').map(line => line.trim()).filter(Boolean);
  const topicLower = topicTitle.toLowerCase();
  const firstDistinct = candidates.find(line => (
    line.toLowerCase() !== topicLower &&
    line.length <= 100 &&
    !/^liver diseases$/i.test(line)
  ));
  return firstDistinct || `Detailed content ${order}`;
}

export function extractGitSource(sourcePath = DEFAULT_SOURCE_PATH) {
  console.log(`[extract-med401-git] Reading source: ${sourcePath}`);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source HTML file not found at: ${sourcePath}`);
  }

  const rawHtml = fs.readFileSync(sourcePath, 'utf8');
  const actualHash = crypto.createHash('sha256').update(rawHtml).digest('hex').toUpperCase();

  if (actualHash !== EXPECTED_SHA256) {
    throw new Error(`Source SHA256 mismatch!\nExpected: ${EXPECTED_SHA256}\nActual:   ${actualHash}`);
  }

  console.log(`[extract-med401-git] SHA-256 verified successfully (${actualHash}).`);

  const canonicalDir = path.join(ROOT_DIR, 'content', 'medical', 'med401-git');
  const topicsDir = path.join(canonicalDir, 'topics');
  const assetsDir = path.join(canonicalDir, 'assets');
  const evidenceDir = path.join(canonicalDir, 'evidence');

  resetGeneratedDirectory(topicsDir, canonicalDir);
  resetGeneratedDirectory(assetsDir, canonicalDir);
  fs.mkdirSync(evidenceDir, { recursive: true });

  const articleRegex = /<article[\s\S]*?id=["'](topic-[^"']+)["'][^>]*>([\s\S]*?)<\/article>/gi;

  let parsedTopics = [];
  let totalSections = 0;
  let totalPassages = 0;
  let extractedAssets = new Map();
  let passageHashes = [];

  let topicMatch;
  while ((topicMatch = articleRegex.exec(rawHtml)) !== null) {
    const rawTopicId = topicMatch[1];
    const topicContent = topicMatch[2];
    const topicId = TOPIC_SLUG_MAP[rawTopicId] || `med401-git-${rawTopicId}`;

    const h2Match = topicContent.match(/<h2[\s\S]*?>([\s\S]*?)<\/h2>/i);
    const topicTitle = h2Match ? normalizeText(h2Match[1].replace(/<[^>]+>/g, '')) : rawTopicId;

    // 1. Extract 37 Outline Sections
    const sectionRegex = /<section[\s\S]*?id=["']([^"']+)["'][^>]*data-category=["']([^"']*)["'][^>]*data-terms=["']([^"']*)["'][^>]*>([\s\S]*?)<\/section>/gi;

    let rawSections = [];
    let secMatch;
    while ((secMatch = sectionRegex.exec(topicContent)) !== null) {
      const rawSecId = secMatch[1];
      const category = normalizeText(secMatch[2]);
      const termsStr = normalizeText(secMatch[3]);
      const secContent = secMatch[4];

      const h3Match = secContent.match(/<h3>([\s\S]*?)<\/h3>/i);
      const secTitle = h3Match ? normalizeText(h3Match[1].replace(/<[^>]+>/g, '')) : rawSecId;

      // Count source visuals for provenance, but never publish or reproduce them.
      const imgRegex = /<img[^>]+src=["'](data:image\/webp;base64,[^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
      let imgMatch;
      while ((imgMatch = imgRegex.exec(secContent)) !== null) {
        const dataUri = imgMatch[1];
        const b64Data = dataUri.replace(/^data:image\/webp;base64,/, '');
        const imgBuffer = Buffer.from(b64Data, 'base64');
        const imgHash = crypto.createHash('sha256').update(imgBuffer).digest('hex').toLowerCase();

        if (!extractedAssets.has(imgHash)) {
          extractedAssets.set(imgHash, {
            hash: imgHash,
            sizeBytes: imgBuffer.length,
            disposition: 'converted-to-text-not-published'
          });
        }
      }

      const contentHtml = extractCoreContent(secContent);
      rawSections.push({
        id: `med401-git-${rawSecId}`,
        topicId: topicId,
        title: secTitle,
        category: category,
        keywords: termsStr.split(/\s+/).filter(Boolean),
        contentHtml,
        contentHash: crypto.createHash('sha256').update(contentHtml).digest('hex').toLowerCase()
      });
    }

    // 2. Extract Topic-Level Source Pages (Passages)
    const detailsRegex = /<details[\s\S]*?id=["']([^"']+)["'][^>]*>[\s\S]*?<summary><span>([\s\S]*?)<\/span>[\s\S]*?<\/summary>[\s\S]*?<pre>([\s\S]*?)<\/pre>[\s\S]*?<\/details>/gi;

    let topicPassages = [];
    let passMatch;
    let order = 0;
    while ((passMatch = detailsRegex.exec(topicContent)) !== null) {
      order++;
      const passRawId = passMatch[1];
      const summaryText = normalizeText(passMatch[2].replace(/<[^>]+>/g, ''));
      const originalText = normalizeText(passMatch[3]);
      const textContent = stripStudentFacingMetadata(originalText);
      const passageId = `med401-git-${passRawId}`;

      const passageHash = crypto.createHash('sha256').update(textContent).digest('hex').toLowerCase();
      const originalSourceHash = crypto.createHash('sha256').update(originalText).digest('hex').toLowerCase();

      passageHashes.push({
        id: passageId,
        hash: passageHash,
        topicId: topicId
      });

      topicPassages.push({
        id: passageId,
        order: order,
        title: derivePassageTitle(summaryText, textContent, topicTitle, order),
        text: textContent,
        blocks: structureMedicalText(textContent),
        provenance: {
          sourceElementId: passRawId,
          sourceOrder: order,
          originalLabel: summaryText,
          originalSourceHash
        },
        sourceHash: passageHash
      });
    }

    totalSections += rawSections.length;
    totalPassages += topicPassages.length;

    const topicObj = {
      id: topicId,
      subjectId: 'med401-git',
      title: topicTitle,
      aliases: [],
      sectionIds: rawSections.map(s => s.id),
      sections: rawSections,
      passages: topicPassages,
      sourceVersion: 'must401-git-2026-07-27',
      status: 'published'
    };

    parsedTopics.push(topicObj);

    // Save canonical topic JSON
    const topicFilePath = path.join(topicsDir, `${topicId}.json`);
    fs.writeFileSync(topicFilePath, JSON.stringify(topicObj, null, 2), 'utf8');
  }

  // Create manifest with deterministic timestamp
  const manifest = {
    subjectId: 'med401-git',
    title: 'Gastroenterology & Hepatology',
    sourceVersion: 'must401-git-2026-07-27',
    extractedAt: STABLE_ISO_DATE,
    provenance: {
      inputFile: path.basename(sourcePath),
      inputHash: actualHash,
      extractorVersion: '2.0.0',
      topicCount: parsedTopics.length,
      sectionCount: totalSections,
      passageCount: totalPassages,
      sourceVisualCount: extractedAssets.size,
      imageCount: 0,
      studentFacingAssetCount: 0
    },
    topics: parsedTopics.map(t => ({
      id: t.id,
      title: t.title,
      sectionCount: t.sections.length,
      passageCount: t.passages.length
    }))
  };

  fs.writeFileSync(path.join(canonicalDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // Create the initial evidence sidecar only once. Future reviewed evidence is
  // canonical editorial data and must survive source re-extraction.
  const evidencePath = path.join(evidenceDir, 'mcq-evidence.json');
  if (!fs.existsSync(evidencePath)) {
    const initialEvidence = {
      version: 'must401-git-2026-07-27',
      updatedAt: STABLE_DATE,
      records: []
    };
    fs.writeFileSync(evidencePath, JSON.stringify(initialEvidence, null, 2), 'utf8');
  }

  // Write integrity report
  const integrityReport = {
    expected: {
      topics: 6,
      sections: 37,
      passages: 82,
      sourceVisuals: 6,
      studentFacingImages: 0,
      inputHash: EXPECTED_SHA256
    },
    actual: {
      topics: parsedTopics.length,
      sections: totalSections,
      passages: totalPassages,
      sourceVisuals: extractedAssets.size,
      studentFacingImages: 0,
      inputHash: actualHash
    },
    status: (
      parsedTopics.length === 6 &&
      totalSections === 37 &&
      totalPassages === 82 &&
      extractedAssets.size === 6 &&
      actualHash === EXPECTED_SHA256
    ) ? 'PASS' : 'FAIL',
    extractedAssets: Array.from(extractedAssets.values()),
    passageHashes
  };

  fs.writeFileSync(path.join(canonicalDir, 'integrity-report.json'), JSON.stringify(integrityReport, null, 2), 'utf8');

  console.log(`[extract-med401-git] Extraction complete.`);
  console.log(`  Topics:   ${parsedTopics.length} (Expected: 6)`);
  console.log(`  Sections: ${totalSections} (Expected: 37)`);
  console.log(`  Passages: ${totalPassages} (Expected: 82)`);
  console.log(`  Source visuals converted to text: ${extractedAssets.size} (Expected: 6)`);
  console.log(`  Student-facing images: 0`);
  console.log(`  Status:   ${integrityReport.status}`);

  return integrityReport;
}

function resetGeneratedDirectory(targetDir, allowedParent) {
  const resolvedTarget = path.resolve(targetDir);
  const resolvedParent = `${path.resolve(allowedParent)}${path.sep}`;
  if (!resolvedTarget.startsWith(resolvedParent)) {
    throw new Error(`Refusing to reset generated directory outside ${allowedParent}: ${targetDir}`);
  }
  fs.rmSync(resolvedTarget, { recursive: true, force: true });
  fs.mkdirSync(resolvedTarget, { recursive: true });
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  extractGitSource(process.env.MED401_GIT_SOURCE_PATH || DEFAULT_SOURCE_PATH);
}
