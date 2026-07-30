// MUST 401 static configuration module
// Extracted from src/main.js for Phase 2 class-based refactor.
// Do not add runtime state, rendering functions, or 402 data here.

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
        mcqTopicKey: 'Spleen',
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
    time: '2:30-3:30',
    quizTopicKey: 'MED 401-2 MCQs',
    quizActionLabel: 'MCQs'
  },
  {
    code: 'MED 401-1',
    subjectCode: 'MED-1',
    subjectName: 'Internal Medicine 1',
    date: '2026-07-29',
    dayLabel: 'Wed',
    time: '2:30-3:30',
    quizTopicKey: 'MED 401-1 MCQs',
    quizActionLabel: 'MCQs'
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

export { subjects401, subjectExamNotes, midtermExamSchedule, courseSchedule }
