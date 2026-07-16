import confetti from 'canvas-confetti'

import { calculatePercent, calculateQuizProgress } from './progress.js'

import {
  deleteNewsCard,
  deleteUserQuizProgress,
  fetchAdminProfile,
  fetchNewsCards,
  fetchTrackerTopicRows,
  fetchUserQuizProgressRows,
  fetchUserTopicProgressRows,
  fetchLeaderboard,
  fetchUserPreference,
  upsertUserPreference,
  getCurrentUser,
  isSupabaseConfigured,
  onAuthStateChange,
  signInAdmin,
  signInWithGoogle,
  signOutUser,
  updateNewsCardOrder,
  upsertNewsCard,
  upsertTrackerTopics,
  upsertUserQuizProgress,
  upsertUserTopicProgress
} from './supabaseClient.js'

let subjects = [
  {
    code: 'SUR-1',
    name: 'Surgery 1',
    totalCount: 15,
    examNote: 'Midterm: Wed Jul 22, 2026, 2:30-3:30.',
    topics: [
      {
        label: 'Liver',
        state: 'taken',
        art: 0,
        coverageUnits: 4,
        midtermScope: true,
        midtermScopeNote: 'SUR 401-1 scope: Liver. Source: Dr. Abu Alata PDFs and lecture recordings.',
        note: 'Consolidates Liver Introduction; Liver Trauma and Infections; Liver Tumors; and Cirrhosis, portal hypertension and hepatic vascular disease.',
        progressAliases: ['Liver Introduction', 'Liver Trauma and Infections', 'Liver Tumors', 'Cirrhosis, portal hypertension and hepatic vascular disease'],
        driveSelector: [
          { label: 'Liver Introduction', source: 'Dr. Abu Alata PDFs and lecture recordings.', url: 'https://docs.google.com/presentation/d/12BIYR9r2h_fwkUQpXQI0xOyPy-lSI9D_/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true', recordUrl: 'https://drive.google.com/file/d/1ukIDlUnzzpsyCOola5-TiyWJy7e2QELO/view?usp=drivesdk' },
          { label: 'Liver Trauma and Infections', source: 'Dr. Abu Alata PDFs and lecture recordings. Includes amoebic hepatitis and abscess.', url: 'https://docs.google.com/presentation/d/1yjIUZolwSkC9DLnvTGCWBsxtPMuqalgY/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true', recordUrl: 'https://drive.google.com/file/d/1mhHDVMOU6lPAar5xesF0eLKtNUJDwVR9/view?usp=drivesdk' },
          { label: 'Liver Tumors', source: 'Tuesday report 30 Jun, taught by Dr. Abu Alata.', url: '' },
          { label: 'Cirrhosis, portal hypertension and hepatic vascular disease', source: 'Tuesday report: cirrhosis, portal hypertension, varices, transplantation, and hepatic vascular disease.', url: 'https://docs.google.com/presentation/d/1Y8AQJlpl-XINpxVDyeexUBjpxfAsDJrV/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true', recordUrl: 'https://drive.google.com/file/d/1t1i2zjXOYw9jaSdIRYn1GvBOrsToq30u/view?usp=drivesdk' }
        ],
        expandableTopics: true
      },
      {
        label: 'Esophagus topics',
        state: 'taken',
        art: 1,
        coverageUnits: 3,
        midtermScope: true,
        midtermScopeNote: "SUR 401-1 scope: Esophagus. Source: Dr. Hisham's book and lecture recordings.",
        note: 'Contains 3 topics: surgical anatomy and physiology; achalasia, hiatus hernia and GERD; esophageal perforation.',
        lectureUrls: [
          { label: 'Anatomy lecture', url: 'https://drive.google.com/file/d/1-iY3KOVw6vUWm_7k--A9lWFJnuGxYqoo/view?usp=drivesdk' },
          { label: 'Achalasia / GERD lecture', url: 'https://drive.google.com/file/d/1-uzZPnXaDetSZxCujFNDLudZ_TOJaQEh/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1vt23RUJTWuT_1ZRUHGm4gvWJKW1sxUyI/view?usp=drivesdk'
      },
      {
        label: 'Tongue',
        state: 'remaining',
        art: 2,
        midtermScope: true,
        midtermScopeNote: 'SUR 401-1 scope: Tongue. Source: Dr. Abu Alata PDFs and lecture recordings.'
      },
      { label: 'Salivary glands', state: 'remaining', art: 13 },
      {
        label: 'Stomach',
        state: 'taken',
        art: 6,
        midtermScope: true,
        midtermScopeNote: "SUR 401-1 scope: Stomach. Source: Dr. Hisham's book and lecture recordings.",
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: anatomy, physiology and histology of the stomach; acute and chronic peptic ulcer; chronic gastric ulcer, taught by Dr. Hisham Ahmed.',
        progressAliases: ['Stomach anatomy, physiology, histology and peptic ulcers'],
        mcqTopicKey: 'Stomach anatomy, physiology, histology and peptic ulcers',
        expandableTopics: true,
        driveSelector: [
          { label: 'Stomach anatomy', source: "SUR 401-1 scope. Source: Dr. Hisham's book and lecture recording.", url: '', recordUrl: 'https://drive.google.com/file/d/19U-2vhMabUKGYhF_reeNy2NDovYvN0wl/view?usp=drivesdk' },
          { label: 'Stomach physiology', source: "SUR 401-1 scope. Source: Dr. Hisham's book and lecture recording.", url: '', recordUrl: 'https://drive.google.com/file/d/19U-2vhMabUKGYhF_reeNy2NDovYvN0wl/view?usp=drivesdk' },
          { label: 'Stomach histology', source: "SUR 401-1 scope. Source: Dr. Hisham's book and lecture recording.", url: '', recordUrl: 'https://drive.google.com/file/d/19U-2vhMabUKGYhF_reeNy2NDovYvN0wl/view?usp=drivesdk' },
          { label: 'Peptic ulcers', source: 'Sunday report 28 Jun: acute and chronic peptic ulcer, including chronic gastric ulcer, taught by Dr. Hisham Ahmed.', url: '', recordUrl: 'https://drive.google.com/file/d/19U-2vhMabUKGYhF_reeNy2NDovYvN0wl/view?usp=drivesdk', quizKey: 'Stomach anatomy, physiology, histology and peptic ulcers' }
        ],
        audioUrl: 'https://drive.google.com/file/d/19U-2vhMabUKGYhF_reeNy2NDovYvN0wl/view?usp=drivesdk'
      },
      { label: 'Pancreas', state: 'remaining', art: 4 },
      { label: 'Intestines', state: 'remaining', art: 7 },
      {
        label: 'Appendix',
        state: 'remaining',
        art: 7
      },
      { label: 'Biliary tract', state: 'remaining', art: 0 },
      {
        label: 'Spleen',
        state: 'remaining',
        art: 12,
        midtermScope: true,
        midtermScopeNote: 'SUR 401-1 scope: Spleen. Source: Spring 2026 midterm curriculum, Dr. Abu Alata PDFs and lecture recordings.',
        lectureUrls: [
          { label: 'Lecture slides', url: 'https://docs.google.com/presentation/d/1GfFE2goGP1WRw5D14YqQHW9ptEuJkBMz/edit?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1_o-r7uaXAHQW8EEGixSW91tBPnpcjEDv/view?usp=drivesdk'
      }
    ],
    clinicalTopics: [
      {
        label: 'Clinical round overview',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1mpckOjHYl__72iCCGy4jXU7EJfzgzKlX/view?usp=drivesdk'
      }
    ]
  },
  {
    code: 'SUR-2',
    name: 'Surgery 2',
    totalCount: 6,
    examNote: 'Finals only (no midterm exam).',
    topics: [
      {
        label: 'Chest trauma / trauma up to sternal fractures',
        state: 'taken',
        art: 10,
        note: 'Sunday report 21 Jun: taught by Dr. Mohand Mostafa.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1wF1XfNhzOsjS7cX8t6-xyEi92dQShVB-/edit?usp=drivesdk' }
        ]
      },
      {
        label: 'Cardiothoracic Trauma Part 1',
        state: 'taken',
        art: 10,
        lectureUrls: [
          { label: 'Lecture slides', url: 'https://docs.google.com/presentation/d/1wF1XfNhzOsjS7cX8t6-xyEi92dQShVB-/edit?usp=drivesdk' },
          { label: 'SharePoint recording', url: 'https://mustedueg-my.sharepoint.com/:v:/g/personal/200022569_must_edu_eg/IQB3Dc4y6O42QJ6eMAnau4B-AV_P59BYY7lhONBTlEb4YAs' }
        ],
        audioUrl: 'https://drive.google.com/file/d/10m1QAEj6AhRE1cD8_zK1jbpejunbeRMX/view?usp=drivesdk'
      },
      {
        label: 'Rib fracture',
        state: 'taken',
        art: 10,
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: Cardiothoracic Trauma Part 2, taught by Dr. Mohand Mostafa. Covers rib fractures, hemothorax, pneumothorax, pulmonary contusion, cardiac injury, great vessel injury, chest tube insertion, trauma priorities, and emergency management.',
        lectureUrls: [
          { label: 'Cardiothoracic Trauma Part 2', url: 'https://docs.google.com/presentation/d/17kjMBNHhun5-76h7saPBwGnZVV4rG588/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1JdFbfB1xuLD-WSCnXs7jgBAA1KoSJ1Rj/view?usp=drivesdk'
      },
      {
        label: 'Pneumothorax, tension pneumothorax, hemothorax',
        state: 'taken',
        art: 10,
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: Cardiothoracic Trauma Part 2, taught by Dr. Mohand Mostafa. Covers rib fractures, hemothorax, pneumothorax, pulmonary contusion, cardiac injury, great vessel injury, chest tube insertion, trauma priorities, and emergency management.',
        lectureUrls: [
          { label: 'Cardiothoracic Trauma Part 2', url: 'https://docs.google.com/presentation/d/17kjMBNHhun5-76h7saPBwGnZVV4rG588/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1JdFbfB1xuLD-WSCnXs7jgBAA1KoSJ1Rj/view?usp=drivesdk'
      },
      {
        label: 'Pulmonary contusion and flail chest',
        state: 'taken',
        art: 10,
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: Cardiothoracic Trauma Part 2, taught by Dr. Mohand Mostafa. Covers rib fractures, hemothorax, pneumothorax, pulmonary contusion, cardiac injury, great vessel injury, chest tube insertion, trauma priorities, and emergency management.',
        lectureUrls: [
          { label: 'Cardiothoracic Trauma Part 2', url: 'https://docs.google.com/presentation/d/17kjMBNHhun5-76h7saPBwGnZVV4rG588/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1JdFbfB1xuLD-WSCnXs7jgBAA1KoSJ1Rj/view?usp=drivesdk'
      },
      { label: 'Empyema', state: 'remaining', art: 10, audioUrl: 'https://drive.google.com/file/d/1WlMpLSuqu3GBmoMLwRtxEOsUl2D8EsVK/view?usp=drivesdk' }
    ],
    clinicalTopics: [
      {
        label: 'Overview of the Subject',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1JCS1ZR8BiLL2sGVi-0B6UBExsstVOZEP/view?usp=drivesdk'
      }
    ]
  },
  {
    code: 'MED-1',
    name: 'Internal Medicine 1',
    totalCount: 15,
    examNote: 'Midterm: Wed Jul 29, 2026, 2:30-3:30.',
    topics: [
      {
        label: "GERD, Barrett's Esophagus, Esophageal Motility Disorders",
        state: 'taken',
        art: 1,
        midtermScope: true,
        midtermScopeNote: 'MED 401-1 scope: Diseases of the Esophagus. Source: Spring 2026 midterm curriculum and Dr. Hisham Samy lecture recordings.',
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: Disease of the Esophagus, taught by Dr. Hisham Samy. Covers anatomy of the esophagus, physiology of the esophagus, physiology of swallowing, and physiology of GERD.',
        lectureUrls: [
          { label: 'Diseases of the oesophagus', url: 'https://docs.google.com/presentation/d/1p7aTSiqNJZa-R63z-pcqjAGhHTTNehrf/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1RIQ-z7QWxEY2QNgMXpE-GCYwYwDM-I7l/view?usp=drivesdk'
      },
      {
        label: 'Investigation of Acute Hepatitis',
        state: 'taken',
        art: 5,
        midtermScope: true,
        midtermScopeNote: 'MED 401-1 scope: Acute viral hepatitis and investigation of liver diseases. Source: Spring 2026 midterm curriculum.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1LQ-zgjWNlzGar7OgfX1WhBxkqvsTIAhQ/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1pCiruJJQ6rB84pyxeGy_NUY5QMUzDJVi/view?usp=drivesdk'
      },
      {
        label: 'Chronic viral and non-viral hepatitis',
        state: 'taken',
        art: 5,
        midtermScope: true,
        midtermScopeNote: 'MED 401-1 scope: NAFLD/NASH, autoimmune hepatitis, and chronic viral hepatitis. Source: Spring 2026 midterm curriculum.',
        note: 'Sunday report 21 Jun: Autoimmune Hepatitis (AIH) taught by Dr. Omar Heikal. Also covers PBC, PSC, MASLD.',
        lectureUrls: [
          { label: 'Lecture folder', url: 'https://drive.google.com/drive/folders/1545uWPrXXOM9JjruxJVRzh2joO5IFDlt' },
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1YFpgL3FEVYMOj3aHLH7zjdYHn7A4G2FF' }
        ],
        audioUrl: 'https://drive.google.com/file/d/10wtq_v-0BOgOysXSgb1qxAFoOkbW8ix0/view?usp=drivesdk'
      },
      { label: 'Diseases of Stomach: PUD, H. pylori, non-ulcer dyspepsia', state: 'remaining', art: 6 },
      { label: 'Small intestine: diarrhea, malabsorption, celiac, Whipple', state: 'remaining', art: 7, midtermScope: true, midtermScopeNote: 'MED 401-1 scope: Diseases of the Small Intestine. Source: Spring 2026 midterm curriculum.', audioUrl: 'https://drive.google.com/file/d/10G1Kk8lgpPk7_N6NDp0xqdTiZZKFz0yR/view?usp=drivesdk' },
      { label: 'Cirrhosis complications: portal hypertension, ascites', state: 'remaining', art: 8, midtermScope: true, midtermScopeNote: 'MED 401-1 scope: Liver cirrhosis and portal hypertension. Source: Spring 2026 midterm curriculum.', audioUrl: 'https://drive.google.com/file/d/17KyoPZaodfoIqTQtEzn21cTxNQOpA9ks/view?usp=drivesdk' },
      { label: 'SBP, Hepatic Encephalopathy, Hepatorenal Syndrome', state: 'remaining', art: 8 },
      {
        label: 'Diseases of the Pancreas',
        state: 'taken',
        art: 4,
        midtermScope: true,
        midtermScopeNote: 'MED 401-1 scope: Diseases of the Pancreas. Source: Spring 2026 midterm curriculum and Dr. Hisham Samy lecture recordings.',
        studyUrl: '/study/index.html#/topic/acute-pancreatitis',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/14TjxXXk2ITCHuao-ayMIwT4z1yjbNFuh/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Jw6R2QaYMQ9PerWxCAU_0vMfReSneE1o/view?usp=drivesdk'
      },
      { label: 'Upper and Lower GI Bleeding', state: 'remaining', art: 7 },
      {
        label: 'Metabolic Liver Disease',
        state: 'taken',
        art: 5,
        note: 'Sunday report 21 Jun: NASH & NAFLD taught by Dr. Omar Heikal.',
        lectureUrls: [
          { label: 'Lecture folder', url: 'https://drive.google.com/drive/folders/1545uWPrXXOM9JjruxJVRzh2joO5IFDlt' },
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1YFpgL3FEVYMOj3aHLH7zjdYHn7A4G2FF' }
        ],
        audioUrl: 'https://drive.google.com/file/d/10wtq_v-0BOgOysXSgb1qxAFoOkbW8ix0/view?usp=drivesdk'
      },
      { label: 'Liver Failure and Transplantation', state: 'remaining', art: 8 },
      { label: 'Vascular Liver Disease and DILI', state: 'remaining', art: 5 },
      { label: 'Constipation, Diverticular Disease, IBD, IBS', state: 'remaining', art: 7 },
      { label: 'GI Cancers and Comprehensive GIT Revision', state: 'remaining', art: 6 },
      { label: 'Case-Based Discussions', state: 'remaining', art: 2 }
    ]
  },
  {
    code: 'MED-2',
    name: 'Internal Medicine 2',
    totalCount: 29,
    examNote: 'Midterm: Sat Jul 25, 2026, 2:30-3:30.',
    topics: [
      // Cardiology (16 topics)
      { label: 'Cardiology Symptomatology', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Acute Coronary Artery Disease', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Chronic Coronary Artery Disease', state: 'remaining', art: 9, section: 'Cardio' },
      {
        label: 'Rheumatic fever and infective endocarditis',
        state: 'taken',
        art: 9,
        section: 'Cardio',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Cardiology scope: Rheumatic Fever only. Infective endocarditis is not listed in the Spring 2026 midterm curriculum.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1yZxhWUh5KDgQp_Z_Le10RL_JmdooXpwb/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1G7x3QDKNsrxEZXdm-iQBAEeQzijaul2K/view?usp=drivesdk'
      },
      { label: 'Acute coronary syndrome', state: 'remaining', art: 9, section: 'Cardio' },
      {
        label: 'Mitral valve diseases',
        state: 'taken',
        art: 9,
        section: 'Cardio',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Cardiology scope: Mitral valve diseases. Source: Spring 2026 midterm curriculum.',
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: Mitral Valve Diseases, taught by Dr. Nashwa El Hagrasy. Covers symptoms, diagnostics, clinical evaluation, mitral stenosis, mitral regurgitation, and mitral valve prolapse.',
        lectureUrls: [
          { label: 'Mitral valve lecture', url: 'https://docs.google.com/presentation/d/1yZxhWUh5KDgQp_Z_Le10RL_JmdooXpwb/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1iA7K5sZ3xXEcHJLey6JUr9WmHFrxlCFS/view?usp=drivesdk'
      },
      { label: 'Aortic valve diseases', state: 'remaining', art: 9, section: 'Cardio', midtermScope: true, midtermScopeNote: 'MED 401-2 Cardiology scope: Aortic valve diseases. Source: Spring 2026 midterm curriculum.' },
      { label: 'Pericardial diseases', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'ECG', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Arrhythmia I', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Arrhythmia II', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Respiratory Failure', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Heart Failure I', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Heart Failure II', state: 'remaining', art: 9, section: 'Cardio' },
      {
        label: 'Systemic Hypertension',
        state: 'taken',
        art: 9,
        section: 'Cardio',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Cardiology scope: Systemic Hypertension. Source: Spring 2026 midterm curriculum.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1lCYbFrQVM23IHF-qxs0DItq6wHIjwxxP/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1ryTmHHfCBcIzK0AXKgYYxqSKvvbMHAZk/view?usp=drivesdk'
      },
      {
        label: 'Pulmonary Embolism',
        state: 'taken',
        art: 10,
        section: 'Cardio',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Cardiology scope: Pulmonary Embolism. Source: Spring 2026 midterm curriculum.',
        note: 'Sunday report 21 Jun: taught by Dr. Ibrahim Abdelhamid.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1TicuEg59UwuZYaZ4OPBiD6vOfDupF8za/edit?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/15PxmYb9SjFLIoabrFFI0XfBqFVaRhjUO/view?usp=drivesdk'
      },
      // Chest (13 topics)
      {
        label: 'Chest Symptomatology',
        state: 'taken',
        art: 10,
        section: 'Chest',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Chest scope: cough, sputum, hemoptysis, and dyspnea.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1SX1PStcEfLVwTwYt_WfjesGwkieI2Pfd/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/14YTH3onMolGkFXHzRSyG_ejnZv9ryGG5/view?usp=drivesdk'
      },
      {
        label: 'Pulmonary Function Test',
        state: 'taken',
        art: 11,
        section: 'Chest',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Chest scope: PFTs, lung volumes, capacities, flow rates, diffusion, and obstructive vs restrictive clinical applications.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1k5IlWjpjnwEeKt4UmcD-zdBNtqiyr0S2/view?usp=drivesdk' },
          { label: 'Slides', url: 'https://docs.google.com/presentation/d/1I3A5NgJf0YtX932PbftokMNZeKfjGEln/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1O83lsWK2zc1e7u6Yljwtd5ZFM2llnrFA/view?usp=drivesdk'
      },
      {
        label: 'Diseases of the airways and bronchial asthma Part 1',
        state: 'taken',
        art: 10,
        section: 'Chest',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Chest scope: airway and small-airway diseases, subglottic stenosis, vocal cord dysfunction, and bronchial asthma including severity assessment, stepwise treatment, biological treatment, and ACO/ACOS. Genetic treatment is excluded.',
        note: 'Tuesday report: diseases of upper and lower airways and bronchial asthma part 1.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/133Ae9Po7wzSJBOf-GqANHRBHmPBufviI/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1w1y-MVBWAmFr78kVW7CGHADsw-CmFsBK/view?usp=drivesdk'
      },
      {
        label: 'Chronic Bronchitis and COPD',
        state: 'taken',
        art: 10,
        section: 'Chest',
        midtermScope: true,
        midtermScopeNote: 'MED 401-2 Chest scope: only ACO/ACOS is included from the COPD and overlaps section. COPD is excluded, and genetic treatment for asthma is excluded.',
        updatedAt: '2026-06-30',
        updateBatch: 'tuesday-report-2026-06-30',
        note: 'Tuesday report 30 Jun: COPD, taught by Dr. Serageldin Ali Sadek. Covers chronic bronchitis, emphysema, spirometry, CT chest, risk factors, airflow limitation, and management.',
        lectureUrls: [
          { label: 'Lecture folder', url: 'https://drive.google.com/drive/folders/1KYLyxp67TVvPqmcnl33siqUB5SSbbwYF' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1QpUB6w-BoBRmhutzUwzUUi9kbf_L_Q0p/view?usp=drivesdk'
      },
      { label: 'Suppurative Lung Diseases', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'CAP and HAP', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Interstitial Lung Diseases and Sarcoidosis', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Pulmonary Tuberculosis', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Atypical Mycoplasma Infections', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Diseases of the Pleura I', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Diseases of the Pleura II', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'EVALI and Smoking', state: 'remaining', art: 10, section: 'Chest' },
      { label: 'Bronchogenic Carcinoma', state: 'remaining', art: 10, section: 'Chest' }
    ]
  },
  {
    code: 'ONC',
    name: 'Oncology',
    totalCount: 14,
    examNote: 'Midterm starts Jul 18, 2026.',
    topics: [
      { label: 'Anemia approach and iron deficiency anemia', state: 'remaining', art: 12 },
      {
        label: 'Anemia of chronic disease and hemoglobinopathies',
        state: 'taken',
        art: 12,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1D3qbb6zibbkzstmNeipmEoNPlnF7BN2q/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1qH7bGw0mqGQzaf8lzszR72PRFUAnNCG6/view?usp=drivesdk'
      },
      {
        label: 'Hemolytic anemia',
        state: 'taken',
        art: 12,
        note: 'Sunday report 21 Jun: taught by Dr. Manal Mahmoud.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1gVZZDhS-d6oiNbk7WDhgG_v1kX_5_2Nm/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1RkBUYZutIOLulGwOrUAny3tAupTZe7Ki/view?usp=drivesdk'
      },
      {
        label: 'Anemia file completion and sideroblastic anemia',
        state: 'taken',
        art: 12,
        lectureUrls: [
          { label: 'Anemia file', url: 'https://drive.google.com/file/d/1zcQyZdfM-y6qqo5AhaeZtORqEkUFIQJJ/view?usp=drivesdk' },
          { label: 'Sideroblastic', url: 'https://docs.google.com/presentation/d/10qAAzE1DcZj3QAjyhf_4kkA8mzf0QH6-/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1UuxB_UA6w7NKqgPerO6yadsKbpdNcNle/view?usp=drivesdk'
      },
      {
        label: 'Bleeding disorders',
        state: 'taken',
        art: 14,
        updatedAt: '2026-06-28',
        updateBatch: 'sunday-report-2026-06-28',
        note: 'Sunday report 28 Jun: Bleeding Disorders, taught by Dr. Manal Mahmoud. Covers hemostasis overview, coagulation cascade, fibrin clot formation, bleeding manifestations, and causes. Stopped at slide number 23.',
        lectureUrls: [
          { label: 'Bleeding disorders file', url: 'https://drive.google.com/file/d/1hPJX5OwPkKD59GqU5BuElPYo9vy8Kc4Y/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1PS3CFen5xTgFj5UhiGmZHFxVr2DNEdSL/view?usp=drivesdk'
      },
      { label: 'Polycythemia vera and essential thrombocytosis', state: 'remaining', art: 12, audioUrl: 'https://drive.google.com/file/d/1IgrJBTBINWlx0k58TiCCxWUt-u_XUJ1G/view?usp=drivesdk' },
      { label: 'WBC Diseases: Neutropenia and Leukocytosis', state: 'remaining', art: 12 },
      { label: 'Malignancy Pathophysiology and Lymphoma', state: 'remaining', art: 12 },
      { label: 'Acute Leukemias: AML and ALL', state: 'remaining', art: 12 },
      { label: 'Chronic Leukemias: CML and CLL', state: 'remaining', art: 12 },
      { label: 'Blood Transfusion', state: 'remaining', art: 12 },
      { label: 'Myeloproliferative Neoplasm', state: 'remaining', art: 12 },
      { label: 'Multiple Myeloma and amyloidosis', state: 'remaining', art: 12 },
      { label: 'Case Scenarios and Problem Solving Revision', state: 'remaining', art: 14 }
    ]
  },
  {
    code: 'NUT',
    name: 'Nutrition',
    totalCount: 9,
    examNote: 'Midterm starts Jul 18, 2026. Exact NUT schedule pending.',
    topics: [
      {
        label: 'Vitamins',
        state: 'taken',
        art: 13,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1rCjJqBqu8wOWIW0SMHoGjvyXSCIniwsR/view?usp=drivesdk' }
        ],
        pdfUrls: [
          { label: 'Compact preview', title: 'Vitamins compact preview', url: '/assets/nut-compact/vitamins-compact.pdf', preview: true, download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/1twQvgbaRxLMP2vBRu4dVV7nU6zmMHUFV/view?usp=drivesdk'
      },
      {
        label: 'Food-borne Diseases',
        state: 'taken',
        art: 13,
        note: 'Covers bacterial, viral foodborne infections, polio virus, and hepatitis A/E viruses.',
        lectureUrls: [
          { label: 'Lecture Part 1', url: 'https://drive.google.com/file/d/1q5b51GzxLYXT-iOOLfA1M1KnigeJTE1b/view?usp=drivesdk' },
          { label: 'Lecture Part 2', url: 'https://drive.google.com/file/d/15d6Q4cfi8jJ9XW2NpuLBk76ctKe8mKSZ/view?usp=drivesdk' }
        ],
        pdfUrls: [
          { label: 'Compact preview', title: 'Food-borne Diseases compact preview', url: '/assets/nut-compact/food-borne-diseases-compact.pdf', preview: true, download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Lr0LftsOc_-uhH2X82uqzJ0eSkUWgSDz/view?usp=drivesdk'
      },
      {
        label: 'Rabies and Tetanus',
        state: 'taken',
        art: 13,
        note: 'Wednesday report 24 Jun: taught by Dr. Enas Abd El-Rahim.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1KB6lV5bwjB2AjkZja2IGy4HGQnYoFi9c/view?usp=drivesdk' }
        ],
        pdfUrls: [
          { label: 'Compact preview', title: 'Rabies and Tetanus compact preview', url: '/assets/nut-compact/rabies-tetanus-compact.pdf', preview: true, download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/1jFCfRCkClJyvgSfNnLIGHNQd0Kg1Le5O/view?usp=drivesdk'
      },
      { label: 'Iodine', state: 'remaining', art: 13 },
      { label: 'Nutrition in elderly', state: 'remaining', art: 13 },
      { label: 'AIDS nutrition', state: 'remaining', art: 13 },
      {
        label: 'Iron deficiency anemia',
        state: 'partial',
        art: 12,
        updatedAt: '2026-07-01',
        updateBatch: 'wednesday-report-2026-07-01',
        note: 'Wednesday report 1 Jul: first half of iron deficiency anemia, taught by Dr. Hanan Samah.',
        lectureUrls: [
          { label: 'Iron deficiency anemia lecture', url: 'https://drive.google.com/file/d/1RcDNwFl91CVAErQ5IyY0cX--mJTGOhZV/view?usp=drivesdk' }
        ],
        pdfUrls: [
          { label: 'Compact preview', title: 'Iron deficiency anemia compact preview', url: '/assets/nut-compact/iron-deficiency-anemia-compact.pdf', preview: true, download: true }
        ]
      },
      {
        label: 'Nutrition in obesity',
        state: 'partial',
        art: 13,
        updatedAt: '2026-07-01',
        updateBatch: 'wednesday-report-2026-07-01',
        note: 'Wednesday report 1 Jul: obesity portion taught by Dr. Hanan Samah; cancer nutrition remains pending.',
        lectureUrls: [
          { label: 'Obesity lecture', url: 'https://drive.google.com/file/d/1_LAXxkYF-i3nnTrSIOCUv0q6qAAPGlKl/view?usp=drivesdk' }
        ],
        pdfUrls: [
          { label: 'Compact preview', title: 'Nutrition in obesity compact preview', url: '/assets/nut-compact/obesity-compact.pdf', preview: true, download: true }
        ]
      },
      { label: 'TB and influenza nutrition', state: 'remaining', art: 13 }
    ]
  },
  {
    code: 'LAB',
    name: 'Lab Medicine',
    totalCount: 7,
    examNote: 'Midterm starts Jul 18, 2026. Exact LAB schedule pending.',
    topics: [
      {
        label: 'Liver Function Test',
        state: 'taken',
        art: 5,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/154Sxxn2R_Y-6l2i3pvhFtWP_Roi_GR0Q/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/122BV8-mfoCWNXt979EaO2ZkMGbGuHpm5/view?usp=drivesdk'
      },
      {
        label: 'Cardiac Biomarkers',
        state: 'taken',
        art: 14,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1RkmsX-_jlL3klayg5fvPwk6gk-LYPYHA/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/168l5PhCSMGsl3GWyVeFpDiw8WEWaJlmC/view?usp=drivesdk'
      },
      {
        label: 'Clinical Immunology',
        state: 'taken',
        art: 14,
        updatedAt: '2026-07-01',
        updateBatch: 'wednesday-report-2026-07-01',
        note: 'Wednesday report 1 Jul: completion of Clinical Immunology, taught by Dr. Mohamed Mostafa.'
      },
      { label: 'Clinical Pathology Research Assignment', state: 'remaining', art: 14 },
      {
        label: 'Diabetes mellitus & disorders of plasma lipids and lipoproteins',
        state: 'taken',
        art: 14,
        note: 'Wednesday report: combined LAB topic.',
        lectureUrls: [
          { label: 'DM lecture', url: 'https://drive.google.com/file/d/1wu3gyA28ynSIPuHvqMAvqCmCPIp5zIzp/view?usp=drivesdk' },
          { label: 'Lipid lecture', url: 'https://drive.google.com/file/d/15At9wbM85dRi_4Cbx9AZ76vRuHTiAL_L/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/12gVSpb0WPGpSicqCYBXZBxipQttFp7Q1/view?usp=drivesdk'
      },
      { label: 'WBCs and leukemia', state: 'remaining', art: 12 },
      { label: 'Microbiology', state: 'remaining', art: 14 }
    ]
  },
  {
    code: 'ANAE',
    name: 'Anesthesia',
    totalCount: 7,
    examNote: 'Midterm starts Jul 18, 2026. Exact ANAE schedule pending.',
    topics: [
      {
        label: 'Preoperative Patient Management',
        state: 'taken',
        art: 15,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1V5Shpas5pvITeqRW3U6hQs1iN6qZGJcv/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1sFabKs8xoweV_eSqkB_D7YVXufv28rLt/view?usp=drivesdk'
      },
      {
        label: 'Monitoring and Fluid Therapy',
        state: 'taken',
        art: 15,
        note: 'Tuesday report: continuation of monitoring and fluid therapy.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1ICi7ExmMJ3zhXnp-dfh0rlHo0cEYub0E/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1o1biv_U_2DBaIVnJPvbN5UXlmPfSkGlq/view?usp=drivesdk'
      },
      {
        label: 'General anaesthesia',
        state: 'taken',
        art: 15,
        updatedAt: '2026-06-30',
        updateBatch: 'tuesday-report-2026-06-30',
        note: 'Tuesday report 30 Jun: General Anesthesia completed, taught by Dr. Alaa Neyazy. Continued from muscle relaxants through maintenance, reversal, emergence, and postoperative care.'
      },
      { label: 'CPR', state: 'remaining', art: 15 },
      { label: 'Oxygen therapy', state: 'remaining', art: 15 },
      { label: 'Nutrition in ICU', state: 'remaining', art: 13 },
      { label: 'ICU admission and discharge criteria', state: 'remaining', art: 15 }
    ]
  }
]

const subjects401 = subjects
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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mobileQuery = window.matchMedia('(max-width: 860px)')
const quizRobotCompactQuery = window.matchMedia('(max-width: 640px)')
const QUIZ_STICKY_OFFSET = 68
const QUIZ_STORAGE_PREFIX = 'quizState'
const LEGACY_QUIZ_STORAGE_PREFIX = 'mcq-progress-'
const TOPIC_COMPLETION_STORAGE_PREFIX = 'topicCompletion'
const LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX = 'med401-topic-progress-v1::'
const TOPIC_UPDATE_STORAGE_KEY_PREFIX = 'tracker-seen-topic-updates-v1'
let TOPIC_UPDATE_STORAGE_KEY = `${TOPIC_UPDATE_STORAGE_KEY_PREFIX}::401`
const UNIVERSITY_WEEK_START_DAY = 0 // Sunday
const NEWS_SEEN_STORAGE_KEY_PREFIX = 'newsSeen'
let NEWS_SEEN_STORAGE_KEY = `${NEWS_SEEN_STORAGE_KEY_PREFIX}::401`
const NEWS_EXPIRY_HOURS = 6
const DRIVE_ICON_URL = '/assets/icons/drive-icon.png'
const PLAY_ICON_URL = '/assets/icons/play-button-v1.png'
const mcqQuizzes = window.mcqQuizzes || {}
const mcqQuizzesBySection = {
  '401': mcqQuizzes,
  '402': window.mcqQuizzes402 || {}
}
const dynamicQuizConfigs = new Map()
const quizState = {
  topicLabel: null,
  sourceId: 'current',
  sourceLabel: 'Current MCQs',
  parentSourceId: null,
  groupId: null,
  groupLabel: '',
  partIndex: null,
  partCount: null,
  mode: 'standard',
  index: 0,
  answers: {},
  missingQuestionIds: [],
  masteredQuestionIds: [],
  timeLimitMinutes: null,
  timerEndsAt: null,
  timerStartedAt: null,
  timerElapsedMs: 0
}
let quizTimerInterval = null
let quizRobotMoodTimeout = null
const studentProgressState = {
  user: null,
  ready: false,
  loading: false,
  topicRows: new Map(),
  quizRows: new Map(),
  lastError: ''
}
const trackerAdminState = {
  profile: null,
  enabled: false,
  saving: false,
  dirtyCollections: new Set(),
  draggingKey: ''
}
const expandedTopicBreakdowns = new Set()

const coveredStates = new Set(['taken', 'partial'])
const stateLabels = {
  taken: 'Taken in university',
  partial: 'Partially taken',
  announced: 'Announced only',
  remaining: 'Remaining'
}

function replayTrackerMotion(container, selector) {
  if (prefersReducedMotion || !container) return
  const items = [...container.querySelectorAll(selector)]
  items.forEach((item) => {
    item.classList.remove('motion-replay')
    void item.offsetWidth
    item.classList.add('motion-replay')
  })
}

const subjectExamNotes = {
  'SUR-1': 'Midterm: Wed Jul 22, 2026, 2:30-3:30.',
  'MED-1': 'Midterm: Wed Jul 29, 2026, 2:30-3:30.',
  'MED-2': 'Midterm: Sat Jul 25, 2026, 2:30-3:30.'
}

const midtermExamSchedule = [
  {
    code: 'SUR 401-1',
    subjectCode: 'SUR-1',
    subjectName: 'Surgery 1',
    date: '2026-07-22',
    dayLabel: 'Wed',
    time: '2:30-3:30',
    quizTopicKey: 'SUR 401-1 MCQs',
    quizActionLabel: 'MCQs'
  },
  {
    code: 'MED 401-2',
    subjectCode: 'MED-2',
    subjectName: 'Internal Medicine 2',
    date: '2026-07-25',
    dayLabel: 'Sat',
    time: '2:30-3:30'
  },
  {
    code: 'MED 401-1',
    subjectCode: 'MED-1',
    subjectName: 'Internal Medicine 1',
    date: '2026-07-29',
    dayLabel: 'Wed',
    time: '2:30-3:30'
  }
]

const courseSchedule = [
  { type: 'lecture', day: 0, dayLabel: 'Sunday', start: '09:00', end: '11:00', title: 'MED 401-1', room: 'SS 116B', icon: 'stethoscope' },
  { type: 'lecture', day: 0, dayLabel: 'Sunday', start: '11:00', end: '11:55', title: 'ONC 401', room: 'SS 116B', icon: 'microscope' },
  { type: 'lecture', day: 0, dayLabel: 'Sunday', start: '12:00', end: '13:00', title: 'SUR 401-2', room: 'SS 116B', icon: 'scalpel' },
  { type: 'lecture', day: 0, dayLabel: 'Sunday', start: '13:00', end: '14:30', title: 'MED 401-2', room: 'SS 116B', icon: 'case' },
  { type: 'lecture', day: 0, dayLabel: 'Sunday', start: '14:30', end: '16:00', title: 'SUR 401-1', room: 'SS 116B', icon: 'clinical' },
  { type: 'lecture', day: 2, dayLabel: 'Tuesday', start: '12:00', end: '13:00', title: 'SUR 401-1', room: 'SS 116B', icon: 'scalpel' },
  { type: 'lecture', day: 2, dayLabel: 'Tuesday', start: '13:00', end: '14:30', title: 'MED 401-2', room: 'SS 116B', icon: 'case' },
  { type: 'lecture', day: 2, dayLabel: 'Tuesday', start: '14:30', end: '16:00', title: 'ANAE 401', room: 'SS 116B', icon: 'syringe' },
  { type: 'lecture', day: 3, dayLabel: 'Wednesday', start: '12:00', end: '13:00', title: 'NUT 401', room: 'SS 116B', icon: 'nutrition' },
  { type: 'lecture', day: 3, dayLabel: 'Wednesday', start: '13:00', end: '14:30', title: 'LAB 401', room: 'SS 116B', icon: 'lab' },
  { type: 'round', day: 2, dayLabel: 'Tuesday', start: '09:00', end: '10:30', title: 'MED 401-2 (A)', room: 'HR1' },
  { type: 'round', day: 2, dayLabel: 'Tuesday', start: '10:30', end: '12:00', title: 'SUR 401 (A)', room: 'HR1' },
  { type: 'round', day: 2, dayLabel: 'Tuesday', start: '09:00', end: '10:30', title: 'SUR 401 (B)', room: 'HR5' },
  { type: 'round', day: 2, dayLabel: 'Tuesday', start: '10:30', end: '12:00', title: 'MED 401-2 (B)', room: 'HR5' },
  { type: 'round', day: 3, dayLabel: 'Wednesday', start: '09:00', end: '10:30', title: 'MED 401-1 (A)', room: 'HR1' },
  { type: 'round', day: 3, dayLabel: 'Wednesday', start: '10:30', end: '12:00', title: 'MED 401-1 (B)', room: 'HR1' }
]

const midtermExamSchedule402 = [
  { code: 'SUR 402-1', subjectCode: 'SUR402-1', subjectName: 'Surgery 402-1', date: '2026-07-22', dayLabel: 'Wed', time: '11:30-12:30' },
  { code: 'MED 402-1', subjectCode: 'MED402-1', subjectName: 'Medicine 402-1', date: '2026-07-25', dayLabel: 'Sat', time: '11:30-12:30' },
  { code: 'MED 402-2', subjectCode: 'MED402-2', subjectName: 'Medicine 402-2', date: '2026-07-29', dayLabel: 'Wed', time: '11:30-12:30' },
  { code: 'GYN 402', subjectCode: 'GYNA402', subjectName: 'Gynecology & Obstetrics 402', date: '2026-08-01', dayLabel: 'Sat', time: '11:30-12:30' }
]

const academicSections = {
  '401': {
    id: '401',
    title: '401',
    newsTitle: 'MED 401 news',
    trackerSearchPlaceholder: 'Search 401 topics or subjects...',
    subjects: subjects401,
    midtermExamSchedule,
    courseSchedule
  },
  '402': {
    id: '402',
    title: '402',
    newsTitle: 'MED 402 news',
    trackerSearchPlaceholder: 'Search 402 topics or subjects...',
    subjects: subjects402,
    midtermExamSchedule: midtermExamSchedule402,
    courseSchedule: []
  }
}

const scheduleDayOrder = [
  { day: 0, label: 'Sunday' },
  { day: 2, label: 'Tuesday' },
  { day: 3, label: 'Wednesday' }
]

const subjectList = document.getElementById('subject-list')
const selectedCode = document.getElementById('selected-code')
const selectedName = document.getElementById('selected-name')
const selectedCount = document.getElementById('selected-count')
const selectedPercent = document.getElementById('selected-percent')
const progressFill = document.getElementById('progress-fill')
const topicList = document.getElementById('topic-list')
const subjectDetail = document.querySelector('.subject-detail')
const subjectTrackTabs = document.getElementById('subject-track-tabs')
const trackerSearch = document.getElementById('tracker-search')
const trackerStatusFilter = document.getElementById('tracker-status-filter')
const trackerScopeFilter = document.getElementById('tracker-scope-filter')
const semesterFill = document.getElementById('semester-fill')
const todayMarker = document.getElementById('today-marker')
const midtermMarker = document.getElementById('midterm-marker')
const finalsMarker = document.getElementById('finals-marker')
const semesterDateScale = document.getElementById('semester-date-scale')
const nextCheckpoint = document.getElementById('next-checkpoint')
const next401Exam = document.getElementById('next-401-exam')
const next401Countdown = document.getElementById('next-401-countdown')
const examScheduleCards = document.getElementById('exam-schedule-cards')
const newsNavLinks = document.querySelectorAll('a[href="#news"], a[href="/#news"]')
const bookingForm = document.getElementById('booking-form')
const bookingName = document.getElementById('booking-name')
const bookingService = document.getElementById('booking-service')
const bookingTime = document.getElementById('booking-time')
const deadlineProgressItems = document.querySelectorAll('[data-assignment-progress], [data-deadline-progress]')
const historyForm = document.getElementById('history-form')
const historyProgressCount = document.getElementById('history-progress-count')
const historyProgressFill = document.getElementById('history-progress-fill')
const historySummaryText = document.getElementById('history-summary-text')
const copyHistorySummary = document.getElementById('copy-history-summary')
const smokingDetails = document.getElementById('smoking-details')
const substanceDetails = document.getElementById('substance-details')
const substanceOtherField = document.getElementById('substance-other-field')
const newsFeed = document.getElementById('news-feed')
const newsCourseFilter = document.getElementById('news-course-filter')
const newsDateFilter = document.getElementById('news-date-filter')
const newsAdminToolbar = document.getElementById('news-admin-toolbar')
const newsAdminStatus = document.getElementById('news-admin-status')
const newsAdminModal = document.getElementById('news-admin-modal')
const newsAdminForm = document.getElementById('news-admin-form')
const newsAdminModalTitle = document.getElementById('news-admin-modal-title')
const newsAdminFormStatus = document.getElementById('news-admin-form-status')
const scheduleTodayTitle = document.getElementById('schedule-today-title')
const scheduleTodaySummary = document.getElementById('schedule-today-summary')
const scheduleNextCard = document.getElementById('schedule-next-card')
const scheduleTodayList = document.getElementById('schedule-today-list')
const scheduleCalendarGrid = document.getElementById('schedule-calendar-grid')
const scheduleList = document.getElementById('schedule-list')
const trackerTitle = document.getElementById('tracker-title')
const newsTitle = document.getElementById('news-title')
const classRepsGrid = document.querySelector('.class-reps__grid')
const scheduleTitle = document.getElementById('schedule-title')
const studentSync = document.getElementById('student-sync')
const studentSyncButton = document.getElementById('student-sync-button')
const studentSyncMenu = document.getElementById('student-sync-menu')
const studentSyncLabel = document.getElementById('student-sync-label')
const studentSyncAvatar = document.getElementById('student-sync-avatar')
const studentSyncInitials = document.getElementById('student-sync-initials')
const studentSyncStatus = document.getElementById('student-sync-status')
const studentSyncEmail = document.getElementById('student-sync-email')
const trackerAdminToolbar = document.getElementById('tracker-admin-toolbar')
const trackerAdminEmail = document.getElementById('tracker-admin-email')
const trackerAdminSubject = document.getElementById('tracker-admin-subject')
const trackerAdminSaveOrder = document.getElementById('tracker-admin-save-order')
const trackerAdminSignOut = document.getElementById('tracker-admin-sign-out')
const adminLoginModal = document.getElementById('admin-login-modal')
const adminLoginForm = document.getElementById('tracker-admin-login-form')
const adminLoginEmail = document.getElementById('tracker-admin-email-input')
const adminLoginPassword = document.getElementById('tracker-admin-password-input')
const adminLoginStatus = document.getElementById('tracker-admin-login-status')
const trackerAdminEditPanel = document.getElementById('tracker-admin-edit-panel')

const initialParams = new URLSearchParams(window.location.search)
subjects = subjects.map((subject) => ({
  ...subject,
  clinicalTopics: Array.isArray(subject.clinicalTopics) ? subject.clinicalTopics : []
}))
subjects401.forEach((subject) => {
  subject.clinicalTopics = Array.isArray(subject.clinicalTopics) ? subject.clinicalTopics : []
})
subjects402.forEach((subject) => {
  subject.clinicalTopics = Array.isArray(subject.clinicalTopics) ? subject.clinicalTopics : []
})
let activeAcademicSection = '401'
let activeSiteMode = 'selector'
let activeAcademicSectionData = academicSections[activeAcademicSection]
const newsCardsState = {
  rowsBySection: new Map(),
  remoteSections: new Set(),
  loadingSections: new Set()
}
subjects = activeAcademicSectionData.subjects
const initialSubject = subjects.find((subject) => subject.code === initialParams.get('subject'))
let activeSubjectCode = initialParams.get('tracker') === '1' && initialSubject ? initialSubject.code : null
let expandedSubjectCode = mobileQuery.matches && activeSubjectCode ? activeSubjectCode : null
let activeSubjectTrack = 'theoretical'

function getAcademicSection(sectionId = activeAcademicSection) {
  return academicSections[sectionId] || academicSections['401']
}

function isValidRemoteTopicState(state) {
  return ['taken', 'partial', 'announced', 'remaining'].includes(state)
}

function makeRemoteTrackerTopic(row) {
  const topic = {
    label: row.topic_label,
    state: isValidRemoteTopicState(row.state) ? row.state : 'remaining',
    stopNote: row.stop_note || '',
    midtermScope: Boolean(row.midterm_scope),
    midtermScopeNote: row.midterm_scope_note || '',
    displayOrder: row.display_order !== null && row.display_order !== undefined && Number.isFinite(Number(row.display_order))
      ? Number(row.display_order)
      : null,
    updateBatch: row.updated_at ? 'remote-admin' : undefined,
    updatedAt: row.updated_at ? row.updated_at.slice(0, 10) : undefined,
    createdAt: row.created_at || undefined
  }

  if (row.drive_url) {
    topic.lectureUrls = [{
      label: 'Drive',
      url: row.drive_url,
      type: 'lecture'
    }]
    topic.driveUrl = row.drive_url
  }

    if (row.audio_url) topic.audioUrl = row.audio_url

  return topic
}

function applyTrackerTopicRows(rows) {
  if (!Array.isArray(rows) || !rows.length) return false

  let changed = false

  rows.forEach((row) => {
    const section = getAcademicSection(row.section)
    const subject = section.subjects.find((item) => item.code === row.subject_code)
    if (!subject) return

    const collection = row.track === 'clinical' ? subject.clinicalTopics : subject.topics
    if (!collection) return

    const consolidatedTopic = collection.find((item) => item.progressAliases?.includes(row.topic_label))
    if (consolidatedTopic) return

    const existingTopic = collection.find((item) => item.label === row.topic_label)
    if (!existingTopic) {
      collection.push({ ...makeRemoteTrackerTopic(row), isNewRemote: true })
      changed = true
      return
    }

    if (isValidRemoteTopicState(row.state) && existingTopic.state !== row.state) {
      existingTopic.state = row.state
      changed = true
    }

    const nextStopNote = row.stop_note || ''
    if ((existingTopic.stopNote || '') !== nextStopNote) {
      existingTopic.stopNote = nextStopNote
      changed = true
    }

    if (Object.prototype.hasOwnProperty.call(row, 'drive_url')) {
      const nextDriveUrl = row.drive_url || ''
      if ((existingTopic.driveUrl || '') !== nextDriveUrl) {
        existingTopic.driveUrl = nextDriveUrl
        existingTopic.lectureUrls = nextDriveUrl ? [{ label: 'Drive', url: nextDriveUrl, type: 'lecture' }] : []
        changed = true
      }
    }

    if (Object.prototype.hasOwnProperty.call(row, 'audio_url')) {
      const nextAudioUrl = row.audio_url || ''
      if ((existingTopic.audioUrl || '') !== nextAudioUrl) {
        existingTopic.audioUrl = nextAudioUrl
        changed = true
      }
    }

    if (Object.prototype.hasOwnProperty.call(row, 'midterm_scope')) {
      const nextMidtermScope = Boolean(row.midterm_scope)
      if (Boolean(existingTopic.midtermScope) !== nextMidtermScope) {
        existingTopic.midtermScope = nextMidtermScope
        changed = true
      }
    }

    if (Object.prototype.hasOwnProperty.call(row, 'midterm_scope_note')) {
      const nextMidtermScopeNote = row.midterm_scope_note || ''
      if ((existingTopic.midtermScopeNote || '') !== nextMidtermScopeNote) {
        existingTopic.midtermScopeNote = nextMidtermScopeNote
        changed = true
      }
    }

    if (row.display_order !== null && row.display_order !== undefined) {
      const nextDisplayOrder = Number(row.display_order)
      if (Number.isFinite(nextDisplayOrder) && existingTopic.displayOrder !== nextDisplayOrder) {
        existingTopic.displayOrder = nextDisplayOrder
        changed = true
      }
    }

    if (row.updated_at) {
      existingTopic.updatedAt = row.updated_at.slice(0, 10)
      existingTopic.updateBatch = 'remote-admin'
    }
    existingTopic.createdAt = row.created_at || undefined
  })

  Object.values(academicSections).forEach(section => {
    section.subjects.forEach(subject => {
      ;[subject.topics, subject.clinicalTopics].forEach(collection => {
        if (!Array.isArray(collection)) return
        const originalPositions = new Map(collection.map((topic, index) => [topic, index]))
        collection.sort((a, b) => {
          const aOrder = Number.isFinite(a.displayOrder) ? a.displayOrder : Number.MAX_SAFE_INTEGER
          const bOrder = Number.isFinite(b.displayOrder) ? b.displayOrder : Number.MAX_SAFE_INTEGER
          return aOrder - bOrder || originalPositions.get(a) - originalPositions.get(b)
        })
      })
    })
  })

  return changed
}

function refreshTrackerAfterRemoteUpdate() {
  updateMiniDashboard()
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
}

let remoteTrackerRefreshPromise = null

function refreshRemoteTrackerData() {
  if (!isSupabaseConfigured()) return Promise.resolve()
  if (remoteTrackerRefreshPromise) return remoteTrackerRefreshPromise

  remoteTrackerRefreshPromise = fetchTrackerTopicRows()
    .then((rows) => {
      if (applyTrackerTopicRows(rows)) refreshTrackerAfterRemoteUpdate()
    })
    .catch((error) => {
      console.warn('Remote tracker data unavailable; using local fallback.', error)
    })
    .finally(() => {
      remoteTrackerRefreshPromise = null
    })

  return remoteTrackerRefreshPromise
}

function isTrackerAdmin() {
  return Boolean(trackerAdminState.profile && trackerAdminState.enabled)
}

function hasTrackerAdminAccess() {
  return Boolean(trackerAdminState.profile)
}

function getAdminCollectionKey(subjectCode = activeSubjectCode, track = activeSubjectTrack) {
  return `${activeAcademicSection}::${subjectCode || ''}::${track}`
}

function getAdminTopicKey(subject, topic, track = activeSubjectTrack) {
  return `${activeAcademicSection}::${subject.code}::${track}::${topic.label}`
}

function getAdminTopicContext(subjectCode, track, topicLabel) {
  const subject = subjects.find(item => item.code === subjectCode)
  const collection = track === 'clinical' ? getClinicalTopics(subject || {}) : subject?.topics
  const topic = collection?.find(item => item.label === topicLabel)
  return subject && topic ? { subject, topic, collection, track } : null
}

function makeAdminTopicPayload(subject, topic, track = activeSubjectTrack, overrides = {}) {
  return {
    section: activeAcademicSection,
    subject_code: subject.code,
    subject_name: subject.name,
    track,
    topic_label: topic.label,
    state: topic.state || 'remaining',
    stop_note: topic.stopNote || null,
    drive_url: topic.driveUrl || topic.lectureUrls?.[0]?.url || null,
    audio_url: topic.audioUrl || null,
    display_order: Number.isFinite(topic.displayOrder) ? topic.displayOrder : null,
    midterm_scope: Boolean(topic.midtermScope),
    midterm_scope_note: topic.midtermScopeNote || null,
    ...overrides
  }
}

function setAdminLoginStatus(message, tone = 'neutral') {
  if (!adminLoginStatus) return
  adminLoginStatus.textContent = message
  adminLoginStatus.dataset.tone = tone
}

function openAdminLogin() {
  setStudentSyncMenu(false)
  if (hasTrackerAdminAccess()) {
    trackerAdminState.enabled = !trackerAdminState.enabled
    closeAdminEditor()
    renderTrackerAdminUi()
    renderSubjects()
    if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
    if (newsCardsState.remoteSections.has(activeAcademicSection)) {
      replaceNewsFeedWithRemoteRows()
      renderNewsFilters()
    }

    showGlobalToast(trackerAdminState.enabled ? 'Admin mode on.' : 'Student view on.')
    return
  }
  adminLoginModal.hidden = false
  document.body.classList.add('admin-modal-open')
  setAdminLoginStatus('')
  requestAnimationFrame(() => adminLoginEmail?.focus())
}

function closeAdminLogin() {
  if (!adminLoginModal) return
  adminLoginModal.hidden = true
  document.body.classList.remove('admin-modal-open')
  if (adminLoginPassword) adminLoginPassword.value = ''
}

function closeAdminEditor() {
  if (!trackerAdminEditPanel) return
  trackerAdminEditPanel.classList.remove('is-open')
  window.setTimeout(() => {
    trackerAdminEditPanel.hidden = true
    trackerAdminEditPanel.innerHTML = ''
  }, 260)
}

function renderTrackerAdminUi() {
  const enabled = isTrackerAdmin()
  const adminSwitch = document.querySelector('[data-admin-login-open]')
  document.body.classList.toggle('tracker-admin-mode', enabled)
  adminSwitch?.classList.toggle('is-active', enabled)
  if (adminSwitch) {
    adminSwitch.setAttribute('aria-label', enabled ? 'Switch to student view' : 'Switch to admin mode')
    const label = adminSwitch.querySelector('span')
    if (label) label.textContent = enabled ? 'Student' : 'Admin'
  }
  if (trackerAdminToolbar) trackerAdminToolbar.hidden = !enabled
  if (trackerAdminEmail) trackerAdminEmail.textContent = enabled ? studentProgressState.user?.email || '' : ''
  if (trackerAdminSubject) {
    trackerAdminSubject.textContent = activeSubjectCode
      ? `${activeSubjectCode} · ${activeSubjectTrack === 'clinical' ? 'Clinical' : 'Theoretical'}`
      : 'Choose a subject'
  }
  const dirty = trackerAdminState.dirtyCollections.has(getAdminCollectionKey())
  if (trackerAdminSaveOrder) {
    trackerAdminSaveOrder.disabled = !enabled || !dirty || trackerAdminState.saving
    trackerAdminSaveOrder.textContent = trackerAdminState.saving && dirty ? 'Saving...' : 'Save arrangement'
  }
  renderNewsAdminToolbar()
}

async function refreshTrackerAdminProfile(user) {
  if (!user) {
    trackerAdminState.profile = null
    trackerAdminState.enabled = false
    trackerAdminState.dirtyCollections.clear()
    closeAdminEditor()
    renderTrackerAdminUi()
    return
  }
  try {
    trackerAdminState.profile = await fetchAdminProfile()
    if (!trackerAdminState.profile) trackerAdminState.enabled = false
  } catch (error) {
    trackerAdminState.profile = null
    console.warn('Admin profile check failed.', error)
  }
  renderTrackerAdminUi()
  if (newsCardsState.remoteSections.has(activeAcademicSection)) {
    replaceNewsFeedWithRemoteRows()
    renderNewsFilters()
  } else {
    await refreshRemoteNewsCards(activeAcademicSection)
  }
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
}

function openAdminTopicEditor(subjectCode, track, topicLabel) {
  if (!isTrackerAdmin() || !trackerAdminEditPanel) return
  const context = getAdminTopicContext(subjectCode, track, topicLabel)
  if (!context) return
  const { subject, topic } = context
  const states = ['remaining', 'announced', 'partial', 'taken']
  trackerAdminEditPanel.innerHTML = `
    <div class="admin-edit-panel__inner">
      <div class="admin-edit-panel__header">
        <div class="admin-edit-panel__title-row">
          <span class="admin-edit-panel__subject">${escapeHtml(subject.code)} / ${escapeHtml(track)}</span>
          <button class="admin-edit-close" type="button" data-admin-editor-close aria-label="Close">×</button>
        </div>
        <h2 class="admin-edit-panel__title">${escapeHtml(topic.label)}</h2>
        <p class="admin-edit-panel__subject-name">${escapeHtml(subject.name)}</p>
      </div>
      <form class="admin-edit-form" data-tracker-admin-edit-form data-subject-code="${escapeHtml(subject.code)}" data-track="${escapeHtml(track)}" data-topic-label="${escapeHtml(topic.label)}">
        <div class="admin-edit-states">
          ${states.map(state => `
            <label class="admin-state-option admin-state-option--${state}${topic.state === state ? ' is-selected' : ''}">
              <input type="radio" name="admin-state" value="${state}" ${topic.state === state ? 'checked' : ''}>
              <span>${state[0].toUpperCase() + state.slice(1)}</span>
            </label>
          `).join('')}
        </div>
        <label class="admin-edit-label">Where did we stop / notes
          <textarea class="admin-edit-textarea" name="stop_note" rows="4" placeholder="Optional note">${escapeHtml(topic.stopNote || '')}</textarea>
        </label>
        <label class="admin-edit-label">
          <span><input type="checkbox" name="midterm_scope" ${topic.midtermScope ? 'checked' : ''}> Included in midterm scope</span>
          <textarea class="admin-edit-textarea" name="midterm_scope_note" rows="3" placeholder="Optional midterm scope note">${escapeHtml(topic.midtermScopeNote || '')}</textarea>
        </label>
        <div class="admin-edit-grid">
          <label class="admin-edit-label">Google Drive Link
            <input class="admin-edit-input" type="url" name="drive_url" value="${escapeHtml(topic.driveUrl || topic.lectureUrls?.[0]?.url || '')}" placeholder="https://drive.google.com/...">
          </label>
          <label class="admin-edit-label">Lecture Record Link
            <input class="admin-edit-input" type="url" name="audio_url" value="${escapeHtml(topic.audioUrl || '')}" placeholder="https://drive.google.com/...">
          </label>
        </div>
        <button class="admin-save-btn" type="submit">Save topic</button>
      </form>
    </div>`
  trackerAdminEditPanel.hidden = false
  requestAnimationFrame(() => trackerAdminEditPanel.classList.add('is-open'))
}

async function saveAdminTopicForm(form) {
  const context = getAdminTopicContext(form.dataset.subjectCode, form.dataset.track, form.dataset.topicLabel)
  if (!context || trackerAdminState.saving) return
  const { subject, topic, track } = context
  const submit = form.querySelector('[type="submit"]')
  const nextState = form.querySelector('input[name="admin-state"]:checked')?.value || topic.state || 'remaining'
  const stopNote = form.querySelector('[name="stop_note"]').value.trim()
  const driveUrl = form.querySelector('[name="drive_url"]').value.trim()
  const audioUrl = form.querySelector('[name="audio_url"]').value.trim()
  const midtermScope = form.querySelector('[name="midterm_scope"]').checked
  const midtermScopeNote = form.querySelector('[name="midterm_scope_note"]').value.trim()
  trackerAdminState.saving = true
  if (submit) { submit.disabled = true; submit.textContent = 'Saving...' }
  try {
    const rows = await upsertTrackerTopics([makeAdminTopicPayload(subject, topic, track, {
      state: nextState,
      stop_note: stopNote || null,
      drive_url: driveUrl || null,
      audio_url: audioUrl || null,
      midterm_scope: midtermScope,
      midterm_scope_note: midtermScopeNote || null
    })])
    applyTrackerTopicRows(rows)
    closeAdminEditor()
    refreshTrackerAfterRemoteUpdate()
  } catch (error) {
    if (submit) { submit.disabled = false; submit.textContent = 'Save topic' }
    window.alert(`Topic was not saved: ${error.message}`)
  } finally {
    trackerAdminState.saving = false
    renderTrackerAdminUi()
  }
}

function moveAdminTopic(subjectCode, track, topicLabel, direction) {
  const context = getAdminTopicContext(subjectCode, track, topicLabel)
  if (!context) return
  const { collection } = context
  const index = collection.findIndex(item => item.label === topicLabel)
  const nextIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || nextIndex < 0 || nextIndex >= collection.length) return
  ;[collection[index], collection[nextIndex]] = [collection[nextIndex], collection[index]]
  collection.forEach((topic, topicIndex) => { topic.displayOrder = (topicIndex + 1) * 10 })
  trackerAdminState.dirtyCollections.add(getAdminCollectionKey(subjectCode, track))
  renderSubjects()
  setActiveSubject(subjectCode, 'open')
  renderTrackerAdminUi()
}

async function saveAdminArrangement() {
  if (!isTrackerAdmin() || trackerAdminState.saving || !activeSubjectCode) return
  const subject = subjects.find(item => item.code === activeSubjectCode)
  const collection = activeSubjectTrack === 'clinical' ? getClinicalTopics(subject) : subject?.topics
  if (!subject || !collection) return
  trackerAdminState.saving = true
  renderTrackerAdminUi()
  try {
    const payload = collection.map((topic, index) => makeAdminTopicPayload(subject, topic, activeSubjectTrack, { display_order: (index + 1) * 10 }))
    const rows = await upsertTrackerTopics(payload)
    applyTrackerTopicRows(rows)
    trackerAdminState.dirtyCollections.delete(getAdminCollectionKey())
    refreshTrackerAfterRemoteUpdate()
  } catch (error) {
    window.alert(`Arrangement was not saved: ${error.message}`)
  } finally {
    trackerAdminState.saving = false
    renderTrackerAdminUi()
  }
}

function getStudentDisplayName() {
  const metadata = studentProgressState.user?.user_metadata || {}
  return metadata.full_name || metadata.name || studentProgressState.user?.email || 'Student'
}

function getLocalTopicCompletionState(subjectCode, topicLabel, section = activeAcademicSection) {
  const emptyState = { studied: false, mcqs: false }
  const currentSection = activeAcademicSection
  const storageKey = `${TOPIC_COMPLETION_STORAGE_PREFIX}::${section}::${encodeURIComponent(subjectCode)}::${encodeURIComponent(topicLabel)}`

  try {
    const savedRaw = localStorage.getItem(storageKey)
      || (section === '401' ? localStorage.getItem(getLegacyTopicCompletionKey(subjectCode, topicLabel)) : null)
    const savedState = JSON.parse(savedRaw || '{}')
    return {
      ...emptyState,
      studied: !!savedState.studied,
      mcqs: !!savedState.mcqs
    }
  } catch {
    if (section === currentSection) localStorage.removeItem(getTopicCompletionKey(subjectCode, topicLabel))
    return emptyState
  }
}

function getLocalQuizState(topicLabel, sourceId = 'current', section = activeAcademicSection) {
  const storageKey = `${QUIZ_STORAGE_PREFIX}::${section}::${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`

  try {
    const savedRaw = localStorage.getItem(storageKey)
      || (section === '401' ? localStorage.getItem(getLegacyQuizStorageKey(topicLabel, sourceId)) : null)
    return JSON.parse(savedRaw || 'null')
  } catch {
    if (section === activeAcademicSection) localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
    return null
  }
}

function getQuizProgressStatsFromPayload(payload) {
  const answers = payload?.answers || {}
  const totalQuestions = payload?.totalQuestions || payload?.order?.length || 0
  const answeredCount = Object.keys(answers).length
  const wrongQuestionIds = Array.isArray(payload?.wrongQuestionIds) ? payload.wrongQuestionIds : []

  return {
    totalQuestions,
    answeredCount,
    score: Number.isFinite(payload?.score) ? payload.score : null,
    wrongQuestionIds
  }
}

function renderStudentSyncUi() {
  if (!studentSync) return

  const signedIn = !!studentProgressState.user
  studentSync.classList.toggle('is-signed-in', signedIn)
  studentSync.classList.toggle('is-loading', studentProgressState.loading)
  studentSyncButton?.classList.toggle('is-login', !signedIn)

  if (studentSyncLabel) {
    studentSyncLabel.textContent = signedIn ? '' : 'Login'
    if (signedIn) studentSyncLabel.setAttribute('hidden', '')
    else studentSyncLabel.removeAttribute('hidden')
  }

  if (studentSyncAvatar) {
    const avatarUrl = signedIn ? getSafeExternalUrl(studentProgressState.user?.user_metadata?.avatar_url || studentProgressState.user?.user_metadata?.picture || '') : ''
    studentSyncAvatar.src = avatarUrl
    studentSyncAvatar.hidden = !avatarUrl
    studentSyncAvatar.alt = avatarUrl ? `${getStudentDisplayName()} profile` : ''
    studentSyncButton?.setAttribute('aria-label', signedIn ? `Open ${getStudentDisplayName()} profile menu` : 'Login')
    if (studentSyncInitials) {
      studentSyncInitials.textContent = signedIn && !avatarUrl
        ? getStudentDisplayName().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
        : ''
      studentSyncInitials.hidden = !signedIn || !!avatarUrl
    }
  }

  if (studentSyncEmail) {
    studentSyncEmail.textContent = signedIn ? getStudentDisplayName() : 'Google sync is off'
  }

  const anonBtn = document.getElementById('leaderboard-anon-toggle')
  if (anonBtn) {
    anonBtn.style.display = signedIn ? '' : 'none'
  }
  if (signedIn) {
    renderAnonToggleUi()
  }

  if (studentSyncStatus) {
    if (!isSupabaseConfigured()) {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Sync unavailable.'
    } else if (studentProgressState.loading) {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Loading your saved progress...'
    } else if (studentProgressState.lastError) {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Sync needs retry. Local progress is still saved.'
    } else if (signedIn) {
      studentSyncStatus.textContent = ''
      studentSyncStatus.hidden = true
    } else {
      studentSyncStatus.hidden = false
      studentSyncStatus.textContent = 'Sign in to keep MCQ progress across devices.'
    }
  }
}

const leaderboardState = {
  loading: false,
  error: '',
  rows: [],
  preferences: { anonymous: true },
  lastFetched: 0
}

function renderAnonToggleUi() {
  const btn = document.getElementById('leaderboard-anon-toggle')
  const label = document.getElementById('leaderboard-anon-label')
  if (!btn || !label) return

  const isAnon = !!leaderboardState.preferences.anonymous
  btn.classList.toggle('is-anon', isAnon)
  label.textContent = isAnon ? 'Show my name' : 'Go anonymous'
}

function showGlobalToast(text) {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = text
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 1600)
}

async function fetchAndRenderLeaderboard(force = false) {
  if (leaderboardState.loading) return

  const now = Date.now()
  if (!force && leaderboardState.rows.length > 0 && (now - leaderboardState.lastFetched < 60000)) {
    renderLeaderboardHtml()
    return
  }

  const loadingEl = document.getElementById('leaderboard-loading')
  const notSignedInEl = document.getElementById('leaderboard-not-signed-in')
  const noDataEl = document.getElementById('leaderboard-no-data')
  const errorEl = document.getElementById('leaderboard-error')
  const contentEl = document.getElementById('leaderboard-content')

  if (loadingEl) loadingEl.hidden = false
  if (notSignedInEl) notSignedInEl.hidden = true
  if (noDataEl) noDataEl.hidden = true
  if (errorEl) errorEl.hidden = true
  if (contentEl) contentEl.hidden = true

  if (!studentProgressState.user) {
    if (loadingEl) loadingEl.hidden = true
    if (notSignedInEl) notSignedInEl.hidden = false
    return
  }

  leaderboardState.loading = true
  try {
    const rows = await fetchLeaderboard(activeAcademicSection)
    leaderboardState.rows = rows
    leaderboardState.lastFetched = now
    renderLeaderboardHtml()
  } catch (err) {
    console.error('Leaderboard fetch failed:', err)
    if (loadingEl) loadingEl.hidden = true
    if (errorEl) errorEl.hidden = false
    showGlobalToast('Failed to load leaderboard.')
  } finally {
    leaderboardState.loading = false
  }
}

function renderLeaderboardHtml() {
  const loadingEl = document.getElementById('leaderboard-loading')
  const notSignedInEl = document.getElementById('leaderboard-not-signed-in')
  const noDataEl = document.getElementById('leaderboard-no-data')
  const errorEl = document.getElementById('leaderboard-error')
  const contentEl = document.getElementById('leaderboard-content')
  const podiumEl = document.getElementById('leaderboard-podium')
  const listEl = document.getElementById('leaderboard-list')
  const yourRankEl = document.getElementById('leaderboard-your-rank')
  const updatedEl = document.getElementById('leaderboard-updated')

  if (loadingEl) loadingEl.hidden = true
  if (notSignedInEl) notSignedInEl.hidden = true
  if (errorEl) errorEl.hidden = true

  const rows = leaderboardState.rows || []
  if (rows.length === 0) {
    if (noDataEl) noDataEl.hidden = false
    if (contentEl) contentEl.hidden = true
    return
  }

  if (noDataEl) noDataEl.hidden = true
  if (contentEl) contentEl.hidden = false

  const top3 = rows.slice(0, 3)
  const rest = rows.slice(3)

  if (podiumEl) {
    podiumEl.innerHTML = ''
    const medalConfig = [
      { rank: 2, key: 'silver', medal: '🥈' },
      { rank: 1, key: 'gold', medal: '🥇' },
      { rank: 3, key: 'bronze', medal: '🥉' }
    ]

    medalConfig.forEach(({ rank, key, medal }) => {
      const entry = top3[rank - 1]
      if (!entry) return

      const isMe = studentProgressState.user && entry.user_id === studentProgressState.user.id
      const isAnon = entry.anonymous
      const displayName = isAnon
        ? (isMe ? 'You (Anon)' : 'Anonymous Student')
        : (entry.display_name || 'Student')

      const avatarUrl = isAnon ? '' : entry.avatar_url
      const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S'

      const avatarHtml = avatarUrl
        ? `<img class="leaderboard__podium-avatar" src="${getSafeExternalUrl(avatarUrl)}" alt="">`
        : `<span class="leaderboard__podium-initials">${isAnon ? '🕵️' : initials}</span>`

      const card = document.createElement('div')
      card.className = `leaderboard__podium-card leaderboard__podium-card--${key}`
      card.innerHTML = `
        <span class="leaderboard__podium-medal">${medal}</span>
        ${avatarHtml}
        <span class="leaderboard__podium-name">${escapeHtml(displayName)}</span>
        <span class="leaderboard__podium-score">${entry.total_score} pts</span>
      `
      podiumEl.appendChild(card)
    })
  }

  if (listEl) {
    listEl.innerHTML = ''
    rest.forEach((entry, idx) => {
      const rank = idx + 4
      const isMe = studentProgressState.user && entry.user_id === studentProgressState.user.id
      const isAnon = entry.anonymous
      const displayName = isAnon
        ? (isMe ? 'You (Anon)' : 'Anonymous Student')
        : (entry.display_name || 'Student')

      const avatarUrl = isAnon ? '' : entry.avatar_url
      const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S'

      const avatarHtml = avatarUrl
        ? `<img class="leaderboard__row-avatar" src="${getSafeExternalUrl(avatarUrl)}" alt="">`
        : `<span class="leaderboard__row-initials">${isAnon ? '🕵️' : initials}</span>`

      const row = document.createElement('div')
      row.className = 'leaderboard__row'
      row.innerHTML = `
        <span class="leaderboard__row-rank">${rank}</span>
        ${avatarHtml}
        <span class="leaderboard__row-name">${escapeHtml(displayName)}</span>
        <span class="leaderboard__row-score">${entry.total_score} pts</span>
      `
      listEl.appendChild(row)
    })
  }

  if (yourRankEl) {
    const myIndex = rows.findIndex((r) => studentProgressState.user && r.user_id === studentProgressState.user.id)
    if (myIndex !== -1) {
      yourRankEl.hidden = false
      const myEntry = rows[myIndex]
      const rank = myIndex + 1
      const isAnon = myEntry.anonymous
      const displayName = isAnon
        ? 'You (Anonymous)'
        : (myEntry.display_name || 'Student')

      const avatarUrl = isAnon ? '' : myEntry.avatar_url
      const initials = displayName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S'

      const avatarContainer = document.getElementById('leaderboard-your-rank-avatar')
      const initialsContainer = document.getElementById('leaderboard-your-rank-initials')

      document.getElementById('leaderboard-your-rank-pos').textContent = `#${rank}`
      if (avatarUrl) {
        if (avatarContainer) {
          avatarContainer.src = getSafeExternalUrl(avatarUrl)
          avatarContainer.hidden = false
        }
        if (initialsContainer) initialsContainer.hidden = true
      } else {
        if (avatarContainer) avatarContainer.hidden = true
        if (initialsContainer) {
          initialsContainer.textContent = isAnon ? '🕵️' : initials
          initialsContainer.hidden = false
        }
      }

      document.getElementById('leaderboard-your-rank-name').textContent = displayName
      document.getElementById('leaderboard-your-rank-breakdown').textContent =
        `${myEntry.mcqs_count} MCQ topics · ${myEntry.quizzes_completed} quizzes · ${myEntry.correct_answers} correct`
      document.getElementById('leaderboard-your-rank-score').textContent = `${myEntry.total_score} pts`
    } else {
      yourRankEl.hidden = true
    }
  }

  if (updatedEl) {
    const timeStr = new Date(leaderboardState.lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    updatedEl.textContent = `Scores update automatically · Last updated at ${timeStr}`
  }
}

function setStudentSyncMenu(open) {
  if (!studentSync || !studentSyncMenu || !studentSyncButton) return
  studentSync.classList.toggle('is-open', open)
  studentSyncMenu.hidden = !open
  studentSyncButton.setAttribute('aria-expanded', String(open))
}

async function syncLocalProgressToCloud(section = activeAcademicSection) {
  if (!studentProgressState.user) return

  const sectionSubjects = getAcademicSection(section).subjects || []
  for (const subject of sectionSubjects) {
    const topicGroups = [subject.topics || [], subject.clinicalTopics || []]
    for (const topic of topicGroups.flat()) {
      const key = getTopicProgressRecordKey(section, subject.code, topic.label)
      if (studentProgressState.topicRows.has(key)) continue
      const localState = getLocalTopicCompletionState(subject.code, topic.label, section)
      if (!localState.studied && !localState.mcqs) continue

      studentProgressState.topicRows.set(key, localState)
      await upsertUserTopicProgress({
        user_id: studentProgressState.user.id,
        section,
        subject_code: subject.code,
        topic_label: topic.label,
        studied: localState.studied,
        mcqs: localState.mcqs
      })
    }
  }

  const quizPrefix = `${QUIZ_STORAGE_PREFIX}::${section}::`
  for (let index = 0; index < localStorage.length; index += 1) {
    const storageKey = localStorage.key(index)
    if (!storageKey?.startsWith(quizPrefix)) continue
    const [, , encodedTopicLabel, encodedSourceId] = storageKey.split('::')
    const topicLabel = decodeURIComponent(encodedTopicLabel || '')
    const sourceId = decodeURIComponent(encodedSourceId || 'current')
    if (!topicLabel) continue
    const key = getQuizProgressRecordKey(section, topicLabel, sourceId)
    if (studentProgressState.quizRows.has(key)) continue

    const payload = getLocalQuizState(topicLabel, sourceId, section)
    if (!payload) continue
    const stats = getQuizProgressStatsFromPayload(payload)
    studentProgressState.quizRows.set(key, payload)
    await upsertUserQuizProgress({
      user_id: studentProgressState.user.id,
      section,
      topic_label: topicLabel,
      source_id: sourceId,
      source_label: payload.sourceLabel || '',
      progress: payload,
      completed: !!payload.completed,
      score: stats.score,
      total_questions: stats.totalQuestions,
      answered_count: stats.answeredCount,
      wrong_question_ids: stats.wrongQuestionIds,
      completed_at: payload.completed ? new Date().toISOString() : null
    })
  }
}

async function loadStudentProgress(section = activeAcademicSection) {
  if (!studentProgressState.user || !isSupabaseConfigured()) {
    studentProgressState.ready = false
    renderStudentSyncUi()
    return
  }

  studentProgressState.loading = true
  studentProgressState.lastError = ''
  renderStudentSyncUi()

  try {
    const [topicRows, quizRows, pref] = await Promise.all([
      fetchUserTopicProgressRows(section),
      fetchUserQuizProgressRows(section),
      fetchUserPreference().catch(() => null)
    ])

    leaderboardState.preferences = pref || { anonymous: true }
    renderAnonToggleUi()

    ;[...studentProgressState.topicRows.keys()]
      .filter((key) => key.startsWith(`${section}::`))
      .forEach((key) => studentProgressState.topicRows.delete(key))
    ;[...studentProgressState.quizRows.keys()]
      .filter((key) => key.startsWith(`${section}::`))
      .forEach((key) => studentProgressState.quizRows.delete(key))

    topicRows.forEach((row) => {
      studentProgressState.topicRows.set(
        getTopicProgressRecordKey(row.section, row.subject_code, row.topic_label),
        row
      )
    })

    quizRows.forEach((row) => {
      studentProgressState.quizRows.set(
        getQuizProgressRecordKey(row.section, row.topic_label, row.source_id),
        row.progress || row
      )
    })

    await syncLocalProgressToCloud(section)
    studentProgressState.ready = true
    refreshTrackerFilters()
    updateGlobalProgress()
  } catch (error) {
    studentProgressState.lastError = error.message
    console.warn('Student progress sync failed.', error)
  } finally {
    studentProgressState.loading = false
    renderStudentSyncUi()
  }
}

function getInitialSiteMode() {
  const hash = window.location.hash.replace('#', '')
  if (initialParams.get('section') === '402') return '402'
  if (initialParams.get('section') === '401') return '401'
  if (initialParams.get('section') === 'tools' || hash === 'history') return 'tools'
  if (initialParams.get('section') === 'work' || hash === 'work') return 'work'
  return 'selector'
}

function setSectionStorageKeys(sectionId) {
  TOPIC_UPDATE_STORAGE_KEY = `${TOPIC_UPDATE_STORAGE_KEY_PREFIX}::${sectionId}`
  NEWS_SEEN_STORAGE_KEY = `${NEWS_SEEN_STORAGE_KEY_PREFIX}::${sectionId}`
}

function updateAcademicSectionUi() {
  activeAcademicSectionData = getAcademicSection()
  subjects = activeAcademicSectionData.subjects
  setSectionStorageKeys(activeAcademicSection)

  if (trackerTitle) trackerTitle.textContent = activeAcademicSectionData.title
  if (newsTitle) newsTitle.textContent = activeAcademicSectionData.newsTitle
  renderClassRepresentatives()
  if (scheduleTitle) scheduleTitle.textContent = `${activeAcademicSectionData.title} schedule`
  if (trackerSearch) trackerSearch.placeholder = activeAcademicSectionData.trackerSearchPlaceholder
  if (examScheduleCards) {
    examScheduleCards.setAttribute('aria-label', `${activeAcademicSectionData.title} subject exam dates`)
  }

  updateMiniDashboard()
  updateGlobalProgress()
}

function getActiveSectionQuizStats() {
  const sectionQuizzes = mcqQuizzesBySection[activeAcademicSection] || {}
  let activeQuizzesCount = 0
  let totalMcqsCount = 0

  for (const topicLabel in sectionQuizzes) {
    const raw = sectionQuizzes[topicLabel]
    if (!raw) continue

    let mcqCount = 0
    if (raw.sources?.length) {
      mcqCount = raw.sources.reduce((total, source) => total + (source.mcqs?.length || 0), 0)
    } else if (Array.isArray(raw)) {
      mcqCount = raw.length
    }

    if (mcqCount > 0) {
      activeQuizzesCount++
      totalMcqsCount += mcqCount
    }
  }

  return {
    quizzesCount: activeQuizzesCount,
    mcqsCount: totalMcqsCount
  }
}

function updateMiniDashboard() {
  const dashNextExamVal = document.querySelector('#dash-next-exam .dash-card__value')
  const dashNextExamSub = document.querySelector('#dash-next-exam .dash-card__sub')
  const dashLatestUpdateVal = document.querySelector('#dash-latest-update .dash-card__value')
  const dashLatestUpdateSub = document.querySelector('#dash-latest-update .dash-card__sub')
  const dashCoveredTopicsVal = document.querySelector('#dash-covered-topics .dash-card__value')
  const dashCoveredTopicsSub = document.querySelector('#dash-covered-topics .dash-card__sub')
  const dashMcqsVal = document.querySelector('#dash-mcqs-available .dash-card__value')
  const dashMcqsSub = document.querySelector('#dash-mcqs-available .dash-card__sub')

  if (!dashNextExamVal) return

  // 1. Next Exam
  const activeExamSchedule = activeAcademicSectionData.midtermExamSchedule || []
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const scheduleWithState = activeExamSchedule.map((exam) => {
    const examDate = getLocalDate(exam.date)
    const daysUntil = Math.ceil((examDate - todayStart) / 86400000)
    return { ...exam, examDate, daysUntil }
  })
  const nextExam = scheduleWithState.find((exam) => exam.daysUntil >= 0)

  if (nextExam) {
    dashNextExamVal.textContent = nextExam.code
    dashNextExamSub.textContent = `${getExamCountdownText(nextExam.daysUntil)} (${formatExamDate(nextExam.date)})`
  } else {
    dashNextExamVal.textContent = 'None'
    dashNextExamSub.textContent = 'Midterms complete'
  }

  // 2. Latest Update
  const activeSectionNews = Array.from(document.querySelectorAll('.update-panel')).filter(card => {
    const cardSection = card.dataset.section || '401'
    return cardSection === activeAcademicSection
  })

  if (activeSectionNews.length) {
    activeSectionNews.sort((a, b) => b.dataset.date.localeCompare(a.dataset.date))
    const latestCard = activeSectionNews[0]
    const titleText = latestCard.querySelector('h2')?.textContent || 'New Update'
    dashLatestUpdateVal.textContent = titleText.length > 18 ? titleText.substring(0, 16) + '...' : titleText
    const datePill = latestCard.querySelector('.status-pill')?.textContent || latestCard.dataset.date
    dashLatestUpdateSub.textContent = datePill
  } else {
    dashLatestUpdateVal.textContent = 'None'
    dashLatestUpdateSub.textContent = 'No recent updates'
  }

  // 3. Covered Topics
  let totalTopics = 0
  let coveredTopics = 0
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      totalTopics++
      if (topic.state === 'taken') {
        coveredTopics++
      }
    })
  })
  dashCoveredTopicsVal.textContent = `${coveredTopics} / ${totalTopics}`
  dashCoveredTopicsSub.textContent = 'taken in university'

  // 4. MCQs Available
  const stats = getActiveSectionQuizStats()
  dashMcqsVal.textContent = `${stats.quizzesCount} Quizzes`
  dashMcqsSub.textContent = `${stats.mcqsCount} questions`
}

const classRepresentativesBySection = {
  '401': [
    {
      name: 'Mohamed Kellawi',
      role: 'Anaesthesia, Nutrition, Lab',
      phone: '201151672255',
      image: '/assets/mohamed-kellawi-avatar.jpg'
    },
    {
      name: 'Mohamed Ragab',
      role: 'Medicine'
    },
    {
      name: 'Yousef El Rouby',
      role: 'Surgery, Oncology'
    }
  ],
  '402': [
    {
      name: 'Shahd Sedky',
      role: 'MED 402 representative',
      phone: '201014245576'
    }
  ]
}

function renderRepresentativeAvatar(rep) {
  if (rep.image) {
    return `<img src="${escapeHtml(rep.image)}" alt="" />`
  }

  return `
    <svg viewBox="0 0 48 48" role="img">
      <path d="M24 24.6c5.15 0 9.33-4.18 9.33-9.33S29.15 5.94 24 5.94s-9.33 4.18-9.33 9.33S18.85 24.6 24 24.6Zm0 4.32c-7.88 0-14.64 4.82-17.5 11.68-.42 1 .31 2.1 1.39 2.1h32.22c1.08 0 1.81-1.1 1.39-2.1C38.64 33.74 31.88 28.92 24 28.92Z" />
    </svg>
  `
}

function renderClassRepresentatives() {
  if (!classRepsGrid) return

  const reps = classRepresentativesBySection[activeAcademicSection] || classRepresentativesBySection['401']
  classRepsGrid.innerHTML = reps.map((rep) => {
    const avatar = renderRepresentativeAvatar(rep)
    if (rep.phone) {
      return `
        <a
          class="class-rep class-rep--link"
          href="https://wa.me/${escapeHtml(rep.phone)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact ${escapeHtml(rep.name)} on WhatsApp"
        >
          <span class="class-rep__avatar" aria-hidden="true">
            ${avatar}
          </span>
          <strong>${escapeHtml(rep.name)}</strong>
          <small>${escapeHtml(rep.role)}</small>
        </a>
      `
    }

    return `
      <article class="class-rep" aria-label="${escapeHtml(rep.name)}, ${escapeHtml(rep.role)}">
        <span class="class-rep__avatar" aria-hidden="true">
          ${avatar}
        </span>
        <strong>${escapeHtml(rep.name)}</strong>
        <small>${escapeHtml(rep.role)}</small>
      </article>
    `
  }).join('')
}

function resetActiveSubjectForSection(preferredCode = '') {
  const preferredSubject = preferredCode ? subjects.find((subject) => subject.code === preferredCode) : null
  activeSubjectCode = preferredSubject?.code || null
  expandedSubjectCode = mobileQuery.matches && activeSubjectCode ? activeSubjectCode : null
  activeSubjectTrack = 'theoretical'
}

function syncModeToBody() {
  document.body.dataset.siteMode = activeSiteMode
  document.body.dataset.academicSection = activeAcademicSection
}

function updateSiteHistory(url, historyMode = 'push') {
  if (historyMode === 'none') return
  const method = historyMode === 'replace' ? 'replaceState' : 'pushState'
  window.history[method]({ siteMode: activeSiteMode }, '', url)
}

function showAcademicSection(sectionId, options = {}) {
  activeAcademicSection = sectionId === '402' ? '402' : '401'
  activeSiteMode = activeAcademicSection
  updateAcademicSectionUi()
  const currentParams = new URLSearchParams(window.location.search)
  resetActiveSubjectForSection(options.subjectCode || currentParams.get('subject') || '')
  syncModeToBody()
  refreshTrackerFilters()
  renderSemesterTimeline()
  render401ExamSchedule()
  renderSchedulePage()
  renderNewsFilters()
  refreshRemoteNewsCards(activeAcademicSection)
  refreshRemoteTrackerData()
  loadStudentProgress(activeAcademicSection)

  try {
    localStorage.setItem('selectedAcademicSection', activeAcademicSection)
  } catch {
    // Section choice should not depend on browser storage.
  }

  const targetHash = options.hash || window.location.hash || '#tracker'
  const url = new URL(window.location.href)
  url.searchParams.set('section', activeAcademicSection)
  if (!url.hash) url.hash = targetHash
  updateSiteHistory(url, options.historyMode || 'push')
  const targetSection = document.getElementById(targetHash.replace('#', '')) || document.getElementById('tracker')
  if (targetSection && options.scroll !== false) {
    targetSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
}

function showToolsSection(options = {}) {
  activeSiteMode = 'tools'
  syncModeToBody()
  try {
    localStorage.setItem('selectedAcademicSection', 'tools')
  } catch {
    // Section choice should not depend on browser storage.
  }
  const url = new URL(window.location.href)
  url.searchParams.set('section', 'tools')
  url.hash = 'history'
  updateSiteHistory(url, options.historyMode || 'push')
  const historyRoot = document.getElementById('history')
  if (historyRoot && options.scroll !== false) {
    historyRoot.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
}

function showWorkSection(options = {}) {
  activeSiteMode = 'work'
  syncModeToBody()
  try {
    localStorage.setItem('selectedAcademicSection', 'work')
  } catch {
    // Section choice should not depend on browser storage.
  }
  const url = new URL(window.location.href)
  url.searchParams.set('section', 'work')
  url.hash = 'work'
  updateSiteHistory(url, options.historyMode || 'push')
  const workRoot = document.getElementById('work')
  if (workRoot && options.scroll !== false) {
    workRoot.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
  }
}

function showSelector(options = {}) {
  activeSiteMode = 'selector'
  syncModeToBody()

  const url = new URL(window.location.href)
  url.searchParams.delete('section')
  url.searchParams.delete('subject')
  url.searchParams.delete('tracker')
  url.hash = ''
  updateSiteHistory(`${url.pathname}${url.search}`, options.historyMode || 'push')
  if (options.scroll !== false) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }))
  }
}

function selectSiteSection(sectionId, options = {}) {
  if (sectionId === 'selector') {
    showSelector(options)
  } else if (sectionId === 'tools') {
    showToolsSection(options)
  } else if (sectionId === 'work') {
    showWorkSection(options)
  } else {
    showAcademicSection(sectionId, options)
  }
}

function handleLegacyHashRoute() {
  const hash = window.location.hash.replace('#', '')
  if (hash === 'history' && activeSiteMode !== 'tools') {
    showToolsSection({ scroll: false, historyMode: 'replace' })
  } else if (hash === 'work' && activeSiteMode !== 'work') {
    showWorkSection({ scroll: false, historyMode: 'replace' })
  }
}

function restoreSiteModeFromLocation() {
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash.replace('#', '')
  const section = params.get('section')
  if (section === '401' || section === '402') {
    showAcademicSection(section, {
      subjectCode: params.get('subject') || '',
      hash: hash ? `#${hash}` : '#tracker',
      scroll: false,
      historyMode: 'none'
    })
  } else if (section === 'tools' || hash === 'history') {
    showToolsSection({ scroll: false, historyMode: 'none' })
  } else if (section === 'work' || hash === 'work') {
    showWorkSection({ scroll: false, historyMode: 'none' })
  } else {
    showSelector({ scroll: false, historyMode: 'none' })
  }
}

function getTopicUnits(topic) {
  return topic.coverageUnits || 1
}

function getScopedProgressTopics(subject) {
  const { scope } = getTrackerFilters()
  return scope === 'midterm'
    ? subject.topics.filter((topic) => isTopicMidtermScopeConfirmed(topic))
    : subject.topics
}

function isTopicMidtermScopeConfirmed(topic) {
  return !!topic.midtermScope
}

function getTopicUnitTotal(topics) {
  return topics.reduce((count, topic) => count + getTopicUnits(topic), 0)
}

function getCoveredCount(subject, topics = subject.topics) {
  return topics.reduce((count, topic) => {
    return coveredStates.has(topic.state) ? count + getTopicUnits(topic) : count
  }, 0)
}

function getProgressTotal(subject) {
  const { scope } = getTrackerFilters()
  if (scope === 'midterm') {
    return getTopicUnitTotal(getScopedProgressTopics(subject))
  }
  return getTopicUnitTotal(getScopedProgressTopics(subject)) || subject.totalCount || 0
}

function getPercent(subject) {
  const progressTopics = getScopedProgressTopics(subject)
  const total = getTopicUnitTotal(progressTopics)
  if (!total) return 0
  return Math.round((getCoveredCount(subject, progressTopics) / total) * 100)
}

function getStateCounts(subject) {
  return subject.topics.reduce((counts, topic) => {
    counts[topic.state] = (counts[topic.state] || 0) + getTopicUnits(topic)
    return counts
  }, {})
}

function getSubjectSummary(subject) {
  const counts = getStateCounts(subject)
  const midtermCount = subject.topics.filter((topic) => isTopicMidtermScopeConfirmed(topic)).length
  const parts = [
    counts.taken ? `${counts.taken} taken` : '',
    counts.partial ? `${counts.partial} partial` : '',
    counts.announced ? `${counts.announced} announced` : '',
    (counts.remaining || 0) ? `${counts.remaining || 0} remaining` : '',
    midtermCount ? `${midtermCount} midterm scope` : ''
  ].filter(Boolean)

  return parts.join(' Â· ')
}

function getTopicUpdateId(subject, topic) {
  if (!topic.updatedAt) return ''
  return `${activeAcademicSection}::${subject.code}::${topic.label}::${topic.updateBatch || topic.updatedAt}`
}

function getSeenTopicUpdates() {
  try {
    return new Set(JSON.parse(localStorage.getItem(TOPIC_UPDATE_STORAGE_KEY) || '[]'))
  } catch {
    localStorage.removeItem(TOPIC_UPDATE_STORAGE_KEY)
    return new Set()
  }
}

function saveSeenTopicUpdates(seenUpdates) {
  try {
    localStorage.setItem(TOPIC_UPDATE_STORAGE_KEY, JSON.stringify([...seenUpdates]))
  } catch {
    // Keep the tracker usable when browser storage is blocked.
  }
}

function getTopicCompletionKey(subjectCode, topicLabel) {
  return `${TOPIC_COMPLETION_STORAGE_PREFIX}::${activeAcademicSection}::${encodeURIComponent(subjectCode)}::${encodeURIComponent(topicLabel)}`
}

function hasCompletedQuizProgress(topic) {
  const topicLabels = new Set([topic.label, topic.mcqTopicKey].filter(Boolean))
  for (const [key, payload] of studentProgressState.quizRows) {
    if (!key.startsWith(`${activeAcademicSection}::`) || !payload?.completed) continue
    if ([...topicLabels].some((label) => key.includes(`::${label}::`))) return true
  }

  for (const label of topicLabels) {
    const sectionPrefix = `${QUIZ_STORAGE_PREFIX}::${activeAcademicSection}::${encodeURIComponent(label)}::`
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith(sectionPrefix)) continue
      try {
        if (JSON.parse(localStorage.getItem(key) || 'null')?.completed) return true
      } catch {
        // Ignore malformed historical quiz progress.
      }
    }
  }
  return false
}

function updateGlobalProgress() {
  const mcqsPercent = document.getElementById('global-mcqs-percent')
  const mcqsFill = document.getElementById('global-mcqs-fill')
  if (!mcqsPercent || !mcqsFill) return

  const total = subjects.reduce((sum, s) => sum + (s.topics?.length || 0) + (s.clinicalTopics?.length || 0), 0)
  const mcqs = subjects.reduce((sum, s) => sum + (s.topics?.filter(t => getTopicCompletionState(s.code, t.label).mcqs || hasCompletedQuizProgress(t)).length || 0) + (s.clinicalTopics?.filter(t => getTopicCompletionState(s.code, t.label).mcqs || hasCompletedQuizProgress(t)).length || 0), 0)

  const mcqsValue = calculatePercent(mcqs, total)

  mcqsPercent.textContent = `${mcqsValue}%`
  mcqsFill.style.width = `${mcqsValue}%`
}

function getLegacyTopicCompletionKey(subjectCode, topicLabel) {
  return `${LEGACY_TOPIC_COMPLETION_STORAGE_PREFIX}${encodeURIComponent(subjectCode)}::${encodeURIComponent(topicLabel)}`
}

function getTopicProgressRecordKey(section, subjectCode, topicLabel) {
  return `${section}::${subjectCode}::${topicLabel}`
}

function getQuizProgressRecordKey(section, topicLabel, sourceId = 'current') {
  return `${section}::${topicLabel}::${sourceId || 'current'}`
}

function getTopicCompletionState(subjectCode, topicLabel) {
  const emptyState = { studied: false, mcqs: false }
  const cloudState = studentProgressState.topicRows.get(getTopicProgressRecordKey(activeAcademicSection, subjectCode, topicLabel))
  if (studentProgressState.user && cloudState) {
    return {
      ...emptyState,
      studied: !!cloudState.studied,
      mcqs: !!cloudState.mcqs
    }
  }

  try {
    const savedRaw = localStorage.getItem(getTopicCompletionKey(subjectCode, topicLabel))
      || (activeAcademicSection === '401' ? localStorage.getItem(getLegacyTopicCompletionKey(subjectCode, topicLabel)) : null)
    const subject = subjects.find((item) => item.code === subjectCode)
    const topic = [...(subject?.topics || []), ...(subject?.clinicalTopics || [])].find((item) => item.label === topicLabel)
    const aliasStates = (topic?.progressAliases || []).map((alias) => {
      const aliasCloudState = studentProgressState.topicRows.get(getTopicProgressRecordKey(activeAcademicSection, subjectCode, alias))
      if (studentProgressState.user && aliasCloudState) return aliasCloudState
      return getLocalTopicCompletionState(subjectCode, alias)
    })
    const savedState = JSON.parse(savedRaw || '{}')
    return {
      ...emptyState,
      studied: !!savedState.studied || aliasStates.some((state) => state.studied),
      mcqs: !!savedState.mcqs || aliasStates.some((state) => state.mcqs)
    }
  } catch {
    localStorage.removeItem(getTopicCompletionKey(subjectCode, topicLabel))
    return emptyState
  }
}

function saveTopicCompletionState(subjectCode, topicLabel, state) {
  const normalizedState = {
    studied: !!state.studied,
    mcqs: !!state.mcqs
  }
  const recordKey = getTopicProgressRecordKey(activeAcademicSection, subjectCode, topicLabel)
  studentProgressState.topicRows.set(recordKey, normalizedState)

  try {
    localStorage.setItem(getTopicCompletionKey(subjectCode, topicLabel), JSON.stringify(normalizedState))
  } catch {
    // Local checklist controls should not break topic rendering if storage is blocked.
  }

  if (studentProgressState.user) {
    upsertUserTopicProgress({
      user_id: studentProgressState.user.id,
      section: activeAcademicSection,
      subject_code: subjectCode,
      topic_label: topicLabel,
      studied: normalizedState.studied,
      mcqs: normalizedState.mcqs
    }).catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
      console.warn('Topic progress cloud sync failed.', error)
    })
  }
}

function renderTopicCompletionControls(subject, topic) {
  const state = getTopicCompletionState(subject.code, topic.label)
  const controls = [{ key: 'studied', label: 'Completed' }]

  return `
    <fieldset class="topic-completion" aria-label="${escapeHtml(topic.label)} progress">
      ${controls.map((control) => `
        <label class="topic-completion__item${state[control.key] ? ' is-checked' : ''}">
          <input
            type="checkbox"
            data-topic-completion="${control.key}"
            data-subject-code="${escapeHtml(subject.code)}"
            data-topic-label="${escapeHtml(topic.label)}"
            ${state[control.key] ? 'checked' : ''}
          >
          <span>${control.label}</span>
        </label>
      `).join('')}
    </fieldset>
  `
}

function isRecentTopicUpdate(topic) {
  return isWeeklyTopicUpdateEligible(topic)
}

function getNextUniversityWeekStart(date) {
  const dateStart = startOfDay(date)
  const daysUntilWeekStart = (7 + UNIVERSITY_WEEK_START_DAY - dateStart.getDay()) % 7 || 7
  const nextWeekStart = new Date(dateStart)
  nextWeekStart.setDate(dateStart.getDate() + daysUntilWeekStart)
  return nextWeekStart
}

function getUniversityWeekStart(date = new Date()) {
  const dateStart = startOfDay(date)
  const daysSinceWeekStart = (7 + dateStart.getDay() - UNIVERSITY_WEEK_START_DAY) % 7
  dateStart.setDate(dateStart.getDate() - daysSinceWeekStart)
  return dateStart
}

function isCurrentWeekDate(value, today = new Date()) {
  if (!value) return false
  const candidate = new Date(value)
  if (!Number.isFinite(candidate.getTime())) return false
  const weekStart = getUniversityWeekStart(today)
  const nextWeekStart = new Date(weekStart)
  nextWeekStart.setDate(weekStart.getDate() + 7)
  return candidate >= weekStart && candidate < nextWeekStart
}

function isWeeklyTopicUpdateEligible(topic, today = new Date()) {
  return !!topic.createdAt && isCurrentWeekDate(topic.createdAt, today)
}

function getUnreadTopicUpdates(subject) {
  return [...(subject.topics || []), ...(subject.clinicalTopics || [])]
    .filter((topic) => isWeeklyTopicUpdateEligible(topic))
}

function markSubjectUpdatesSeen(subject) {
  return false
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getDriveFileId(url = '') {
  const match = String(url).match(/\/file\/d\/([^/]+)/) || String(url).match(/[?&]id=([^&]+)/)
  return match ? match[1] : ''
}

function isDriveUrl(url = '') {
  return /drive\.google\.com|docs\.google\.com/.test(String(url))
}

function getDriveDownloadUrl(url = '') {
  const fileId = getDriveFileId(url)
  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : url
}

function getTrackerFilters() {
  return {
    query: trackerSearch?.value.trim().toLowerCase() || '',
    status: trackerStatusFilter?.value || 'all',
    scope: trackerScopeFilter?.value || 'all'
  }
}

function getFilteredTopics(subject) {
  const { query, status, scope } = getTrackerFilters()

  return subject.topics.filter((topic) => {
    const matchesStatus = status === 'all' || topic.state === status
    const matchesScope = scope === 'all' || (scope === 'midterm' && isTopicMidtermScopeConfirmed(topic))
    const searchable = `${subject.code} ${subject.name} ${topic.label} ${topic.section || ''} ${topic.note || ''} ${isTopicMidtermScopeConfirmed(topic) ? topic.midtermScopeNote || '' : ''} ${isTopicMidtermScopeConfirmed(topic) ? 'midterm scope included' : ''}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query)
    return matchesStatus && matchesScope && matchesQuery
  })
}

function getClinicalTopics(subject) {
  return Array.isArray(subject.clinicalTopics) ? subject.clinicalTopics : []
}

function getFilteredClinicalTopics(subject) {
  const { query, status, scope } = getTrackerFilters()

  if (scope === 'midterm') return []

  return getClinicalTopics(subject).filter((topic) => {
    const matchesStatus = status === 'all' || topic.state === status
    const searchable = `${subject.code} ${subject.name} ${topic.label || ''} ${topic.note || ''} ${topic.roundDate || ''} ${topic.room || ''}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query)
    return matchesStatus && matchesQuery
  })
}

function getFilteredSubjects() {
  const { query, status, scope } = getTrackerFilters()

  const activeExamSchedule = activeAcademicSectionData?.midtermExamSchedule || []
  const subjectCodesInMidterm = activeExamSchedule
    .filter(exam => exam.type !== 'quiz')
    .map(exam => exam.subjectCode)

  return subjects.filter((subject) => {
    if (!query && status === 'all' && scope === 'all') return true

    if (scope === 'midterm') {
      const isInMidtermSchedule = subjectCodesInMidterm.includes(subject.code)
      const hasMidtermTopics = subject.topics.some(topic => topic.midtermScope)
      if (!isInMidtermSchedule && !hasMidtermTopics) return false

      if (query || status !== 'all') {
        const matchesQuery = !query || `${subject.code} ${subject.name}`.toLowerCase().includes(query)
        const hasMatchingTopics = getFilteredTopics(subject).length > 0
        return matchesQuery || hasMatchingTopics
      }

      return true
    }

    return getFilteredTopics(subject).length > 0 || getFilteredClinicalTopics(subject).length > 0
  })
}

function getResourceItems(topic) {
  const lectureUrls = topic.lectureUrls || []
  const driveLectureItems = lectureUrls.filter((item) => isDriveUrl(item.url))
  const otherLectureItems = lectureUrls
    .filter((item) => !isDriveUrl(item.url))
    .map((item) => ({ ...item, type: 'lecture' }))
  const driveItems = driveLectureItems.length > 1
    ? [{ label: 'Drive resources', type: 'drive-group', items: driveLectureItems }]
    : driveLectureItems.map((item) => ({ ...item, type: 'lecture' }))
  const pdfItems = (topic.pdfUrls || []).map((item) => ({ ...item, type: 'pdf' }))
  const audioItem = topic.audioUrl ? [{ label: 'Lecture record', url: topic.audioUrl, type: 'audio' }] : []
  return [...driveItems, ...otherLectureItems, ...pdfItems, ...audioItem]
}

function getCompactResourceLabel(item) {
  const label = (item.label || '').toLowerCase()
  const url = (item.url || '').toLowerCase()

  if (item.type === 'audio') return 'Audio'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'

  if (label.includes('board') || label.includes('image') || label.includes('whiteboard')) {
    return 'Board image'
  }
  if (label.includes('ppt') || label.includes('presentation') || label.includes('powerpoint')) {
    return 'PPT'
  }
  if (item.type === 'pdf' || label.includes('pdf') || label.includes('booklet') || label.includes('summary') || label.includes('compact') || url.includes('.pdf')) {
    return 'PDF'
  }

  if (item.type === 'drive-group') return 'Drive'
  if (item.type === 'lecture') return 'Lecture'

  return item.label || 'Resource'
}

function renderResourceItem(item) {
  const compactLabel = getCompactResourceLabel(item)
  const tooltip = item.title || item.label || compactLabel

  if (item.type === 'audio') {
    return `
      <a class="topic-resource topic-resource--audio" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Open lecture record in Google Drive" title="${escapeHtml(tooltip)}">
        <img class="topic-resource__play-icon" src="${PLAY_ICON_URL}" alt="" loading="lazy">
        <span>${escapeHtml(compactLabel)}</span>
      </a>
    `
  }

  if (item.type === 'drive-group') {
    const links = item.items.map((driveItem) => `
      <a href="${driveItem.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(driveItem.label || '')}">
        ${escapeHtml(getCompactResourceLabel(driveItem))}
      </a>
    `).join('')

    return `
      <details class="topic-resource-menu">
        <summary class="topic-resource topic-resource--drive" aria-label="Open Drive resources" title="${escapeHtml(tooltip)}">
          <img class="topic-resource__drive-icon" src="${DRIVE_ICON_URL}" alt="" loading="lazy">
          <span>${escapeHtml(compactLabel)}</span>
        </summary>
        <span class="topic-resource-menu__links">
          ${links}
        </span>
      </details>
    `
  }

  if (item.type === 'pdf' && item.preview) {
    const title = item.title || item.label || 'PDF preview'
    const downloadUrl = item.downloadUrl || item.url
    return `
      <button class="topic-resource topic-resource--pdf topic-resource--pdf-preview" type="button" data-pdf-preview="${escapeHtml(item.url)}" data-pdf-title="${escapeHtml(title)}" data-pdf-download="${escapeHtml(downloadUrl)}" title="${escapeHtml(tooltip)}">
        ${escapeHtml(compactLabel)}
      </button>
    `
  }

  const isDriveLecture = item.type === 'lecture' && isDriveUrl(item.url)
  const labelAttr = isDriveLecture ? ` aria-label="Open ${escapeHtml(item.label || 'lecture source')} in Google Drive"` : ''

  return `
    <a class="topic-resource topic-resource--${item.type}${isDriveLecture ? ' topic-resource--drive' : ''}" href="${item.url}" target="_blank" rel="noopener noreferrer"${item.download ? ' download' : ''}${labelAttr} title="${escapeHtml(tooltip)}">
      ${isDriveLecture ? `<img class="topic-resource__drive-icon" src="${DRIVE_ICON_URL}" alt="" loading="lazy">` : ''}
      <span>${escapeHtml(compactLabel)}</span>
    </a>
  `
}

function renderTopicActionIcon(type) {
  if (type === 'drive') {
    return `<img class="topic-action-card__image" src="${DRIVE_ICON_URL}" alt="" loading="lazy">`
  }

  if (type === 'mcq') {
    return `
      <svg class="topic-action-card__svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z"></path>
        <path d="M14 3v5h5"></path>
        <path d="M10 12h5"></path>
        <path d="M10 16h4"></path>
      </svg>
    `
  }

  if (type === 'study') {
    return `
      <svg class="topic-action-card__svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"></path>
        <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"></path>
      </svg>
    `
  }

  return `
    <svg class="topic-action-card__svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"></path>
      <path d="M19 11a7 7 0 0 1-14 0"></path>
      <path d="M12 18v3"></path>
      <path d="M8 21h8"></path>
      <path d="M4 10v2"></path>
      <path d="M20 10v2"></path>
    </svg>
  `
}

function renderTopicActionContent(type) {
  return `
    <span class="topic-action-card__icon">
      ${renderTopicActionIcon(type)}
    </span>
  `
}

function renderDriveActionCard(resources, topic, breakdownExpanded = false) {
  if (topic.expandableTopics) {
    const actionLabel = breakdownExpanded ? 'Hide topic resources' : 'Show topic resources'
    return `
      <button class="topic-action-card topic-action-card--drive" type="button" data-toggle-topic-breakdown aria-expanded="${breakdownExpanded}" aria-label="${actionLabel}" title="${actionLabel}">
        ${renderTopicActionContent('drive')}
      </button>
    `
  }

  const driveResources = resources.flatMap((item) => {
    if (item.type === 'drive-group') return item.items
    if (item.type !== 'audio' && item.url && isDriveUrl(item.url)) return [item]
    return []
  })
  const label = 'Lecture slides and files'

  if (!driveResources.length) {
    return `
      <span class="topic-action-card topic-action-card--drive topic-action-card--disabled" aria-disabled="true" aria-label="${label}: Not uploaded yet" title="${label}: Not uploaded yet">
        ${renderTopicActionContent('drive')}
      </span>
    `
  }

  if (driveResources.length > 1) {
    const links = driveResources.map((item) => `
      <a href="${item.url}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(item.label || label)}">
        ${escapeHtml(item.label || getCompactResourceLabel(item))}
      </a>
    `).join('')

    return `
      <details class="topic-action-menu">
        <summary class="topic-action-card topic-action-card--drive" aria-label="Open ${label}" title="${label}">
          ${renderTopicActionContent('drive')}
        </summary>
        <span class="topic-action-menu__links">
          ${links}
        </span>
      </details>
    `
  }

  const driveItem = driveResources[0]
  return `
    <a class="topic-action-card topic-action-card--drive" href="${driveItem.url}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(driveItem.label || label)}" title="${escapeHtml(driveItem.label || label)}">
      ${renderTopicActionContent('drive')}
    </a>
  `
}

function renderMcqActionCard(quizTopicKey, quizCount) {
  const label = quizCount ? `MCQs (${quizCount})` : 'MCQs'

  if (!quizCount) {
    return `
      <span class="topic-action-card topic-action-card--mcq topic-action-card--disabled" aria-disabled="true" aria-label="MCQs: Not uploaded yet" title="MCQs: Not uploaded yet">
        ${renderTopicActionContent('mcq')}
      </span>
    `
  }

  return `
    <button class="topic-action-card topic-action-card--mcq" type="button" data-quiz-topic="${escapeHtml(quizTopicKey)}" aria-label="Open ${escapeHtml(label)}" title="${escapeHtml(label)}">
      ${renderTopicActionContent('mcq')}
    </button>
  `
}

function renderLectureRecordActionCard(topic) {
  if (!topic.audioUrl) {
    return `
      <span class="topic-action-card topic-action-card--audio topic-action-card--disabled" aria-disabled="true" aria-label="Lecture recording: Not uploaded yet" title="Lecture recording: Not uploaded yet">
        ${renderTopicActionContent('audio')}
      </span>
    `
  }

  return `
    <a class="topic-action-card topic-action-card--audio" href="${topic.audioUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open lecture recording in Google Drive" title="Lecture recording">
      ${renderTopicActionContent('audio')}
    </a>
  `
}

function renderStudyActionCard(topic) {
  if (!topic.studyUrl) return ''

  return `
    <a class="topic-action-card topic-action-card--study" href="${escapeHtml(topic.studyUrl)}" aria-label="Study ${escapeHtml(topic.label)} with explanation cards" title="Study explanation cards">
      ${renderTopicActionContent('study')}
    </a>
  `
}

function renderResourceLinks(topic, breakdownExpanded = false) {
  const quizTopicKey = topic.mcqTopicKey || topic.label
  const quizSources = getQuizSources(quizTopicKey)
  const quizCount = quizSources.reduce((total, source) => total + source.mcqs.length, 0)
  const resources = getResourceItems(topic)

  return `
    <div class="topic-action-row${topic.studyUrl ? ' topic-action-row--has-study' : ''}" aria-label="Topic resources">
      ${renderDriveActionCard(resources, topic, breakdownExpanded)}
      ${renderMcqActionCard(quizTopicKey, quizCount)}
      ${renderLectureRecordActionCard(topic)}
      ${renderStudyActionCard(topic)}
    </div>
  `
}

function getTopicBreakdownKey(subjectCode, topicLabel) {
  return `${activeAcademicSection}::${subjectCode}::${topicLabel}`
}

function renderTopicBreakdownAction({ type, label, url = '', quizKey = '', available = false }) {
  const content = `
    <span class="topic-breakdown-action__icon">${renderTopicActionIcon(type)}</span>
    <span class="topic-breakdown-action__text">
      <strong>${escapeHtml(label)}</strong>
      ${available ? '' : '<small>Not uploaded yet</small>'}
    </span>
  `

  if (!available) {
    return `<span class="topic-breakdown-action topic-breakdown-action--${type} topic-breakdown-action--unavailable" aria-disabled="true">${content}</span>`
  }

  if (type === 'mcq') {
    return `<button class="topic-breakdown-action topic-breakdown-action--mcq" type="button" data-quiz-topic="${escapeHtml(quizKey)}">${content}</button>`
  }

  return `<a class="topic-breakdown-action topic-breakdown-action--${type}" href="${url}" target="_blank" rel="noopener noreferrer">${content}</a>`
}

function renderTopicBreakdown(subject, topic) {
  if (!topic.expandableTopics || !topic.driveSelector?.length) return ''
  const isExpanded = expandedTopicBreakdowns.has(getTopicBreakdownKey(subject.code, topic.label))
  const items = topic.driveSelector.map((item) => {
    const quizKey = item.quizKey || item.label
    const quizSources = getQuizSources(quizKey)
    const quizCount = quizSources.reduce((total, source) => total + source.mcqs.length, 0)
    return `
      <article class="topic-breakdown__item">
        <div class="topic-breakdown__copy">
          <strong>${escapeHtml(item.label)}</strong>
          <p>${escapeHtml(item.source)}</p>
        </div>
        <div class="topic-breakdown__actions" aria-label="${escapeHtml(item.label)} resources">
          ${renderTopicBreakdownAction({ type: 'drive', label: 'Lecture slides', url: item.url, available: Boolean(item.url) })}
          ${renderTopicBreakdownAction({ type: 'audio', label: 'Lecture recording', url: item.recordUrl, available: Boolean(item.recordUrl) })}
          ${renderTopicBreakdownAction({ type: 'mcq', label: quizCount ? `MCQs (${quizCount})` : 'MCQs', quizKey, available: quizCount > 0 })}
        </div>
      </article>
    `
  }).join('')

  return `
    <section class="topic-breakdown" ${isExpanded ? '' : 'hidden'} aria-label="${escapeHtml(topic.label)} topics">
      ${items}
    </section>
  `
}

function updateTrackerUrl(subjectCode) {
  const url = new URL(window.location.href)
  url.searchParams.set('section', activeAcademicSection)
  url.searchParams.set('tracker', '1')
  url.searchParams.set('subject', subjectCode)
  url.hash = 'tracker'
  window.history.replaceState({}, '', url)
}

function sortTopicsForDisplay(subject, topics, collection = subject.topics) {
  return [...topics].sort((a, b) => {
    return collection.indexOf(a) - collection.indexOf(b)
  })
}

function getFastStaggerDelay(index, step = 14, max = 120) {
  return `${Math.min(index * step, max)}ms`
}

function renderTopicGroupHeading(groupTitle, globalIndex) {
  if (groupTitle === 'Taken in University') return ''

  return `
    <li class="topic-section-heading" style="--delay: ${getFastStaggerDelay(globalIndex)}">
      <span>${groupTitle}</span>
    </li>
  `
}

function renderTopicBadges(topic) {
  const badges = []

  // 1 & 2 & 3. Covered / Partial / Remaining
  const isCovered = topic.state === 'taken'
  const isPartial = topic.state === 'partial' ||
                    (topic.note && (topic.note.toLowerCase().includes('started') || topic.note.toLowerCase().includes('incomplete')))

  if (isCovered) {
    badges.push('<span class="t-badge t-badge--covered">Covered</span>')
  } else if (isPartial) {
    badges.push('<span class="t-badge t-badge--partial">Partial</span>')
  } else {
    badges.push('<span class="t-badge t-badge--remaining">Remaining</span>')
  }

  // 4. Midterm
  if (topic.midtermScope) {
    badges.push('<span class="t-badge t-badge--midterm">Midterm</span>')
  }

  // 5. Lecture
  const hasLecture = (topic.lectureUrls && topic.lectureUrls.length > 0) ||
                     (topic.resources && topic.resources.length > 0) ||
                     topic.audioUrl || topic.videoUrl
  if (hasLecture) {
    badges.push('<span class="t-badge t-badge--lecture">Lecture</span>')
  }

  // 6. MCQs
  const quizSources = getQuizSources(topic.mcqTopicKey || topic.label)
  if (quizSources.length > 0) {
    badges.push('<span class="t-badge t-badge--mcq">MCQs</span>')
  }

  return `<div class="topic-item__badges">${badges.join('')}</div>`
}

function renderTopicCard(subject, topic, index, collection = subject.topics) {
  const topicPosition = collection.indexOf(topic)
  const displayNum = String((topicPosition >= 0 ? topicPosition : index) + 1).padStart(2, '0')
  const topicState = ['taken', 'partial', 'announced', 'remaining', 'taken-in-university'].includes(topic.state)
    ? topic.state
    : 'remaining'
  const track = collection === subject.clinicalTopics ? 'clinical' : 'theoretical'
  const breakdownKey = getTopicBreakdownKey(subject.code, topic.label)
  const breakdownExpanded = expandedTopicBreakdowns.has(breakdownKey)
  const adminControls = isTrackerAdmin() ? `
    <span class="tracker-admin-topic-controls" aria-label="Admin controls for ${escapeHtml(topic.label)}">
      <button type="button" data-admin-move="up" aria-label="Move ${escapeHtml(topic.label)} up" ${topicPosition <= 0 ? 'disabled' : ''}>↑</button>
      <button type="button" data-admin-move="down" aria-label="Move ${escapeHtml(topic.label)} down" ${topicPosition >= collection.length - 1 ? 'disabled' : ''}>↓</button>
      <button type="button" data-admin-edit-topic aria-label="Edit ${escapeHtml(topic.label)}">Edit</button>
    </span>
  ` : ''

  return `
    <li class="topic-item topic-item--${topicState}${topic.expandableTopics ? ' topic-item--expandable' : ''}${breakdownExpanded ? ' is-breakdown-expanded' : ''}${isTrackerAdmin() ? ' tracker-admin-topic' : ''}"
      style="--delay: ${getFastStaggerDelay(index)};"
      data-admin-subject="${escapeHtml(subject.code)}"
      data-admin-track="${track}"
      data-admin-topic="${escapeHtml(topic.label)}"
      ${topic.expandableTopics ? `data-topic-breakdown-card aria-expanded="${breakdownExpanded}"` : ''}
      ${isTrackerAdmin() ? 'draggable="true"' : ''}>
      <span class="topic-item__index">${displayNum}</span>
      <span class="topic-item__body">
        <span class="topic-item__heading">
          <span class="topic-item__label">${escapeHtml(topic.label)}</span>
        </span>
        ${topic.midtermScope && topic.midtermScopeNote ? `<span class="topic-item__midterm-note">${escapeHtml(topic.midtermScopeNote)}</span>` : ''}
        ${renderResourceLinks(topic, breakdownExpanded)}
        ${renderTopicBreakdown(subject, topic)}
      </span>
      ${renderTopicCompletionControls(subject, topic)}
      ${adminControls}
    </li>
  `
}

function renderTopicCards(subject, topics = getFilteredTopics(subject), options = {}) {
  if (!topics.length) {
    return `<li class="topic-empty">${options.emptyMessage || 'No topics match the current filters.'}</li>`
  }

  const collection = options.collection || subject.topics
  const sortedTopics = sortTopicsForDisplay(subject, topics, collection)
  let globalIndex = 0
  let previousSection = null

  return sortedTopics.map((topic) => {
    const sectionTitle = topic.section || ''
    const sectionMarkup = sectionTitle && sectionTitle !== previousSection
      ? `<li class="topic-section-subheading" style="--delay: ${getFastStaggerDelay(globalIndex)}">${sectionTitle}</li>`
      : ''
    previousSection = sectionTitle
    return sectionMarkup + renderTopicCard(subject, topic, globalIndex++, collection)
  }).join('')
}

function renderSubjectTrackTabs(subject) {
  const clinicalCount = getClinicalTopics(subject).length
  const tracks = [
    { key: 'theoretical', label: 'Theoretical', count: subject.topics.length },
    { key: 'clinical', label: 'Clinical', count: clinicalCount }
  ]

  return tracks.map((track) => `
    <button
      class="subject-track-tab${activeSubjectTrack === track.key ? ' active' : ''}"
      type="button"
      role="tab"
      aria-selected="${activeSubjectTrack === track.key}"
      data-subject-track="${track.key}"
      data-code="${subject.code}"
    >
      <span>${track.label}</span>
      <b>${track.count}</b>
    </button>
  `).join('')
}

function renderSubjectTrackList(subject) {
  if (activeSubjectTrack === 'clinical') {
    const clinicalTopics = getClinicalTopics(subject)
    const visibleClinicalTopics = getFilteredClinicalTopics(subject)
    return renderTopicCards(subject, visibleClinicalTopics, {
      collection: clinicalTopics,
      emptyMessage: clinicalTopics.length
        ? 'No clinical round topics match the current filters.'
        : 'Clinical round topics have not been added from Drive yet.'
    })
  }

  const { scope } = getTrackerFilters()
  const emptyMessage = (scope === 'midterm' && subject.code === 'MED-1')
    ? 'Ø§Ù„ØªØ­Ø¯ÙŠØ¯Ø§Øª Ù„Ø³Ù‡ Ù…Ù†Ø²Ù„ØªØ´'
    : 'No topics match the current filters.'

  return renderTopicCards(subject, getFilteredTopics(subject), { emptyMessage })
}

function getSubjectGridColumnCount() {
  if (!mobileQuery.matches) return 1
  if (window.matchMedia('(max-width: 560px)').matches) return 2
  if (window.matchMedia('(min-width: 760px) and (max-width: 860px)').matches) return 4
  return 3
}

function renderSubjectInlineDetail(subject) {
  return `
    <div class="subject-inline-detail">
      <div class="subject-track-tabs subject-track-tabs--inline" role="tablist" aria-label="${subject.code} sections">
        ${renderSubjectTrackTabs(subject)}
      </div>
      <ul class="topic-list topic-list--inline">
        ${renderSubjectTrackList(subject)}
      </ul>
    </div>
  `
}

function bindSubjectButtons(root = subjectList) {
  root.querySelectorAll('.subject-button').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSubject(button.dataset.code)
    })
  })
}

function updateSubjectButtonStates(subject) {
  subjectList.querySelectorAll('.subject-row').forEach((row) => {
    const button = row.querySelector('.subject-button')
    const isExpanded = button?.dataset.code === expandedSubjectCode
    row.classList.toggle('expanded', isExpanded)
    if (button) {
      const isActive = button.dataset.code === subject.code
      button.classList.toggle('active', isActive)
      button.setAttribute('aria-expanded', String(isExpanded))
      if (isActive) button.querySelector('.subject-button__updates')?.remove()
    }
  })
}

function updateMobileSubjectInlineDetail(subject) {
  subjectList.querySelector('.subject-inline-detail')?.remove()
  updateSubjectButtonStates(subject)
  if (!expandedSubjectCode) return

  const visibleSubjects = getFilteredSubjects()
  const subjectIndex = visibleSubjects.findIndex((item) => item.code === expandedSubjectCode)
  if (subjectIndex === -1) {
    renderSubjects()
    return
  }

  const columnCount = getSubjectGridColumnCount()
  const rowEndIndex = Math.min(visibleSubjects.length - 1, subjectIndex + (columnCount - 1 - (subjectIndex % columnCount)))
  const rowEndCode = visibleSubjects[rowEndIndex]?.code
  const rowEndButton = subjectList.querySelector(`.subject-button[data-code="${CSS.escape(rowEndCode)}"]`)
  const rowEnd = rowEndButton?.closest('.subject-row')
  if (!rowEnd) {
    renderSubjects()
    return
  }

  rowEnd.insertAdjacentHTML('afterend', renderSubjectInlineDetail(subject))
  const detail = rowEnd.nextElementSibling
  if (detail) bindSubjectTrackTabs(detail)
}

function getSubjectTrackTitle() {
  return activeSubjectTrack === 'clinical' ? 'Clinical rounds' : 'Topic list'
}

function getSubjectTrackCount(subject) {
  if (activeSubjectTrack === 'clinical') {
    const clinicalCount = getFilteredClinicalTopics(subject).length
    return `${clinicalCount} clinical`
  }

  return `${getFilteredTopics(subject).length} shown`
}

function bindSubjectTrackTabs(root = document) {
  root.querySelectorAll('[data-subject-track]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextTrack = button.dataset.subjectTrack || 'theoretical'
      if (nextTrack !== activeSubjectTrack && trackerAdminState.dirtyCollections.has(getAdminCollectionKey())) {
        window.alert('Save this arrangement before switching topic sections.')
        return
      }
      activeSubjectTrack = nextTrack
      const code = button.dataset.code || activeSubjectCode
      if (code) setActiveSubject(code, 'open')
    })
  })
}

function ensureQuizModal() {
  let modal = document.getElementById('quiz-modal')
  if (modal) return modal

  modal = document.createElement('div')
  modal.id = 'quiz-modal'
  modal.className = 'quiz-modal'
  modal.setAttribute('aria-hidden', 'true')
  modal.innerHTML = `
    <div class="quiz-modal__backdrop" data-quiz-close></div>
    <section class="quiz-modal__panel" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <div class="quiz-progress" aria-label="Quiz progress">
        <div class="quiz-progress__stats">
          <strong id="quiz-progress-count">0/0</strong>
        </div>
        <div class="quiz-progress__track">
        <span id="quiz-progress-fill"></span>
        </div>
      </div>
      <div class="quiz-modal__top">
        <span class="quiz-timer" id="quiz-timer" hidden role="timer" aria-label="Quiz timer" data-mood="neutral">
          <span class="quiz-robot__antenna" aria-hidden="true"><span></span></span>
          <span class="quiz-robot__head" aria-hidden="true">
            <span class="quiz-robot__face">
              <span class="quiz-robot__eyes"><i></i><i></i></span>
              <span class="quiz-robot__time" id="quiz-timer-value">0:00</span>
              <span class="quiz-robot__mouth"></span>
            </span>
          </span>
          <span class="quiz-robot__body" aria-hidden="true">
            <span class="quiz-robot__arm quiz-robot__arm--left"></span>
            <span class="quiz-robot__arm quiz-robot__arm--right"></span>
            <span class="quiz-robot__chest-light"></span>
            <span class="quiz-robot__foot quiz-robot__foot--left"></span>
            <span class="quiz-robot__foot quiz-robot__foot--right"></span>
          </span>
        </span>
        <button class="icon-button" type="button" data-quiz-close aria-label="Close quiz">X</button>
      </div>
      <div class="quiz-modal__heading">
        <h2 id="quiz-title">MCQs</h2>
        <p class="quiz-modal__meta" id="quiz-meta">Choose a quiz.</p>
      </div>
      <div class="quiz-modal__body" id="quiz-body"></div>
      <div class="quiz-modal__actions">
        <button class="quiz-action" type="button" data-quiz-prev>Previous</button>
        <button class="quiz-action" type="button" data-quiz-reset>Reset</button>
        <button class="quiz-action quiz-action--primary" type="button" data-quiz-next>Next</button>
      </div>
      <div class="quiz-confetti" aria-hidden="true" id="quiz-confetti"></div>
    </section>
  `
  document.body.appendChild(modal)
  const panel = modal.querySelector('.quiz-modal__panel')
  if (panel) panel.addEventListener('scroll', updateQuizRobotCompactMode, { passive: true })
  if (typeof quizRobotCompactQuery.addEventListener === 'function') {
    quizRobotCompactQuery.addEventListener('change', updateQuizRobotCompactMode)
  } else {
    quizRobotCompactQuery.addListener(updateQuizRobotCompactMode)
  }
  return modal
}

function getQuizStorageKey(topicLabel, sourceId = quizState.sourceId || 'current') {
  return `${QUIZ_STORAGE_PREFIX}::${activeAcademicSection}::${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`
}

function getLegacyQuizStorageKey(topicLabel, sourceId = quizState.sourceId || 'current') {
  return `${LEGACY_QUIZ_STORAGE_PREFIX}${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`
}

function normalizeSavedQuizState(savedState) {
  if (!savedState) return null
  return savedState.progress || savedState
}

function getSavedQuizState(topicLabel, sourceId = 'current') {
  const cloudState = studentProgressState.quizRows.get(getQuizProgressRecordKey(activeAcademicSection, topicLabel, sourceId))
  if (studentProgressState.user && cloudState) return normalizeSavedQuizState(cloudState)

  try {
    const savedRaw = localStorage.getItem(getQuizStorageKey(topicLabel, sourceId))
      || (activeAcademicSection === '401' ? localStorage.getItem(getLegacyQuizStorageKey(topicLabel, sourceId)) : null)
    return JSON.parse(savedRaw || 'null')
  } catch {
    localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
    return null
  }
}

function buildQuizProgressPayload() {
  if (!quizState.topicLabel) return
  const questions = getCurrentQuiz()
  const totalQuestions = questions.length
  const answeredCount = Object.keys(quizState.answers || {}).length
  const wrongQuestionIds = questions
    .filter((question) => quizState.answers[question.id] !== undefined && quizState.answers[question.id] !== question.correctOptionId)
    .map((question) => question.id)

  return {
    topicLabel: quizState.topicLabel,
    sourceId: quizState.sourceId,
    sourceLabel: quizState.sourceLabel,
    index: quizState.index,
    answers: quizState.answers,
    completed: quizState.completed,
    order: quizState.order,
    questionOptionOrder: quizState.questionOptionOrder,
    missingQuestionIds: quizState.missingQuestionIds || [],
    masteredQuestionIds: quizState.masteredQuestionIds || [],
    timeLimitMinutes: quizState.timeLimitMinutes || null,
    timerEndsAt: quizState.timerEndsAt || null,
    timerStartedAt: quizState.timerStartedAt || null,
    timerElapsedMs: getQuizTimerElapsedMs(),
    score: quizState.completed ? getQuizScore() : null,
    totalQuestions,
    answeredCount,
    wrongQuestionIds,
    savedAt: new Date().toISOString()
  }
}

function saveQuizState() {
  const payload = buildQuizProgressPayload()
  if (!payload) return

  localStorage.setItem(getQuizStorageKey(quizState.topicLabel), JSON.stringify(payload))
  studentProgressState.quizRows.set(getQuizProgressRecordKey(activeAcademicSection, quizState.topicLabel, quizState.sourceId), payload)
  updateGlobalProgress()

  if (studentProgressState.user) {
    upsertUserQuizProgress({
      user_id: studentProgressState.user.id,
      section: activeAcademicSection,
      topic_label: quizState.topicLabel,
      source_id: quizState.sourceId || 'current',
      source_label: quizState.sourceLabel,
      progress: payload,
      completed: !!quizState.completed,
      score: payload.score,
      total_questions: payload.totalQuestions,
      answered_count: payload.answeredCount,
      wrong_question_ids: payload.wrongQuestionIds,
      completed_at: quizState.completed ? new Date().toISOString() : null
    }).catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
      console.warn('MCQ progress cloud sync failed.', error)
    })
  }
}

function clearSavedQuizState(topicLabel, sourceId = quizState.sourceId || 'current') {
  localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
  studentProgressState.quizRows.delete(getQuizProgressRecordKey(activeAcademicSection, topicLabel, sourceId))
  updateGlobalProgress()

  if (studentProgressState.user) {
    deleteUserQuizProgress({
      user_id: studentProgressState.user.id,
      section: activeAcademicSection,
      topic_label: topicLabel,
      source_id: sourceId || 'current'
    }).catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
      console.warn('MCQ progress cloud delete failed.', error)
    })
  }
}

function getSavedQuizStatus(topicLabel, source) {
  const savedState = getSavedQuizState(topicLabel, source.id)
  if (!savedState) return null

  const total = savedState.order?.length || source.quizSize || source.mcqs.length
  const answeredCount = Object.keys(savedState.answers || {}).length
  if (!total) return null

  return {
    completed: !!savedState.completed,
    score: Number.isFinite(savedState.score) ? savedState.score : null,
    wrongCount: Array.isArray(savedState.wrongQuestionIds) ? savedState.wrongQuestionIds.length : 0,
    answeredCount: Math.min(answeredCount, total),
    percent: Math.min(Math.round((answeredCount / total) * 100), 100),
    total,
    savedAt: savedState.savedAt || ''
  }
}

function getSavedQuizProgress(topicLabel, source) {
  const status = getSavedQuizStatus(topicLabel, source)
  return status && !status.completed && status.answeredCount ? status : null
}

function getCollectionParts(source) {
  return source?.collection?.groups?.flatMap((group) => group.parts || []) || []
}

function getCollectionProgressSummary(topicLabel, source) {
  const parts = getCollectionParts(source)
  if (!parts.length) return null

  let completedParts = 0
  let inProgressParts = 0
  let answeredCount = 0
  let total = 0

  parts.forEach((part) => {
    const status = getSavedQuizStatus(topicLabel, part)
    total += part.mcqs.length
    if (!status) return
    answeredCount += status.completed ? status.total : status.answeredCount
    if (status.completed) completedParts += 1
    else if (status.answeredCount) inProgressParts += 1
  })

  if (!completedParts && !inProgressParts) return null

  return {
    completed: completedParts === parts.length,
    completedParts,
    inProgressParts,
    partCount: parts.length,
    answeredCount,
    total,
    percent: total ? Math.round((answeredCount / total) * 100) : 0
  }
}

function getLatestCollectionAttempt(topicLabel, source) {
  return getCollectionParts(source)
    .map((part) => ({ part, status: getSavedQuizStatus(topicLabel, part) }))
    .filter(({ status }) => status && !status.completed && status.answeredCount)
    .sort((a, b) => new Date(b.status.savedAt || 0) - new Date(a.status.savedAt || 0))[0] || null
}

function formatQuizTimer(ms) {
  const safeMs = Math.max(ms, 0)
  const totalSeconds = Math.ceil(safeMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function getQuizTimerRemainingMs() {
  if (!quizState.timerEndsAt) return 0
  return new Date(quizState.timerEndsAt).getTime() - Date.now()
}

function getQuizTimerElapsedMs() {
  const savedElapsedMs = Number.isFinite(quizState.timerElapsedMs) ? quizState.timerElapsedMs : 0
  if (!quizState.timerStartedAt) return savedElapsedMs
  const currentSessionMs = Date.now() - new Date(quizState.timerStartedAt).getTime()
  return savedElapsedMs + Math.max(currentSessionMs, 0)
}

function pauseQuizCountupTimer() {
  if (quizState.timeLimitMinutes || !quizState.timerStartedAt) return
  quizState.timerElapsedMs = getQuizTimerElapsedMs()
  quizState.timerStartedAt = null
}

function clearQuizTimerInterval() {
  if (!quizTimerInterval) return
  clearInterval(quizTimerInterval)
  quizTimerInterval = null
}

function clearQuizRobotMoodTimeout() {
  if (!quizRobotMoodTimeout) return
  clearTimeout(quizRobotMoodTimeout)
  quizRobotMoodTimeout = null
}

function resetQuizRobotMood(timer = document.getElementById('quiz-timer')) {
  clearQuizRobotMoodTimeout()
  if (timer) timer.dataset.mood = 'neutral'
}

function updateQuizRobotCompactMode() {
  const modal = document.getElementById('quiz-modal')
  const panel = modal?.querySelector('.quiz-modal__panel')
  const timer = modal?.querySelector('#quiz-timer')
  if (!panel || !timer) return

  const compact = quizRobotCompactQuery.matches || panel.scrollTop > 64
  timer.classList.toggle('quiz-timer--compact', compact)
}

function triggerQuizRobotMood(mood, duration = 950) {
  const timer = document.getElementById('quiz-timer')
  if (!timer || timer.hidden) return

  resetQuizRobotMood(timer)
  timer.dataset.mood = mood
  quizRobotMoodTimeout = setTimeout(() => {
    timer.dataset.mood = 'neutral'
    quizRobotMoodTimeout = null
  }, duration)
}

function setQuizTimerText(timer, value, label) {
  const timerValue = timer.querySelector('#quiz-timer-value')
  if (timerValue) timerValue.textContent = value
  timer.setAttribute('aria-label', `${label} ${value}`)
}

function updateQuizTimerDisplay({ allowExpire = false } = {}) {
  const modal = ensureQuizModal()
  const timer = modal.querySelector('#quiz-timer')
  if (!timer) return

  if (quizState.completed || (!quizState.timeLimitMinutes && !quizState.timerStartedAt)) {
    setQuizTimerText(timer, '', 'Quiz timer')
    timer.hidden = true
    timer.style.removeProperty('--quiz-timer-progress')
    timer.classList.remove('quiz-timer--countup', 'quiz-timer--warning')
    resetQuizRobotMood(timer)
    clearQuizTimerInterval()
    return
  }

  if (!quizState.timeLimitMinutes) {
    const elapsedTime = formatQuizTimer(getQuizTimerElapsedMs())
    timer.hidden = false
    setQuizTimerText(timer, elapsedTime, 'Elapsed quiz time')
    timer.style.setProperty('--quiz-timer-progress', '100%')
    timer.classList.add('quiz-timer--countup')
    timer.classList.remove('quiz-timer--warning')
    updateQuizRobotCompactMode()
    return
  }

  const remainingMs = getQuizTimerRemainingMs()
  const totalMs = quizState.timeLimitMinutes * 60000
  const timerProgress = totalMs ? Math.max(Math.min(remainingMs / totalMs, 1), 0) : 0
  const remainingTime = formatQuizTimer(remainingMs)
  timer.hidden = false
  setQuizTimerText(timer, remainingTime, 'Quiz time remaining')
  timer.style.setProperty('--quiz-timer-progress', `${timerProgress * 100}%`)
  timer.classList.remove('quiz-timer--countup')
  timer.classList.toggle('quiz-timer--warning', remainingMs <= 120000)
  updateQuizRobotCompactMode()

  if (remainingMs > 0 || !allowExpire) return

  quizState.completed = true
  quizState.showResumePrompt = false
  quizState.missingQuestionIds = []
  saveQuizState()
  clearQuizTimerInterval()
  renderQuizQuestion()
}

function startQuizTimer() {
  clearQuizTimerInterval()
  resetQuizRobotMood()
  updateQuizTimerDisplay()

  if (quizState.completed || (!quizState.timeLimitMinutes && !quizState.timerStartedAt)) return

  quizTimerInterval = setInterval(() => {
    updateQuizTimerDisplay({ allowExpire: true })
  }, 1000)
}

function hideQuizTimer() {
  const modal = ensureQuizModal()
  const timer = modal.querySelector('#quiz-timer')
  if (timer) {
    setQuizTimerText(timer, '', 'Quiz timer')
    timer.hidden = true
    timer.style.removeProperty('--quiz-timer-progress')
    timer.classList.remove('quiz-timer--countup', 'quiz-timer--warning')
    resetQuizRobotMood(timer)
  }
  clearQuizTimerInterval()
}

function shuffleArray(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function getQuizSources(topicLabel) {
  const sectionQuizzes = mcqQuizzesBySection[activeAcademicSection] || {}
  const raw = sectionQuizzes[topicLabel]
  if (!raw) return []

  if (raw.sources?.length) {
    return raw.sources.map((source, index) => ({
      id: source.id || `source-${index}`,
      label: source.label || `MCQ source ${index + 1}`,
      description: source.description || '',
      mcqs: source.mcqs || [],
      quizSize: source.quizSize || raw.quizSize || null,
      shuffleQuestions: source.shuffleQuestions ?? raw.shuffleQuestions ?? false,
      shuffleOptions: source.shuffleOptions ?? raw.shuffleOptions ?? false,
      timeLimitMinutes: source.timeLimitMinutes || raw.timeLimitMinutes || null,
      collection: source.collection || null,
      parentSourceId: source.parentSourceId || null,
      groupId: source.groupId || null,
      groupLabel: source.groupLabel || '',
      partIndex: Number.isInteger(source.partIndex) ? source.partIndex : null,
      partCount: Number.isInteger(source.partCount) ? source.partCount : null,
      mode: source.mode || 'standard'
    })).filter((source) => source.mcqs.length || source.collection)
  }

  if (Array.isArray(raw)) {
    return [{
      id: 'current',
      label: 'Current MCQs',
      mcqs: raw,
      quizSize: raw.quizSize || null,
      shuffleQuestions: raw.shuffleQuestions || false,
      shuffleOptions: raw.shuffleOptions || false,
      timeLimitMinutes: raw.timeLimitMinutes || null
    }]
  }

  return [{
    id: 'current',
    label: raw.label || 'Current MCQs',
    description: raw.description || '',
    mcqs: raw.mcqs || [],
    quizSize: raw.quizSize || null,
    shuffleQuestions: raw.shuffleQuestions || false,
    shuffleOptions: raw.shuffleOptions || false,
    timeLimitMinutes: raw.timeLimitMinutes || null
  }].filter((source) => source.mcqs.length)
}

function getQuizConfig(topicLabel, sourceId = 'current') {
  const sources = getQuizSources(topicLabel)
  const dynamicConfig = dynamicQuizConfigs.get(`${topicLabel}::${sourceId}`)
  if (dynamicConfig) return dynamicConfig

  const directSource = sources.find((source) => source.id === sourceId)
  if (directSource) return directSource

  const nestedPart = sources
    .flatMap((source) => getCollectionParts(source))
    .find((part) => part.id === sourceId)

  return nestedPart || sources[0] || null
}

function getQuizSource(topicLabel, sourceId) {
  return getQuizSources(topicLabel).find((source) => source.id === sourceId) || null
}

function registerDynamicQuizConfig(topicLabel, config) {
  dynamicQuizConfigs.set(`${topicLabel}::${config.id}`, config)
  return config
}

function shouldShowQuizSourcePicker(topicLabel) {
  const sectionQuizzes = mcqQuizzesBySection[activeAcademicSection] || {}
  return Boolean(sectionQuizzes[topicLabel]?.alwaysShowSourcePicker)
}

function normalizeQuestion(question, index) {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => ({ id: option.id, text: option.text }))
    : (question.choices || []).map((choice, choiceIndex) => ({
      id: String.fromCharCode(97 + choiceIndex),
      text: choice
    }))

  const correctOptionId = question.correctOptionId || (
    typeof question.answerIndex === 'number' && options[question.answerIndex]
      ? options[question.answerIndex].id
      : options[0]?.id
  )

  return {
    id: question.id || `q${index}`,
    question: question.question,
    options,
    correctOptionId,
    explanation: question.explanation || '',
    source: question.source || '',
    section: question.section || '',
    organ: question.organ || '',
    originalNumber: question.originalNumber || null,
    topicTags: question.topicTags || []
  }
}

function getFirstUnansweredQuestion() {
  return getCurrentQuiz().find((question) => quizState.answers[question.id] === undefined) || null
}

function getTopicData(topicLabel) {
  return subjects.flatMap((subject) => subject.topics).find((topic) => (topic.mcqTopicKey || topic.label) === topicLabel || topic.label === topicLabel)
}

function initializeQuiz(topicLabel, {
  sourceId = 'current',
  useSaved = false,
  fresh = false,
  shuffleQuestionsOverride = null,
  promptOnSaved = true
} = {}) {
  const config = getQuizConfig(topicLabel, sourceId)
  if (!config || !config.mcqs.length) return false

  const normalizedQuestions = config.mcqs.map(normalizeQuestion)
  let order = normalizedQuestions.map((question) => question.id)
  let questionOptionOrder = {}
  let index = 0
  let answers = {}
  let completed = false
  let masteredQuestionIds = []

  const savedState = useSaved ? getSavedQuizState(topicLabel, config.id) : null
  if (savedState && !fresh && config.mode === 'wrong-review') {
    order = normalizedQuestions.map((question) => question.id)
    masteredQuestionIds = savedState.masteredQuestionIds || []
  } else if (savedState && !fresh) {
    order = savedState.order || order
    questionOptionOrder = savedState.questionOptionOrder || {}
    answers = savedState.answers || {}
    index = Number.isInteger(savedState.index) ? savedState.index : 0
    completed = !!savedState.completed
    masteredQuestionIds = savedState.masteredQuestionIds || []
  } else {
    let questionPool = [...normalizedQuestions]
    if (shuffleQuestionsOverride ?? config.shuffleQuestions) {
      questionPool = shuffleArray(questionPool)
    }
    if (config.quizSize && config.quizSize < questionPool.length) {
      questionPool = questionPool.slice(0, config.quizSize)
    }
    order = questionPool.map((question) => question.id)
    if (config.shuffleOptions) {
      questionPool.forEach((question) => {
        questionOptionOrder[question.id] = shuffleArray(question.options.map((option) => option.id))
      })
    }
  }

  const questions = order
    .map((id) => normalizedQuestions.find((question) => question.id === id))
    .filter(Boolean)

  quizState.topicLabel = topicLabel
  quizState.sourceId = config.id
  quizState.sourceLabel = config.label
  quizState.parentSourceId = config.parentSourceId || null
  quizState.groupId = config.groupId || null
  quizState.groupLabel = config.groupLabel || ''
  quizState.partIndex = Number.isInteger(config.partIndex) ? config.partIndex : null
  quizState.partCount = Number.isInteger(config.partCount) ? config.partCount : null
  quizState.mode = config.mode || 'standard'
  quizState.index = Math.min(index, Math.max(0, questions.length - 1))
  quizState.answers = answers
  quizState.completed = completed
  quizState.order = order
  quizState.questionOptionOrder = questionOptionOrder
  quizState.questions = questions
  quizState.showResumePrompt = false
  quizState.missingQuestionIds = savedState?.missingQuestionIds || []
  quizState.masteredQuestionIds = masteredQuestionIds
  quizState.lectureUrls = getTopicData(topicLabel)?.lectureUrls || []
  quizState.timeLimitMinutes = config.timeLimitMinutes || null
  quizState.timerEndsAt = null
  quizState.timerStartedAt = null
  quizState.timerElapsedMs = 0

  if (quizState.timeLimitMinutes && !completed) {
    const savedTimerEndsAt = savedState?.timerEndsAt ? new Date(savedState.timerEndsAt).getTime() : NaN
    quizState.timerEndsAt = savedState && Number.isFinite(savedTimerEndsAt)
      ? savedState.timerEndsAt
      : new Date(Date.now() + quizState.timeLimitMinutes * 60000).toISOString()
  } else if (!completed) {
    const savedElapsedMs = Number(savedState?.timerElapsedMs)
    quizState.timerElapsedMs = savedState && Number.isFinite(savedElapsedMs)
      ? Math.max(savedElapsedMs, 0)
      : 0
    quizState.timerStartedAt = new Date().toISOString()
  }

  if (savedState && !fresh && !savedState.completed && useSaved && promptOnSaved && config.mode !== 'wrong-review') {
    quizState.showResumePrompt = true
    pauseQuizCountupTimer()
  }

  return true
}

function getCurrentQuiz() {
  return quizState.questions || []
}

function getCurrentQuestion() {
  return getCurrentQuiz()[quizState.index]
}

function getQuizScore() {
  return Object.entries(quizState.answers).reduce((score, [questionId, selectedOptionId]) => {
    const question = getCurrentQuiz().find((item) => item.id === questionId)
    return question && question.correctOptionId === selectedOptionId ? score + 1 : score
  }, 0)
}

function getQuizProgressStats() {
  const quiz = getCurrentQuiz()
  return calculateQuizProgress(
    quiz.map((question) => question.id),
    Object.keys(quizState.answers)
  )
}

function getPerformanceLabel(score, total) {
  const percent = total ? Math.round((score / total) * 100) : 0
  if (percent >= 90) return 'Excellent'
  if (percent >= 70) return 'Good'
  if (percent >= 50) return 'Needs review'
  return 'Repeat this topic'
}

function getOptionOrder(question) {
  return quizState.questionOptionOrder[question.id] || question.options.map((option) => option.id)
}

function getOptionById(question, optionId) {
  return question.options.find((option) => option.id === optionId)
}

function getMissedQuestions() {
  return getCurrentQuiz().filter((question) => !quizState.answers[question.id])
}

function getCurrentWrongQuestionIds() {
  return getCurrentQuiz()
    .filter((question) => quizState.answers[question.id] !== undefined && quizState.answers[question.id] !== question.correctOptionId)
    .map((question) => question.id)
}

function getCollectionWrongQuestionIds(topicLabel, source) {
  const wrongIds = new Set()
  const trackSource = (config) => {
    const state = getSavedQuizState(topicLabel, config.id)
    ;(state?.wrongQuestionIds || []).forEach((questionId) => wrongIds.add(questionId))
  }

  getCollectionParts(source).forEach(trackSource)
  ;(source.collection?.mixedSizes || []).forEach((mode) => {
    trackSource({ id: `${source.id}-mixed-${mode.size}` })
  })

  const reviewId = source.collection?.wrongReviewId
  const reviewState = reviewId ? getSavedQuizState(topicLabel, reviewId) : null
  ;(reviewState?.masteredQuestionIds || []).forEach((questionId) => wrongIds.delete(questionId))

  return source.mcqs.filter((question) => wrongIds.has(question.id)).map((question) => question.id)
}

function createMixedQuizConfig(topicLabel, source, mode) {
  return registerDynamicQuizConfig(topicLabel, {
    id: `${source.id}-mixed-${mode.size}`,
    label: mode.label,
    description: mode.description,
    parentSourceId: source.id,
    mode: 'mixed',
    mcqs: source.mcqs,
    quizSize: mode.size,
    shuffleQuestions: true,
    shuffleOptions: false,
    timeLimitMinutes: null
  })
}

function createWrongReviewQuizConfig(topicLabel, source) {
  const wrongIds = new Set(getCollectionWrongQuestionIds(topicLabel, source))
  const questions = source.mcqs.filter((question) => wrongIds.has(question.id))
  return registerDynamicQuizConfig(topicLabel, {
    id: source.collection?.wrongReviewId || `${source.id}-wrong-review`,
    label: 'Review Wrong Answers',
    description: 'Questions previously answered incorrectly.',
    parentSourceId: source.id,
    mode: 'wrong-review',
    mcqs: questions,
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimitMinutes: null
  })
}

function getCurrentCollectionSource() {
  if (!quizState.topicLabel || !quizState.parentSourceId) return null
  return getQuizSource(quizState.topicLabel, quizState.parentSourceId)
}

function getCurrentCollectionGroup() {
  const source = getCurrentCollectionSource()
  return source?.collection?.groups?.find((group) => group.id === quizState.groupId) || null
}

function getNextCollectionPart() {
  const group = getCurrentCollectionGroup()
  if (!group || !Number.isInteger(quizState.partIndex)) return null
  return group.parts[quizState.partIndex + 1] || null
}

function scrollToQuizQuestion(questionId) {
  const modal = ensureQuizModal()
  const questionCard = modal.querySelector(`[data-quiz-card="${CSS.escape(questionId)}"]`)
  if (!questionCard) return

  const panel = modal.querySelector('.quiz-modal__panel')
  if (panel) {
    const panelRect = panel.getBoundingClientRect()
    const questionRect = questionCard.getBoundingClientRect()
    panel.scrollTo({
      top: Math.max(panel.scrollTop + questionRect.top - panelRect.top - QUIZ_STICKY_OFFSET, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  } else {
    questionCard.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
  }

  const firstChoice = questionCard.querySelector('[data-quiz-answer]')
  if (firstChoice) firstChoice.focus({ preventScroll: true })
}

function scrollToNextQuizQuestion(answeredQuestionId) {
  const quiz = getCurrentQuiz()
  const questionIndex = quiz.findIndex((question) => question.id === answeredQuestionId)
  const nextQuestion = quiz[questionIndex + 1]
  if (!nextQuestion) return

  setTimeout(() => {
    const modal = ensureQuizModal()
    const panel = modal.querySelector('.quiz-modal__panel')
    const questionCard = modal.querySelector(`[data-quiz-card="${CSS.escape(nextQuestion.id)}"]`)
    if (!panel || !questionCard) return

    const panelRect = panel.getBoundingClientRect()
    const questionRect = questionCard.getBoundingClientRect()
    panel.scrollTo({
      top: Math.max(panel.scrollTop + questionRect.top - panelRect.top - QUIZ_STICKY_OFFSET, 0),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    })
  }, 450)
}

function renderQuizActions() {
  const modal = ensureQuizModal()
  const actions = modal.querySelector('.quiz-modal__actions')
  if (!actions) return

  if (quizState.showResumePrompt) {
    actions.innerHTML = ''
    return
  }

  if (quizState.completed) {
    const collectionSource = getCurrentCollectionSource()
    const nextPart = getNextCollectionPart()
    const wrongReviewCount = collectionSource
      ? getCollectionWrongQuestionIds(quizState.topicLabel, collectionSource).length
      : 0

    actions.innerHTML = `
      ${quizState.groupId ? '<button class="quiz-action" type="button" data-quiz-back-group>Back to organ</button>' : ''}
      ${collectionSource && !quizState.groupId ? '<button class="quiz-action" type="button" data-quiz-back-collection>Back to Kellawi</button>' : ''}
      ${wrongReviewCount && quizState.mode !== 'wrong-review' ? `<button class="quiz-action" type="button" data-quiz-review-wrong>Wrong answers (${wrongReviewCount})</button>` : ''}
      <button class="quiz-action" type="button" data-quiz-retake>Retake quiz</button>
      ${nextPart ? '<button class="quiz-action quiz-action--primary" type="button" data-quiz-next-part>Next part</button>' : ''}
      <button class="quiz-action${nextPart ? '' : ' quiz-action--primary'}" type="button" data-quiz-close>Close</button>
    `
    return
  }

  actions.innerHTML = `
    <button class="quiz-action" type="button" data-quiz-reset>Reset</button>
    <button class="quiz-action quiz-action--primary" type="button" data-quiz-submit>Submit</button>
  `
}

function renderQuizMeta() {
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const progressCount = modal.querySelector('#quiz-progress-count')
  const quiz = getCurrentQuiz()
  const score = getQuizScore()
  const { answeredCount, percent, total } = getQuizProgressStats()

  if (title) {
    title.textContent = quizState.parentSourceId
      ? quizState.sourceLabel
      : (quizState.topicLabel || 'Quiz')
  }
  if (progressCount) progressCount.textContent = `${answeredCount}/${total}`
  if (fill) fill.style.width = `${percent}%`
  const progress = modal.querySelector('.quiz-progress')
  if (progress) progress.style.setProperty('--quiz-progress-percent', `${percent}%`)
  updateQuizTimerDisplay()

  if (quizState.showResumePrompt) {
    if (meta) meta.textContent = `${quizState.sourceLabel} - resume your previous attempt or start over.`
    return
  }

  if (quizState.completed) {
    const scorePercent = quiz.length ? Math.round((score / quiz.length) * 100) : 0
    if (meta) {
      const location = quizState.groupLabel ? `Kellawi MCQs · ${quizState.groupLabel}` : 'Kellawi MCQs'
      meta.textContent = `${quizState.parentSourceId ? location + ' · ' : ''}Final score ${score} / ${quiz.length} (${scorePercent}%)`
    }
    return
  }

  const missedCount = quizState.missingQuestionIds?.length || 0
  if (meta) {
    const location = quizState.groupLabel ? `Kellawi MCQs · ${quizState.groupLabel} · ` : ''
    meta.textContent = missedCount
      ? `${location}${missedCount} unanswered question${missedCount === 1 ? '' : 's'}`
      : `${location}${answeredCount} / ${quiz.length} answered`
  }
}

function renderQuizQuestion() {
  const modal = ensureQuizModal()
  const body = modal.querySelector('#quiz-body')
  const quiz = getCurrentQuiz()
  const score = getQuizScore()
  const missedIds = new Set(quizState.missingQuestionIds || [])

  renderQuizMeta()
  renderQuizActions()

  if (!quiz.length) {
    body.innerHTML = '<article class="quiz-card"><p class="quiz-question">No questions available.</p></article>'
    return
  }

  const resultBanner = quizState.completed ? `
    <article class="quiz-card quiz-result-banner">
      <p class="quiz-summary__score">${score} / ${quiz.length}</p>
      <p class="quiz-summary__percent">${Math.round((score / Math.max(quiz.length, 1)) * 100)}%</p>
      <p class="quiz-summary__performance">${getPerformanceLabel(score, quiz.length)}</p>
    </article>
  ` : ''

  const questionCards = quiz.map((question, questionIndex) => {
    const selectedOptionId = quizState.answers[question.id]
    const optionOrder = getOptionOrder(question)
    const missed = missedIds.has(question.id)
    const isAnswered = selectedOptionId !== undefined
    const shouldReveal = quizState.completed || isAnswered

    const choices = optionOrder.map((optionId, optionIndex) => {
      const option = getOptionById(question, optionId)
      const isCorrect = option && option.id === question.correctOptionId
      const isSelected = option && option.id === selectedOptionId
      let stateClass = ''

      if (shouldReveal) {
        if (isCorrect) stateClass = ' quiz-choice--correct'
        else if (isSelected) stateClass = ' quiz-choice--wrong'
      } else if (isSelected) {
        stateClass = ' quiz-choice--selected'
      }

      return `
        <button class="quiz-choice${stateClass}" type="button" data-quiz-question="${escapeHtml(question.id)}" data-quiz-answer="${escapeHtml(option.id)}" ${shouldReveal ? 'disabled' : ''} ${isSelected ? 'data-quiz-selected="true"' : ''}>
          <span>${String.fromCharCode(65 + optionIndex)}</span>
          ${escapeHtml(option.text)}
        </button>
      `
    }).join('')

    const correctOption = getOptionById(question, question.correctOptionId)

    return `
      <article class="quiz-card quiz-question-card${missed ? ' quiz-question-card--missed' : ''}" data-quiz-card="${escapeHtml(question.id)}">
        ${question.section ? `<p class="quiz-question__section">${escapeHtml(question.section)}</p>` : ''}
        <p class="quiz-question"><strong>Q${questionIndex + 1}.</strong> ${escapeHtml(question.question)}</p>
        ${missed ? '<p class="quiz-missed-note">Answer this question before submitting.</p>' : ''}
        <div class="quiz-choices">${choices}</div>
        ${shouldReveal ? `
          <div class="quiz-explanation">
            <strong>${selectedOptionId === question.correctOptionId ? 'Correct.' : 'Correct answer: ' + escapeHtml(correctOption?.text || '')}</strong>
            <p>${escapeHtml(question.explanation)}</p>
            ${question.source ? `<p class="quiz-explanation__source">${escapeHtml(question.source)}</p>` : ''}
          </div>
        ` : ''}
      </article>
    `
  }).join('')

  body.innerHTML = `
    ${resultBanner}
    <div class="quiz-question-list">${questionCards}</div>
  `

  replayTrackerMotion(body, '.quiz-card, .quiz-choice[data-quiz-selected="true"]')
}

function triggerCorrectAnswerCelebration() {
  const defaults = {
    spread: 60,
    ticks: 80,
    gravity: 0.9,
    decay: 0.93,
    startVelocity: 30,
    colors: ['#4ade80', '#22d3ee', '#a78bfa', '#fbbf24', '#f87171', '#34d399'],
  }

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(120 * particleRatio),
    })
  }

  // Two-burst from bottom corners for a celebratory arc
  fire(0.25, { origin: { x: 0.15, y: 1 }, angle: 60 })
  fire(0.25, { origin: { x: 0.85, y: 1 }, angle: 120 })

  setTimeout(() => {
    fire(0.2, { origin: { x: 0.3, y: 0.95 }, angle: 75, spread: 80, startVelocity: 25 })
    fire(0.2, { origin: { x: 0.7, y: 0.95 }, angle: 105, spread: 80, startVelocity: 25 })
  }, 150)

  setTimeout(() => {
    fire(0.15, { origin: { x: 0.5, y: 0.98 }, angle: 90, spread: 100, startVelocity: 20 })
  }, 300)
}

function renderResumePrompt() {
  const modal = ensureQuizModal()
  const body = modal.querySelector('#quiz-body')
  body.innerHTML = `
    <article class="quiz-resume-card">
      <div class="quiz-resume-card__header">
        <div class="quiz-resume-card__icon-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <h3 class="quiz-resume-card__title">Saved Attempt</h3>
      </div>
      <p class="quiz-resume-card__desc">
        You have an active attempt saved for this topic. Would you like to resume where you left off or start fresh?
      </p>
      <div class="quiz-resume-card__actions">
        <button class="quiz-resume-card__btn quiz-resume-card__btn--secondary" type="button" data-quiz-start-over>
          Start over
        </button>
        <button class="quiz-resume-card__btn quiz-resume-card__btn--primary" type="button" data-quiz-resume>
          Resume Quiz
        </button>
      </div>
    </article>
  `
}

function renderSourceProgress(sourceProgress) {
  if (!sourceProgress) return ''

  if (sourceProgress.partCount) {
    return `
      <span class="quiz-source-option__resume-row quiz-source-option__resume-row--collection">
        <span class="quiz-source-option__resume${sourceProgress.completed ? ' quiz-source-option__resume--complete' : ''}">
          ${sourceProgress.completed ? 'Completed' : 'In progress'}
        </span>
        <span class="quiz-source-option__progress" aria-label="${sourceProgress.answeredCount} of ${sourceProgress.total} questions completed">
          <span style="width: ${sourceProgress.percent}%"></span>
        </span>
        <span class="quiz-source-option__count">${sourceProgress.completedParts}/${sourceProgress.partCount} parts</span>
      </span>
    `
  }

  if (sourceProgress.completed) {
    return `
      <span class="quiz-source-option__resume-row quiz-source-option__resume-row--complete">
        <span class="quiz-source-option__resume quiz-source-option__resume--complete">Completed</span>
        <span class="quiz-source-option__progress" aria-label="Quiz completed">
          <span style="width: 100%"></span>
        </span>
        <span class="quiz-source-option__count">${sourceProgress.score ?? sourceProgress.answeredCount}/${sourceProgress.total}</span>
      </span>
    `
  }

  return `
    <span class="quiz-source-option__resume-row">
      <span class="quiz-source-option__resume">Resume</span>
      <span class="quiz-source-option__progress" aria-label="${sourceProgress.answeredCount} of ${sourceProgress.total} questions answered">
        <span style="width: ${sourceProgress.percent}%"></span>
      </span>
      <span class="quiz-source-option__count">${sourceProgress.answeredCount}/${sourceProgress.total}</span>
    </span>
  `
}

function renderQuizSourcePicker(topicLabel, event = null) {
  const sources = getQuizSources(topicLabel)
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const progressCount = modal.querySelector('#quiz-progress-count')
  const body = modal.querySelector('#quiz-body')
  const actions = modal.querySelector('.quiz-modal__actions')
  const panel = modal.querySelector('.quiz-modal__panel')
  const sourcesWithProgress = sources.map((source) => ({
    ...source,
    savedProgress: source.collection
      ? getCollectionProgressSummary(topicLabel, source)
      : getSavedQuizProgress(topicLabel, source)
  }))
  const firstSavedProgress = sourcesWithProgress.find((source) => source.savedProgress)?.savedProgress || null

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    panel.style.transformOrigin = `${x}px ${y}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  if (title) title.textContent = topicLabel
  if (meta) meta.textContent = 'Choose an MCQ source.'
  if (fill) fill.style.width = `${firstSavedProgress?.percent || 0}%`
  if (progressCount) progressCount.textContent = firstSavedProgress
    ? `${firstSavedProgress.answeredCount}/${firstSavedProgress.total}`
    : '0/0'
  const progress = modal.querySelector('.quiz-progress')
  if (progress) progress.style.setProperty('--quiz-progress-percent', `${firstSavedProgress?.percent || 0}%`)
  hideQuizTimer()
  body.innerHTML = `
    <article class="quiz-card quiz-source-picker">
      ${sourcesWithProgress.map((source) => {
        const isVipPastExam = source.id === 'nutr-quiz-1-2-cleaned-bank'
        const isKellawiCollection = source.id === 'kellawi-surgical-git-master-bank'
        const resumesDirectly = Boolean(source.savedProgress && !source.collection)
        return `
        <button class="quiz-source-option${isVipPastExam ? ' quiz-source-option--vip' : ''}${isKellawiCollection ? ' quiz-source-option--kellawi' : ''}" type="button" data-quiz-source="${source.id}" data-quiz-topic="${escapeHtml(topicLabel)}" ${resumesDirectly ? 'data-quiz-resume-direct' : ''} ${isVipPastExam ? 'dir="rtl"' : ''}>
          ${isVipPastExam ? '<img class="quiz-source-option__icon" src="/assets/past-exams-vip-icon.png" alt="" />' : ''}
          ${isKellawiCollection ? `
            <span class="quiz-source-option__kellawi-mascot" aria-hidden="true">
              <span class="quiz-source-option__kellawi-avatar">
                <img src="/assets/mohamed-kellawi-avatar.jpg" alt="" />
              </span>
              <span class="quiz-source-option__thought">Ready? Let’s solve it organ by organ.</span>
            </span>
          ` : ''}
          <span class="quiz-source-option__content">
            <strong>${source.label}</strong>
            ${isVipPastExam
              ? '<span>15 min timer</span>'
              : isKellawiCollection
                ? '<span>1,187 questions · 5 organs · 33 short parts</span>'
                : `<span>${source.mcqs.length} questions${source.description ? ` - ${source.description}` : ''}</span>`}
            ${renderSourceProgress(source.savedProgress)}
          </span>
        </button>
      `}).join('')}
    </article>
  `
  actions.innerHTML = '<button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>'
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
}

function prepareQuizPicker({ titleText, metaText, progress = null, event = null }) {
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const progressCount = modal.querySelector('#quiz-progress-count')
  const body = modal.querySelector('#quiz-body')
  const actions = modal.querySelector('.quiz-modal__actions')
  const panel = modal.querySelector('.quiz-modal__panel')

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    panel.style.transformOrigin = `${event.clientX - rect.left}px ${event.clientY - rect.top}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  if (title) title.textContent = titleText
  if (meta) meta.textContent = metaText
  if (fill) fill.style.width = `${progress?.percent || 0}%`
  if (progressCount) {
    progressCount.textContent = progress
      ? `${progress.answeredCount}/${progress.total}`
      : '0/0'
  }
  const progressBar = modal.querySelector('.quiz-progress')
  if (progressBar) progressBar.style.setProperty('--quiz-progress-percent', `${progress?.percent || 0}%`)

  hideQuizTimer()
  actions.innerHTML = '<button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>'
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')

  return { modal, body, actions, panel }
}

function getGroupProgressSummary(topicLabel, group) {
  let completedParts = 0
  let inProgressParts = 0
  let answeredCount = 0
  let total = 0

  group.parts.forEach((part) => {
    const status = getSavedQuizStatus(topicLabel, part)
    total += part.mcqs.length
    if (!status) return
    answeredCount += status.completed ? status.total : status.answeredCount
    if (status.completed) completedParts += 1
    else if (status.answeredCount) inProgressParts += 1
  })

  return {
    completed: completedParts === group.parts.length,
    completedParts,
    inProgressParts,
    partCount: group.parts.length,
    answeredCount,
    total,
    percent: total ? Math.round((answeredCount / total) * 100) : 0
  }
}

function renderCollectionCardStatus(summary) {
  const stateLabel = summary.completed
    ? 'Completed'
    : summary.inProgressParts
      ? 'In progress'
      : 'Not started'

  return `
    <span class="quiz-collection-option__status">
      <span>${stateLabel}</span>
      <strong>${summary.completedParts}/${summary.partCount} parts</strong>
    </span>
    <span class="quiz-collection-option__bar" aria-hidden="true">
      <span style="width: ${summary.percent}%"></span>
    </span>
  `
}

function renderQuizCollectionPicker(topicLabel, sourceId, event = null) {
  const source = getQuizSource(topicLabel, sourceId)
  if (!source?.collection) return

  const collectionProgress = getCollectionProgressSummary(topicLabel, source)
  const latestAttempt = getLatestCollectionAttempt(topicLabel, source)
  const wrongCount = getCollectionWrongQuestionIds(topicLabel, source).length
  const { body } = prepareQuizPicker({
    titleText: source.label,
    metaText: 'Choose an organ or a revision mode.',
    progress: collectionProgress,
    event
  })

  const continueCard = latestAttempt ? `
    <button class="quiz-collection-option quiz-collection-option--continue" type="button"
      data-quiz-continue-source="${escapeHtml(latestAttempt.part.id)}"
      data-quiz-topic="${escapeHtml(topicLabel)}">
      <span class="quiz-collection-option__eyebrow">Continue</span>
      <strong>${escapeHtml(latestAttempt.part.groupLabel)} · ${escapeHtml(latestAttempt.part.label)}</strong>
      <span>${latestAttempt.status.answeredCount}/${latestAttempt.status.total} answered</span>
      <span class="quiz-collection-option__bar" aria-hidden="true">
        <span style="width: ${latestAttempt.status.percent}%"></span>
      </span>
    </button>
  ` : ''

  const organCards = source.collection.groups.map((group) => {
    const summary = getGroupProgressSummary(topicLabel, group)
    return `
      <button class="quiz-collection-option" type="button"
        data-quiz-group="${escapeHtml(group.id)}"
        data-quiz-collection-source="${escapeHtml(source.id)}"
        data-quiz-topic="${escapeHtml(topicLabel)}">
        <span class="quiz-collection-option__eyebrow">Organ bank</span>
        <strong>${escapeHtml(group.label)}</strong>
        <span>${group.questionCount} questions · ${group.parts.length} parts</span>
        ${renderCollectionCardStatus(summary)}
      </button>
    `
  }).join('')

  body.innerHTML = `
    <article class="quiz-card quiz-collection-picker">
      <div class="quiz-picker-breadcrumb">
        <button type="button" data-quiz-picker-back-source data-quiz-topic="${escapeHtml(topicLabel)}">MCQ sources</button>
        <span aria-hidden="true">›</span>
        <strong>${escapeHtml(source.label)}</strong>
      </div>
      ${continueCard}
      <div class="quiz-collection-grid">
        ${organCards}
        <button class="quiz-collection-option quiz-collection-option--mixed" type="button"
          data-quiz-mixed-menu
          data-quiz-collection-source="${escapeHtml(source.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}">
          <span class="quiz-collection-option__eyebrow">Revision mode</span>
          <strong>Mixed Practice</strong>
          <span>Quick 20 · Standard 30 · Exam 50</span>
        </button>
        <button class="quiz-collection-option quiz-collection-option--wrong" type="button"
          data-quiz-wrong-review
          data-quiz-collection-source="${escapeHtml(source.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}"
          ${wrongCount ? '' : 'disabled'}>
          <span class="quiz-collection-option__eyebrow">Focused review</span>
          <strong>Review Wrong Answers</strong>
          <span>${wrongCount ? `${wrongCount} question${wrongCount === 1 ? '' : 's'} to review` : 'No wrong answers saved yet'}</span>
        </button>
      </div>
    </article>
  `
}

function renderPartResumeActions(topicLabel, part, status) {
  return `
    <span class="quiz-part-option__saved-footer">
      <span class="quiz-part-option__saved-actions">
        <button class="quiz-part-option__resume-button" type="button"
          data-quiz-part="${escapeHtml(part.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}"
          data-quiz-resume-direct>Resume</button>
        <button class="quiz-part-option__restart-button" type="button"
          data-quiz-part-start-over="${escapeHtml(part.id)}"
          data-quiz-topic="${escapeHtml(topicLabel)}">Start over</button>
      </span>
      <span class="quiz-source-option__progress" aria-label="${status.answeredCount} of ${status.total} questions answered">
        <span style="width: ${status.percent}%"></span>
      </span>
      <span class="quiz-source-option__count">${status.answeredCount}/${status.total}</span>
    </span>
  `
}

function renderQuizPartPicker(topicLabel, sourceId, groupId, event = null) {
  const source = getQuizSource(topicLabel, sourceId)
  const group = source?.collection?.groups?.find((item) => item.id === groupId)
  if (!source || !group) return

  const progress = getGroupProgressSummary(topicLabel, group)
  const { body } = prepareQuizPicker({
    titleText: group.label,
    metaText: `${group.questionCount} questions · ${group.parts.length} short parts`,
    progress,
    event
  })

  const partCards = group.parts.map((part) => {
    const status = getSavedQuizStatus(topicLabel, part)
    const resumesDirectly = Boolean(status && !status.completed && status.answeredCount)
    const cardContent = `
      <span class="quiz-collection-option__eyebrow">${escapeHtml(part.range)}</span>
      <strong>${escapeHtml(part.label)}</strong>
      <span>${part.mcqs.length} questions</span>
      <small>${escapeHtml(part.description)}</small>
    `

    if (resumesDirectly) {
      return `
        <article class="quiz-part-option quiz-part-option--saved">
          ${cardContent}
          ${renderPartResumeActions(topicLabel, part, status)}
        </article>
      `
    }

    return `
      <button class="quiz-part-option${status?.completed ? ' quiz-part-option--complete' : ''}" type="button"
        data-quiz-part="${escapeHtml(part.id)}"
        data-quiz-topic="${escapeHtml(topicLabel)}">
        ${cardContent}
        ${renderSourceProgress(status)}
      </button>
    `
  }).join('')

  body.innerHTML = `
    <article class="quiz-card quiz-parts-picker">
      <div class="quiz-picker-breadcrumb">
        <button type="button" data-quiz-back-collection
          data-quiz-topic="${escapeHtml(topicLabel)}"
          data-quiz-collection-source="${escapeHtml(source.id)}">${escapeHtml(source.label)}</button>
        <span aria-hidden="true">›</span>
        <strong>${escapeHtml(group.label)}</strong>
      </div>
      <label class="quiz-picker-toggle">
        <input type="checkbox" data-quiz-shuffle-toggle>
        <span>Shuffle questions when starting a new part</span>
      </label>
      <div class="quiz-parts-grid">
        ${partCards}
      </div>
    </article>
  `
}

function renderMixedPracticePicker(topicLabel, sourceId, event = null) {
  const source = getQuizSource(topicLabel, sourceId)
  if (!source?.collection) return

  const { body } = prepareQuizPicker({
    titleText: 'Mixed Practice',
    metaText: 'Random questions from all five organs.',
    event
  })

  body.innerHTML = `
    <article class="quiz-card quiz-parts-picker">
      <div class="quiz-picker-breadcrumb">
        <button type="button" data-quiz-back-collection
          data-quiz-topic="${escapeHtml(topicLabel)}"
          data-quiz-collection-source="${escapeHtml(source.id)}">${escapeHtml(source.label)}</button>
        <span aria-hidden="true">›</span>
        <strong>Mixed Practice</strong>
      </div>
      <div class="quiz-parts-grid">
        ${source.collection.mixedSizes.map((mode) => {
          const config = createMixedQuizConfig(topicLabel, source, mode)
          const status = getSavedQuizStatus(topicLabel, config)
          const resumesDirectly = Boolean(status && !status.completed && status.answeredCount)
          return `
            <button class="quiz-part-option${status?.completed ? ' quiz-part-option--complete' : ''}" type="button"
              data-quiz-mixed-size="${mode.size}"
              data-quiz-topic="${escapeHtml(topicLabel)}"
              data-quiz-collection-source="${escapeHtml(source.id)}"
              ${resumesDirectly ? 'data-quiz-resume-direct' : ''}>
              <span class="quiz-collection-option__eyebrow">Random session</span>
              <strong>${escapeHtml(mode.label)}</strong>
              <span>${mode.size} questions</span>
              <small>${escapeHtml(mode.description)}</small>
              ${renderSourceProgress(status)}
            </button>
          `
        }).join('')}
      </div>
    </article>
  `
}


function openQuiz(topicLabel, sourceId = 'current', event = null, launchOptions = {}) {
  const config = getQuizConfig(topicLabel, sourceId)
  if (!config || !config.mcqs.length) return

  const savedState = getSavedQuizState(topicLabel, config.id)
  const useSaved = Boolean(savedState)
  const resumeDirectly = Boolean(launchOptions.resumeDirectly && savedState && !savedState.completed)
  initializeQuiz(topicLabel, {
    sourceId: config.id,
    useSaved,
    fresh: false,
    shuffleQuestionsOverride: useSaved ? null : (launchOptions.shuffleQuestionsOverride ?? null),
    promptOnSaved: !resumeDirectly
  })

  if (launchOptions.restartTimer && !quizState.completed) {
    quizState.timerElapsedMs = 0
    quizState.timerEndsAt = quizState.timeLimitMinutes
      ? new Date(Date.now() + quizState.timeLimitMinutes * 60000).toISOString()
      : null
    quizState.timerStartedAt = quizState.timeLimitMinutes ? null : new Date().toISOString()
  }

  const modal = ensureQuizModal()
  const panel = modal.querySelector('.quiz-modal__panel')
  let resumedQuestion = null

  if (panel && !resumeDirectly) panel.scrollTop = 0

  if (resumeDirectly) {
    resumedQuestion = getFirstUnansweredQuestion()
    if (resumedQuestion) {
      quizState.index = getCurrentQuiz().findIndex((question) => question.id === resumedQuestion.id)
    }
  }

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    panel.style.transformOrigin = `${x}px ${y}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
  renderQuizMeta()
  renderQuizActions()

  if (quizState.showResumePrompt) {
    renderResumePrompt()
  } else if (quizState.completed) {
    renderQuizQuestion()
  } else {
    renderQuizQuestion()
  }
  if (quizState.showResumePrompt) {
    hideQuizTimer()
  } else {
    startQuizTimer()
  }
  updateQuizRobotCompactMode()

  if (resumeDirectly) {
    setTimeout(() => {
      if (resumedQuestion) {
        scrollToQuizQuestion(resumedQuestion.id)
        return
      }
      if (panel) panel.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }, 80)
  }
}

function closeQuiz() {
  const modal = ensureQuizModal()
  if (quizState.topicLabel && !quizState.completed && !quizState.showResumePrompt) {
    pauseQuizCountupTimer()
    saveQuizState()
  }
  modal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('panel-open')
  clearQuizTimerInterval()
  resetQuizRobotMood()
}

function ensurePdfPreviewModal() {
  let modal = document.getElementById('pdf-preview-modal')
  if (modal) return modal

  modal = document.createElement('div')
  modal.id = 'pdf-preview-modal'
  modal.className = 'pdf-preview-modal'
  modal.setAttribute('aria-hidden', 'true')
  modal.innerHTML = `
    <div class="pdf-preview-modal__backdrop" data-pdf-close></div>
    <section class="pdf-preview-modal__panel" role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title">
      <div class="pdf-preview-modal__top">
        <div>
          <p class="card__kicker">Compact PDF</p>
          <h2 id="pdf-preview-title">PDF preview</h2>
          <p class="pdf-preview-modal__meta">Preview opens inside the website.</p>
        </div>
        <button class="icon-button" type="button" data-pdf-close aria-label="Close PDF preview">X</button>
      </div>
      <div class="pdf-preview-frame-wrap">
        <iframe class="pdf-preview-frame" title="PDF preview" loading="lazy"></iframe>
      </div>
      <div class="pdf-preview-modal__actions">
        <a class="quiz-action" data-pdf-open target="_blank" rel="noopener noreferrer">Open PDF</a>
        <a class="quiz-action quiz-action--primary" data-pdf-download download>Download</a>
      </div>
    </section>
  `
  document.body.appendChild(modal)
  return modal
}

function openPdfPreview({ url, title, downloadUrl }, event = null) {
  if (!url) return

  const modal = ensurePdfPreviewModal()
  const panel = modal.querySelector('.pdf-preview-modal__panel')
  const heading = modal.querySelector('#pdf-preview-title')
  const frame = modal.querySelector('.pdf-preview-frame')
  const openLink = modal.querySelector('[data-pdf-open]')
  const downloadLink = modal.querySelector('[data-pdf-download]')

  if (event && event.clientX && event.clientY && panel) {
    const rect = panel.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    panel.style.transformOrigin = `${x}px ${y}px`
  } else if (panel) {
    panel.style.transformOrigin = 'center center'
  }

  heading.textContent = title || 'PDF preview'
  frame.src = url
  frame.title = title || 'PDF preview'
  openLink.href = url
  downloadLink.href = downloadUrl || url
  downloadLink.setAttribute('download', '')
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
}

function closePdfPreview() {
  const modal = ensurePdfPreviewModal()
  const frame = modal.querySelector('.pdf-preview-frame')
  modal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('panel-open')
  if (frame) frame.src = 'about:blank'
}

function handleQuizClick(event) {
  const topicCompletionInput = event.target.closest('[data-topic-completion]')
  if (topicCompletionInput) {
    const subjectCode = topicCompletionInput.dataset.subjectCode
    const topicLabel = topicCompletionInput.dataset.topicLabel
    const completionKey = topicCompletionInput.dataset.topicCompletion
    const state = getTopicCompletionState(subjectCode, topicLabel)
    state[completionKey] = !state[completionKey]

    saveTopicCompletionState(subjectCode, topicLabel, state)
    setActiveSubject(subjectCode, 'open')
    updateGlobalProgress()
    return
  }

  const breakdownCard = event.target.closest('[data-topic-breakdown-card]')
  const breakdownToggle = event.target.closest('[data-toggle-topic-breakdown]')
  const clickedInteractiveChild = event.target.closest('a, button, input, label, select, textarea')
  if (breakdownCard && (breakdownToggle || !clickedInteractiveChild)) {
    event.preventDefault()
    const subjectCode = breakdownCard.dataset.adminSubject
    const topicLabel = breakdownCard.dataset.adminTopic
    const key = getTopicBreakdownKey(subjectCode, topicLabel)
    const shouldExpand = !expandedTopicBreakdowns.has(key)
    if (shouldExpand) expandedTopicBreakdowns.add(key)
    else expandedTopicBreakdowns.delete(key)

    breakdownCard.classList.toggle('is-breakdown-expanded', shouldExpand)
    breakdownCard.setAttribute('aria-expanded', String(shouldExpand))
    const breakdown = breakdownCard.querySelector('.topic-breakdown')
    if (breakdown) breakdown.hidden = !shouldExpand
    const toggle = breakdownToggle || breakdownCard.querySelector('[data-toggle-topic-breakdown]')
    if (toggle) {
      const actionLabel = shouldExpand ? 'Hide topic resources' : 'Show topic resources'
      toggle.setAttribute('aria-expanded', String(shouldExpand))
      toggle.setAttribute('aria-label', actionLabel)
      toggle.setAttribute('title', actionLabel)
    }
    return
  }

  const pdfButton = event.target.closest('[data-pdf-preview]')
  if (pdfButton) {
    openPdfPreview({
      url: pdfButton.dataset.pdfPreview,
      title: pdfButton.dataset.pdfTitle,
      downloadUrl: pdfButton.dataset.pdfDownload
    }, event)
    return
  }

  if (event.target.closest('[data-pdf-close]')) {
    closePdfPreview()
    return
  }

  const sourcePickerBack = event.target.closest('[data-quiz-picker-back-source]')
  if (sourcePickerBack) {
    renderQuizSourcePicker(sourcePickerBack.dataset.quizTopic, event)
    return
  }

  const collectionBack = event.target.closest('[data-quiz-back-collection]')
  if (collectionBack) {
    const topicLabel = collectionBack.dataset.quizTopic || quizState.topicLabel
    const sourceId = collectionBack.dataset.quizCollectionSource || quizState.parentSourceId
    renderQuizCollectionPicker(topicLabel, sourceId, event)
    return
  }

  const groupButton = event.target.closest('[data-quiz-group]')
  if (groupButton) {
    renderQuizPartPicker(
      groupButton.dataset.quizTopic,
      groupButton.dataset.quizCollectionSource,
      groupButton.dataset.quizGroup,
      event
    )
    return
  }

  const partStartOverButton = event.target.closest('[data-quiz-part-start-over]')
  if (partStartOverButton) {
    const topicLabel = partStartOverButton.dataset.quizTopic
    const sourceId = partStartOverButton.dataset.quizPartStartOver
    const modal = ensureQuizModal()
    const shuffleToggle = modal.querySelector('[data-quiz-shuffle-toggle]')
    clearSavedQuizState(topicLabel, sourceId)
    openQuiz(topicLabel, sourceId, event, {
      shuffleQuestionsOverride: Boolean(shuffleToggle?.checked),
      restartTimer: true
    })
    return
  }

  const partButton = event.target.closest('[data-quiz-part]')
  if (partButton) {
    const modal = ensureQuizModal()
    const shuffleToggle = modal.querySelector('[data-quiz-shuffle-toggle]')
    openQuiz(partButton.dataset.quizTopic, partButton.dataset.quizPart, event, {
      shuffleQuestionsOverride: Boolean(shuffleToggle?.checked),
      resumeDirectly: partButton.hasAttribute('data-quiz-resume-direct')
    })
    return
  }

  const continueButton = event.target.closest('[data-quiz-continue-source]')
  if (continueButton) {
    openQuiz(continueButton.dataset.quizTopic, continueButton.dataset.quizContinueSource, event, {
      resumeDirectly: true
    })
    return
  }

  const mixedMenuButton = event.target.closest('[data-quiz-mixed-menu]')
  if (mixedMenuButton) {
    renderMixedPracticePicker(
      mixedMenuButton.dataset.quizTopic,
      mixedMenuButton.dataset.quizCollectionSource,
      event
    )
    return
  }

  const mixedSizeButton = event.target.closest('[data-quiz-mixed-size]')
  if (mixedSizeButton) {
    const topicLabel = mixedSizeButton.dataset.quizTopic
    const source = getQuizSource(topicLabel, mixedSizeButton.dataset.quizCollectionSource)
    const mode = source?.collection?.mixedSizes?.find((item) => item.size === Number(mixedSizeButton.dataset.quizMixedSize))
    if (source && mode) {
      const config = createMixedQuizConfig(topicLabel, source, mode)
      openQuiz(topicLabel, config.id, event, {
        resumeDirectly: mixedSizeButton.hasAttribute('data-quiz-resume-direct')
      })
    }
    return
  }

  const wrongReviewButton = event.target.closest('[data-quiz-wrong-review]')
  if (wrongReviewButton) {
    const topicLabel = wrongReviewButton.dataset.quizTopic || quizState.topicLabel
    const sourceId = wrongReviewButton.dataset.quizCollectionSource || quizState.parentSourceId
    const source = getQuizSource(topicLabel, sourceId)
    if (!source) return
    const config = createWrongReviewQuizConfig(topicLabel, source)
    if (config.mcqs.length) openQuiz(topicLabel, config.id, event)
    else renderQuizCollectionPicker(topicLabel, source.id, event)
    return
  }

  const sourceButton = event.target.closest('[data-quiz-source]')
  if (sourceButton) {
    const topicLabel = sourceButton.dataset.quizTopic
    const source = getQuizConfig(topicLabel, sourceButton.dataset.quizSource)
    if (source?.collection) renderQuizCollectionPicker(topicLabel, source.id, event)
    else {
      openQuiz(topicLabel, sourceButton.dataset.quizSource, event, {
        resumeDirectly: sourceButton.hasAttribute('data-quiz-resume-direct')
      })
    }
    return
  }

  const openButton = event.target.closest('[data-quiz-topic]')
  if (openButton) {
    const topicLabel = openButton.dataset.quizTopic
    const sources = getQuizSources(topicLabel)
    if (sources.length > 1 || shouldShowQuizSourcePicker(topicLabel)) {
      renderQuizSourcePicker(topicLabel, event)
    } else {
      openQuiz(topicLabel, sources[0]?.id || 'current', event)
    }
    return
  }

  if (event.target.closest('[data-quiz-close]')) {
    closeQuiz()
    return
  }

  if (event.target.closest('[data-quiz-resume]')) {
    quizState.showResumePrompt = false
    if (!quizState.timeLimitMinutes && !quizState.timerStartedAt) {
      quizState.timerStartedAt = new Date().toISOString()
    }
    const targetQuestion = getFirstUnansweredQuestion()
    if (targetQuestion) {
      quizState.index = getCurrentQuiz().findIndex((question) => question.id === targetQuestion.id)
      saveQuizState()
    }
    renderQuizQuestion()
    startQuizTimer()
    setTimeout(() => {
      if (targetQuestion) {
        scrollToQuizQuestion(targetQuestion.id)
        return
      }

      const modal = ensureQuizModal()
      const panel = modal.querySelector('.quiz-modal__panel')
      if (panel) panel.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
    }, 80)
    return
  }

  if (event.target.closest('[data-quiz-start-over]')) {
    const topicLabel = quizState.topicLabel
    const sourceId = quizState.sourceId
    clearSavedQuizState(topicLabel, sourceId)
    initializeQuiz(topicLabel, { sourceId, fresh: true })
    renderQuizQuestion()
    startQuizTimer()
    return
  }

  if (event.target.closest('[data-quiz-retake]')) {
    if (quizState.mode === 'wrong-review') {
      const source = getCurrentCollectionSource()
      if (source) {
        const config = createWrongReviewQuizConfig(quizState.topicLabel, source)
        if (config.mcqs.length) openQuiz(quizState.topicLabel, config.id, event, { restartTimer: true })
        else renderQuizCollectionPicker(quizState.topicLabel, source.id, event)
      }
      return
    }

    const topicLabel = quizState.topicLabel
    const sourceId = quizState.sourceId
    clearSavedQuizState(topicLabel, sourceId)
    initializeQuiz(topicLabel, { sourceId, fresh: true })
    renderQuizQuestion()
    startQuizTimer()
    return
  }

  if (event.target.closest('[data-quiz-next-part]')) {
    const nextPart = getNextCollectionPart()
    if (nextPart) openQuiz(quizState.topicLabel, nextPart.id, event)
    return
  }

  if (event.target.closest('[data-quiz-back-group]')) {
    const source = getCurrentCollectionSource()
    if (source && quizState.groupId) {
      renderQuizPartPicker(quizState.topicLabel, source.id, quizState.groupId, event)
    }
    return
  }

  if (event.target.closest('[data-quiz-submit]')) {
    const missedQuestions = getMissedQuestions()
    if (missedQuestions.length) {
      quizState.missingQuestionIds = missedQuestions.map((question) => question.id)
      quizState.index = getCurrentQuiz().findIndex((question) => question.id === missedQuestions[0].id)
      saveQuizState()
      renderQuizQuestion()
      scrollToQuizQuestion(missedQuestions[0].id)
      return
    }

    quizState.completed = true
    quizState.missingQuestionIds = []
    saveQuizState()
    renderQuizQuestion()
    updateQuizTimerDisplay()
    return
  }

  if (event.target.closest('[data-quiz-reset]')) {
    if (quizState.mode === 'wrong-review') {
      quizState.answers = {}
      quizState.index = 0
      quizState.completed = false
      quizState.missingQuestionIds = []
      saveQuizState()
      const source = getCurrentCollectionSource()
      if (source) {
        const config = createWrongReviewQuizConfig(quizState.topicLabel, source)
        if (config.mcqs.length) openQuiz(quizState.topicLabel, config.id, event, { restartTimer: true })
        else renderQuizCollectionPicker(quizState.topicLabel, source.id, event)
      }
      return
    }

    quizState.answers = {}
    quizState.index = 0
    quizState.completed = false
    quizState.missingQuestionIds = []
    clearSavedQuizState(quizState.topicLabel, quizState.sourceId)
    quizState.timerEndsAt = quizState.timeLimitMinutes
      ? new Date(Date.now() + quizState.timeLimitMinutes * 60000).toISOString()
      : null
    quizState.timerStartedAt = quizState.timeLimitMinutes ? null : new Date().toISOString()
    quizState.timerElapsedMs = 0
    saveQuizState()
    renderQuizQuestion()
    startQuizTimer()
    return
  }

  const answerButton = event.target.closest('[data-quiz-answer]')
  if (answerButton) {
    const selectedOptionId = answerButton.dataset.quizAnswer
    const question = getCurrentQuiz().find((item) => item.id === answerButton.dataset.quizQuestion) || getCurrentQuestion()
    if (!question || quizState.completed || quizState.showResumePrompt) return
    if (quizState.answers[question.id] !== undefined) return

    quizState.answers[question.id] = selectedOptionId
    quizState.missingQuestionIds = (quizState.missingQuestionIds || []).filter((questionId) => questionId !== question.id)
    saveQuizState()
    renderQuizQuestion()

    if (question.correctOptionId === selectedOptionId) {
      if (quizState.mode === 'wrong-review' && !quizState.masteredQuestionIds.includes(question.id)) {
        quizState.masteredQuestionIds.push(question.id)
        saveQuizState()
      }
      triggerCorrectAnswerCelebration()
      triggerQuizRobotMood('happy')
      scrollToNextQuizQuestion(question.id)
    } else {
      triggerQuizRobotMood('sad')
    }
  }
}

function renderSubjects() {
  const visibleSubjects = getFilteredSubjects()

  if (!visibleSubjects.length) {
    subjectList.innerHTML = '<div class="topic-empty topic-empty--panel">No subjects match the current filters.</div>'
    clearSubjectDetail()
    return
  }

  if (activeSubjectCode && !visibleSubjects.some((subject) => subject.code === activeSubjectCode)) {
    activeSubjectCode = null
    expandedSubjectCode = null
    clearSubjectDetail()
  }

  const subjectGridColumnCount = getSubjectGridColumnCount()
  const subjectCards = []

  visibleSubjects.forEach((subject, index) => {
    const percent = getPercent(subject)
    const isActive = subject.code === activeSubjectCode
    const isExpanded = subject.code === expandedSubjectCode
    const activeClass = isActive ? ' active' : ''
    const expandedClass = isExpanded ? ' expanded' : ''
    const unreadUpdateCount = getUnreadTopicUpdates(subject).length
    const updateNotice = unreadUpdateCount ? `
      <span class="subject-button__updates" aria-label="New topic added this university week">
        <span class="subject-button__updates-pulse" aria-hidden="true"></span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z"></path>
          <path d="M10 21h4"></path>
        </svg>
      </span>
    ` : ''

    subjectCards.push(`
      <div class="subject-row${expandedClass}" style="--delay: ${getFastStaggerDelay(index, 10, 90)}">
        <button class="subject-button${activeClass}" type="button" data-code="${subject.code}" aria-expanded="${isExpanded}">
          <span>
            <strong>${subject.code}</strong>
            <small>${subject.name}</small>
          </span>
          <span class="subject-button__meta">
            ${updateNotice}
            <span>${getCoveredCount(subject, getScopedProgressTopics(subject))}/${getProgressTotal(subject)}</span>
          </span>
          <span class="subject-button__bar" aria-hidden="true">
            <span style="width: ${percent}%"></span>
          </span>
        </button>
      </div>
    `)

    const isRowEnd = (index + 1) % subjectGridColumnCount === 0
    const isLastSubject = index === visibleSubjects.length - 1
    const rowStart = index - (index % subjectGridColumnCount)
    const rowSubjects = visibleSubjects.slice(rowStart, index + 1)
    const expandedSubjectInRow = rowSubjects.find((item) => item.code === expandedSubjectCode)

    if (expandedSubjectInRow && (isRowEnd || isLastSubject)) {
      subjectCards.push(renderSubjectInlineDetail(expandedSubjectInRow))
    }
  })

  subjectList.innerHTML = subjectCards.join('')
  bindSubjectButtons()
  bindSubjectTrackTabs(subjectList)
}

function clearSubjectDetail() {
  if (!selectedCode || !selectedName || !selectedCount || !selectedPercent || !progressFill || !topicList) return
  selectedCode.textContent = 'Tracker'
  selectedName.textContent = 'Choose a subject'
  selectedCount.textContent = 'Closed'
  selectedPercent.textContent = '0%'
  progressFill.style.width = '0%'
  if (subjectTrackTabs) subjectTrackTabs.innerHTML = ''
  topicList.innerHTML = '<li class="topic-empty">Click a subject card to view its topics.</li>'
}

function setActiveSubject(code, mobileMode = 'toggle') {
  const subject = subjects.find((item) => item.code === code) || subjects[0]
  const subjectChanged = activeSubjectCode !== subject.code
  if (subjectChanged && trackerAdminState.dirtyCollections.has(getAdminCollectionKey())) {
    window.alert('Save this arrangement before switching subjects.')
    return
  }
  if (subjectChanged) activeSubjectTrack = 'theoretical'
  updateTrackerUrl(subject.code)

  if (mobileQuery.matches) {
    const wasMobileRendered = Boolean(subjectList.querySelector('.subject-button'))
    if (mobileMode === 'open') {
      expandedSubjectCode = subject.code
    } else if (mobileMode === 'closed') {
      expandedSubjectCode = null
    } else {
      expandedSubjectCode = expandedSubjectCode === subject.code ? null : subject.code
    }
    activeSubjectCode = subject.code
    markSubjectUpdatesSeen(subject)
    if (wasMobileRendered) {
      updateMobileSubjectInlineDetail(subject)
    } else {
      renderSubjects()
    }
    renderTrackerAdminUi()
    return
  }

  activeSubjectCode = subject.code
  expandedSubjectCode = null
  const clearedUpdates = markSubjectUpdatesSeen(subject)

  if (clearedUpdates) {
    renderSubjects()
  }

  if (subjectChanged && !prefersReducedMotion) {
    subjectDetail?.classList.remove('subject-detail--entered')
    void subjectDetail?.offsetWidth
    subjectDetail?.classList.add('subject-detail--entered')
  }

  subjectList.querySelectorAll('.subject-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.code === subject.code)
    button.setAttribute('aria-expanded', 'false')
  })

  const percent = getPercent(subject)
  selectedCode.textContent = subject.code
  selectedName.textContent = subject.name
  selectedCount.textContent = getSubjectTrackCount(subject)
  selectedPercent.textContent = `${percent}%`
  if (subjectTrackTabs) {
    subjectTrackTabs.innerHTML = renderSubjectTrackTabs(subject)
    bindSubjectTrackTabs(subjectTrackTabs)
  }
  progressFill.style.width = '0%'
  if (prefersReducedMotion) {
    progressFill.style.width = `${percent}%`
  } else {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        progressFill.style.width = `${percent}%`
      })
    })
  }

  topicList.innerHTML = renderSubjectTrackList(subject)
  replayTrackerMotion(topicList, '.topic-section-heading, .topic-section-subheading, .topic-item')
  renderTrackerAdminUi()
}

function getTodayLabel() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date())
}

function getLocalDate(dateString) {
  return new Date(`${dateString}T00:00:00`)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatExamDate(dateString) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(getLocalDate(dateString))
}

function formatShortDate(dateLike) {
  const date = typeof dateLike === 'string' ? getLocalDate(dateLike) : dateLike
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function getExamCountdownText(daysUntil) {
  if (daysUntil > 1) return `${daysUntil} days left`
  if (daysUntil === 1) return '1 day left'
  if (daysUntil === 0) return 'Today'
  return 'Completed'
}

function render401ExamSchedule() {
  if (!examScheduleCards) return

  const activeExamSchedule = activeAcademicSectionData.midtermExamSchedule || []
  const today = new Date()
  const todayStart = startOfDay(today)
  const dayNum = today.getDate()
  const monthNum = today.getMonth() + 1
  const todayMarkerLabel = todayMarker?.querySelector('b')
  if (todayMarkerLabel) todayMarkerLabel.textContent = `${dayNum}/${monthNum}`

  const scheduleWithState = activeExamSchedule.map((exam) => {
    const examDate = getLocalDate(exam.date)
    const daysUntil = Math.ceil((examDate - todayStart) / 86400000)
    return { ...exam, examDate, daysUntil }
  })

  const nextExam = scheduleWithState.find((exam) => exam.daysUntil >= 0)

  if (nextExam) {
    if (nextCheckpoint) {
      nextCheckpoint.innerHTML = `<span class="checkpoint-code">${escapeHtml(nextExam.code)}</span><span class="checkpoint-meta">${escapeHtml(getExamCountdownText(nextExam.daysUntil))} - ${escapeHtml(formatExamDate(nextExam.date))}, ${escapeHtml(nextExam.time)}</span>`
    }
    if (next401Exam) {
      next401Exam.textContent = `Next ${activeAcademicSectionData.title} exam: ${nextExam.code} on ${formatExamDate(nextExam.date)}`
    }
    if (next401Countdown) {
      next401Countdown.textContent = `${getExamCountdownText(nextExam.daysUntil)} - ${nextExam.subjectName} at ${nextExam.time}.`
    }
  } else {
    if (nextCheckpoint) {
      nextCheckpoint.innerHTML = '<span class="checkpoint-code">Finals</span><span class="checkpoint-meta">Sep 19, 2026</span>'
    }
    if (next401Exam) next401Exam.textContent = `${activeAcademicSectionData.title} midterm schedule complete`
    if (next401Countdown) next401Countdown.textContent = `All listed ${activeAcademicSectionData.title} midterm exams have passed.`
  }

  examScheduleCards.innerHTML = scheduleWithState.map((exam) => {
    const isNext = nextExam?.code === exam.code
    const isDone = exam.daysUntil < 0
    const statusLabel = isNext ? getExamCountdownText(exam.daysUntil) : isDone ? 'Completed' : 'Upcoming'
    const stateClass = `${isNext ? ' exam-card--next' : ''}${isDone ? ' exam-card--done' : ''}`
    const cardContent = `
      <strong>${escapeHtml(exam.code)}</strong>
      <time datetime="${exam.date}T14:30">${formatShortDate(exam.date)}</time>
      <em>${escapeHtml(exam.time)}</em>
      ${exam.meta ? `<span class="exam-card__meta">${escapeHtml(exam.meta)}</span>` : ''}
      <small>${escapeHtml(statusLabel)}</small>
    `

    if (!exam.quizTopicKey) {
      return `
        <button class="exam-card${stateClass}" type="button" data-code="${exam.subjectCode}" aria-label="Open ${escapeHtml(exam.subjectName)} tracker">
          ${cardContent}
        </button>
      `
    }

    return `
      <article class="exam-card exam-card--has-action${stateClass}" data-code="${exam.subjectCode}">
        <button class="exam-card__tracker-action" type="button" aria-label="Open ${escapeHtml(exam.subjectName)} tracker"></button>
        ${cardContent}
        <button class="exam-card__quiz-action" type="button" data-quiz-topic="${escapeHtml(exam.quizTopicKey)}" aria-label="Open ${escapeHtml(exam.quizActionLabel || 'MCQs')} for ${escapeHtml(exam.subjectName)}">
          <svg class="exam-card__quiz-icon" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="3"></rect>
            <path d="m8 9 1.5 1.5L12 8"></path>
            <path d="M14 9h3"></path>
            <path d="m8 15 1.5 1.5L12 14"></path>
            <path d="M14 15h3"></path>
          </svg>
          <span>${escapeHtml(exam.quizActionLabel || 'MCQs')}</span>
        </button>
      </article>
    `
  }).join('')

  examScheduleCards.querySelectorAll('.exam-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-quiz-topic]')) {
        return
      }
      setActiveSubject(card.dataset.code, 'open')
    })
  })
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getTimelinePercent(date, startDate, endDate) {
  const start = startDate.getTime()
  const end = endDate.getTime()
  return clamp(((date.getTime() - start) / (end - start)) * 100, 0, 100)
}

function formatTimelineDate(date) {
  return formatShortDate(date)
}

function renderSemesterTimeline() {
  if (!semesterFill || !todayMarker || !midtermMarker || !finalsMarker) return

  const today = new Date()
  const semesterStart = new Date('2026-05-25T00:00:00')
  const activeExamSchedule = activeAcademicSectionData.midtermExamSchedule || []
  const midtermExam = activeExamSchedule.find((exam) => exam.type !== 'quiz') || activeExamSchedule[0]
  const midterm = midtermExam ? getLocalDate(midtermExam.date) : new Date('2026-07-22T00:00:00')
  const finals = new Date('2026-09-19T00:00:00')
  const todayPercent = getTimelinePercent(today, semesterStart, finals)
  const midtermPercent = getTimelinePercent(midterm, semesterStart, finals)

  const shouldAnimateTimeline = !prefersReducedMotion && !semesterFill.dataset.motionPlayed
  const raceTrack = semesterFill.closest('.race-track')
  if (shouldAnimateTimeline) {
    semesterFill.dataset.motionPlayed = 'true'
    raceTrack?.classList.add('race-track--motion')
    semesterFill.style.width = '0%'
    todayMarker.style.left = '0%'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        semesterFill.style.width = `${todayPercent}%`
        todayMarker.style.left = `${todayPercent}%`
      })
    })
  } else {
    semesterFill.style.width = `${todayPercent}%`
    todayMarker.style.left = `${todayPercent}%`
  }
  midtermMarker.style.left = `${midtermPercent}%`
  finalsMarker.style.left = '100%'

  const midtermLabel = midtermMarker.querySelector('b')
  const midtermDateLabel = midtermMarker.querySelector('time')
  const finalsLabel = finalsMarker.querySelector('b')
  const finalsDateLabel = finalsMarker.querySelector('time')
  if (midtermLabel) midtermLabel.textContent = 'Midterm'
  if (midtermDateLabel) {
    midtermDateLabel.dateTime = midterm.toISOString().slice(0, 10)
    midtermDateLabel.textContent = formatShortDate(midterm)
  }
  if (finalsLabel) finalsLabel.textContent = 'Finals'
  if (finalsDateLabel) {
    finalsDateLabel.dateTime = finals.toISOString().slice(0, 10)
    finalsDateLabel.textContent = formatShortDate(finals)
  }

  if (semesterDateScale) {
    const ticks = [
      { label: 'Start', date: semesterStart },
      { label: 'Midterm', date: midterm },
      { label: 'Finals', date: finals }
    ]

    semesterDateScale.innerHTML = ticks.map((tick) => {
      const percent = getTimelinePercent(tick.date, semesterStart, finals)
      const isoDate = tick.date.toISOString().slice(0, 10)

      return `
        <span class="semester-date-scale__tick" style="left: ${percent}%">
          <i aria-hidden="true"></i>
          <strong>${tick.label}</strong>
          <time datetime="${isoDate}">${formatTimelineDate(tick.date)}</time>
        </span>
      `
    }).join('')
  }

  if (nextCheckpoint) {
    const nextExam = activeExamSchedule
      .map((exam) => {
        const examDate = getLocalDate(exam.date)
        return {
          ...exam,
          daysUntil: Math.ceil((examDate - startOfDay(today)) / 86400000)
        }
      })
      .find((exam) => exam.daysUntil >= 0)

    nextCheckpoint.innerHTML = nextExam
      ? `<span class="checkpoint-code">${escapeHtml(nextExam.code)}</span><span class="checkpoint-meta">${escapeHtml(getExamCountdownText(nextExam.daysUntil))} - ${escapeHtml(formatExamDate(nextExam.date))}, ${escapeHtml(nextExam.time)}</span>`
      : '<span class="checkpoint-code">Finals</span><span class="checkpoint-meta">Sep 19, 2026</span>'
  }
}

function renderAssignmentProgress() {
  const items = document.querySelectorAll('[data-assignment-progress], [data-deadline-progress]')
  if (!items.length) return

  items.forEach((progress) => {
    const startDate = getLocalDate(progress.dataset.startDate)
    const dueDate = getLocalDate(progress.dataset.dueDate)
    const dueLabel = progress.dataset.dueLabel || formatExamDate(progress.dataset.dueDate)
    const today = new Date()
    const fill = progress.querySelector('[data-assignment-fill], [data-deadline-fill]')
    const daysLabel = progress.querySelector('[data-assignment-days], [data-deadline-days]')
    const caption = progress.querySelector('[data-assignment-caption], [data-deadline-caption]')

    const totalMs = dueDate - startDate
    const elapsedMs = today - startDate
    const percent = clamp((elapsedMs / totalMs) * 100, 0, 100)
    const displayPercent = progress.dataset.progressMode === 'remaining' ? 100 - percent : percent

    const daysLeft = Math.ceil((dueDate - today) / 86400000)

    if (fill) fill.style.width = `${displayPercent}%`

    if (daysLabel) {
      if (daysLeft > 1) {
        daysLabel.textContent = `${daysLeft} days left`
      } else if (daysLeft === 1) {
        daysLabel.textContent = '1 day left'
      } else if (daysLeft === 0) {
        daysLabel.textContent = 'Due today'
      } else {
        daysLabel.textContent = 'Deadline passed'
      }
    }

    if (caption) {
      caption.textContent = `Due ${dueLabel} - ${Math.round(percent)}% of the window has passed.`
    }
  })
}

function minutesFromTime(value) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function formatScheduleTime(start, end) {
  const formatOne = (value) => {
    const [hourValue, minuteValue] = value.split(':').map(Number)
    const suffix = hourValue >= 12 ? 'PM' : 'AM'
    const hour = hourValue % 12 || 12
    return `${hour}:${String(minuteValue).padStart(2, '0')} ${suffix}`
  }

  return `${formatOne(start)} - ${formatOne(end)}`
}

function getScheduleStatus(item, now = new Date()) {
  if (item.day !== now.getDay()) return 'upcoming'

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = minutesFromTime(item.start)
  const endMinutes = minutesFromTime(item.end)

  if (currentMinutes < startMinutes) return 'upcoming'
  if (currentMinutes >= endMinutes) return 'done'
  return 'now'
}

function getScheduleProgress(item, now = new Date()) {
  const startMinutes = minutesFromTime(item.start)
  const endMinutes = minutesFromTime(item.end)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const durationMinutes = endMinutes - startMinutes
  if (durationMinutes <= 0) return { percent: 0, remainingMinutes: 0 }

  const elapsedMinutes = Math.max(0, Math.min(durationMinutes, currentMinutes - startMinutes))
  const remainingMinutes = Math.max(0, endMinutes - currentMinutes)

  return {
    percent: Math.round((elapsedMinutes / durationMinutes) * 100),
    remainingMinutes
  }
}

function renderScheduleProgress(item, now = new Date(), modifierClass = '') {
  if (getScheduleStatus(item, now) !== 'now') return ''

  const { percent, remainingMinutes } = getScheduleProgress(item, now)
  const label = remainingMinutes <= 1 ? 'ending now' : `${remainingMinutes} min left`
  const className = ['schedule-progress', modifierClass].filter(Boolean).join(' ')

  return `
    <div class="${className}" aria-label="${escapeHtml(`${percent}% done, ${label}`)}">
      <div class="schedule-progress__track">
        <span style="width: ${percent}%;"></span>
      </div>
      <div class="schedule-progress__label">
        <span>${escapeHtml(`${percent}% done`)}</span>
        <strong>${escapeHtml(label)}</strong>
      </div>
    </div>
  `
}

function minutesUntilNext(item, now = new Date()) {
  const today = now.getDay()
  const startMinutes = minutesFromTime(item.start)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const dayDelta = (item.day - today + 7) % 7

  if (dayDelta === 0 && startMinutes > currentMinutes) {
    return startMinutes - currentMinutes
  }

  return dayDelta * 24 * 60 + startMinutes - currentMinutes
}

function getNextScheduleItem(items, now = new Date()) {
  return [...items]
    .map((item) => ({ ...item, waitMinutes: minutesUntilNext(item, now) }))
    .filter((item) => item.waitMinutes > 0)
    .sort((a, b) => a.waitMinutes - b.waitMinutes)[0] || null
}

function formatWait(minutes) {
  if (minutes < 60) return `starts in ${minutes} min`
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0 && hours > 0) return `starts in ${days}d ${hours}h`
  if (days > 0) return `starts in ${days} day${days > 1 ? 's' : ''}`
  return `starts in ${hours}h`
}

function getScheduleIcon(icon) {
  const icons = {
    stethoscope: '+',
    microscope: 'ONC',
    scalpel: 'SUR',
    case: 'MED',
    clinical: 'CR',
    syringe: 'AN',
    nutrition: 'NUT',
    lab: 'LAB'
  }

  return icons[icon] || '401'
}

function renderScheduleCard(item, now = new Date(), options = {}) {
  const status = options.status || getScheduleStatus(item, now)
  const typeLabel = item.type === 'round' ? 'Clinical round' : 'Lecture'
  const roomMarkup = item.room ? `<span>${escapeHtml(item.room)}</span>` : ''
  const statusLabel = status === 'now' ? 'Now' : status === 'done' ? 'Finished' : 'Upcoming'

  return `
    <article class="schedule-card schedule-card--${status}">
      <div class="schedule-card__icon" aria-hidden="true">${escapeHtml(getScheduleIcon(item.icon))}</div>
      <div class="schedule-card__body">
        <div class="schedule-card__meta">
          <span>${escapeHtml(typeLabel)}</span>
          <span>${escapeHtml(item.dayLabel)}</span>
          ${roomMarkup}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(formatScheduleTime(item.start, item.end))}</p>
        ${renderScheduleProgress(item, now)}
      </div>
      <span class="schedule-card__status">${escapeHtml(statusLabel)}</span>
    </article>
  `
}

function renderScheduleGroup(items, day, now = new Date()) {
  const dayItems = items
    .filter((item) => item.day === day.day)
    .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start) || (a.room || '').localeCompare(b.room || ''))

  if (!dayItems.length) return ''

  const isToday = day.day === now.getDay()

  return `
    <section class="schedule-day ${isToday ? 'schedule-day--today' : ''}" aria-label="${escapeHtml(day.label)} schedule">
      <div class="schedule-day__top">
        <h3>${escapeHtml(day.label)}</h3>
        ${isToday ? '<span>Today</span>' : ''}
      </div>
      <div class="schedule-card-stack">
        ${dayItems.map((item) => renderScheduleCard(item, now)).join('')}
      </div>
    </section>
  `
}

function formatScheduleHour(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const label = hour % 12 || 12
  return `${label} ${suffix}`
}

function getCalendarBounds(items) {
  const starts = items.map((item) => minutesFromTime(item.start))
  const ends = items.map((item) => minutesFromTime(item.end))
  const startHour = Math.floor(Math.min(...starts) / 60)
  const endHour = Math.ceil(Math.max(...ends) / 60)

  return {
    startMinutes: startHour * 60,
    endMinutes: endHour * 60,
    hours: Array.from({ length: endHour - startHour + 1 }, (_, index) => startHour + index)
  }
}

function getScheduleLane(item, dayItems) {
  const itemStart = minutesFromTime(item.start)
  const itemEnd = minutesFromTime(item.end)
  const overlapping = dayItems
    .filter((candidate) => {
      const candidateStart = minutesFromTime(candidate.start)
      const candidateEnd = minutesFromTime(candidate.end)
      return itemStart < candidateEnd && itemEnd > candidateStart
    })
    .sort((a, b) => {
      const roomSort = (a.room || '').localeCompare(b.room || '')
      if (roomSort) return roomSort
      return a.title.localeCompare(b.title)
    })

  return {
    lane: Math.max(0, overlapping.indexOf(item)),
    laneCount: Math.max(1, overlapping.length)
  }
}

function renderScheduleCalendarEvent(item, dayItems, bounds, now = new Date()) {
  const startMinutes = minutesFromTime(item.start)
  const endMinutes = minutesFromTime(item.end)
  const totalMinutes = bounds.endMinutes - bounds.startMinutes
  const top = ((startMinutes - bounds.startMinutes) / totalMinutes) * 100
  const height = ((endMinutes - startMinutes) / totalMinutes) * 100
  const { lane, laneCount } = getScheduleLane(item, dayItems)
  const gap = laneCount > 1 ? 1.5 : 0
  const width = 100 / laneCount
  const left = lane * width
  const status = getScheduleStatus(item, now)
  const typeLabel = item.type === 'round' ? 'Round' : 'Lecture'
  const roomMarkup = item.room ? `<span class="schedule-calendar-event__room">${escapeHtml(item.room)}</span>` : ''

  return `
    <article
      class="schedule-calendar-event schedule-calendar-event--${escapeHtml(item.type)} schedule-calendar-event--${escapeHtml(status)}"
      style="--event-top: ${top}%; --event-height: ${height}%; --event-left: calc(${left}% + ${gap}px); --event-width: calc(${width}% - ${gap * 2}px);"
      aria-label="${escapeHtml(item.title)}, ${escapeHtml(formatScheduleTime(item.start, item.end))}"
    >
      <div class="schedule-calendar-event__top">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(typeLabel)}</span>
      </div>
      <p>${escapeHtml(formatScheduleTime(item.start, item.end))}</p>
      ${roomMarkup}
      ${renderScheduleProgress(item, now, 'schedule-progress--calendar')}
    </article>
  `
}

function renderScheduleCalendar(now = new Date()) {
  const activeCourseSchedule = activeAcademicSectionData.courseSchedule || []
  if (!activeCourseSchedule.length) return '<p class="empty-state">No weekly schedule has been added for this section yet.</p>'

  const bounds = getCalendarBounds(activeCourseSchedule)
  const hourCount = bounds.hours.length - 1

  const dayHeaders = scheduleDayOrder.map((day) => {
    const isToday = day.day === now.getDay()
    return `
      <div class="schedule-calendar__day-head ${isToday ? 'schedule-calendar__day-head--today' : ''}">
        <span>${escapeHtml(day.label.slice(0, 3))}</span>
        <strong>${escapeHtml(day.label)}</strong>
      </div>
    `
  }).join('')

  const hourLabels = bounds.hours.map((hour) => `
    <div class="schedule-calendar__hour-label">${escapeHtml(formatScheduleHour(hour))}</div>
  `).join('')

  const dayColumns = scheduleDayOrder.map((day) => {
    const dayItems = activeCourseSchedule
      .filter((item) => item.day === day.day)
      .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start) || (a.room || '').localeCompare(b.room || ''))
    const isToday = day.day === now.getDay()

    return `
      <div class="schedule-calendar__day ${isToday ? 'schedule-calendar__day--today' : ''}" aria-label="${escapeHtml(day.label)} calendar column">
        <div class="schedule-calendar__hour-lines" aria-hidden="true">
          ${Array.from({ length: hourCount }, () => '<span></span>').join('')}
        </div>
        ${dayItems.map((item) => renderScheduleCalendarEvent(item, dayItems, bounds, now)).join('')}
      </div>
    `
  }).join('')

  return `
    <div class="schedule-calendar__scroller">
      <div class="schedule-calendar__frame" style="--hour-count: ${hourCount};">
        <div class="schedule-calendar__corner" aria-hidden="true"></div>
        ${dayHeaders}
        <div class="schedule-calendar__hours" aria-hidden="true">${hourLabels}</div>
        ${dayColumns}
      </div>
    </div>
  `
}

function renderSchedulePage() {
  if (!scheduleTodayTitle && !scheduleTodaySummary && !scheduleNextCard && !scheduleTodayList && !scheduleCalendarGrid && !scheduleList) return

  const now = new Date()
  const activeCourseSchedule = activeAcademicSectionData.courseSchedule || []
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const todayItems = activeCourseSchedule
    .filter((item) => item.day === now.getDay())
    .sort((a, b) => minutesFromTime(a.start) - minutesFromTime(b.start) || (a.room || '').localeCompare(b.room || ''))
  const currentItem = todayItems.find((item) => getScheduleStatus(item, now) === 'now')
  const nextItem = getNextScheduleItem(activeCourseSchedule, now)

  if (scheduleTodayTitle) scheduleTodayTitle.textContent = `Today is ${todayName}`
  if (scheduleTodaySummary) {
    if (currentItem) {
      scheduleTodaySummary.textContent = `${currentItem.title} is happening now until ${formatScheduleTime(currentItem.start, currentItem.end).split(' - ')[1]}.`
    } else if (nextItem) {
      const nextPrefix = nextItem.day === now.getDay() ? 'Next today' : `Next on ${nextItem.dayLabel}`
      scheduleTodaySummary.textContent = `${nextPrefix}: ${nextItem.title} at ${formatScheduleTime(nextItem.start, nextItem.end).split(' - ')[0]}.`
    } else {
      scheduleTodaySummary.textContent = activeCourseSchedule.length
        ? 'No upcoming university items found in the weekly schedule.'
        : `No weekly ${activeAcademicSectionData.title} schedule has been added yet.`
    }
  }

  if (scheduleNextCard) {
    scheduleNextCard.innerHTML = currentItem
      ? renderScheduleCard(currentItem, now, { status: 'now' })
      : nextItem
        ? `${renderScheduleCard(nextItem, now)}<p class="schedule-next-card__wait">${escapeHtml(formatWait(nextItem.waitMinutes))}</p>`
        : `<p class="empty-state">No upcoming ${activeAcademicSectionData.title} schedule item.</p>`
  }

  if (scheduleTodayList) {
    scheduleTodayList.innerHTML = todayItems.length
      ? todayItems.map((item) => renderScheduleCard(item, now)).join('')
      : `<p class="empty-state">No ${activeAcademicSectionData.title} lectures or clinical rounds scheduled for today.</p>`
  }

  if (scheduleCalendarGrid) scheduleCalendarGrid.innerHTML = renderScheduleCalendar(now)

  if (scheduleList) {
    scheduleList.innerHTML = scheduleDayOrder
      .map((day) => renderScheduleGroup(activeCourseSchedule, day, now))
      .join('')
  }
}

function handleBookingSubmit(event) {
  event.preventDefault()

  const name = bookingName.value.trim()
  const service = bookingService.value
  const time = bookingTime.value

  if (!name || !service || !time) return

  const message = [
    'Hi Ahmed, I want to book a call.',
    `Name: ${name}`,
    `Service: ${service}`,
    `Preferred time: ${getTodayLabel()} at ${time}`
  ].join('\n')

  window.location.href = `https://wa.me/201030469634?text=${encodeURIComponent(message)}`
}

function getFormValue(name) {
  return historyForm?.elements[name]?.value?.trim() || ''
}

function getCheckedField(name, label) {
  return historyForm?.elements[name]?.checked ? label : ''
}

function clearPanelFields(panel) {
  panel?.querySelectorAll('input, select, textarea').forEach((field) => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = false
    } else {
      field.value = ''
    }
  })
}

function calculateAgeFromDob(dobValue) {
  if (!dobValue) return ''

  const dob = new Date(`${dobValue}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age >= 0 ? `${age} years` : ''
}

function joinFilled(items, fallback = 'Not recorded') {
  const filled = items.filter(Boolean)
  return filled.length ? filled.join(', ') : fallback
}

function getSmokingDetails() {
  if (!historyForm?.elements.smoking?.checked) return ''

  const details = [
    getFormValue('smokingType'),
    getFormValue('cigarettesPerDay') ? `${getFormValue('cigarettesPerDay')} cigarettes/day` : '',
    getFormValue('smokingDuration') ? `for ${getFormValue('smokingDuration')}` : ''
  ].filter(Boolean)

  return details.length ? `smoking (${details.join(', ')})` : 'smoking'
}

function getSubstanceDetails() {
  if (!historyForm?.elements.substance?.checked) return ''

  const type = getFormValue('substanceType') === 'Other'
    ? getFormValue('substanceOther') || 'other substance'
    : getFormValue('substanceType')

  return type ? `substance use (${type})` : 'substance use'
}

function renderHistorySummary() {
  if (!historyForm || !historySummaryText) return

  const age = getFormValue('ageManual') || calculateAgeFromDob(getFormValue('dob'))
  const chronicDiseases = joinFilled([
    getCheckedField('hypertension', 'hypertension'),
    getCheckedField('diabetes', 'diabetes mellitus'),
    getCheckedField('cardiac', 'cardiac disease'),
    getCheckedField('renal', 'renal disease'),
    getCheckedField('hepatic', 'hepatic disease'),
    getCheckedField('asthma', 'asthma/COPD')
  ], 'No selected chronic disease')
  const habits = joinFilled([
    getSmokingDetails(),
    getCheckedField('alcohol', 'alcohol use'),
    getSubstanceDetails(),
    getCheckedField('occupationalExposure', 'occupational exposure')
  ], 'No selected special habit')

  const identityLine = [
    getFormValue('patientName') || 'Patient',
    age,
    getFormValue('sex'),
    getFormValue('occupation') ? `works as ${getFormValue('occupation')}` : '',
    getFormValue('residence') ? `from ${getFormValue('residence')}` : ''
  ].filter(Boolean).join(', ')

  const painAnalysis = [
    getFormValue('site') && `site: ${getFormValue('site')}`,
    getFormValue('painOnset') && `onset: ${getFormValue('painOnset')}`,
    getFormValue('character') && `character: ${getFormValue('character')}`,
    getFormValue('radiation') && `radiation: ${getFormValue('radiation')}`,
    getFormValue('associations') && `associations: ${getFormValue('associations')}`,
    getFormValue('timing') && `timing: ${getFormValue('timing')}`,
    getFormValue('exacerbating') && `exacerbating: ${getFormValue('exacerbating')}`,
    getFormValue('relieving') && `relieving: ${getFormValue('relieving')}`,
    getFormValue('severity') && `severity: ${getFormValue('severity')}`
  ].filter(Boolean).join('; ')

  const lines = [
    identityLine || 'Patient identity not recorded.',
    getFormValue('complaint')
      ? `Chief complaint: ${getFormValue('complaint')}${getFormValue('duration') ? ` for ${getFormValue('duration')}` : ''}.`
      : 'Chief complaint: not recorded.',
    getFormValue('onset') ? `Mode of onset: ${getFormValue('onset')}.` : '',
    getFormValue('hpi') ? `History of present illness: ${getFormValue('hpi')}` : '',
    painAnalysis ? `Focused symptom analysis: ${painAnalysis}.` : '',
    `Past medical history: ${chronicDiseases}. ${getFormValue('pastHistory')}`,
    getFormValue('surgicalHistory') ? `Surgical history: ${getFormValue('surgicalHistory')}` : '',
    getFormValue('drugHistory') ? `Drug history: ${getFormValue('drugHistory')}` : 'Drug history: not recorded.',
    getFormValue('allergies') ? `Allergies: ${getFormValue('allergies')}` : 'Allergies: not recorded.',
    getFormValue('vaccination') ? `Vaccination history: ${getFormValue('vaccination')}` : '',
    getFormValue('familyHistory') ? `Family history: ${getFormValue('familyHistory')}` : '',
    `Social and special habits: ${habits}. ${getFormValue('socialHistory')}`,
    getFormValue('ros') ? `Review of systems: ${getFormValue('ros')}` : ''
  ].filter(Boolean)

  historySummaryText.textContent = lines.join('\n\n')
}

function updateHistoryProgress() {
  if (!historyForm || !historyProgressCount || !historyProgressFill) return

  const checks = [...historyForm.querySelectorAll('[data-history-check]')]
  const completed = checks.filter((check) => check.checked).length
  const total = checks.length
  const percent = total ? Math.round((completed / total) * 100) : 0

  historyProgressCount.textContent = `${completed} / ${total}`
  historyProgressFill.style.width = `${percent}%`
}

function handleHistoryInput(event) {
  syncHistoryAge(event)
  toggleHistoryConditionalSections()
  updateHistoryProgress()
  renderHistorySummary()
}

function syncHistoryAge(event) {
  if (!historyForm) return

  const dobField = historyForm.elements.dob
  const ageField = historyForm.elements.ageManual
  if (!dobField || !ageField || event?.target !== dobField) return

  const calculatedAge = calculateAgeFromDob(dobField.value)
  if (calculatedAge) {
    ageField.value = calculatedAge
  }
}

function toggleHistoryConditionalSections() {
  if (!historyForm) return

  const smokingChecked = Boolean(historyForm.elements.smoking?.checked)
  const substanceChecked = Boolean(historyForm.elements.substance?.checked)
  const substanceIsOther = getFormValue('substanceType') === 'Other'

  if (smokingDetails) {
    if (!smokingChecked && !smokingDetails.hidden) clearPanelFields(smokingDetails)
    smokingDetails.hidden = !smokingChecked
  }

  if (substanceDetails) {
    if (!substanceChecked && !substanceDetails.hidden) clearPanelFields(substanceDetails)
    substanceDetails.hidden = !substanceChecked
  }

  if (substanceOtherField) {
    if (!substanceIsOther && !substanceOtherField.hidden) clearPanelFields(substanceOtherField)
    substanceOtherField.hidden = !substanceChecked || !substanceIsOther
  }
}

function getNewsCardId(card) {
  const title = card.querySelector('h2')?.textContent?.trim() || 'news'
  return card.dataset.newsId || `${card.dataset.course || 'all'}::${card.dataset.date || ''}::${title}`
}

function getNewsSeenCards() {
  try {
    return new Set(JSON.parse(localStorage.getItem(NEWS_SEEN_STORAGE_KEY) || '[]'))
  } catch {
    localStorage.removeItem(NEWS_SEEN_STORAGE_KEY)
    return new Set()
  }
}

function getNewsExpiryDate(card) {
  if (!card.dataset.date) return null
  const expiry = new Date(`${card.dataset.date}T00:00:00`)
  if (!Number.isFinite(expiry.getTime())) return null
  expiry.setHours(expiry.getHours() + NEWS_EXPIRY_HOURS)
  return expiry
}

function isNewsCardExpired(card, now = new Date()) {
  if (card.dataset.persistent === 'true') return false
  const expiry = getNewsExpiryDate(card)
  return expiry ? now >= expiry : false
}

function renderNewsNavBadge(cards = []) {
  if (!newsNavLinks.length) return

  newsNavLinks.forEach((link) => {
    link.querySelector('.site-nav__badge')?.remove()
    link.classList.remove('site-nav__link--has-news')
  })

  const unreadCount = cards.filter((card) => {
    const cardSection = card.dataset.section || '401'
    return cardSection === activeAcademicSection && card.dataset.published === 'true' && isCurrentWeekDate(card.dataset.createdAt) && !isNewsCardExpired(card)
  }).length
  if (!unreadCount) return

  newsNavLinks.forEach((link) => {
    link.classList.add('site-nav__link--has-news')
    link.insertAdjacentHTML('beforeend', `
      <span class="site-nav__badge" aria-label="New news published this university week">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z"></path>
          <path d="M10 21h4"></path>
        </svg>
      </span>
    `)
  })
}

function markNewsCardsSeen(cards = []) {
  if (!cards.length) return
  const seenCards = getNewsSeenCards()
  cards
    .filter((card) => (card.dataset.section || '401') === activeAcademicSection && !isNewsCardExpired(card))
    .forEach((card) => seenCards.add(getNewsCardId(card)))
  try {
    localStorage.setItem(NEWS_SEEN_STORAGE_KEY, JSON.stringify([...seenCards]))
  } catch {
    // Keep the page usable when browser storage is blocked.
  }
}

function ensureSectionNewsCard() {
  if (newsCardsState.remoteSections.has(activeAcademicSection)) return
  if (!newsFeed || activeAcademicSection !== '402') return
  if (newsFeed.querySelector('[data-news-id="402-tracker-launch"]')) return

  const card = document.createElement('article')
  card.className = 'update-panel update-panel--primary update-panel--wide'
  card.dataset.newsId = '402-tracker-launch'
  card.dataset.section = '402'
  card.dataset.course = 'all'
  card.dataset.date = '2026-07-06'
  card.dataset.priority = '1'
  card.dataset.persistent = 'true'
  card.innerHTML = `
    <div class="update-panel__top">
      <p class="card__kicker">402</p>
      <span class="status-pill status-pill--open">Now</span>
    </div>
    <h2>MED 402 tracker shell is live locally</h2>
    <p>The 402 hub now tracks covered Weekly Reports topics. Midterm badges are hidden until the scope is confirmed, and MCQs are not active until answer-key-backed sources are added.</p>
    <dl class="update-facts update-facts--three">
      <div><dt>Source</dt><dd>Weekly Reports Weeks 1-6</dd></div>
      <div><dt>Midterm</dt><dd>Not confirmed yet</dd></div>
      <div><dt>MCQs</dt><dd>Pending answer keys</dd></div>
    </dl>
  `
  newsFeed.prepend(card)
}

function getNewsRows(section = activeAcademicSection) {
  return newsCardsState.rowsBySection.get(section) || []
}

function isNewsAdminForSection(section = activeAcademicSection) {
  return isTrackerAdmin() && String(trackerAdminState.profile?.allowed_section || '') === String(section)
}

function getSafeExternalUrl(value = '') {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : ''
  } catch {
    return ''
  }
}

function getNewsTagClass(tag = '') {
  const normalized = tag.toLowerCase()
  if (normalized.includes('exam')) return 'exam'
  if (normalized.includes('schedule')) return 'schedule'
  if (normalized.includes('resource') || normalized.includes('tracker')) return 'resource'
  return 'assignment'
}

function renderNewsAdminToolbar() {
  if (newsAdminToolbar) newsAdminToolbar.hidden = !isNewsAdminForSection()
}

function renderRemoteNewsCard(row) {
  const card = document.createElement('article')
  const pinned = row.card_group === 'pinned'
  card.className = `update-panel${pinned ? ' update-panel--primary' : ''}${row.is_wide ? ' update-panel--wide' : ''}${row.published ? '' : ' news-card--draft'}`
  card.dataset.newsId = row.id
  card.dataset.section = row.section
  card.dataset.course = row.course || 'all'
  card.dataset.date = row.card_date || ''
  card.dataset.group = row.card_group || 'regular'
  card.dataset.persistent = String(pinned)
  card.dataset.order = String(row.display_order ?? 0)
  card.dataset.published = String(Boolean(row.published))
  card.dataset.createdAt = row.created_at || ''
  card.dir = row.text_direction === 'rtl' ? 'rtl' : 'ltr'

  const facts = Array.isArray(row.facts) ? row.facts.filter((fact) => fact?.label && fact?.value) : []
  const paragraphs = String(row.body || '').split(/\n{2,}/).filter(Boolean)
  const groupRows = getNewsRows(row.section).filter((item) => item.card_group === row.card_group)
  const groupIndex = groupRows.findIndex((item) => item.id === row.id)
  const body = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`).join('')
  const factsHtml = facts.length ? `<dl class="update-facts${facts.length === 3 ? ' update-facts--three' : ''}">${facts.map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`).join('')}</dl>` : ''
  const safeActionUrl = getSafeExternalUrl(row.action_url)
  const action = safeActionUrl && row.action_label ? `<a class="news-action" href="${escapeHtml(safeActionUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.action_label)}</a>` : ''
  const deadline = row.deadline_start && row.deadline_due ? `<div class="assignment-progress assignment-progress--top" data-deadline-progress data-progress-mode="remaining" data-start-date="${escapeHtml(row.deadline_start)}" data-due-date="${escapeHtml(row.deadline_due)}" data-due-label="${escapeHtml(row.deadline_label || row.deadline_due)}"><div class="assignment-progress__top"><strong data-deadline-days>${escapeHtml(row.deadline_label || row.deadline_due)}</strong></div><div class="assignment-progress__bar" aria-hidden="true"><span data-deadline-fill></span></div></div>` : ''
  const adminControls = isNewsAdminForSection(row.section) ? `<div class="news-admin-card-controls"><button type="button" data-news-move="up" aria-label="Move up" ${groupIndex <= 0 ? 'disabled' : ''}>↑</button><button type="button" data-news-move="down" aria-label="Move down" ${groupIndex >= groupRows.length - 1 ? 'disabled' : ''}>↓</button><button type="button" data-news-toggle-pin>${pinned ? 'Unpin' : 'Pin'}</button><button type="button" data-news-toggle-publish>${row.published ? 'Unpublish' : 'Publish'}</button><button type="button" data-news-edit>Edit</button><button type="button" data-news-delete>Delete</button></div>` : ''

  card.innerHTML = `${adminControls}${deadline}<div class="update-panel__top"><p class="card__kicker">${escapeHtml(row.kicker || row.course || '')}</p>${row.tag ? `<span class="news-tag news-tag--${getNewsTagClass(row.tag)}">${escapeHtml(row.tag)}</span>` : ''}${row.badge ? `<span class="status-pill status-pill--open">${escapeHtml(row.badge)}</span>` : ''}</div><h2>${escapeHtml(row.title)}</h2><div class="news-card__body">${body}</div>${factsHtml}${action}`
  return card
}

