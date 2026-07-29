import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import {
  DEFAULT_SOURCE_PATH,
  decodeHtmlEntities,
  sanitizeCoreContentHtml,
  stripStudentFacingMetadata,
  structureMedicalText
} from '../scripts/extract-med401-git-source.mjs';
import { DEFAULT_ALSHAMEL_QUESTION_PATH } from '../scripts/build-med1-alshamel-evidence.mjs';
import { validateMedicalLibrary } from '../scripts/validate-medical-library.mjs';
import {
  escapeHtml,
  renderSourceReaderMarkup,
  searchSourceItems
} from '../src/knowledgeLibrary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('medical library passes validation and data integrity checks', () => {
  const isValid = validateMedicalLibrary();
  assert.equal(isValid, true, 'Medical library validation must return true');
});

test('canonical manifest provenance matches expected input source and counts', () => {
  const manifestPath = path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'manifest.json');
  assert.equal(existsSync(manifestPath), true, 'Canonical manifest.json must exist');

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.subjectId, 'med401-git');
  assert.equal(manifest.provenance.inputHash, '36CA1A86B9C4E1E1D0F42F8D90858F2D72584DD2BCC53BEECEB69ED97A0C3688');
  assert.equal(manifest.provenance.topicCount, 8);
  assert.equal(manifest.provenance.sectionCount, 59);
  assert.equal(manifest.provenance.passageCount, 93);
  assert.equal(manifest.provenance.alshamelSupportedCount, 341);
  assert.equal(manifest.provenance.alshamelUnsupportedCount, 49);
  assert.equal(manifest.provenance.studentFacingSourceLabel, 'University Source');
  assert.equal(manifest.provenance.sourceVisualCount, 6);
  assert.equal(manifest.provenance.imageCount, 0);
  assert.equal(manifest.provenance.studentFacingAssetCount, 0);
});

test('deploy bundles exist under public/data/medical/', () => {
  const deployManifestPath = path.join(ROOT_DIR, 'public', 'data', 'medical', 'manifest.json');
  const deployIndexPath = path.join(ROOT_DIR, 'public', 'data', 'medical', 'search-index.json');
  const deployEvidencePath = path.join(ROOT_DIR, 'public', 'data', 'medical', 'evidence.json');

  assert.equal(existsSync(deployManifestPath), true, 'deploy manifest.json must exist');
  assert.equal(existsSync(deployIndexPath), true, 'deploy search-index.json must exist');
  assert.equal(existsSync(deployEvidencePath), true, 'deploy evidence.json must exist');

  const searchIndex = JSON.parse(readFileSync(deployIndexPath, 'utf8'));
  assert.equal(searchIndex.totalItems, 160);
});

test('source extraction decodes HTML entities exactly once', () => {
  assert.equal(
    decodeHtmlEntities('&amp; &lt; &gt; &quot; &#39; &#x27; &#x1F9EC;'),
    '& < > " \' \' 🧬'
  );

  const topicsDir = path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'topics');
  const topicText = readdirSync(topicsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readFileSync(path.join(topicsDir, file), 'utf8'))
    .join('\n');

  assert.equal(topicText.includes('&amp;'), false, 'canonical text must not retain encoded ampersands');
  assert.equal(topicText.includes('&#x27;'), false, 'canonical text must not retain numeric apostrophe entities');
});

test('visible source material becomes safe structured text without reproduced pages or branding', () => {
  const sanitized = sanitizeCoreContentHtml(`
    <div class="table-wrap"><table><tr><th>Marker</th><td>HBsAg</td></tr></table></div>
    <div class="visual-card"><img src="data:image/webp;base64,AAAA" alt="slide"><div>Uploaded lecture visual</div></div>
    <button class="marker-chip"><b>Anti-HBs</b><span>Recovery</span></button>
  `);
  assert.match(sanitized, /<table>/);
  assert.match(sanitized, /<b>Anti-HBs<\/b>/);
  assert.equal(/<(?:img|button)\b/i.test(sanitized), false);
  assert.equal(/uploaded lecture visual/i.test(sanitized), false);

  const cleaned = stripStudentFacingMetadata('Dr. Kamal Mokbel | MUST 401\nDiagnosis\n• CT abdomen\nPage 7');
  assert.equal(cleaned, 'Diagnosis\n• CT abdomen');
  assert.deepEqual(structureMedicalText(cleaned), [
    { type: 'heading', text: 'Diagnosis' },
    { type: 'list', items: ['CT abdomen'] }
  ]);
});

