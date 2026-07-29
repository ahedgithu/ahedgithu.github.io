import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const EXPECTED_INPUT_HASH = '36CA1A86B9C4E1E1D0F42F8D90858F2D72584DD2BCC53BEECEB69ED97A0C3688';

export function validateMedicalLibrary() {
  console.log('[validate-medical-library] Starting validation of medical library...');

  const contentDir = path.join(ROOT_DIR, 'content', 'medical', 'med401-git');
  const deployDir = path.join(ROOT_DIR, 'public', 'data', 'medical');

  // 1. Check directories exist
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Canonical content directory missing: ${contentDir}`);
  }
  if (!fs.existsSync(deployDir)) {
    throw new Error(`Deploy data directory missing: ${deployDir}`);
  }

  // 2. Check manifest
  const manifestPath = path.join(contentDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest missing at: ${manifestPath}`);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (manifest.provenance.inputHash !== EXPECTED_INPUT_HASH) {
    throw new Error(`Manifest input hash mismatch: expected ${EXPECTED_INPUT_HASH}, got ${manifest.provenance.inputHash}`);
  }

  if (manifest.provenance.topicCount !== 8) {
    throw new Error(`Expected 8 topics, got ${manifest.provenance.topicCount}`);
  }
  if (manifest.provenance.sectionCount !== 59) {
    throw new Error(`Expected 59 sections, got ${manifest.provenance.sectionCount}`);
  }
  if (manifest.provenance.passageCount !== 93) {
    throw new Error(`Expected 93 passages, got ${manifest.provenance.passageCount}`);
  }
  if (manifest.provenance.sourceVisualCount !== 6) {
    throw new Error(`Expected 6 converted source visuals, got ${manifest.provenance.sourceVisualCount}`);
  }
  if (manifest.provenance.imageCount !== 0 || manifest.provenance.studentFacingAssetCount !== 0) {
    throw new Error('Student-facing source images and assets must remain zero');
  }

  // Check canonical vs deploy manifest match
  const deployManifestBuf = fs.readFileSync(path.join(deployDir, 'manifest.json'));
  const canonicalManifestBuf = fs.readFileSync(manifestPath);
  if (!canonicalManifestBuf.equals(deployManifestBuf)) {
    throw new Error('Canonical and deploy manifest.json are not byte-identical');
  }

  // 3. Load topics & passages registry, verify IDs, recompute passage hashes, verify no data URIs
  const topicsContentDir = path.join(contentDir, 'topics');
  const topicFiles = fs.readdirSync(topicsContentDir).filter(f => f.endsWith('.json')).sort();

  if (topicFiles.length !== manifest.provenance.topicCount) {
    throw new Error(`Expected ${manifest.provenance.topicCount} topic files in ${topicsContentDir}, got ${topicFiles.length}`);
  }

  const registeredTopicIds = new Set();
  const registeredSectionIds = new Set();
  const registeredPassageIds = new Set();
  const registeredPassageText = new Map();
  const topicTitles = new Map();
  const sectionMetadata = new Map();
  let actualSectionCount = 0;
  let actualPassageCount = 0;

  topicFiles.forEach(file => {
    const canonicalTopicPath = path.join(topicsContentDir, file);
    const deployTopicPath = path.join(deployDir, 'topics', file);

    if (!fs.existsSync(deployTopicPath)) {
      throw new Error(`Deploy topic file missing: ${deployTopicPath}`);
    }

    const canonicalBuf = fs.readFileSync(canonicalTopicPath);
    const deployBuf = fs.readFileSync(deployTopicPath);
    if (!canonicalBuf.equals(deployBuf)) {
      throw new Error(`Topic file ${file} is not byte-identical between canonical and deploy`);
    }

    const rawStr = canonicalBuf.toString('utf8');
    if (rawStr.includes('data:image/')) {
      throw new Error(`Topic file ${file} contains base64 data URI! Data URIs are forbidden.`);
    }

    const tData = JSON.parse(rawStr);

    if (registeredTopicIds.has(tData.id)) {
      throw new Error(`Duplicate topic ID: ${tData.id}`);
    }
    registeredTopicIds.add(tData.id);
    topicTitles.set(tData.id, tData.title);

    (tData.sections || []).forEach(sec => {
      if (registeredSectionIds.has(sec.id)) {
        throw new Error(`Duplicate section ID: ${sec.id}`);
      }
      registeredSectionIds.add(sec.id);
      sectionMetadata.set(sec.id, { topicId: tData.id, title: sec.title });
      actualSectionCount += 1;

      if (!sec.contentHtml || !sec.contentHash) {
        throw new Error(`Section ${sec.id} is missing structured text content or its hash`);
      }
      if (/<(?:img|svg|canvas|iframe)\b/i.test(sec.contentHtml)) {
        throw new Error(`Section ${sec.id} contains a forbidden visual reproduction`);
      }
      if (/\b(?:Dr\.?\s+Kamal\s+Mokbel|Omar\s+Heikal|Hisham\s+Samy|MUST\s*401|Faculty\s+of\s+Medicine|Internal\s+Medicine\s+Department|uploaded lecture visual|Compact\s+MED401|supplied lecture slides)\b/i.test(sec.contentHtml)) {
        throw new Error(`Section ${sec.id} exposes author, branding, or source-visual metadata`);
      }
      const computedContentHash = crypto.createHash('sha256').update(sec.contentHtml).digest('hex').toLowerCase();
      if (computedContentHash !== sec.contentHash) {
        throw new Error(`Section ${sec.id} contentHash mismatch`);
      }
    });

    (tData.passages || []).forEach(pass => {
      if (registeredPassageIds.has(pass.id)) {
        throw new Error(`Duplicate passage ID: ${pass.id}`);
      }
      registeredPassageIds.add(pass.id);
      registeredPassageText.set(pass.id, pass.text);
      actualPassageCount += 1;

      if (!pass.sourceHash) {
        throw new Error(`Missing sourceHash for passage: ${pass.id}`);
      }
      if (!pass.title || !Array.isArray(pass.blocks) || pass.blocks.length === 0) {
        throw new Error(`Passage ${pass.id} is missing a clean title or structured text blocks`);
      }
      if (/\b(?:Dr\.?\s+Kamal\s+Mokbel|Omar\s+Heikal|Hisham\s+Samy|MUST\s*401|Faculty\s+of\s+Medicine|Internal\s+Medicine\s+Department|uploaded lecture visual|Compact\s+MED401|supplied lecture slides)\b/i.test(pass.text)) {
        throw new Error(`Passage ${pass.id} exposes author, branding, or source-visual metadata`);
      }

      // Recompute passage hash
      const computedHash = crypto.createHash('sha256').update(pass.text).digest('hex').toLowerCase();
      if (computedHash !== pass.sourceHash) {
        throw new Error(`Passage ${pass.id} sourceHash mismatch! Stored: ${pass.sourceHash}, Computed: ${computedHash}`);
      }
    });
  });

  if (registeredTopicIds.size !== manifest.provenance.topicCount) {
    throw new Error(`Manifest topic count does not match canonical topics: ${registeredTopicIds.size}`);
  }
  if (actualSectionCount !== manifest.provenance.sectionCount) {
    throw new Error(`Manifest section count does not match canonical sections: ${actualSectionCount}`);
  }
  if (actualPassageCount !== manifest.provenance.passageCount) {
    throw new Error(`Manifest passage count does not match canonical passages: ${actualPassageCount}`);
  }

  // 4. Verify source visual reproductions are absent from canonical and deploy output.
  for (const assetDir of [
    path.join(contentDir, 'assets'),
    path.join(deployDir, 'assets')
  ]) {
    const files = fs.existsSync(assetDir) ? fs.readdirSync(assetDir) : [];
    if (files.length !== 0) {
      throw new Error(`Source asset directory must be empty: ${assetDir}`);
    }
  }

  // 5. Verify evidence sidecar
  const evidencePath = path.join(contentDir, 'evidence', 'mcq-evidence.json');
  const deployEvidencePath = path.join(deployDir, 'evidence.json');

  if (fs.existsSync(evidencePath)) {
    if (!fs.existsSync(deployEvidencePath)) {
      throw new Error(`Deploy evidence.json missing at: ${deployEvidencePath}`);
    }

    const canonicalEvidenceBuf = fs.readFileSync(evidencePath);
    const deployEvidenceBuf = fs.readFileSync(deployEvidencePath);
    if (!canonicalEvidenceBuf.equals(deployEvidenceBuf)) {
      throw new Error('Canonical and deploy evidence.json are not byte-identical');
    }

    const evidenceData = JSON.parse(canonicalEvidenceBuf.toString('utf8'));
    (evidenceData.records || []).forEach(rec => {
      if (rec.reviewStatus === 'verified' || rec.reviewStatus === 'published') {
        if (!rec.questionId) {
          throw new Error(`Verified evidence record missing questionId`);
        }
        if (!registeredTopicIds.has(rec.topicId)) {
          throw new Error(`Evidence record ${rec.questionId} cites unknown topicId: ${rec.topicId}`);
        }
        if (!rec.sectionId) {
          throw new Error(`Verified evidence record ${rec.questionId} missing reviewed sectionId`);
        }
        if (rec.sectionId && !registeredSectionIds.has(rec.sectionId)) {
          throw new Error(`Evidence record ${rec.questionId} cites unknown sectionId: ${rec.sectionId}`);
        }
        const citedSection = sectionMetadata.get(rec.sectionId);
        if (citedSection.topicId !== rec.topicId) {
          throw new Error(`Evidence record ${rec.questionId} section does not belong to cited topic`);
        }
        if (rec.subjectTitle !== manifest.title) {
          throw new Error(`Evidence record ${rec.questionId} subjectTitle does not match manifest`);
        }
        if (rec.topicTitle !== topicTitles.get(rec.topicId)) {
          throw new Error(`Evidence record ${rec.questionId} topicTitle does not match canonical topic`);
        }
        if (rec.sectionTitle !== citedSection.title) {
          throw new Error(`Evidence record ${rec.questionId} sectionTitle does not match canonical section`);
        }
        if (!rec.passageIds || rec.passageIds.length === 0) {
          throw new Error(`Verified evidence record ${rec.questionId} missing passageIds citation`);
        }
        (rec.passageIds || []).forEach(pId => {
          if (!registeredPassageIds.has(pId)) {
            throw new Error(`Evidence record ${rec.questionId} cites unknown passageId: ${pId}`);
          }
        });
        if (rec.explanation) {
          if (!rec.explanation.correct || !rec.explanation.correct.text || !rec.explanation.correct.choiceId) {
            throw new Error(`Verified evidence record ${rec.questionId} has an incomplete reviewed rationale`);
          }
          Object.values(rec.explanation.incorrect || {}).forEach((rationale) => {
            if (!rationale.text) {
              throw new Error(`Evidence record ${rec.questionId} has an empty incorrect-choice rationale`);
            }
            if (!Array.isArray(rationale.passageIds) || rationale.passageIds.length === 0) {
              throw new Error(`Evidence record ${rec.questionId} incorrect-choice rationale has no passage citation`);
            }
            rationale.passageIds.forEach((pId) => {
              if (!registeredPassageIds.has(pId)) {
                throw new Error(`Evidence record ${rec.questionId} incorrect rationale cites unknown passageId: ${pId}`);
              }
            });
          });
        } else {
          if (!rec.highlightText) {
            throw new Error(`Source-only evidence record ${rec.questionId} is missing exact highlightText`);
          }
          const highlightFound = rec.passageIds.some((pId) => registeredPassageText.get(pId)?.includes(rec.highlightText));
          if (!highlightFound) {
            throw new Error(`Evidence record ${rec.questionId} highlightText is not present in a cited passage`);
          }
        }
        if (rec.sourceVersion !== manifest.sourceVersion) {
          throw new Error(`Evidence record ${rec.questionId} sourceVersion mismatch: expected ${manifest.sourceVersion}, got ${rec.sourceVersion}`);
        }
      }
    });
  }

  const alshamelEvidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  const alshamelRecords = alshamelEvidence.records
    .filter((record) => String(record.questionId).startsWith('med1-alshamel-'));
  const alshamelUnsupported = alshamelEvidence.unsupportedAlshamel || [];
  if (alshamelRecords.length !== manifest.provenance.alshamelSupportedCount || alshamelRecords.length !== 341) {
    throw new Error(`Expected 341 source-backed الشامل records, got ${alshamelRecords.length}`);
  }
  if (alshamelUnsupported.length !== manifest.provenance.alshamelUnsupportedCount || alshamelUnsupported.length !== 49) {
    throw new Error(`Expected 49 unsupported الشامل records, got ${alshamelUnsupported.length}`);
  }
  if (new Set(alshamelRecords.map((record) => record.questionId)).size !== alshamelRecords.length) {
    throw new Error('Duplicate الشامل evidence question IDs detected');
  }

  // 6. Verify deploy search index
  const searchIndexPath = path.join(deployDir, 'search-index.json');
  if (!fs.existsSync(searchIndexPath)) {
    throw new Error(`Deploy search-index.json missing at: ${searchIndexPath}`);
  }
  const searchIndex = JSON.parse(fs.readFileSync(searchIndexPath, 'utf8'));
  const expectedSearchItems = manifest.provenance.topicCount + manifest.provenance.sectionCount + manifest.provenance.passageCount;
  if (searchIndex.totalItems !== expectedSearchItems) {
    throw new Error(`Expected ${expectedSearchItems} search index items, got ${searchIndex.totalItems}`);
  }
  if (searchIndex.version !== manifest.sourceVersion) {
    throw new Error(`Search index source version does not match manifest`);
  }
  if (JSON.stringify(searchIndex).includes('data:image/')) {
    throw new Error('Deploy search index contains a data URI');
  }

  console.log('[validate-medical-library] Validation PASSED cleanly!');
  return true;
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  validateMedicalLibrary();
}