function replaceNewsFeedWithRemoteRows() {
  if (!newsFeed || !newsCardsState.remoteSections.has(activeAcademicSection)) return
  newsFeed.querySelectorAll('.update-panel, .news-group, [data-news-empty]').forEach((item) => item.remove())
  getNewsRows().forEach((row) => newsFeed.append(renderRemoteNewsCard(row)))
}

async function refreshRemoteNewsCards(section = activeAcademicSection) {
  if (!newsFeed || !isSupabaseConfigured() || newsCardsState.loadingSections.has(section)) return
  newsCardsState.loadingSections.add(section)
  try {
    const rows = await fetchNewsCards(section)
    if (rows.length || newsCardsState.remoteSections.has(section)) {
      newsCardsState.rowsBySection.set(section, rows)
      newsCardsState.remoteSections.add(section)
      if (section === activeAcademicSection) {
        replaceNewsFeedWithRemoteRows()
        renderNewsFilters()
        renderAssignmentProgress()
      }
    }
  } catch (error) {
    console.warn('Remote news data unavailable; using static fallback.', error)
    if (newsAdminStatus && isNewsAdminForSection(section)) newsAdminStatus.textContent = `News sync unavailable: ${error.message}`
  } finally {
    newsCardsState.loadingSections.delete(section)
  }
}