test('all canonical sections and passages are clean text-only student content', () => {
  const topicsDir = path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'topics');
  let sectionCount = 0;
  let passageCount = 0;

  for (const file of readdirSync(topicsDir).filter((entry) => entry.endsWith('.json'))) {
    const topic = JSON.parse(readFileSync(path.join(topicsDir, file), 'utf8'));
    for (const section of topic.sections) {
      sectionCount += 1;
      assert.ok(section.contentHtml);
      assert.ok(section.contentHash);
      assert.equal('images' in section, false);
      assert.equal(/<(?:img|svg|canvas|iframe)\b/i.test(section.contentHtml), false);
      assert.equal(/\b(?:Dr\.?\s+Kamal\s+Mokbel|MUST\s*401|uploaded lecture visual)\b/i.test(section.contentHtml), false);
    }
    for (const passage of topic.passages) {
      passageCount += 1;
      assert.ok(passage.title);
      assert.ok(Array.isArray(passage.blocks));
      assert.equal('pageLabel' in passage, false);
      assert.equal('summary' in passage, false);
      assert.equal(/\b(?:Dr\.?\s+Kamal\s+Mokbel|MUST\s*401|uploaded lecture visual)\b/i.test(passage.text), false);
    }
  }

  assert.equal(sectionCount, 59);
  assert.equal(passageCount, 93);
  for (const assetDir of [
    path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'assets'),
    path.join(ROOT_DIR, 'public', 'data', 'medical', 'assets')
  ]) {
    assert.deepEqual(existsSync(assetDir) ? readdirSync(assetDir) : [], []);
  }
});

test('source pages remain topic-level and are never assigned by fuzzy section matching', () => {
  const topicsDir = path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'topics');
  let passageCount = 0;

  for (const file of readdirSync(topicsDir).filter((entry) => entry.endsWith('.json'))) {
    const topic = JSON.parse(readFileSync(path.join(topicsDir, file), 'utf8'));
    assert.ok(Array.isArray(topic.sections));
    assert.ok(Array.isArray(topic.passages));
    for (const passage of topic.passages) {
      passageCount += 1;
      assert.equal('sectionId' in passage, false, `${passage.id} must not claim an inferred section`);
    }
    for (const section of topic.sections) {
      assert.equal('passages' in section, false, `${section.id} must not contain fuzzy-assigned passages`);
    }
  }

  assert.equal(passageCount, 93);
});

test('source search ranks titles and returns escaped plain-text snippets', () => {
  const results = searchSourceItems([
    {
      id: 'topic',
      type: 'topic',
      topicId: 'topic',
      title: 'NAFLD & NASH',
      text: 'NAFLD & NASH'
    },
    {
      id: 'passage',
      type: 'passage',
      topicId: 'topic',
      passageId: 'passage',
      title: 'Lecture page 1',
      text: 'A passage about NAFLD & metabolic risk.'
    }
  ], 'NAFLD');

  assert.equal(results[0].id, 'topic');
  assert.match(results[1].snippet, /&amp;/);
});

