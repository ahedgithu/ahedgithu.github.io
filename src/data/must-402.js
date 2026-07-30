// MUST 402 static configuration module
// Extracted from src/main.js for Phase 2 class-based refactor.
// Do not add runtime state, rendering functions, or 401 data here.

const subjects402 = [
  {
    code: 'SUR402-1',
    name: 'Surgery 402-1',
    totalCount: 5,
    examNote: 'Midterm: Wed Jul 22, 2026, 11:30-12:30.',
    topics: [
      { label: 'Thyroid', state: 'taken', art: 0, midtermScope: true, midtermScopeNote: 'SUR402-1 midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 1-3, completed by Week 3. Source: Weekly Reports.', lectureUrls: [{ label: 'Thyroid 2026', url: 'https://docs.google.com/presentation/d/1fpmXmkNcEH_HBg8n-R3eD0-9wp_D4er7/edit?usp=drivesdk' }], mcqTopicKey: '402::SUR402-1::Thyroid' },
      { label: 'Parathyroid', state: 'taken', art: 1, midtermScope: true, midtermScopeNote: 'SUR402-1 midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 3. Source: Weekly Reports.', lectureUrls: [{ label: 'Parathyroid', url: 'https://docs.google.com/presentation/d/1LlqKUnMnJXLDfb2oOlhxP6HLi3Qm0p7o/edit?usp=drivesdk' }], mcqTopicKey: '402::SUR402-1::Parathyroid' },
      { label: 'Breast / Fibroadenoma', state: 'taken', art: 2, midtermScope: true, midtermScopeNote: 'SUR402-1 midterm scope: Breast. Source: Midterm exams curriculum 402.', note: 'Covered Week 4. Source: Weekly Reports.', lectureUrls: [{ label: 'Breast diseases', url: 'https://docs.google.com/presentation/d/1s-6fayQ9x05HinNwyX0o_Fr3rxA-q-pl/edit?usp=drivesdk' }], mcqTopicKey: '402::SUR402-1::Breast Fibroadenoma' },
      { label: 'Breast tumor & cancer', state: 'taken', art: 3, midtermScope: true, midtermScopeNote: 'SUR402-1 midterm scope: Breast. Source: Midterm exams curriculum 402.', note: 'Covered Week 5. Source: Weekly Reports.', lectureUrls: [{ label: 'Breast cancer', url: 'https://docs.google.com/presentation/d/1EQXEsMqAkUa9_ai37kp-QuKJ9rSeoLuc/edit?usp=drivesdk' }], mcqTopicKey: '402::SUR402-1::Breast tumor cancer' },
      { label: 'Hernia', state: 'partial', art: 4, midtermScope: true, midtermScopeNote: 'SUR402-1 midterm scope: all hernia including abdominal and inguino-scrotal hernia. Source: Midterm exams curriculum 402.', note: 'Started Week 6 and reached the start of umbilical hernia; not complete. Source: Weekly Reports.', mcqTopicKey: '402::SUR402-1::Hernia' }
    ]
  },
  {
    code: 'SUR402-2',
    name: 'Surgery 402-2',
    totalCount: 5,
    examNote: 'Covered in Weekly Reports; no midterm scope source confirmed yet.',
    topics: [
      { label: 'Head trauma', state: 'taken', art: 5, note: 'Covered Week 1-2. Source: Weekly Reports.', mcqTopicKey: '402::SUR402-2::Head trauma' },
      { label: 'Cervical and lumbar disc prolapse', state: 'taken', art: 6, note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::SUR402-2::Disc prolapse' },
      { label: 'Cases', state: 'announced', art: 7, note: 'Mentioned Week 4 as not included / not with us in exam. Source: Weekly Reports.', mcqTopicKey: '402::SUR402-2::Cases' },
      { label: 'Spine fractures', state: 'taken', art: 8, note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::SUR402-2::Spine fractures' },
      { label: 'Incomplete & complete spinal cord injury', state: 'taken', art: 9, note: 'Covered Week 6. Source: Weekly Reports.', mcqTopicKey: '402::SUR402-2::Spinal cord injury' }
    ]
  },
  {
    code: 'MED402-1',
    name: 'Medicine 402-1',
    totalCount: 12,
    examNote: 'Midterm: Sat Jul 25, 2026, 11:30-12:30.',
    topics: [
      { label: 'Acromegaly', state: 'taken', art: 10, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 1. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::Acromegaly' },
      { label: 'Geriatric assessment and changes', state: 'taken', art: 11, midtermScope: true, midtermScopeNote: 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 2. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::Geriatric assessment' },
      { label: 'Atypical presentations of diseases', state: 'taken', art: 12, midtermScope: true, midtermScopeNote: 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::Atypical presentations' },
      { label: 'Prolactin', state: 'taken', art: 13, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::Prolactin' },
      { label: 'Comprehensive assessment', state: 'taken', art: 14, midtermScope: true, midtermScopeNote: 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::Comprehensive assessment' },
      { label: 'DM till end of DKA', state: 'taken', art: 15, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope: DM. Source: Midterm exams curriculum 402.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::DM DKA' },
      { label: 'Complications of DM', state: 'taken', art: 0, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope: DM. Source: Midterm exams curriculum 402.', note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::DM complications' },
      { label: 'Management of DM', state: 'taken', art: 1, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope: DM. Source: Midterm exams curriculum 402.', note: 'Covered Week 6. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::DM management' },
      { label: 'Osteoporosis', state: 'taken', art: 2, midtermScope: true, midtermScopeNote: 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 6. Source: Weekly Reports.', mcqTopicKey: '402::MED402-1::Osteoporosis' },
      { label: 'Panhypopituitarism', state: 'remaining', art: 3, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-1::Panhypopituitarism' },
      { label: 'SIADH', state: 'remaining', art: 4, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-1::SIADH' },
      { label: 'Diabetes insipidus', state: 'remaining', art: 5, midtermScope: true, midtermScopeNote: 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-1::Diabetes insipidus' }
    ]
  },
  {
    code: 'MED402-2',
    name: 'Medicine 402-2',
    totalCount: 9,
    examNote: 'Midterm: Wed Jul 29, 2026, 11:30-12:30.',
    topics: [
      { label: 'Intro into neuro, book p.1-15', state: 'taken', art: 6, midtermScope: true, midtermScopeNote: 'MED402-2 neurology midterm scope starts from page 1. Source: Midterm exams curriculum 402.', note: 'Covered Week 2. Source: Weekly Reports.', mcqTopicKey: '402::MED402-2::Intro neuro' },
      { label: 'Psych history and examination', state: 'taken', art: 7, midtermScope: true, midtermScopeNote: 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::MED402-2::Psych history MSE' },
      { label: 'Hemiplegia', state: 'taken', art: 8, midtermScope: true, midtermScopeNote: 'MED402-2 neurology midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::MED402-2::Hemiplegia' },
      { label: 'Mood disorders', state: 'taken', art: 9, midtermScope: true, midtermScopeNote: 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::MED402-2::Mood disorders' },
      { label: 'Paraplegia', state: 'taken', art: 10, midtermScope: true, midtermScopeNote: 'MED402-2 neurology midterm scope. Source: Midterm exams curriculum 402.', note: 'Covered Week 6. Source: Weekly Reports.', mcqTopicKey: '402::MED402-2::Paraplegia' },
      { label: 'Mood stabilizers', state: 'remaining', art: 11, midtermScope: true, midtermScopeNote: 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-2::Mood stabilizers' },
      { label: 'Antidepressants', state: 'remaining', art: 12, midtermScope: true, midtermScopeNote: 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-2::Antidepressants' },
      { label: 'Cranial nerves / speech / sensory system', state: 'remaining', art: 13, midtermScope: true, midtermScopeNote: 'MED402-2 neurology page 1-69 scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-2::Neuro systems' },
      { label: 'Vascular occlusive syndrome and brain blood supply', state: 'remaining', art: 14, midtermScope: true, midtermScopeNote: 'MED402-2 neurology page 1-69 scope. Source: Midterm exams curriculum 402.', mcqTopicKey: '402::MED402-2::Vascular occlusive syndrome' }
    ]
  },
  {
    code: 'GYNA402',
    name: 'Gynecology & Obstetrics 402',
    totalCount: 13,
    examNote: 'Midterm: Sat Aug 1, 2026, 11:30-12:30.',
    topics: [
      { label: 'Menstrual cycle', state: 'taken', art: 15, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 12-16.', note: 'Covered Week 1. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Menstrual cycle' },
      { label: 'Abortion', state: 'taken', art: 0, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 19-25.', note: 'Covered Week 2. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Abortion' },
      { label: 'Amenorrhea', state: 'taken', art: 1, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 25-29.', note: 'Covered Week 2. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Amenorrhea' },
      { label: 'Ectopic pregnancy', state: 'taken', art: 2, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 25-29.', note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Ectopic pregnancy' },
      { label: 'PCOS', state: 'taken', art: 3, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 34-36.', note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::PCOS' },
      { label: 'Vesicular mole', state: 'taken', art: 4, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 30-33. Malignant GTD is not included.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Vesicular mole' },
      { label: 'Antenatal care round', state: 'taken', art: 5, midtermScope: true, midtermScopeNote: 'OBS rounds midterm scope. 2026 book pages 147-149, 1-13.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Antenatal care round' },
      { label: 'Abnormal uterine bleeding', state: 'taken', art: 6, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 92-96.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::AUB' },
      { label: 'Endometrial hyperplasia', state: 'taken', art: 7, note: 'Covered Week 4, but not listed in the provided midterm scope. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Endometrial hyperplasia' },
      { label: 'Dysmenorrhea', state: 'taken', art: 8, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 17-18.', note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Dysmenorrhea' },
      { label: 'Hyperprolactinemia', state: 'taken', art: 9, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book page 30.', note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Hyperprolactinemia' },
      { label: 'Antepartum hemorrhage', state: 'taken', art: 10, midtermScope: true, midtermScopeNote: 'GYNA402 midterm scope. 2026 book pages 35-41.', note: 'Covered Week 6. Source: Weekly Reports.', mcqTopicKey: '402::GYNA402::Antepartum hemorrhage' },
      { label: 'Lower genital tract infection', state: 'remaining', art: 11, midtermScope: true, midtermScopeNote: 'GYNA rounds midterm scope. 2026 book pages 61-67.', mcqTopicKey: '402::GYNA402::Lower genital tract infection' }
    ]
  },
  {
    code: 'PED402',
    name: 'Pediatrics 402',
    totalCount: 8,
    examNote: 'Midterm scope: Growth & Development, Nutrition, Cardiology.',
    topics: [
      { label: 'Growth & Development', state: 'taken', art: 12, midtermScope: true, midtermScopeNote: 'PED402 midterm scope. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 1. Source: Weekly Reports.', mcqTopicKey: '402::PED402::Growth Development' },
      { label: 'Nutrition', state: 'taken', art: 13, midtermScope: true, midtermScopeNote: 'PED402 midterm scope. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 2-3. Source: Weekly Reports.', mcqTopicKey: '402::PED402::Nutrition' },
      { label: 'Cardiology intro/pages 323-326/362', state: 'taken', art: 14, midtermScope: true, midtermScopeNote: 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::PED402::Cardiology intro' },
      { label: 'ASD / VSD / PDA', state: 'taken', art: 15, midtermScope: true, midtermScopeNote: 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::PED402::ASD VSD PDA' },
      { label: 'F4 / TGA / AVC', state: 'taken', art: 0, midtermScope: true, midtermScopeNote: 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::PED402::F4 TGA AVC' },
      { label: 'RHD / SBE / Cardiomyopathy', state: 'taken', art: 1, midtermScope: true, midtermScopeNote: 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::PED402::RHD SBE Cardiomyopathy' },
      { label: 'AS / PS / CoA', state: 'taken', art: 2, midtermScope: true, midtermScopeNote: 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.', note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::PED402::AS PS CoA' },
      { label: 'GIT Pain & Constipation', state: 'taken', art: 3, note: 'Covered Week 6. Source: Weekly Reports. Not included in the reduced midterm scope unless confirmed later.', mcqTopicKey: '402::PED402::GIT Pain Constipation' }
    ]
  },
  {
    code: 'RAD402',
    name: 'Radiology 402',
    totalCount: 5,
    examNote: 'Covered in Weekly Reports; no midterm scope source confirmed yet.',
    topics: [
      { label: 'Liver and biliary + small and large bowel', state: 'taken', art: 4, note: 'Covered Week 2. Source: Weekly Reports.', mcqTopicKey: '402::RAD402::Liver biliary bowel' },
      { label: 'Breast imaging', state: 'taken', art: 5, note: 'Covered Week 3. Source: Weekly Reports.', mcqTopicKey: '402::RAD402::Breast imaging' },
      { label: 'Nuclear Medicine', state: 'taken', art: 6, note: 'Covered Week 4. Source: Weekly Reports.', mcqTopicKey: '402::RAD402::Nuclear Medicine' },
      { label: 'Cardiothoracic imaging', state: 'taken', art: 7, note: 'Covered Week 5. Source: Weekly Reports.', mcqTopicKey: '402::RAD402::Cardiothoracic imaging' },
      { label: 'CNS imaging', state: 'taken', art: 8, note: 'Covered Week 6. Source: Weekly Reports.', mcqTopicKey: '402::RAD402::CNS imaging' }
    ]
  }
]

const midtermExamSchedule402 = [
  { code: 'SUR 402-1', subjectCode: 'SUR402-1', subjectName: 'Surgery 402-1', date: '2026-07-22', dayLabel: 'Wed', time: '11:30-12:30', quizTopicKey: 'SUR 402-1 MCQs', quizActionLabel: 'MCQs' },
  { code: 'MED 402-1', subjectCode: 'MED402-1', subjectName: 'Medicine 402-1', date: '2026-07-25', dayLabel: 'Sat', time: '11:30-12:30', quizTopicKey: 'MED 402-1 MCQs', quizActionLabel: 'MCQs' },
  { code: 'MED 402-2', subjectCode: 'MED402-2', subjectName: 'Medicine 402-2', date: '2026-07-29', dayLabel: 'Wed', time: '11:30-12:30', quizTopicKey: 'MED 402-2 MCQs', quizActionLabel: 'MCQs' },
  { code: 'GYN 402', subjectCode: 'GYNA402', subjectName: 'Gynecology & Obstetrics 402', date: '2026-08-01', dayLabel: 'Sat', time: '11:30-12:30', quizTopicKey: 'GYN 402 MCQs', quizActionLabel: 'MCQs' }
]

export { subjects402, midtermExamSchedule402 }