function parseNewsFacts(value = '') {
  return String(value).split('\n').map((line) => {
    const separator = line.indexOf('|')
    if (separator < 0) return null
    const label = line.slice(0, separator).trim()
    const factValue = line.slice(separator + 1).trim()
    return label && factValue ? { label, factValue } : null
  }).filter(Boolean)
}

function getNewsFormRow(form) {
  const data = new FormData(form)
  const id = String(data.get('id') || '').trim()
  const title = String(data.get('title') || '').trim()
  const body = String(data.get('body') || '').trim()
  const actionUrl = String(data.get('action_url') || '').trim()
  if (!title || !body) throw new Error('Title and body are required.')
  if (actionUrl && !getSafeExternalUrl(actionUrl)) throw new Error('Action URL must start with http:// or https://.')
  const group = data.get('card_group') === 'regular' ? 'regular' : 'pinned'
  const existing = getNewsRows().find((row) => row.id === id)
  const groupRows = getNewsRows().filter((row) => row.card_group === group)
  return {
    id: id || `news-${Date.now().toString(36)}`,
    section: activeAcademicSection,
    title,
    body,
    text_direction: data.get('text_direction') === 'rtl' ? 'rtl' : 'ltr',
    course: String(data.get('course') || 'all').trim() || 'all',
    card_date: data.get('card_date') || null,
    kicker: String(data.get('kicker') || '').trim(),
    tag: String(data.get('tag') || '').trim(),
    badge: String(data.get('badge') || '').trim(),
    deadline_start: data.get('deadline_start') || null,
    deadline_due: data.get('deadline_due') || null,
    deadline_label: String(data.get('deadline_label') || '').trim(),
    facts: parseNewsFacts(data.get('facts')),
    action_label: String(data.get('action_label') || '').trim(),
    action_url: actionUrl,
    card_group: group,
    display_order: existing?.card_group === group ? existing.display_order : ((groupRows.at(-1)?.display_order || 0) + 10),
    is_wide: data.get('is_wide') === 'on',
    published: data.get('published') === 'on'
  }
}

