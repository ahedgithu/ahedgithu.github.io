import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const STABLE_ISO_DATE = '2026-07-27T00:00:00.000Z';

export function buildMedicalLibrary() {
  console.log('[build-medical-library] Building deploy bundles under public/data/medical/...');

  const contentDir = path.join(ROOT_DIR, 'content', 'medical', 'med401-git');
  const deployDir = path.join(ROOT_DIR, 'public', 'data', 'medical');
  const deployTopicsDir = path.join(deployDir, 'topics');
  const deployAssetsDir = path.join(deployDir, 'assets');

  if (!fs.existsSync(contentDir)) {
    throw new Error(`Canonical content directory missing: ${contentDir}. Run extraction first.`);
  }

  resetGeneratedDirectory(deployTopicsDir, deployDir);
  resetGeneratedDirectory(deployAssetsDir, deployDir);

  // Read manifest
  const manifestPath = path.join(contentDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  fs.copyFileSync(manifestPath, path.join(deployDir, 'manifest.json'));

  // Copy evidence if present
  const evidencePath = path.join(contentDir, 'evidence', 'mcq-evidence.json');
  if (fs.existsSync(evidencePath)) {
    fs.copyFileSync(evidencePath, path.join(deployDir, 'evidence.json'));
  }

  // Read all topics and construct search-index.json
  const topicsContentDir = path.join(contentDir, 'topics');
  const topicFiles = fs.readdirSync(topicsContentDir).filter(f => f.endsWith('.json')).sort();

  let searchIndexItems = [];

  topicFiles.forEach(tFile => {
    const topicData = JSON.parse(fs.readFileSync(path.join(topicsContentDir, tFile), 'utf8'));

    // Copy topic to public/data/medical/topics/
    fs.copyFileSync(path.join(topicsContentDir, tFile), path.join(deployTopicsDir, tFile));

    const subjectBreadcrumb = 'University Source';
    const topicBreadcrumb = `${subjectBreadcrumb} › ${topicData.title}`;

    // Index topic
    searchIndexItems.push({
      id: topicData.id,
      type: 'topic',
      topicId: topicData.id,
      title: topicData.title,
      breadcrumb: topicBreadcrumb,
      keywords: topicData.aliases || [],
      text: `${topicData.title} ${(topicData.aliases || []).join(' ')}`
    });

    // Index outline sections
    (topicData.sections || []).forEach(sec => {
      const secBreadcrumb = `${topicBreadcrumb} › ${sec.title}`;

      searchIndexItems.push({
        id: sec.id,
        type: 'section',
        topicId: topicData.id,
        sectionId: sec.id,
        title: sec.title,
        breadcrumb: secBreadcrumb,
        category: sec.category,
        keywords: sec.keywords || [],
        text: `${sec.title} ${sec.category} ${(sec.keywords || []).join(' ')}`
      });
    });

    // Index topic-level source pages (passages)
    (topicData.passages || []).forEach(pass => {
      searchIndexItems.push({
        id: pass.id,
        type: 'passage',
        topicId: topicData.id,
        passageId: pass.id,
        title: pass.title || 'Detailed source content',
        breadcrumb: topicBreadcrumb,
        text: pass.text,
        sourceHash: pass.sourceHash
      });
    });
  });

  const searchIndex = {
    version: manifest.sourceVersion,
    generatedAt: STABLE_ISO_DATE,
    totalItems: searchIndexItems.length,
    items: searchIndexItems
  };

  fs.writeFileSync(path.join(deployDir, 'search-index.json'), JSON.stringify(searchIndex, null, 2), 'utf8');

  console.log(`[build-medical-library] Static build complete.`);
  console.log(`  Deploy path: public/data/medical/`);
  console.log(`  Indexed items: ${searchIndexItems.length}`);
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
  buildMedicalLibrary();
}