test('source reader escapes imported content before producing markup', () => {
  const markup = renderSourceReaderMarkup({
    topic: {
      id: 'topic',
      title: '<script>alert("topic")</script>',
      sections: [],
      passages: [{
        id: 'passage',
        title: 'Source & detail',
        text: '<img src=x onerror=alert(1)> & text'
      }]
    },
    section: null,
    passage: null,
    breadcrumb: 'GIT > unsafe'
  });

  assert.equal(markup.includes('<script>'), false);
  assert.equal(markup.includes('<img src=x'), false);
  assert.match(markup, /&lt;script&gt;/);
  assert.match(markup, /Source &amp; detail/);
  assert.match(markup, /&lt;img src=x onerror=alert\(1\)&gt; &amp; text/);
  assert.equal(/<(?:img|figure)\b/i.test(markup), false);
  assert.equal(/(?:Lecture|Source) page/i.test(markup), false);
  assert.equal(escapeHtml('<>&"\''), '&lt;&gt;&amp;&quot;&#39;');
});

test('supported MCQs expose Open Source before answer feedback is rendered', () => {
  const mainSource = readFileSync(path.join(ROOT_DIR, 'src', 'main.js'), 'utf8');
  const actionIndex = mainSource.indexOf('const sourceAction = citation?.verified');
  const revealIndex = mainSource.indexOf('${shouldReveal ? (() => {', actionIndex);
  assert.ok(actionIndex > -1, 'supported question source action must be defined');
  assert.ok(revealIndex > actionIndex, 'Open Source must be created outside answer-only feedback');
  assert.match(mainSource.slice(actionIndex, revealIndex), />Open Source<\/button>/);
});

test('الشامل evidence is exact, private, and source-only', () => {
  const evidence = JSON.parse(readFileSync(
    path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'evidence', 'mcq-evidence.json'),
    'utf8'
  ));
  const records = evidence.records.filter((record) => record.questionId.startsWith('med1-alshamel-'));
  assert.equal(records.length, 341);
  assert.equal(evidence.unsupportedAlshamel.length, 49);

  const topics = new Map(
    readdirSync(path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'topics'))
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const topic = JSON.parse(readFileSync(
          path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'topics', file),
          'utf8'
        ));
        return [topic.id, topic];
      })
  );

  for (const record of records) {
    assert.equal(record.subjectTitle, 'University Source');
    assert.equal('explanation' in record, false);
    assert.ok(record.highlightText);
    const topic = topics.get(record.topicId);
    assert.ok(topic);
    const citedText = topic.passages
      .filter((passage) => record.passageIds.includes(passage.id))
      .map((passage) => passage.text)
      .join('\n');
    assert.ok(citedText.includes(record.highlightText), `${record.questionId} highlight must be an exact source substring`);
  }

  const publicData = [
    readFileSync(path.join(ROOT_DIR, 'public', 'data', 'medical', 'manifest.json'), 'utf8'),
    readFileSync(path.join(ROOT_DIR, 'public', 'data', 'medical', 'evidence.json'), 'utf8'),
    ...readdirSync(path.join(ROOT_DIR, 'public', 'data', 'medical', 'topics'))
      .map((file) => readFileSync(path.join(ROOT_DIR, 'public', 'data', 'medical', 'topics', file), 'utf8'))
  ].join('\n');
  assert.doesNotMatch(publicData, /Omar\s+Heikal|Hisham\s+Samy|Kamal\s+Mokbel|Document \(34\)|\.docx|lecture slides/i);
});