function openNewsAdminEditor(row = null) {
  if (!newsAdminModal || !newsAdminForm || !isNewsAdminForSection()) return
  newsAdminForm.reset()
  newsAdminForm.elements.published.checked = row ? Boolean(row.published) : true
  newsAdminForm.elements.card_group.value = row?.card_group || 'pinned'
  newsAdminForm.elements.text_direction.value = row?.text_direction || 'ltr'
  if (row) {
    Object.entries(row).forEach(([key, value]) => {
      const field = newsAdminForm.elements.namedItem(key)
      if (!field || ['facts', 'published', 'is_wide'].includes(key)) return
      field.value = value ?? ''
    })
    newsAdminForm.elements.facts.value = (row.facts || []).map((fact) => `${fact.label} | ${fact.value}`).join('\n')
    newsAdminForm.elements.is_wide.checked = Boolean(row.is_wide)
  }
  newsAdminModalTitle.textContent = row ? 'Edit news card' : 'Add news card'
  newsAdminFormStatus.textContent = ''
  newsAdminModal.hidden = false
  document.body.classList.add('admin-modal-open')
}

function closeNewsAdminEditor() {
  if (!newsAdminModal) return
  newsAdminModal.hidden = true
  document.body.classList.remove('admin-modal-open')
}

async function saveNewsAdminForm(form) {
  const submit = form.querySelector('[type="submit"]')
  if (submit) submit.disabled = true
  newsAdminFormStatus.textContent = 'Saving...'
  try {
    await upsertNewsCard(getNewsFormRow(form))
    closeNewsAdminEditor()
    await refreshRemoteNewsCards(activeAcademicSection)
    newsAdminStatus.textContent = 'News card saved.'
  } catch (error) {
    newsAdminFormStatus.textContent = error.message
  } finally {
    if (submit) submit.disabled = false
  }
}

async function moveNewsCard(row, direction) {
  const groupRows = getNewsRows().filter((item) => item.card_group === row.card_group)
  const index = groupRows.findIndex((item) => item.id === row.id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (index < 0 || targetIndex < 0 || targetIndex >= groupRows.length) return
  const target = groupRows[targetIndex]
  await updateNewsCardOrder([{ id: row.id, section: row.section, display_order: target.display_order }, { id: target.id, section: target.section, display_order: row.display_order }])
  await refreshRemoteNewsCards(row.section)
}

function renderNewsFilters() {
  if (!newsFeed) return

  ensureSectionNewsCard()
  renderNewsAdminToolbar()
  const course = newsCourseFilter?.value || 'all'
  const order = newsDateFilter?.value || 'newest'
  const now = new Date()
  const cards = [...newsFeed.querySelectorAll('.update-panel')]
  const seenCards = getNewsSeenCards()
  renderNewsNavBadge(cards)

  // Find or create pinned container
  let pinnedContainer = newsFeed.querySelector('.news-group--pinned')
  if (!pinnedContainer) {
    pinnedContainer = document.createElement('div')
    pinnedContainer.className = 'news-group news-group--pinned'
    pinnedContainer.innerHTML = '<h3 class="news-group-title">Pinned & Important</h3><div class="news-group-list"></div>'
    newsFeed.append(pinnedContainer)
  }
  const pinnedList = pinnedContainer.querySelector('.news-group-list')
  pinnedList.innerHTML = ''

  // Find or create older container
  let olderContainer = newsFeed.querySelector('.news-group--older')
  if (!olderContainer) {
    olderContainer = document.createElement('div')
    olderContainer.className = 'news-group news-group--older collapsed'
    olderContainer.innerHTML = `
      <div class="news-group-header">
        <button class="news-older-toggle" type="button" id="news-older-toggle">
          <span>Show Older Updates</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>
      <div class="news-group-list"></div>
    `
    newsFeed.append(olderContainer)

    const toggleBtn = olderContainer.querySelector('#news-older-toggle')
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = olderContainer.classList.toggle('collapsed')
      toggleBtn.querySelector('span').textContent = isCollapsed ? 'Show Older Updates' : 'Hide Older Updates'
    })
  }
  const olderList = olderContainer.querySelector('.news-group-list')
  olderList.innerHTML = ''

  let hasPinned = false
  let hasOlder = false

  cards
    .sort((a, b) => {
      if (newsCardsState.remoteSections.has(activeAcademicSection)) {
        const groupDifference = (a.dataset.group === 'pinned' ? 0 : 1) - (b.dataset.group === 'pinned' ? 0 : 1)
        if (groupDifference) return groupDifference
        return Number(a.dataset.order || 0) - Number(b.dataset.order || 0)
      }
      const priorityDifference = Number(b.dataset.priority || 0) - Number(a.dataset.priority || 0)
      if (priorityDifference) return priorityDifference
      const difference = new Date(a.dataset.date || 0) - new Date(b.dataset.date || 0)
      return order === 'oldest' ? difference : -difference
    })
    .forEach((card) => {
      const cardSection = card.dataset.section || '401'
      const expired = isNewsCardExpired(card, now)
      const unpublished = card.dataset.published === 'false' && !isNewsAdminForSection(cardSection)
      const isHidden = cardSection !== activeAcademicSection || expired || unpublished || (course !== 'all' && card.dataset.course !== course)

      card.hidden = isHidden
      if (isHidden) return

      const isUnseen = !expired && !seenCards.has(getNewsCardId(card))
      card.classList.toggle('update-panel--new', isUnseen)
      if (!prefersReducedMotion && isUnseen && !card.dataset.motionSeen) {
        card.dataset.motionSeen = 'true'
        card.classList.add('update-panel--new-flash')
      }

      const isPinned = card.dataset.group ? card.dataset.group === 'pinned' : Number(card.dataset.priority || 0) > 0 || card.dataset.persistent === 'true' || card.classList.contains('update-panel--primary')

      if (isPinned) {
        pinnedList.append(card)
        hasPinned = true
      } else {
        olderList.append(card)
        hasOlder = true
      }
    })

  pinnedContainer.style.display = hasPinned ? 'block' : 'none'
  olderContainer.style.display = hasOlder ? 'block' : 'none'

  const hasVisibleCards = hasPinned || hasOlder
  let emptyState = newsFeed.querySelector('[data-news-empty]')

  if (!hasVisibleCards) {
    if (!emptyState) {
      emptyState = document.createElement('div')
      emptyState.className = 'topic-empty topic-empty--panel'
      emptyState.dataset.newsEmpty = 'true'
      emptyState.textContent = 'No updates match the selected filters.'
      newsFeed.append(emptyState)
    }
  } else {
    emptyState?.remove()
  }
}