test('source reader preserves active quiz state and hides raw source-page labels', () => {
  const mainSource = readFileSync(path.join(ROOT_DIR, 'src', 'main.js'), 'utf8');
  assert.match(mainSource, /getCurrentQuiz\(\)\.length > 0[\s\S]+openerElement\?\.closest\('\.quiz-question-card'\)/);
  assert.match(mainSource, /const studentFacingSection = getStudentFacingQuizSection\(question\)/);
  assert.doesNotMatch(
    mainSource,
    /\$\{question\.section \? `<p class="quiz-question__section"/,
    'raw source and page metadata must not be rendered beneath the question'
  );
});

test('published MCQ evidence matches the existing answer key and cited source pages', () => {
  const sandbox = { window: {} };
  runInNewContext(
    readFileSync(path.join(ROOT_DIR, 'src', 'med1-kellawi-mcqs.js'), 'utf8'),
    sandbox
  );

  const questions = [];
  collectQuestions(sandbox.window.mcqQuizzes, questions);
  const question = questions.find((item) => item.id === 'med1-kellawi-q011');
  assert.ok(question, 'the cited MCQ must still exist');

  const evidence = JSON.parse(readFileSync(
    path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'evidence', 'mcq-evidence.json'),
    'utf8'
  ));
  const record = evidence.records.find((item) => item.questionId === question.id);
  assert.ok(record, 'the verified evidence record must exist');
  assert.equal(record.explanation.correct.choiceId, String.fromCharCode(97 + question.answerIndex));
  assert.equal(question.choices[question.answerIndex], 'CT abdomen');

  const pancreasTopic = JSON.parse(readFileSync(
    path.join(ROOT_DIR, 'content', 'medical', 'med401-git', 'topics', 'med401-git-diseases-of-the-pancreas.json'),
    'utf8'
  ));
  const citedText = pancreasTopic.passages
    .filter((passage) => record.passageIds.includes(passage.id))
    .map((passage) => passage.text)
    .join('\n');
  assert.match(citedText, /most reliable modality/i);
  assert.match(citedText, /CT Scan diagnosis/i);
  assert.match(citedText, /return to normal within 24–48 hours/i);
});

test('extract and build are byte-deterministic and preserve evidence', () => {
  const evidencePath = path.join(
    ROOT_DIR,
    'content',
    'medical',
    'med401-git',
    'evidence',
    'mcq-evidence.json'
  );
  const evidenceBefore = readFileSync(evidencePath);

  runLibraryGeneration();
  const firstSnapshot = snapshotTrees([
    path.join(ROOT_DIR, 'content', 'medical', 'med401-git'),
    path.join(ROOT_DIR, 'public', 'data', 'medical')
  ]);

  runLibraryGeneration();
  const secondSnapshot = snapshotTrees([
    path.join(ROOT_DIR, 'content', 'medical', 'med401-git'),
    path.join(ROOT_DIR, 'public', 'data', 'medical')
  ]);

  assert.deepEqual(secondSnapshot, firstSnapshot);
  assert.deepEqual(readFileSync(evidencePath), evidenceBefore, 're-extraction must preserve reviewed evidence');
});

function runLibraryGeneration() {
  const sourcePath = process.env.MED401_GIT_SOURCE_PATH || DEFAULT_SOURCE_PATH;
  const alshamelSourcePath = process.env.MED1_ALSHAMEL_SOURCE_PATH || DEFAULT_ALSHAMEL_QUESTION_PATH;
  if (existsSync(sourcePath) && existsSync(alshamelSourcePath)) {
    execFileSync(process.execPath, ['scripts/extract-med401-git-source.mjs'], {
      cwd: ROOT_DIR,
      env: { ...process.env, MED401_GIT_SOURCE_PATH: sourcePath },
      stdio: 'pipe'
    });
    execFileSync(process.execPath, ['scripts/build-med1-alshamel-evidence.mjs', alshamelSourcePath], {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });
  }
  execFileSync(process.execPath, ['scripts/build-medical-library.mjs'], {
    cwd: ROOT_DIR,
    stdio: 'pipe'
  });
}

function snapshotTrees(roots) {
  const snapshot = {};
  for (const root of roots) {
    visit(root, root, snapshot);
  }
  return snapshot;
}

function visit(root, current, snapshot) {
  for (const name of readdirSync(current).sort()) {
    const absolutePath = path.join(current, name);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) {
      visit(root, absolutePath, snapshot);
      continue;
    }
    const relativePath = `${path.basename(root)}/${path.relative(root, absolutePath).replaceAll('\\', '/')}`;
    snapshot[relativePath] = createHash('sha256').update(readFileSync(absolutePath)).digest('hex');
  }
}

function collectQuestions(value, questions) {
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.question === 'string' && Array.isArray(value.choices)) {
    questions.push(value);
  }
  for (const child of Object.values(value)) {
    collectQuestions(child, questions);
  }
}