function initStudentSync() {
  if (!studentSync || !isSupabaseConfigured()) {
    renderStudentSyncUi()
    return
  }

  getCurrentUser()
    .then((user) => {
      studentProgressState.user = user
      renderStudentSyncUi()
      if (user) loadStudentProgress(activeAcademicSection)
      else updateGlobalProgress()
      refreshTrackerAdminProfile(user)
    })
    .catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
    })

  onAuthStateChange((user) => {
    studentProgressState.user = user
    studentProgressState.topicRows.clear()
    studentProgressState.quizRows.clear()
    studentProgressState.ready = false
    studentProgressState.lastError = ''
    renderStudentSyncUi()
    refreshTrackerAdminProfile(user)

    if (user) {
      loadStudentProgress(activeAcademicSection)
    } else {
      updateGlobalProgress()
    }
  })
}

if (subjectList) {
  const initialMode = getInitialSiteMode()
  updateAcademicSectionUi()
  syncModeToBody()
  if (initialMode === '402') {
    selectSiteSection('402', { scroll: false, hash: window.location.hash || '#tracker', historyMode: 'replace' })
  } else if (initialMode === '401') {
    selectSiteSection('401', { scroll: false, hash: window.location.hash || '#tracker', historyMode: 'replace' })
  } else if (initialMode === 'tools') {
    showToolsSection({ scroll: false, historyMode: 'replace' })
  } else if (initialMode === 'work') {
    showWorkSection({ scroll: false, historyMode: 'replace' })
  } else {
    showSelector({ scroll: false, historyMode: 'replace' })
  }
  window.setInterval(render401ExamSchedule, 3600000)
  refreshRemoteTrackerData()
  initStudentSync()
  renderTrackerAdminUi()
  if (initialParams.get('admin') === 'login') openAdminLogin()
}

document.addEventListener('click', (event) => {
  const syncToggle = event.target.closest('[data-student-sync-toggle]')
  if (syncToggle) {
    event.preventDefault()
    setStudentSyncMenu(!studentSync?.classList.contains('is-open'))
    return
  }

  if (event.target.closest('[data-student-sync-login]')) {
    event.preventDefault()
    studentProgressState.lastError = ''
    renderStudentSyncUi()
    signInWithGoogle({ redirectTo: window.location.href }).catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
    })
    return
  }

  if (event.target.closest('[data-student-sync-logout]')) {
    event.preventDefault()
    signOutUser().catch((error) => {
      studentProgressState.lastError = error.message
      renderStudentSyncUi()
    })
    setStudentSyncMenu(false)
    return
  }

  const anonToggle = event.target.closest('#leaderboard-anon-toggle')
  if (anonToggle) {
    event.preventDefault()
    if (!studentProgressState.user) return
    const currentAnon = !leaderboardState.preferences.anonymous
    leaderboardState.preferences.anonymous = currentAnon
    renderAnonToggleUi()
    upsertUserPreference({
      user_id: studentProgressState.user.id,
      anonymous: currentAnon
    }).then(() => {
      fetchAndRenderLeaderboard(true)
    }).catch((err) => {
      showGlobalToast('Failed to update: ' + err.message)
    })
    return
  }

  if (event.target.closest('[data-leaderboard-retry]')) {
    event.preventDefault()
    fetchAndRenderLeaderboard(true)
    return
  }

  if (event.target.closest('[data-admin-login-open]')) {
    event.preventDefault()
    openAdminLogin()
    return
  }

  if (event.target.closest('[data-admin-login-close]')) {
    closeAdminLogin()
    return
  }

  if (event.target === adminLoginModal) {
    closeAdminLogin()
    return
  }

  if (event.target.closest('[data-admin-editor-close]')) {
    closeAdminEditor()
    return
  }

  if (event.target.closest('[data-news-admin-add]')) {
    openNewsAdminEditor()
    return
  }

  if (event.target.closest('[data-news-admin-close]') || event.target === newsAdminModal) {
    closeNewsAdminEditor()
    return
  }

  const newsCard = event.target.closest('.update-panel[data-news-id]')
  const newsRow = newsCard ? getNewsRows().find((row) => row.id === newsCard.dataset.newsId) : null
  if (newsRow && event.target.closest('[data-news-edit]')) {
    openNewsAdminEditor(newsRow)
    return
  }
  if (newsRow && event.target.closest('[data-news-delete]')) {
    if (!window.confirm(`Delete “${newsRow.title}”? This cannot be undone.`)) return
    newsAdminStatus.textContent = 'Deleting...'
    deleteNewsCard(newsRow.id, newsRow.section)
      .then(() => refreshRemoteNewsCards(newsRow.section))
      .then(() => { newsAdminStatus.textContent = 'News card deleted.' })
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }
  if (newsRow && event.target.closest('[data-news-toggle-pin]')) {
    const nextGroup = newsRow.card_group === 'pinned' ? 'regular' : 'pinned'
    const groupRows = getNewsRows().filter((row) => row.card_group === nextGroup)
    upsertNewsCard({ ...newsRow, card_group: nextGroup, display_order: (groupRows.at(-1)?.display_order || 0) + 10 })
      .then(() => refreshRemoteNewsCards(newsRow.section))
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }
  if (newsRow && event.target.closest('[data-news-toggle-publish]')) {
    upsertNewsCard({ ...newsRow, published: !newsRow.published })
      .then(() => refreshRemoteNewsCards(newsRow.section))
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }
  const newsMoveButton = event.target.closest('[data-news-move]')
  if (newsRow && newsMoveButton) {
    moveNewsCard(newsRow, newsMoveButton.dataset.newsMove)
      .catch((error) => { newsAdminStatus.textContent = error.message })
    return
  }

  const adminEditButton = event.target.closest('[data-admin-edit-topic]')
  if (adminEditButton) {
    event.preventDefault()
    event.stopPropagation()
    const card = adminEditButton.closest('[data-admin-topic]')
    if (card) openAdminTopicEditor(card.dataset.adminSubject, card.dataset.adminTrack, card.dataset.adminTopic)
    return
  }

  const adminMoveButton = event.target.closest('[data-admin-move]')
  if (adminMoveButton) {
    event.preventDefault()
    event.stopPropagation()
    const card = adminMoveButton.closest('[data-admin-topic]')
    if (card) moveAdminTopic(card.dataset.adminSubject, card.dataset.adminTrack, card.dataset.adminTopic, adminMoveButton.dataset.adminMove)
    return
  }

  if (studentSync?.classList.contains('is-open') && !event.target.closest('#student-sync')) {
    setStudentSyncMenu(false)
  }

  const sectionButton = event.target.closest('[data-select-section]')
  if (sectionButton) {
    event.preventDefault()
    selectSiteSection(sectionButton.dataset.selectSection)
    return
  }

  handleQuizClick(event)
})

adminLoginForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  setAdminLoginStatus('Signing in...')
  const submit = adminLoginForm.querySelector('[type="submit"]')
  if (submit) submit.disabled = true
  try {
    const { user } = await signInAdmin(adminLoginEmail.value.trim(), adminLoginPassword.value)
    studentProgressState.user = user
    const profile = await fetchAdminProfile()
    if (!profile) {
      await signOutUser()
      throw new Error('This account is not registered as a tracker admin.')
    }
    trackerAdminState.profile = profile
    trackerAdminState.enabled = true
    closeAdminLogin()
    renderTrackerAdminUi()
    await refreshRemoteNewsCards(activeAcademicSection)
    renderSubjects()
    if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  } catch (error) {
    setAdminLoginStatus(error.message, 'error')
  } finally {
    if (submit) submit.disabled = false
  }
})

trackerAdminEditPanel?.addEventListener('change', (event) => {
  if (!event.target.matches('input[name="admin-state"]')) return
  trackerAdminEditPanel.querySelectorAll('.admin-state-option').forEach(option => option.classList.remove('is-selected'))
  event.target.closest('.admin-state-option')?.classList.add('is-selected')
})

trackerAdminEditPanel?.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-tracker-admin-edit-form]')
  if (!form) return
  event.preventDefault()
  saveAdminTopicForm(form)
})

newsAdminForm?.addEventListener('submit', (event) => {
  event.preventDefault()
  saveNewsAdminForm(newsAdminForm)
})

trackerAdminSaveOrder?.addEventListener('click', saveAdminArrangement)
trackerAdminSignOut?.addEventListener('click', () => {
  if (trackerAdminState.dirtyCollections.size) {
    window.alert('Save the topic arrangement before signing out.')
    return
  }
  trackerAdminState.enabled = false
  closeAdminEditor()
  renderTrackerAdminUi()
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  showGlobalToast('Student view on.')
})

document.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.tracker-admin-topic[data-admin-topic]')
  if (!card || !isTrackerAdmin()) return
  trackerAdminState.draggingKey = `${card.dataset.adminSubject}::${card.dataset.adminTrack}::${card.dataset.adminTopic}`
  card.classList.add('admin-topic--dragging')
  event.dataTransfer?.setData('text/plain', trackerAdminState.draggingKey)
})

document.addEventListener('dragover', (event) => {
  const card = event.target.closest('.tracker-admin-topic[data-admin-topic]')
  if (!card || !trackerAdminState.draggingKey) return
  event.preventDefault()
  document.querySelectorAll('.admin-topic--drag-over').forEach(item => item.classList.remove('admin-topic--drag-over'))
  card.classList.add('admin-topic--drag-over')
})

document.addEventListener('drop', (event) => {
  const target = event.target.closest('.tracker-admin-topic[data-admin-topic]')
  if (!target || !trackerAdminState.draggingKey) return
  event.preventDefault()
  const [sourceSubject, sourceTrack, ...sourceLabelParts] = trackerAdminState.draggingKey.split('::')
  const sourceLabel = sourceLabelParts.join('::')
  if (sourceSubject !== target.dataset.adminSubject || sourceTrack !== target.dataset.adminTrack) return
  const context = getAdminTopicContext(sourceSubject, sourceTrack, sourceLabel)
  if (!context) return
  const fromIndex = context.collection.findIndex(item => item.label === sourceLabel)
  const toIndex = context.collection.findIndex(item => item.label === target.dataset.adminTopic)
  if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
    const [moved] = context.collection.splice(fromIndex, 1)
    context.collection.splice(toIndex, 0, moved)
    context.collection.forEach((topic, index) => { topic.displayOrder = (index + 1) * 10 })
    trackerAdminState.dirtyCollections.add(getAdminCollectionKey(sourceSubject, sourceTrack))
    renderSubjects()
    setActiveSubject(sourceSubject, 'open')
  }
})

document.addEventListener('dragend', () => {
  trackerAdminState.draggingKey = ''
  document.querySelectorAll('.admin-topic--dragging, .admin-topic--drag-over').forEach(item => item.classList.remove('admin-topic--dragging', 'admin-topic--drag-over'))
})

window.addEventListener('beforeunload', (event) => {
  if (!trackerAdminState.dirtyCollections.size) return
  event.preventDefault()
  event.returnValue = ''
})

window.addEventListener('hashchange', handleLegacyHashRoute)
window.addEventListener('popstate', restoreSiteModeFromLocation)
window.addEventListener('focus', () => {
  if (activeSiteMode === '401' || activeSiteMode === '402') refreshRemoteTrackerData()
})
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && (activeSiteMode === '401' || activeSiteMode === '402')) refreshRemoteTrackerData()
})


function refreshTrackerFilters() {
  if (trackerScopeFilter) {
    document.querySelectorAll('.scope-toggle__btn').forEach((button) => {
      button.classList.toggle('scope-toggle__btn--active', button.dataset.scope === trackerScopeFilter.value)
    })
  }

  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  else clearSubjectDetail()
}

if (trackerSearch && trackerStatusFilter) {
  ;[trackerSearch, trackerStatusFilter, trackerScopeFilter].filter(Boolean).forEach((control) => {
    control.addEventListener('input', refreshTrackerFilters)
    control.addEventListener('change', refreshTrackerFilters)
  })
}

// Scope pill button wiring
document.querySelectorAll('.scope-toggle__btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (trackerScopeFilter) {
      trackerScopeFilter.value = btn.dataset.scope
    }
    refreshTrackerFilters()
  })
})

if (newsFeed) {
  renderNewsFilters()
  newsNavLinks.forEach((link) => link.addEventListener('click', () => {
    markNewsCardsSeen([...newsFeed.querySelectorAll('.update-panel')])
  }))
  ;[newsCourseFilter, newsDateFilter].filter(Boolean).forEach((control) => {
    control.addEventListener('input', renderNewsFilters)
    control.addEventListener('change', renderNewsFilters)
  })

  let newsFilterKey = `${newsCourseFilter?.value || 'all'}:${newsDateFilter?.value || 'newest'}`
  window.setInterval(() => {
    const nextKey = `${newsCourseFilter?.value || 'all'}:${newsDateFilter?.value || 'newest'}`
    if (nextKey !== newsFilterKey) {
      newsFilterKey = nextKey
      renderNewsFilters()
    }
  }, 300)
  window.setInterval(renderNewsFilters, 60000)
}

requestAnimationFrame(() => {
  const params = new URLSearchParams(window.location.search)
  if (subjectList && mobileQuery.matches && params.get('tracker') === '1' && activeSubjectCode) {
    expandedSubjectCode = activeSubjectCode
    renderSubjects()
  }
})

if (bookingForm) {
  bookingForm.addEventListener('submit', handleBookingSubmit)
}

if (historyForm) {
  historyForm.addEventListener('input', handleHistoryInput)
  historyForm.addEventListener('change', handleHistoryInput)
  toggleHistoryConditionalSections()
  handleHistoryInput()
}

if (copyHistorySummary && historySummaryText) {
  copyHistorySummary.addEventListener('click', async () => {
    await navigator.clipboard.writeText(historySummaryText.textContent)
    copyHistorySummary.textContent = 'Copied'
    window.setTimeout(() => {
      copyHistorySummary.textContent = 'Copy'
    }, 1200)
  })
}

renderAssignmentProgress()
renderSchedulePage()
if (scheduleTodayTitle) {
  window.setInterval(renderSchedulePage, 60 * 1000)
}

function initFullHistoryTool() {
  const historyRoot = document.getElementById('history')
  const historyApp = document.getElementById('history-app')
  if (!historyRoot || !historyApp || historyRoot.dataset.historyToolReady) return
  historyRoot.dataset.historyToolReady = 'true'
    const systems = {
      general: {
        label: "General",
        desc: "Basic history sheet",
        complaints: ["Fever", "Weight loss", "Fatigue", "Swelling", "Pallor", "Jaundice"],
        symptoms: [
          ["Fever", "pattern, grade, chills"], ["Weight loss", "amount, duration, appetite"], ["Night sweats", "TB/lymphoma clue"], ["Pallor", "anemia clue"],
          ["Jaundice", "urine/stool/pruritus"], ["Cyanosis", "central/peripheral"], ["Edema", "site, pitting, timing"], ["Rash", "type, distribution"]
        ]
      },
      cardiology: {
        label: "Cardiology",
        desc: "Cardiac symptoms",
        complaints: ["Dyspnea", "Chest pain", "Palpitations", "Syncope", "LL edema", "Orthopnea"],
        symptoms: [
          ["Dyspnea", "exertional grade"], ["Orthopnea", "number of pillows"], ["PND", "wakes from sleep"], ["Chest pain", "site/character/radiation"],
          ["Palpitations", "onset/rhythm/duration"], ["Syncope", "pre/post-event"], ["LL edema", "dependent/pitting"], ["Cyanosis", "central/peripheral"],
          ["Cough/hemoptysis", "pulmonary congestion"], ["Fatigue", "low COP clue"]
        ]
      },
      chest: {
        label: "Chest",
        desc: "Respiratory symptoms",
        complaints: ["Cough", "Sputum", "Dyspnea", "Wheeze", "Hemoptysis", "Chest pain"],
        symptoms: [
          ["Cough", "dry/productive, timing"], ["Sputum", "amount/color/odour"], ["Hemoptysis", "streaks vs massive"], ["Dyspnea", "acute/subacute/chronic"],
          ["Wheeze", "episodic/triggered"], ["Chest pain", "pleuritic/localized"], ["Fever", "infection clue"], ["Weight loss", "TB/malignancy"],
          ["Occupational exposure", "dust/asbestos/farm"], ["Allergy/asthma", "personal/family"]
        ]
      },
      abdomen: {
        label: "Abdomen / GIT",
        desc: "GIT + hepatology",
        complaints: ["Abdominal pain", "Vomiting", "Diarrhea", "Constipation", "Jaundice", "Abdominal swelling"],
        symptoms: [
          ["Dysphagia", "solids/liquids"], ["Vomiting", "content/amount/relation"], ["Hematemesis", "fresh/coffee ground"], ["Abdominal pain", "site/character/radiation"],
          ["Diarrhea", "frequency/consistency/blood"], ["Constipation", "duration/obstruction"], ["Melena", "black tarry stool"], ["Jaundice", "urine/stool/pruritus"],
          ["Abdominal swelling", "ascites/mass"], ["LL swelling", "hepatic/cardiac clue"], ["Urinary symptoms", "renal overlap"], ["Gynecological symptoms", "female patients"]
        ]
      },
      neurology: {
        label: "Neurology",
        desc: "CNS history",
        complaints: ["Weakness", "Headache", "Convulsions", "Sensory loss", "Speech trouble", "Sphincter trouble"],
        symptoms: [
          ["Headache", "ICT/red flags"], ["Projectile vomiting", "ICT clue"], ["Blurring of vision", "optic/ICT"], ["Convulsions", "type/post-ictal"],
          ["Motor weakness", "side/distribution"], ["Sensory symptoms", "level/modality"], ["Speech symptoms", "aphasia/dysarthria"], ["Sphincter troubles", "retention/incontinence"],
          ["Cranial nerves", "vision/diplopia/facial"], ["Trauma", "exclude in history"], ["Fever/malaise", "inflammation clue"], ["Hypothalamic symptoms", "sleep/appetite/temp"]
        ]
      },
      rheumatology: {
        label: "Rheumatology",
        desc: "Articular + extra-articular",
        complaints: ["Joint pain", "Joint swelling", "Morning stiffness", "Back pain", "Rash", "Oral ulcers"],
        symptoms: [
          ["Joint pain", "site, number, symmetry"], ["Swelling", "inflammatory/mechanical"], ["Morning stiffness", "duration"], ["Deformity", "type/progression"],
          ["Limitation", "function/disability"], ["Skin rash", "malar/psoriasis/nodules"], ["Eye symptoms", "redness/uveitis"], ["Oral ulcers", "SLE/BehÃ§et clue"],
          ["Raynaudâ€™s", "color change/cold"], ["Back pain", "inflammatory features"], ["Fever/weight loss", "systemic"], ["Drug history", "steroids/NSAIDs"]
        ]
      }
    };

    const steps = [
      { id: "personal", label: "Personal", desc: "NASOMRH" },
      { id: "complaint", label: "Complaint", desc: "C/O + duration" },
      { id: "hpi", label: "HPI", desc: "analysis story" },
      { id: "related", label: "Related", desc: "system symptoms" },
      { id: "past", label: "Past", desc: "disease/drugs" },
      { id: "family", label: "Family", desc: "risk context" },
      { id: "final", label: "Final", desc: "review/copy" }
    ];

    const requiredKeys = [
      "age", "sex", "occupation", "residence", "mainComplaint", "complaintDuration",
      "complaintType", "onset", "course", "associated", "aggravating", "relieving",
      "treatmentEffect", "dm", "htn", "tb", "familyDM", "familyHTN", "consanguinity"
    ];

    const defaultState = {
      system: "general",
      step: "personal",
      mode: "study",
      tab: "full",
      relatedSymptoms: []
    };

    let state = loadState();

    function loadState() {
      try {
        const saved = localStorage.getItem("historyToolState.v1");
        return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
      } catch {
        return { ...defaultState };
      }
    }

    function saveState() {
      localStorage.setItem("historyToolState.v1", JSON.stringify(state));
    }

    const $ = (sel) => historyRoot.querySelector(sel);
    const $$ = (sel) => Array.from(historyRoot.querySelectorAll(sel));

    function value(key) {
      const v = state[key];
      if (v === undefined || v === null || v === false) return "";
      return String(v).trim();
    }

    function sentence(text) {
      const t = String(text || "").trim();
      if (!t) return "";
      return /[.!?]$/.test(t) ? t : t + ".";
    }

    function joinParts(parts, sep = ", ") {
      return parts.filter(Boolean).map(x => String(x).trim()).filter(Boolean).join(sep);
    }

    function smokingStats() {
      const cigs = Number(value("cigsDay")) || 0;
      const years = Number(value("smokingYears")) || 0;
      const index = cigs * years;
      const pack = cigs * years / 20;
      let grade = "";
      if (index > 0) grade = index < 100 ? "mild" : index <= 400 ? "moderate" : "heavy";
      return { index, pack: Number.isInteger(pack) ? pack : pack.toFixed(1), grade };
    }

    function renderSystems() {
      const grid = $("#systemGrid");
      grid.innerHTML = "";
      Object.entries(systems).forEach(([id, sys]) => {
        const btn = document.createElement("button");
        btn.className = "system-btn" + (state.system === id ? " active" : "");
        btn.type = "button";
        btn.innerHTML = `<b>${sys.label}</b><span>${sys.desc}</span>`;
        btn.addEventListener("click", () => {
          state.system = id;
          state.relatedSymptoms = [];
          state.step = "personal";
          saveState();
          renderAll();
        });
        grid.appendChild(btn);
      });
    }

    function renderSteps() {
      const list = $("#stepList");
      list.innerHTML = "";
      const currentIndex = steps.findIndex(s => s.id === state.step);
      steps.forEach((s, i) => {
        const btn = document.createElement("button");
        btn.className = "step-btn" + (state.step === s.id ? " active" : "") + (i < currentIndex ? " done" : "");
        btn.type = "button";
        btn.innerHTML = `<span class="step-dot">${i < currentIndex ? "âœ“" : i + 1}</span><span class="step-label"><b>${s.label}</b><span>${s.desc}</span></span>`;
        btn.addEventListener("click", () => {
          state.step = s.id;
          saveState();
          renderAll();
          const section = $(`.step-section[data-step="${s.id}"]`);
          const bottomNavSpace = document.querySelector('.bottom-nav-wrap')?.offsetHeight || 0;
          const targetTop = section ? section.getBoundingClientRect().top + window.scrollY - Math.max(bottomNavSpace + 22, 96) : null;
          if (targetTop !== null) window.scrollTo({ top: targetTop, behavior: "smooth" });
        });
        list.appendChild(btn);
      });
    }

    function renderMode() {
      $$(".mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === state.mode);
      });
      historyApp.classList.toggle("osce", state.mode === "osce");
      if (state.mode === "presentation") state.tab = "osce";
    }

    function renderStepSections() {
      $$(".step-section").forEach(sec => sec.classList.toggle("active", sec.dataset.step === state.step));
      const index = steps.findIndex(s => s.id === state.step);
      $("#prevStep").disabled = index === 0;
      $("#nextStep").textContent = index === steps.length - 1 ? "Back to start â†’" : "Next â†’";
      $("#systemTag").textContent = systems[state.system].label;
    }

    function renderInputs() {
      $$('[data-key]').forEach(el => {
        const key = el.dataset.key;
        if (el.type === "checkbox") {
          el.checked = Boolean(state[key]);
        } else if (el.tagName === "SELECT" || el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.value = state[key] ?? "";
        }
      });
      updateConditionals();
    }

    function renderComplaintChips() {
      const wrap = $("#complaintChips");
      wrap.innerHTML = "";
      systems[state.system].complaints.forEach(label => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip" + (value("mainComplaint").toLowerCase() === label.toLowerCase() ? " active" : "");
        chip.textContent = label;
        chip.addEventListener("click", () => {
          state.mainComplaint = label.toLowerCase();
          const lower = label.toLowerCase();
          if (lower.includes("pain")) state.complaintType = "pain";
          else if (lower.includes("cough") || lower.includes("sputum")) state.complaintType = "cough-sputum";
          else if (lower.includes("dyspnea") || lower.includes("breath")) state.complaintType = "dyspnea";
          else if (lower.includes("swelling") || lower.includes("edema")) state.complaintType = "swelling";
          else if (lower.includes("fever")) state.complaintType = "fever";
          else if (lower.includes("weakness")) state.complaintType = "weakness";
          saveState();
          renderAll();
        });
        wrap.appendChild(chip);
      });
    }

    function renderRelatedSymptoms() {
      const wrap = $("#relatedSymptoms");
      wrap.innerHTML = "";
      const selected = new Set(state.relatedSymptoms || []);
      systems[state.system].symptoms.forEach(([name, detail]) => {
        const label = document.createElement("label");
        label.className = "symptom-card";
        label.innerHTML = `<input type="checkbox" ${selected.has(name) ? "checked" : ""} /><span><b>${name}</b><span>${detail}</span></span>`;
        label.querySelector("input").addEventListener("change", (e) => {
          if (e.target.checked) selected.add(name); else selected.delete(name);
          state.relatedSymptoms = Array.from(selected);
          saveState();
          renderOutput();
          renderProgress();
        });
        wrap.appendChild(label);
      });
    }

    function updateConditionals() {
      $("#femaleWrap").classList.toggle("show", value("sex") === "Female");
      $("#handednessWrap").classList.toggle("show", state.system === "neurology");
      $("#smokingWrap").classList.toggle("show", Boolean(state.isSmoker));
      const type = value("complaintType");
      const needsPain = type === "pain" || value("mainComplaint").toLowerCase().includes("pain");
      const needsExcreta = ["excreta", "cough-sputum", "bleeding"].includes(type) || ["sputum", "diarrhea", "vomit", "urine", "stool", "hemoptysis", "hematemesis", "melena"].some(w => value("mainComplaint").toLowerCase().includes(w));
      $("#painWrap").classList.toggle("show", needsPain);
      $("#excretaWrap").classList.toggle("show", needsExcreta);

      const stats = smokingStats();
      $("#smokingIndex").textContent = stats.index ? `${stats.index} ${stats.grade ? `(${stats.grade})` : ""}` : "0";
      $("#packYears").textContent = stats.pack || "0";
    }

    function missingQuestions() {
      const missing = [];
      const add = (key, text) => { if (!value(key)) missing.push(text); };

      add("age", "Ask the patientâ€™s age.");
      add("sex", "Record sex.");
      add("occupation", "Ask occupation and occupational exposure.");
      add("residence", "Ask residence / place of living.");
      add("mainComplaint", "Write the main complaint.");
      add("complaintDuration", "Add duration to the complaint.");
      add("complaintType", "Choose complaint type so the tool can guide analysis.");
      add("onset", "Analyze onset.");
      add("course", "Analyze course.");
      add("associated", "Ask associated symptoms.");
      add("aggravating", "Ask what increases the complaint.");
      add("relieving", "Ask what decreases the complaint.");
      add("treatmentEffect", "Ask about effect of treatment.");
      add("dm", "Ask past history of DM.");
      add("htn", "Ask past history of hypertension.");
      add("tb", "Ask past/contact history of TB.");
      add("familyDM", "Ask family history of DM.");
      add("familyHTN", "Ask family history of HTN.");
      add("consanguinity", "Ask consanguinity.");

      const type = value("complaintType");
      const lowerComplaint = value("mainComplaint").toLowerCase();
      const needsPain = type === "pain" || lowerComplaint.includes("pain");
      const needsExcreta = ["excreta", "cough-sputum", "bleeding"].includes(type) || ["sputum", "diarrhea", "vomit", "urine", "stool", "hemoptysis", "hematemesis", "melena"].some(w => lowerComplaint.includes(w));

      if (needsPain) {
        add("painSite", "Pain complaint: ask site.");
        add("painCharacter", "Pain complaint: ask character.");
        add("painRadiation", "Pain complaint: ask radiation.");
      }
      if (needsExcreta) {
        add("amount", "Excreta complaint: ask amount.");
        add("color", "Excreta complaint: ask color.");
        add("consistency", "Excreta complaint: ask consistency.");
        add("odour", "Excreta complaint: ask odour.");
      }
      if (state.system === "neurology") add("handedness", "Neurology mode: add handedness.");
      if (value("sex") === "Female") {
        add("menarche", "Female patient: ask menarche.");
        add("cycleRhythm", "Female patient: ask menstrual cycle rhythm.");
        add("flowDuration", "Female patient: ask duration of flow.");
        add("dysmenorrhea", "Female patient: ask dysmenorrhea.");
        add("contraception", "Female patient: ask current contraception.");
      }
      if (!state.relatedSymptoms || state.relatedSymptoms.length === 0) missing.push("Ask/check related system symptoms.");

      return missing;
    }

    function completion() {
      const keys = [...requiredKeys];
      const type = value("complaintType");
      const lowerComplaint = value("mainComplaint").toLowerCase();
      if (type === "pain" || lowerComplaint.includes("pain")) keys.push("painSite", "painCharacter", "painRadiation");
      if (["excreta", "cough-sputum", "bleeding"].includes(type) || ["sputum", "diarrhea", "vomit", "urine", "stool", "hemoptysis", "hematemesis", "melena"].some(w => lowerComplaint.includes(w))) keys.push("amount", "color", "consistency", "odour");
      if (state.system === "neurology") keys.push("handedness");
      if (value("sex") === "Female") keys.push("menarche", "cycleRhythm", "flowDuration", "dysmenorrhea", "contraception");
      const done = keys.filter(k => value(k)).length + ((state.relatedSymptoms || []).length ? 1 : 0);
      const total = keys.length + 1;
      return Math.round((done / total) * 100);
    }

    function renderProgress() {
      const pct = completion();
      $("#completionLabel").textContent = pct + "%";
      $("#completionFill").style.width = pct + "%";
    }

    function personalParagraph() {
      const parts = [];
      const gender = value("sex") ? value("sex").toLowerCase() : "Patient";
      const name = value("name") ? ` ${value("name")}` : "";
      let opener = `${value("sex") || "Patient"}${name}`;
      if (value("age")) opener += `, ${value("age")}-year-old`;
      if (value("occupation")) opener += `, ${value("occupation")}`;
      parts.push(opener);

      const residence = value("residence") ? `living in ${value("residence")}` : "";
      const marital = value("marital") ? value("marital").toLowerCase() : "";
      const marriage = value("marriageDuration") ? `for ${value("marriageDuration")}` : "";
      const children = value("children") ? `with ${value("children")} living offspring` : "";
      const youngest = value("youngestChild") ? `the youngest is ${value("youngestChild")}` : "";
      parts.push(joinParts([residence, marital, marriage, children, youngest]));

      if (state.system === "neurology" && value("handedness")) parts.push(value("handedness"));

      if (state.isSmoker) {
        const stats = smokingStats();
        const smoke = joinParts([
          value("smokingStatus") || "smoker",
          value("cigsDay") ? `${value("cigsDay")} cigarettes/day` : "",
          value("smokingYears") ? `for ${value("smokingYears")} years` : "",
          stats.index ? `smoking index ${stats.index}${stats.grade ? ` (${stats.grade})` : ""}` : "",
          stats.pack ? `${stats.pack} pack-years` : "",
          value("smokingType") ? `type: ${value("smokingType")}` : ""
        ]);
        parts.push(smoke);
      } else {
        parts.push("no special habits documented");
      }
      if (value("otherHabits")) parts.push(`Other habits: ${value("otherHabits")}`);

      if (value("sex") === "Female") {
        const menstrual = joinParts([
          value("menarche") ? `menarche at ${value("menarche")}` : "",
          value("menopause") ? `menopause: ${value("menopause")}` : "",
          value("cycleRhythm") ? `cycle ${value("cycleRhythm")}` : "",
          value("flowDuration") ? `flow duration ${value("flowDuration")}` : "",
          value("flowAmount") ? `flow ${value("flowAmount")}` : "",
          value("dysmenorrhea"),
          value("contraception") ? `contraception: ${value("contraception")}` : "",
          value("obstetric") ? `obstetric note: ${value("obstetric")}` : ""
        ]);
        if (menstrual) parts.push(`Menstrual history: ${menstrual}`);
      }

      if (value("socialClass")) parts.push(value("socialClass"));
      return sentence(joinParts(parts));
    }

    function complaintLine() {
      const complaint = value("mainComplaint") || "[main complaint]";
      const duration = value("complaintDuration") ? ` of ${value("complaintDuration")} duration` : "";
      return `C/O: ${complaint}${duration}.`;
    }

    function hpiParagraph() {
      const chunks = [];
      const complaint = value("mainComplaint") || "the complaint";
      chunks.push(`The patient presented with ${complaint}${value("complaintDuration") ? ` for ${value("complaintDuration")}` : ""}`);
      if (value("onset")) chunks.push(`onset was ${value("onset")}`);
      if (value("course")) chunks.push(`course was ${value("course")}`);
      if (value("hpiDuration")) chunks.push(`duration details: ${value("hpiDuration")}`);
      if (value("associated")) chunks.push(`associated with ${value("associated")}`);
      if (value("aggravating")) chunks.push(`increased by ${value("aggravating")}`);
      if (value("relieving")) chunks.push(`relieved by ${value("relieving")}`);
      if (value("treatmentEffect")) chunks.push(`effect of treatment: ${value("treatmentEffect")}`);
      if (value("lastAttack")) chunks.push(`last attack: ${value("lastAttack")}`);

      const pain = joinParts([
        value("painSite") ? `site: ${value("painSite")}` : "",
        value("painCharacter") ? `character: ${value("painCharacter")}` : "",
        value("painRadiation") ? `radiation: ${value("painRadiation")}` : ""
      ]);
      if (pain) chunks.push(`Pain analysis: ${pain}`);

      const excreta = joinParts([
        value("amount") ? `amount: ${value("amount")}` : "",
        value("content") ? `content: ${value("content")}` : "",
        value("color") ? `color: ${value("color")}` : "",
        value("consistency") ? `consistency: ${value("consistency")}` : "",
        value("odour") ? `odour: ${value("odour")}` : ""
      ]);
      if (excreta) chunks.push(`Excreta analysis: ${excreta}`);

      const variants = joinParts([
        value("postural") ? `postural variation: ${value("postural")}` : "",
        value("diurnal") ? `diurnal variation: ${value("diurnal")}` : "",
        value("seasonal") ? `seasonal variation: ${value("seasonal")}` : ""
      ]);
      if (variants) chunks.push(`Variants: ${variants}`);
      if (value("investigationTreatment")) chunks.push(`Investigations/treatment for current illness: ${value("investigationTreatment")}`);

      return sentence(chunks.join("; "));
    }

    function relatedParagraph() {
      const symptoms = (state.relatedSymptoms || []).join(", ");
      const parts = [];
      if (symptoms) parts.push(`Related ${systems[state.system].label} symptoms checked: ${symptoms}`);
      if (value("relatedNotes")) parts.push(value("relatedNotes"));
      if (value("systemicReview")) parts.push(`Systemic review: ${value("systemicReview")}`);
      return sentence(parts.join(". "));
    }

    function pastParagraph() {
      const parts = [];
      ["dm", "htn", "tb", "ihd"].forEach(k => { if (value(k)) parts.push(value(k)); });
      if (value("similarAttacks")) parts.push(`similar attacks: ${value("similarAttacks")}`);
      if (value("operations")) parts.push(`operations: ${value("operations")}`);
      if (value("transfusion")) parts.push(`blood transfusion: ${value("transfusion")}`);
      if (value("drugs")) parts.push(`drug history: ${value("drugs")}`);
      if (value("allergies")) parts.push(`allergies: ${value("allergies")}`);
      if (value("pastDetails")) parts.push(value("pastDetails"));
      return sentence(parts.length ? `Past history: ${parts.join("; ")}` : "Past history not completed");
    }

    function familyParagraph() {
      const parts = [];
      ["consanguinity", "similarFamily", "familyDM", "familyHTN", "familyTB", "familyIHD"].forEach(k => { if (value(k)) parts.push(value(k)); });
      if (value("familyDetails")) parts.push(`family details: ${value("familyDetails")}`);
      if (value("livingConditions")) parts.push(`living/exposure: ${value("livingConditions")}`);
      return sentence(parts.length ? `Family and social history: ${parts.join("; ")}` : "Family and social history not completed");
    }

    function fullHistory() {
      const lines = [
        `SYSTEM: ${systems[state.system].label}`,
        "",
        "PERSONAL HISTORY",
        personalParagraph(),
        "",
        "COMPLAINT",
        complaintLine(),
        value("patientWords") ? `Patientâ€™s own words: â€œ${value("patientWords")}â€` : "",
        "",
        "HISTORY OF PRESENT ILLNESS",
        hpiParagraph(),
        "",
        "RELATED SYSTEM + SYSTEMIC REVIEW",
        relatedParagraph(),
        "",
        "PAST HISTORY",
        pastParagraph(),
        "",
        "FAMILY + SOCIAL HISTORY",
        familyParagraph()
      ];
      return lines.filter(line => line !== "").join("\n");
    }

    function osceSummary() {
      const demo = joinParts([
        value("age") ? `${value("age")}-year-old` : "",
        value("sex") ? value("sex").toLowerCase() : "patient",
        value("occupation") || ""
      ], " ");
      const smoker = state.isSmoker ? `, ${value("smokingStatus") || "smoker"}${value("cigsDay") ? ` ${value("cigsDay")} cigarettes/day` : ""}${value("smokingYears") ? ` for ${value("smokingYears")} years` : ""}` : "";
      const complaint = value("mainComplaint") || "[main complaint]";
      const duration = value("complaintDuration") ? `for ${value("complaintDuration")}` : "with unspecified duration";
      const assoc = value("associated") ? ` It was associated with ${value("associated")}.` : "";
      const systemPos = (state.relatedSymptoms || []).length ? ` Related positive/checklisted symptoms include ${(state.relatedSymptoms || []).join(", ")}.` : "";
      const risks = joinParts([value("dm"), value("htn"), value("tb"), value("ihd")], "; ");
      return `This is a ${demo || "patient"}${smoker}, presenting with ${complaint} ${duration}. The illness had ${value("onset") || "[onset not specified]"} onset and ${value("course") || "[course not specified]"} course.${assoc}${systemPos}${risks ? ` Past history: ${risks}.` : ""}`;
    }

    function renderOutput() {
      const missing = missingQuestions();
      const missingBox = $("#missingBox");
      const output = $("#outputBox");
      const finalMissing = $("#finalMissing");

      $$(".tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === state.tab));
      if (state.tab === "full") output.textContent = fullHistory();
      if (state.tab === "osce") output.textContent = osceSummary();
      if (state.tab === "missing") output.textContent = missing.length ? "Complete the items below." : "Looks clean. No major missing items detected.";

      missingBox.innerHTML = "";
      if (state.tab === "missing") {
        if (!missing.length) {
          missingBox.innerHTML = `<div class="good-item">No major missing questions detected. Nice.</div>`;
        } else {
          missing.forEach(m => {
            const div = document.createElement("div");
            div.className = "missing-item";
            div.textContent = m;
            missingBox.appendChild(div);
          });
        }
      }

      if (finalMissing) {
        finalMissing.innerHTML = "";
        if (!missing.length) {
          finalMissing.innerHTML = `<div class="good-item">No major missing questions detected. You can present this case.</div>`;
        } else {
          missing.slice(0, 12).forEach(m => {
            const div = document.createElement("div");
            div.className = "missing-item";
            div.textContent = m;
            finalMissing.appendChild(div);
          });
          if (missing.length > 12) {
            const div = document.createElement("div");
            div.className = "missing-item";
            div.textContent = `+ ${missing.length - 12} more items in the Missing tab.`;
            finalMissing.appendChild(div);
          }
        }
      }
    }

    function renderAll() {
      renderMode();
      renderSystems();
      renderSteps();
      renderStepSections();
      renderInputs();
      renderComplaintChips();
      renderRelatedSymptoms();
      renderProgress();
      renderOutput();
    }

    function bindEvents() {
      historyRoot.addEventListener("input", (e) => {
        const el = e.target.closest("[data-key]");
        if (!el) return;
        const key = el.dataset.key;
        if (el.type === "checkbox") state[key] = el.checked;
        else state[key] = el.value;
        saveState();
        updateConditionals();
        renderComplaintChips();
        renderProgress();
        renderOutput();
      });

      historyRoot.addEventListener("change", (e) => {
        const el = e.target.closest("[data-key]");
        if (!el) return;
        const key = el.dataset.key;
        if (el.type === "checkbox") state[key] = el.checked;
        else state[key] = el.value;
        saveState();
        updateConditionals();
        renderProgress();
        renderOutput();
      });

      $$(".mode-btn").forEach(btn => btn.addEventListener("click", () => {
        state.mode = btn.dataset.mode;
        if (state.mode === "presentation") state.tab = "osce";
        saveState();
        renderAll();
      }));

      $$(".tab-btn").forEach(btn => btn.addEventListener("click", () => {
        state.tab = btn.dataset.tab;
        saveState();
        renderOutput();
      }));

      $("#prevStep").addEventListener("click", () => {
        const idx = steps.findIndex(s => s.id === state.step);
        state.step = steps[Math.max(0, idx - 1)].id;
        saveState();
        renderAll();
      });

      $("#nextStep").addEventListener("click", () => {
        const idx = steps.findIndex(s => s.id === state.step);
        state.step = steps[(idx + 1) % steps.length].id;
        saveState();
        renderAll();
      });

      $("#copyBtn").addEventListener("click", () => copyText($("#outputBox").textContent));
      $("#copyFinalBtn").addEventListener("click", () => copyText(fullHistory()));
      $("#printBtn").addEventListener("click", () => window.print());

      $("#resetBtn").addEventListener("click", () => {
        if (!confirm("Reset the whole prototype form?")) return;
        localStorage.removeItem("historyToolState.v1");
        state = { ...defaultState };
        renderAll();
      });
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied.");
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        showToast("Copied.");
      }
    }

    function showToast(text) {
      const toast = $("#toast");
      toast.textContent = text;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1600);
    }

    bindEvents();
    renderAll();

}

function initBottomSectionNav() {
  const navLinks = [...document.querySelectorAll('[data-section-nav]')]
  if (!navLinks.length) return

  const sections = navLinks
    .map((link) => document.getElementById(link.dataset.sectionNav))
    .filter(Boolean)

  const setActive = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.sectionNav === id)
    })
    if (id === 'leaderboard') {
      fetchAndRenderLeaderboard()
    }
  }

  const sectionIds = new Set(sections.map((section) => section.id))
  const activeIdFromHash = () => {
    const id = window.location.hash.replace('#', '')
    return sectionIds.has(id) ? id : ''
  }

  const updateActiveFromViewport = () => {
    const hashId = activeIdFromHash()
    if (hashId) {
      setActive(hashId)
      return
    }

    const referenceY = window.innerHeight * 0.45
    const activeSection = sections
      .map((section) => {
        const rect = section.getBoundingClientRect()
        return {
          id: section.id,
          distance: Math.abs(rect.top - referenceY),
          visible: rect.bottom > 0 && rect.top < window.innerHeight
        }
      })
      .filter((section) => section.visible)
      .sort((a, b) => a.distance - b.distance)[0]

    if (activeSection?.id) setActive(activeSection.id)
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!link.hash) return
      const targetId = link.hash.slice(1)
      const targetSection = document.getElementById(targetId)
      if (!targetSection) return

      event.preventDefault()
      setActive(targetId)
      targetSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      })
      window.history.pushState(null, '', link.hash)
    })
  })

  updateActiveFromViewport()
  window.addEventListener('hashchange', updateActiveFromViewport)
  window.addEventListener('popstate', updateActiveFromViewport)

  if (!sections.length || !('IntersectionObserver' in window)) return

  const observer = new IntersectionObserver((entries) => {
    if (activeIdFromHash()) {
      updateActiveFromViewport()
      return
    }

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
    if (visible?.target?.id) setActive(visible.target.id)
  }, {
    rootMargin: '-35% 0px -45% 0px',
    threshold: [0.12, 0.28, 0.5]
  })

  sections.forEach((section) => observer.observe(section))
}

initFullHistoryTool()
initBottomSectionNav()
