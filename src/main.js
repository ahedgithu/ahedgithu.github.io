import confetti from 'canvas-confetti'
import { fetchTrackerData, isSupabaseConfigured } from './supabaseClient.js'

let subjects = [
  {
    code: 'SUR-1',
    name: 'Surgery 1',
    totalCount: 16,
    examNote: 'Midterm: Sat Jul 25, 2026, 2:30-3:30.',
    topics: [
      {
        label: 'Liver Introduction',
        state: 'taken',
        art: 0,
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/12BIYR9r2h_fwkUQpXQI0xOyPy-lSI9D_/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1ukIDlUnzzpsyCOola5-TiyWJy7e2QELO/view?usp=drivesdk'
      },
      {
        label: 'Esophagus topics',
        state: 'taken',
        art: 1,
        coverageUnits: 3,
        note: 'Contains 3 topics: surgical anatomy and physiology; achalasia, hiatus hernia and GERD; esophageal perforation.',
        lectureUrls: [
          { label: 'Anatomy lecture', url: 'https://drive.google.com/file/d/1-iY3KOVw6vUWm_7k--A9lWFJnuGxYqoo/view?usp=drivesdk' },
          { label: 'Achalasia / GERD lecture', url: 'https://drive.google.com/file/d/1-uzZPnXaDetSZxCujFNDLudZ_TOJaQEh/view?usp=drivesdk' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1vt23RUJTWuT_1ZRUHGm4gvWJKW1sxUyI/view?usp=drivesdk'
      },
      {
        label: 'Corrosive Injury',
        state: 'taken',
        art: 1,
        note: 'Sunday report 21 Jun: taught by Dr. Hisham Ahmed.',
        lectureUrls: [
          { label: 'Esophagus lecture', url: 'https://drive.google.com/file/d/1-uzZPnXaDetSZxCujFNDLudZ_TOJaQEh' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Xy8aJmb30RgLP7C0-0uRa5Q8fLaJChIr/view?usp=drivesdk'
      },
      {
        label: 'Carcinoma of the Esophagus',
        state: 'taken',
        art: 1,
        note: 'Sunday report 21 Jun: taught by Dr. Hisham Ahmed.',
        lectureUrls: [
          { label: 'Esophagus lecture', url: 'https://drive.google.com/file/d/1-uzZPnXaDetSZxCujFNDLudZ_TOJaQEh' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Xy8aJmb30RgLP7C0-0uRa5Q8fLaJChIr/view?usp=drivesdk'
      },
      {
        label: 'Clinical round overview',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1mpckOjHYl__72iCCGy4jXU7EJfzgzKlX/view?usp=drivesdk'
      },
      {
        label: 'Liver Trauma and Infections',
        state: 'taken',
        art: 3,
        note: 'Hepatobiliary surgery coverage includes amoebic hepatitis and abscess.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1yjIUZolwSkC9DLnvTGCWBsxtPMuqalgY/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1mhHDVMOU6lPAar5xesF0eLKtNUJDwVR9/view?usp=drivesdk'
      },
      {
        label: 'Cirrhosis, portal hypertension and hepatic vascular disease',
        state: 'taken',
        art: 8,
        note: 'Tuesday report: cirrhosis, portal hypertension, esophageal varices, liver transplantation, Budd-Chiari syndrome, portal vein thrombosis, and splenic vein thrombosis.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1Y8AQJlpl-XINpxVDyeexUBjpxfAsDJrV/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1t1i2zjXOYw9jaSdIRYn1GvBOrsToq30u/view?usp=drivesdk'
      },
      { label: 'Tongue', state: 'remaining', art: 2 },
      { label: 'Salivary glands', state: 'remaining', art: 13 },
      {
        label: 'Overview of the Stomach',
        state: 'taken',
        art: 6,
        note: 'Sunday report 21 Jun: taught by Dr. Hisham Ahmed.',
        lectureUrls: [
          { label: 'Summary / Stomach file', url: 'https://drive.google.com/file/d/1XX_NpXX5jb0VGaL_-LW-O_6SAwFv0c1-' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Xy8aJmb30RgLP7C0-0uRa5Q8fLaJChIr/view?usp=drivesdk'
      },
      { label: 'Pancreas', state: 'remaining', art: 4 },
      { label: 'Intestines', state: 'remaining', art: 7 },
      { label: 'Biliary tract', state: 'remaining', art: 0 },
      { label: 'Spleen', state: 'remaining', art: 12 }
    ]
  },
  {
    code: 'SUR-2',
    name: 'Surgery 2',
    totalCount: 6,
    examNote: 'Midterm starts Jul 18, 2026. Exact SUR-2 schedule pending.',
    topics: [
      {
        label: 'Overview of the Subject',
        state: 'taken',
        art: 2,
        audioUrl: 'https://drive.google.com/file/d/1JCS1ZR8BiLL2sGVi-0B6UBExsstVOZEP/view?usp=drivesdk'
      },
      {
        label: 'Chest trauma / trauma up to sternal fractures',
        state: 'taken',
        art: 10,
        note: 'Sunday report 21 Jun: taught by Dr. Mohand Mostafa.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/18BP11uNEJk5eq6GKSAtj_mBEMN59l8U' }
        ]
      },
      { label: 'Rib fracture', state: 'remaining', art: 10 },
      { label: 'Pneumothorax, tension pneumothorax, hemothorax', state: 'remaining', art: 10 },
      { label: 'Pulmonary contusion and flail chest', state: 'remaining', art: 10 },
      { label: 'Empyema', state: 'remaining', art: 10 }
    ]
  },
  {
    code: 'MED-1',
    name: 'Internal Medicine 1',
    totalCount: 15,
    examNote: 'Midterm: Sat Jul 18, 2026, 2:30-3:30.',
    topics: [
      { label: "GERD, Barrett's Esophagus, Esophageal Motility Disorders", state: 'remaining', art: 1 },
      {
        label: 'Investigation of Acute Hepatitis',
        state: 'taken',
        art: 5,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1LQ-zgjWNlzGar7OgfX1WhBxkqvsTIAhQ/view?usp=drivesdk' },
          { label: 'Hepatitis map', url: '/assets/acute-viral-hepatitis-map-v3.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/acute-viral-hepatitis-map-v3.pdf', download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/1pCiruJJQ6rB84pyxeGy_NUY5QMUzDJVi/view?usp=drivesdk'
      },
      {
        label: 'Chronic viral and non-viral hepatitis',
        state: 'taken',
        art: 5,
        note: 'Sunday report 21 Jun: Autoimmune Hepatitis (AIH) taught by Dr. Omar Heikal. Also covers PBC, PSC, MASLD.',
        lectureUrls: [
          { label: 'Lecture folder', url: 'https://drive.google.com/drive/folders/1545uWPrXXOM9JjruxJVRzh2joO5IFDlt' },
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1YFpgL3FEVYMOj3aHLH7zjdYHn7A4G2FF' }
        ],
        audioUrl: 'https://drive.google.com/file/d/10wtq_v-0BOgOysXSgb1qxAFoOkbW8ix0/view?usp=drivesdk'
      },
      { label: 'Diseases of Stomach: PUD, H. pylori, non-ulcer dyspepsia', state: 'remaining', art: 6 },
      { label: 'Small intestine: diarrhea, malabsorption, celiac, Whipple', state: 'remaining', art: 7 },
      { label: 'Cirrhosis complications: portal hypertension, ascites', state: 'remaining', art: 8 },
      { label: 'SBP, Hepatic Encephalopathy, Hepatorenal Syndrome', state: 'remaining', art: 8 },
      {
        label: 'Diseases of the Pancreas',
        state: 'taken',
        art: 4,
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
    totalCount: 28,
    examNote: 'Midterm: Wed Jul 22, 2026, 2:30-3:30.',
    topics: [
      // Cardiology (15 topics)
      { label: 'Cardiology Symptomatology', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Acute Coronary Artery Disease', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Chronic Coronary Artery Disease', state: 'remaining', art: 9, section: 'Cardio' },
      {
        label: 'Rheumatic fever and infective endocarditis',
        state: 'taken',
        art: 9,
        section: 'Cardio',
        lectureUrls: [
          { label: 'Lecture', url: 'https://docs.google.com/presentation/d/1yZxhWUh5KDgQp_Z_Le10RL_JmdooXpwb/edit?usp=drivesdk&ouid=109054155258701630059&rtpof=true&sd=true' }
        ],
        audioUrl: 'https://drive.google.com/file/d/1G7x3QDKNsrxEZXdm-iQBAEeQzijaul2K/view?usp=drivesdk'
      },
      { label: 'Acute coronary syndrome', state: 'remaining', art: 9, section: 'Cardio' },
      { label: 'Aortic and mitral valve diseases', state: 'remaining', art: 9, section: 'Cardio' },
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
        note: 'Sunday report 21 Jun: taught by Dr. Ibrahim Abdelhamid.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1N4XIY296nvaftsjrXUEbYUaGH2-UJBT0' }
        ],
        audioUrl: 'https://drive.google.com/file/d/15PxmYb9SjFLIoabrFFI0XfBqFVaRhjUO/view?usp=drivesdk'
      },
      // Chest (13 topics)
      {
        label: 'Chest Symptomatology',
        state: 'taken',
        art: 10,
        section: 'Chest',
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
        note: 'Tuesday report: diseases of upper and lower airways and bronchial asthma part 1.',
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/133Ae9Po7wzSJBOf-GqANHRBHmPBufviI/view?usp=drivesdk' },
          { label: 'Asthma map', url: '/assets/asthma-guidelines-map-v1.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/asthma-guidelines-map-v1.pdf', download: true }
        ]
      },
      {
        label: 'Chronic Bronchitis and COPD',
        state: 'taken',
        art: 10,
        section: 'Chest',
        note: 'Tuesday report: Asthma Part 2 & COPD & ACOS taught by Dr. Serageldin Ali Sadek.',
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
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1j1_ViyVc0eF2J-0qkTmg6vbO9V5EvIzp' }
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
      { label: 'Bleeding disorders', state: 'remaining', art: 14 },
      { label: 'Polycythemia vera and essential thrombocytosis', state: 'remaining', art: 12 },
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
        audioUrl: 'https://drive.google.com/file/d/1twQvgbaRxLMP2vBRu4dVV7nU6zmMHUFV/view?usp=drivesdk'
      },
      {
        label: 'Food-borne Diseases',
        state: 'taken',
        art: 13,
        note: 'Covers bacterial, viral foodborne infections, polio virus, and hepatitis A/E viruses.',
        lectureUrls: [
          { label: 'Lecture Part 1', url: 'https://drive.google.com/file/d/1q5b51GzxLYXT-iOOLfA1M1KnigeJTE1b/view?usp=drivesdk' },
          { label: 'Lecture Part 2', url: 'https://drive.google.com/file/d/15d6Q4cfi8jJ9XW2NpuLBk76ctKe8mKSZ/view?usp=drivesdk' },
          { label: 'Foodborne map', url: '/assets/foodborne-viral-part2-map-v1.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/foodborne-viral-part2-map-v1.pdf', download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/1Lr0LftsOc_-uhH2X82uqzJ0eSkUWgSDz/view?usp=drivesdk'
      },
      {
        label: 'Rabies and Tetanus',
        state: 'taken',
        art: 13,
        note: 'Wednesday report 24 Jun: taught by Dr. Enas Abd El-Rahim.'
      },
      { label: 'Iodine', state: 'remaining', art: 13 },
      { label: 'Nutrition in elderly', state: 'remaining', art: 13 },
      { label: 'AIDS nutrition', state: 'remaining', art: 13 },
      { label: 'Iron deficiency anemia', state: 'remaining', art: 12 },
      { label: 'Nutrition in cancer and obesity', state: 'remaining', art: 13 },
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
          { label: 'Lecture', url: 'https://drive.google.com/file/d/154Sxxn2R_Y-6l2i3pvhFtWP_Roi_GR0Q/view?usp=drivesdk' },
          { label: 'Lecture map', url: '/assets/lft-full-lecture-map-v2.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/lft-full-lecture-map-v2.pdf', download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/122BV8-mfoCWNXt979EaO2ZkMGbGuHpm5/view?usp=drivesdk'
      },
      {
        label: 'Cardiac Biomarkers',
        state: 'taken',
        art: 14,
        lectureUrls: [
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1RkmsX-_jlL3klayg5fvPwk6gk-LYPYHA/view?usp=drivesdk' },
          { label: 'Biomarkers map', url: '/assets/cardiac-biomarkers-map-v1.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/cardiac-biomarkers-map-v1.pdf', download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/168l5PhCSMGsl3GWyVeFpDiw8WEWaJlmC/view?usp=drivesdk'
      },
      {
        label: 'Clinical Immunology Part 1',
        state: 'taken',
        art: 14,
        note: 'Wednesday report 24 Jun: taught by Dr. Mohamed Mostafa.'
      },
      { label: 'Clinical Pathology Research Assignment', state: 'remaining', art: 14 },
      {
        label: 'Diabetes mellitus & disorders of plasma lipids and lipoproteins',
        state: 'taken',
        art: 14,
        note: 'Wednesday report: combined LAB topic. The lecture map currently covers the diabetes/glucose-testing lecture only.',
        lectureUrls: [
          { label: 'DM lecture', url: 'https://drive.google.com/file/d/1wu3gyA28ynSIPuHvqMAvqCmCPIp5zIzp/view?usp=drivesdk' },
          { label: 'Lipid lecture', url: 'https://drive.google.com/file/d/15At9wbM85dRi_4Cbx9AZ76vRuHTiAL_L/view?usp=drivesdk' },
          { label: 'Diabetes map', url: '/assets/diabetes-glucose-testing-map-v1.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/diabetes-glucose-testing-map-v1.pdf', download: true }
        ]
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
          { label: 'Lecture', url: 'https://drive.google.com/file/d/1ICi7ExmMJ3zhXnp-dfh0rlHo0cEYub0E/view?usp=drivesdk' },
          { label: 'Monitoring map', url: '/assets/monitoring-fluid-therapy-map-v1.png' }
        ],
        pdfUrls: [
          { label: 'Download PDF', url: '/assets/monitoring-fluid-therapy-map-v1.pdf', download: true }
        ],
        audioUrl: 'https://drive.google.com/file/d/1o1biv_U_2DBaIVnJPvbN5UXlmPfSkGlq/view?usp=drivesdk'
      },
      {
        label: 'General anaesthesia',
        state: 'taken',
        art: 15,
        note: 'Tuesday report: taught by Dr. Alaa Neyazy; stopped at muscle relaxant.'
      },
      { label: 'CPR', state: 'remaining', art: 15 },
      { label: 'Oxygen therapy', state: 'remaining', art: 15 },
      { label: 'Nutrition in ICU', state: 'remaining', art: 13 },
      { label: 'ICU admission and discharge criteria', state: 'remaining', art: 15 }
    ]
  }
]

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const mobileQuery = window.matchMedia('(max-width: 860px)')
const QUIZ_STORAGE_PREFIX = 'mcq-progress-'
const DRIVE_ICON_URL = '/assets/icons/drive-icon.png'
const PLAY_ICON_URL = '/assets/icons/play-button-v1.png'
const mcqQuizzes = window.mcqQuizzes || {}
const quizState = {
  topicLabel: null,
  sourceId: 'current',
  sourceLabel: 'Current MCQs',
  index: 0,
  answers: {},
  missingQuestionIds: []
}

const coveredStates = new Set(['taken', 'partial'])
const stateLabels = {
  taken: 'Taken in university',
  partial: 'Partially taken',
  announced: 'Announced only',
  remaining: 'Remaining'
}

const subjectExamNotes = {
  'SUR-1': 'Midterm: Sat Jul 25, 2026, 2:30-3:30.',
  'MED-1': 'Midterm: Sat Jul 18, 2026, 2:30-3:30.',
  'MED-2': 'Midterm: Wed Jul 22, 2026, 2:30-3:30.'
}

const midtermExamSchedule = [
  {
    code: 'MED 401-1',
    subjectCode: 'MED-1',
    subjectName: 'Internal Medicine 1',
    date: '2026-07-18',
    dayLabel: 'Sat',
    time: '2:30-3:30'
  },
  {
    code: 'MED 401-2',
    subjectCode: 'MED-2',
    subjectName: 'Internal Medicine 2',
    date: '2026-07-22',
    dayLabel: 'Wed',
    time: '2:30-3:30'
  },
  {
    code: 'SUR 401-1',
    subjectCode: 'SUR-1',
    subjectName: 'Surgery 1',
    date: '2026-07-25',
    dayLabel: 'Sat',
    time: '2:30-3:30'
  }
]

function makeResourceList(items) {
  if (!Array.isArray(items)) return []
  return items
    .filter((item) => item?.label && item?.url)
    .map((item) => ({
      label: item.label,
      url: item.url,
      download: Boolean(item.download)
    }))
}

function mapDatabaseTopic(topic, index) {
  const lectureUrls = makeResourceList(topic.lecture_urls)
  if (topic.lecture_url) {
    lectureUrls.unshift({ label: 'Lecture', url: topic.lecture_url })
  }

  const pdfUrls = makeResourceList(topic.pdf_urls)
  if (topic.pdf_url) {
    pdfUrls.unshift({ label: topic.pdf_label || 'Download PDF', url: topic.pdf_url, download: true })
  }

  return {
    label: topic.title,
    state: topic.status || 'remaining',
    art: Number.isFinite(topic.art) ? topic.art : index % 16,
    section: topic.section || '',
    note: topic.notes || '',
    lectureUrls,
    pdfUrls,
    audioUrl: topic.audio_url || ''
  }
}

function mapDatabaseSubjects(subjectRows, topicRows) {
  return subjectRows.map((subject) => {
    const topics = topicRows
      .filter((topic) => topic.subject_id === subject.id)
      .map((topic, index) => mapDatabaseTopic(topic, index))

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      totalCount: subject.total_count || topics.length,
      examNote: subjectExamNotes[subject.code] || subject.exam_note || '',
      topics
    }
  })
}

async function loadRemoteTrackerData() {
  if (!subjectList || !isSupabaseConfigured()) return

  try {
    const data = await fetchTrackerData()
    if (!data.topics.length) return
    const remoteSubjects = mapDatabaseSubjects(data.subjects, data.topics)
    if (!remoteSubjects.length) return

    subjects = remoteSubjects
    const params = new URLSearchParams(window.location.search)
    const initialRemoteSubject = subjects.find((subject) => subject.code === params.get('subject'))
    activeSubjectCode = params.get('tracker') === '1' && initialRemoteSubject ? initialRemoteSubject.code : null
    expandedSubjectCode = mobileQuery.matches && activeSubjectCode ? activeSubjectCode : null
    renderSubjects()
    if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
    else clearSubjectDetail()
  } catch (error) {
    console.warn('Supabase tracker data unavailable; using local fallback.', error)
  }
}

const subjectList = document.getElementById('subject-list')
const selectedCode = document.getElementById('selected-code')
const selectedName = document.getElementById('selected-name')
const selectedCount = document.getElementById('selected-count')
const selectedPercent = document.getElementById('selected-percent')
const progressFill = document.getElementById('progress-fill')
const topicList = document.getElementById('topic-list')
const trackerSearch = document.getElementById('tracker-search')
const trackerStatusFilter = document.getElementById('tracker-status-filter')
const semesterFill = document.getElementById('semester-fill')
const todayMarker = document.getElementById('today-marker')
const midtermMarker = document.getElementById('midterm-marker')
const finalsMarker = document.getElementById('finals-marker')
const semesterDateScale = document.getElementById('semester-date-scale')
const nextCheckpoint = document.getElementById('next-checkpoint')
const examTodayDay = document.getElementById('exam-today-day')
const examTodayMonth = document.getElementById('exam-today-month')
const next401Exam = document.getElementById('next-401-exam')
const next401Countdown = document.getElementById('next-401-countdown')
const examScheduleCards = document.getElementById('exam-schedule-cards')
const bookingForm = document.getElementById('booking-form')
const bookingName = document.getElementById('booking-name')
const bookingService = document.getElementById('booking-service')
const bookingTime = document.getElementById('booking-time')
const assignmentProgress = document.querySelector('[data-assignment-progress]')
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
const whatsappFeedbackUrl = 'https://wa.me/201030469634?text=Hi%20Ahmed%2C%20I%20have%20a%20recommendation%20to%20improve%20the%20MED%20401%20tracker%3A%20'

const initialParams = new URLSearchParams(window.location.search)
const initialSubject = subjects.find((subject) => subject.code === initialParams.get('subject'))
let activeSubjectCode = initialParams.get('tracker') === '1' && initialSubject ? initialSubject.code : null
let expandedSubjectCode = mobileQuery.matches && activeSubjectCode ? activeSubjectCode : null

function getPercent(subject) {
  if (!subject.totalCount) return 0
  return Math.round((getCoveredCount(subject) / subject.totalCount) * 100)
}

function getTopicUnits(topic) {
  return topic.coverageUnits || 1
}

function getCoveredCount(subject) {
  return subject.topics.reduce((count, topic) => {
    return coveredStates.has(topic.state) ? count + getTopicUnits(topic) : count
  }, 0)
}

function getStateCounts(subject) {
  return subject.topics.reduce((counts, topic) => {
    counts[topic.state] = (counts[topic.state] || 0) + getTopicUnits(topic)
    return counts
  }, {})
}

function getSubjectSummary(subject) {
  const counts = getStateCounts(subject)
  const parts = [
    counts.taken ? `${counts.taken} taken` : '',
    counts.partial ? `${counts.partial} partial` : '',
    counts.announced ? `${counts.announced} announced` : '',
    (counts.remaining || 0) ? `${counts.remaining || 0} remaining` : ''
  ].filter(Boolean)

  return parts.join(' · ')
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
    status: trackerStatusFilter?.value || 'all'
  }
}

function getFilteredTopics(subject) {
  const { query, status } = getTrackerFilters()

  return subject.topics.filter((topic) => {
    const matchesStatus = status === 'all' || topic.state === status
    const searchable = `${subject.code} ${subject.name} ${topic.label} ${topic.section || ''} ${topic.note || ''}`.toLowerCase()
    const matchesQuery = !query || searchable.includes(query)
    return matchesStatus && matchesQuery
  })
}

function getFilteredSubjects() {
  const { query, status } = getTrackerFilters()

  return subjects.filter((subject) => {
    if (!query && status === 'all') return true
    return getFilteredTopics(subject).length > 0
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

function renderResourceItem(item) {
  if (item.type === 'audio') {
    return `
      <a class="topic-resource topic-resource--audio" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="Open lecture record in Google Drive">
        <img class="topic-resource__play-icon" src="${PLAY_ICON_URL}" alt="" loading="lazy">
      </a>
    `
  }

  if (item.type === 'drive-group') {
    const links = item.items.map((driveItem) => `
      <a href="${driveItem.url}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(driveItem.label || 'Lecture source')}
      </a>
    `).join('')

    return `
      <details class="topic-resource-menu">
        <summary class="topic-resource topic-resource--drive" aria-label="Open Drive resources">
          <img class="topic-resource__drive-icon" src="${DRIVE_ICON_URL}" alt="" loading="lazy">
        </summary>
        <span class="topic-resource-menu__links">
          ${links}
        </span>
      </details>
    `
  }

  const isDriveLecture = item.type === 'lecture' && isDriveUrl(item.url)
  const content = isDriveLecture
    ? `<img class="topic-resource__drive-icon" src="${DRIVE_ICON_URL}" alt="" loading="lazy"><span class="sr-only">${escapeHtml(item.label || 'Lecture source')}</span>`
    : escapeHtml(item.label)
  const label = isDriveLecture ? ` aria-label="Open ${escapeHtml(item.label || 'lecture source')} in Google Drive"` : ''

  return `
    <a class="topic-resource topic-resource--${item.type}${isDriveLecture ? ' topic-resource--drive' : ''}" href="${item.url}" target="_blank" rel="noopener noreferrer"${item.download ? ' download' : ''}${label}>
      ${content}
    </a>
  `
}

function renderResourceLinks(topic) {
  const quizSources = getQuizSources(topic.label)
  const quizCount = quizSources.reduce((total, source) => total + source.mcqs.length, 0)
  const quizButton = quizCount ? `
    <button class="topic-resource topic-resource--quiz" type="button" data-quiz-topic="${escapeHtml(topic.label)}">
      MCQs (${quizCount})
    </button>
  ` : ''

  if (!coveredStates.has(topic.state)) {
    return quizButton ? `
      <div class="topic-resources" aria-label="Topic resources">
        ${quizButton}
      </div>
    ` : ''
  }

  const resources = getResourceItems(topic)
  const links = resources.map(renderResourceItem).join('')

  const pendingLecture = topic.lectureUrls?.length ? '' : '<span class="topic-resource topic-resource--pending">Lecture pending</span>'
  const pendingAudio = topic.audioUrl ? '' : '<span class="topic-resource topic-resource--pending">Lecture record pending</span>'

  return `
    <div class="topic-resources" aria-label="Topic resources">
      ${links}
      ${quizButton}
      ${pendingLecture}
      ${pendingAudio}
    </div>
  `
}

function updateTrackerUrl(subjectCode) {
  const url = new URL(window.location.href)
  url.searchParams.set('tracker', '1')
  url.searchParams.set('subject', subjectCode)
  url.hash = 'tracker'
  window.history.replaceState({}, '', url)
}

function sortTopicsForDisplay(subject, topics) {
  const { status } = getTrackerFilters()

  if (status !== 'all') {
    return [...topics].sort((a, b) => {
      return subject.topics.indexOf(a) - subject.topics.indexOf(b)
    })
  }

  const priority = {
    'taken': 0,
    'partial': 0,
    'taken-in-university': 0,
    'announced': 1,
    'lecture-pending': 2,
    'remaining': 3
  }

  return [...topics].sort((a, b) => {
    const pA = priority[a.state] ?? 3
    const pB = priority[b.state] ?? 3

    if (pA !== pB) {
      return pA - pB
    }
    return subject.topics.indexOf(a) - subject.topics.indexOf(b)
  })
}

function renderTopicCard(subject, topic, index) {
  const tileX = topic.art % 4
  const tileY = Math.floor(topic.art / 4)
  const displayNum = String(subject.topics.indexOf(topic) + 1).padStart(2, '0')

  return `
    <li class="topic-item topic-item--${topic.state}" style="--delay: ${index * 45}ms; --tile-x: ${tileX}; --tile-y: ${tileY};">
      <span class="topic-item__image" aria-hidden="true"></span>
      <span class="topic-item__index">${displayNum}</span>
      <span class="topic-item__body">
        <span class="topic-item__label">${topic.label}</span>
        <span class="topic-item__state topic-item__state--${topic.state}">${stateLabels[topic.state] || topic.state}</span>
        ${topic.note ? `<span class="topic-item__note">${topic.note}</span>` : ''}
        ${renderResourceLinks(topic)}
      </span>
    </li>
  `
}

function renderTopicCards(subject, topics = getFilteredTopics(subject)) {
  if (!topics.length) {
    return '<li class="topic-empty">No topics match the current filters.</li>'
  }

  const sortedTopics = sortTopicsForDisplay(subject, topics)
  const takenStates = new Set(['taken', 'partial', 'taken-in-university'])
  const takenGroup = sortedTopics.filter(t => takenStates.has(t.state))
  const upcomingGroup = sortedTopics.filter(t => !takenStates.has(t.state))

  let globalIndex = 0

  function renderGroup(groupTopics, groupTitle) {
    if (!groupTopics.length) return ''

    let groupHtml = `<li class="topic-section-heading" style="--delay: ${globalIndex * 45}ms">${groupTitle}</li>`
    const hasSections = groupTopics.some((t) => t.section)

    if (!hasSections) {
      groupHtml += groupTopics.map((topic) => renderTopicCard(subject, topic, globalIndex++)).join('')
    } else {
      const sections = groupTopics.reduce((collection, topic) => {
        const title = topic.section || 'Topics'
        const section = collection.find((item) => item.title === title)

        if (section) {
          section.topics.push(topic)
        } else {
          collection.push({ title, topics: [topic] })
        }
        return collection
      }, [])

      groupHtml += sections.map((section) => {
        const headingDelay = globalIndex * 45
        const sectionTitleMarkup = `<li class="topic-section-subheading" style="--delay: ${headingDelay}ms">${section.title}</li>`
        const topicMarkup = section.topics.map((topic) => renderTopicCard(subject, topic, globalIndex++)).join('')
        return sectionTitleMarkup + topicMarkup
      }).join('')
    }

    return groupHtml
  }

  return renderGroup(takenGroup, 'Taken in University') + renderGroup(upcomingGroup, 'Upcoming / Remaining')
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
      <div class="quiz-modal__top">
        <div>
          <p class="card__kicker">Interactive MCQs</p>
          <h2 id="quiz-title">Quiz</h2>
          <p class="quiz-modal__meta" id="quiz-meta"></p>
        </div>
        <button class="icon-button" type="button" data-quiz-close aria-label="Close quiz">X</button>
      </div>
      <div class="quiz-progress" aria-label="Quiz progress">
        <span id="quiz-progress-fill"></span>
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
  return modal
}

function getQuizStorageKey(topicLabel, sourceId = quizState.sourceId || 'current') {
  return `${QUIZ_STORAGE_PREFIX}${encodeURIComponent(topicLabel)}::${encodeURIComponent(sourceId)}`
}

function getSavedQuizState(topicLabel, sourceId = 'current') {
  try {
    return JSON.parse(localStorage.getItem(getQuizStorageKey(topicLabel, sourceId)) || 'null')
  } catch {
    localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
    return null
  }
}

function saveQuizState() {
  if (!quizState.topicLabel) return

  const payload = {
    topicLabel: quizState.topicLabel,
    sourceId: quizState.sourceId,
    sourceLabel: quizState.sourceLabel,
    index: quizState.index,
    answers: quizState.answers,
    completed: quizState.completed,
    order: quizState.order,
    questionOptionOrder: quizState.questionOptionOrder,
    missingQuestionIds: quizState.missingQuestionIds || []
  }

  localStorage.setItem(getQuizStorageKey(quizState.topicLabel), JSON.stringify(payload))
}

function clearSavedQuizState(topicLabel, sourceId = quizState.sourceId || 'current') {
  localStorage.removeItem(getQuizStorageKey(topicLabel, sourceId))
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
  const raw = mcqQuizzes[topicLabel]
  if (!raw) return []

  if (raw.sources?.length) {
    return raw.sources.map((source, index) => ({
      id: source.id || `source-${index}`,
      label: source.label || `MCQ source ${index + 1}`,
      description: source.description || '',
      mcqs: source.mcqs || [],
      quizSize: source.quizSize || raw.quizSize || null,
      shuffleQuestions: source.shuffleQuestions ?? raw.shuffleQuestions ?? false,
      shuffleOptions: source.shuffleOptions ?? raw.shuffleOptions ?? false
    })).filter((source) => source.mcqs.length)
  }

  if (Array.isArray(raw)) {
    return [{
      id: 'current',
      label: 'Current MCQs',
      mcqs: raw,
      quizSize: raw.quizSize || null,
      shuffleQuestions: raw.shuffleQuestions || false,
      shuffleOptions: raw.shuffleOptions || false
    }]
  }

  return [{
    id: 'current',
    label: raw.label || 'Current MCQs',
    description: raw.description || '',
    mcqs: raw.mcqs || [],
    quizSize: raw.quizSize || null,
    shuffleQuestions: raw.shuffleQuestions || false,
    shuffleOptions: raw.shuffleOptions || false
  }].filter((source) => source.mcqs.length)
}

function getQuizConfig(topicLabel, sourceId = 'current') {
  const sources = getQuizSources(topicLabel)
  return sources.find((source) => source.id === sourceId) || sources[0] || null
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
    explanation: question.explanation || ''
  }
}

function getTopicData(topicLabel) {
  return subjects.flatMap((subject) => subject.topics).find((topic) => topic.label === topicLabel)
}

function initializeQuiz(topicLabel, { sourceId = 'current', useSaved = false, fresh = false } = {}) {
  const config = getQuizConfig(topicLabel, sourceId)
  if (!config || !config.mcqs.length) return false

  const normalizedQuestions = config.mcqs.map(normalizeQuestion)
  let order = normalizedQuestions.map((question) => question.id)
  let questionOptionOrder = {}
  let index = 0
  let answers = {}
  let completed = false

  const savedState = useSaved ? getSavedQuizState(topicLabel, config.id) : null
  if (savedState && !fresh) {
    order = savedState.order || order
    questionOptionOrder = savedState.questionOptionOrder || {}
    answers = savedState.answers || {}
    index = Number.isInteger(savedState.index) ? savedState.index : 0
    completed = !!savedState.completed
  } else {
    let questionPool = [...normalizedQuestions]
    if (config.shuffleQuestions) {
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
  quizState.index = Math.min(index, Math.max(0, questions.length - 1))
  quizState.answers = answers
  quizState.completed = completed
  quizState.order = order
  quizState.questionOptionOrder = questionOptionOrder
  quizState.questions = questions
  quizState.showResumePrompt = false
  quizState.missingQuestionIds = savedState?.missingQuestionIds || []
  quizState.lectureUrls = getTopicData(topicLabel)?.lectureUrls || []

  if (savedState && !fresh && !savedState.completed && useSaved) {
    quizState.showResumePrompt = true
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

function scrollToQuizQuestion(questionId) {
  const modal = ensureQuizModal()
  const questionCard = modal.querySelector(`[data-quiz-card="${CSS.escape(questionId)}"]`)
  if (!questionCard) return

  questionCard.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })
  const firstChoice = questionCard.querySelector('[data-quiz-answer]')
  if (firstChoice) firstChoice.focus({ preventScroll: true })
}

function renderQuizActions() {
  const modal = ensureQuizModal()
  const actions = modal.querySelector('.quiz-modal__actions')
  if (!actions) return

  if (quizState.showResumePrompt) {
    actions.innerHTML = `
      <button class="quiz-action quiz-action--secondary" type="button" data-quiz-resume>Resume</button>
      <button class="quiz-action quiz-action--secondary" type="button" data-quiz-start-over>Start over</button>
      <button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>
    `
    return
  }

  if (quizState.completed) {
    actions.innerHTML = `
      <button class="quiz-action" type="button" data-quiz-retake>Retake quiz</button>
      <button class="quiz-action" type="button" data-quiz-reset>Reset</button>
      <button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>
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
  const quiz = getCurrentQuiz()
  const score = getQuizScore()

  title.textContent = quizState.topicLabel || 'Quiz'
  if (quizState.showResumePrompt) {
    meta.textContent = `${quizState.sourceLabel} - resume your previous attempt or start over.`
    fill.style.width = '0%'
    return
  }

  if (quizState.completed) {
    const percent = quiz.length ? Math.round((score / quiz.length) * 100) : 0
    meta.textContent = `${quizState.sourceLabel} - final score ${score} / ${quiz.length} (${percent}%)`
    fill.style.width = '100%'
    return
  }

  const answeredCount = Object.keys(quizState.answers).length
  const missedCount = quizState.missingQuestionIds?.length || 0
  meta.textContent = missedCount
    ? `${quizState.sourceLabel} - ${missedCount} unanswered question${missedCount === 1 ? '' : 's'}`
    : `${quizState.sourceLabel} - ${answeredCount} / ${quiz.length} answered`
  fill.style.width = `${(answeredCount / Math.max(quiz.length, 1)) * 100}%`
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
        <button class="quiz-choice${stateClass}" type="button" data-quiz-question="${escapeHtml(question.id)}" data-quiz-answer="${escapeHtml(option.id)}" ${shouldReveal ? 'disabled' : ''}>
          <span>${String.fromCharCode(65 + optionIndex)}</span>
          ${escapeHtml(option.text)}
        </button>
      `
    }).join('')

    const correctOption = getOptionById(question, question.correctOptionId)

    return `
      <article class="quiz-card quiz-question-card${missed ? ' quiz-question-card--missed' : ''}" data-quiz-card="${escapeHtml(question.id)}">
        <p class="quiz-question"><strong>Q${questionIndex + 1}.</strong> ${escapeHtml(question.question)}</p>
        ${missed ? '<p class="quiz-missed-note">Answer this question before submitting.</p>' : ''}
        <div class="quiz-choices">${choices}</div>
        ${shouldReveal ? `
          <div class="quiz-explanation">
            <strong>${selectedOptionId === question.correctOptionId ? 'Correct.' : 'Correct answer: ' + escapeHtml(correctOption?.text || '')}</strong>
            <p>${escapeHtml(question.explanation)}</p>
          </div>
        ` : ''}
      </article>
    `
  }).join('')

  body.innerHTML = `
    ${resultBanner}
    <div class="quiz-question-list">${questionCards}</div>
  `
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
    <article class="quiz-card quiz-prompt">
      <p class="quiz-prompt__label">You have a saved attempt for this quiz.</p>
      <p class="quiz-prompt__message">Resume your previous attempt or start over with a fresh quiz.</p>
    </article>
  `
}

function renderQuizSourcePicker(topicLabel) {
  const sources = getQuizSources(topicLabel)
  const modal = ensureQuizModal()
  const title = modal.querySelector('#quiz-title')
  const meta = modal.querySelector('#quiz-meta')
  const fill = modal.querySelector('#quiz-progress-fill')
  const body = modal.querySelector('#quiz-body')
  const actions = modal.querySelector('.quiz-modal__actions')

  title.textContent = topicLabel
  meta.textContent = 'Choose an MCQ source.'
  fill.style.width = '0%'
  body.innerHTML = `
    <article class="quiz-card quiz-source-picker">
      ${sources.map((source) => `
        <button class="quiz-source-option" type="button" data-quiz-source="${source.id}" data-quiz-topic="${escapeHtml(topicLabel)}">
          <strong>${source.label}</strong>
          <span>${source.mcqs.length} questions${source.description ? ` - ${source.description}` : ''}</span>
        </button>
      `).join('')}
    </article>
  `
  actions.innerHTML = '<button class="quiz-action quiz-action--primary" type="button" data-quiz-close>Close</button>'
  modal.setAttribute('aria-hidden', 'false')
  document.body.classList.add('panel-open')
}


function openQuiz(topicLabel, sourceId = 'current') {
  const config = getQuizConfig(topicLabel, sourceId)
  if (!config || !config.mcqs.length) return

  const savedState = getSavedQuizState(topicLabel, config.id)
  const useSaved = Boolean(savedState)
  initializeQuiz(topicLabel, { sourceId: config.id, useSaved, fresh: false })

  const modal = ensureQuizModal()
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
}

function closeQuiz() {
  const modal = ensureQuizModal()
  modal.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('panel-open')
}

function handleQuizClick(event) {
  const sourceButton = event.target.closest('[data-quiz-source]')
  if (sourceButton) {
    openQuiz(sourceButton.dataset.quizTopic, sourceButton.dataset.quizSource)
    return
  }

  const openButton = event.target.closest('[data-quiz-topic]')
  if (openButton) {
    const sources = getQuizSources(openButton.dataset.quizTopic)
    if (sources.length > 1) renderQuizSourcePicker(openButton.dataset.quizTopic)
    else openQuiz(openButton.dataset.quizTopic, sources[0]?.id || 'current')
    return
  }

  if (event.target.closest('[data-quiz-close]')) {
    closeQuiz()
    return
  }

  if (event.target.closest('[data-quiz-resume]')) {
    quizState.showResumePrompt = false
    renderQuizQuestion()
    return
  }

  if (event.target.closest('[data-quiz-start-over]')) {
    const topicLabel = quizState.topicLabel
    const sourceId = quizState.sourceId
    clearSavedQuizState(topicLabel, sourceId)
    initializeQuiz(topicLabel, { sourceId, fresh: true })
    renderQuizQuestion()
    return
  }

  if (event.target.closest('[data-quiz-retake]')) {
    const topicLabel = quizState.topicLabel
    const sourceId = quizState.sourceId
    clearSavedQuizState(topicLabel, sourceId)
    initializeQuiz(topicLabel, { sourceId, fresh: true })
    renderQuizQuestion()
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
    return
  }

  if (event.target.closest('[data-quiz-reset]')) {
    quizState.answers = {}
    quizState.index = 0
    quizState.completed = false
    quizState.missingQuestionIds = []
    clearSavedQuizState(quizState.topicLabel, quizState.sourceId)
    renderQuizQuestion()
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
      triggerCorrectAnswerCelebration()
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

  subjectList.innerHTML = visibleSubjects.map((subject, index) => {
    const percent = getPercent(subject)
    const filteredTopics = getFilteredTopics(subject)
    const isActive = subject.code === activeSubjectCode
    const isExpanded = subject.code === expandedSubjectCode
    const activeClass = isActive ? ' active' : ''
    const expandedClass = isExpanded ? ' expanded' : ''
    const inlinePanel = isExpanded ? `
      <div class="subject-inline-detail">
        <div class="subject-inline-detail__top">
          <span>${getCoveredCount(subject)} covered</span>
          <span>${subject.totalCount - getCoveredCount(subject)} not covered</span>
        </div>
        <ul class="topic-list topic-list--inline">
          ${renderTopicCards(subject, filteredTopics)}
        </ul>
      </div>
    ` : ''

    return `
      <div class="subject-row${expandedClass}" style="--delay: ${index * 45}ms">
        <button class="subject-button${activeClass}" type="button" data-code="${subject.code}" aria-expanded="${isExpanded}">
          <span>
            <strong>${subject.code}</strong>
            <small>${subject.name}</small>
            <em class="subject-button__summary">${getSubjectSummary(subject)}</em>
          </span>
          <span class="subject-button__meta">${filteredTopics.length}/${subject.totalCount}</span>
          <span class="subject-button__bar" aria-hidden="true">
            <span style="width: ${percent}%"></span>
          </span>
        </button>
        ${inlinePanel}
      </div>
    `
  }).join('')

  subjectList.querySelectorAll('.subject-button').forEach((button) => {
    button.addEventListener('click', () => {
      setActiveSubject(button.dataset.code)
    })
  })
}

function clearSubjectDetail() {
  if (!selectedCode || !selectedName || !selectedCount || !selectedPercent || !progressFill || !topicList) return
  selectedCode.textContent = 'Tracker'
  selectedName.textContent = 'Choose a subject'
  selectedCount.textContent = 'Closed'
  selectedPercent.textContent = '0%'
  progressFill.style.width = '0%'
  topicList.innerHTML = '<li class="topic-empty">Click a subject card to view its topics.</li>'
}

function setActiveSubject(code, mobileMode = 'toggle') {
  const subject = subjects.find((item) => item.code === code) || subjects[0]
  updateTrackerUrl(subject.code)

  if (mobileQuery.matches) {
    if (mobileMode === 'open') {
      expandedSubjectCode = subject.code
    } else if (mobileMode === 'closed') {
      expandedSubjectCode = null
    } else {
      expandedSubjectCode = expandedSubjectCode === subject.code ? null : subject.code
    }
    activeSubjectCode = subject.code
    renderSubjects()
    return
  }

  activeSubjectCode = subject.code
  expandedSubjectCode = null

  subjectList.querySelectorAll('.subject-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.code === subject.code)
    button.setAttribute('aria-expanded', 'false')
  })

  const percent = getPercent(subject)
  const visibleTopics = getFilteredTopics(subject)
  selectedCode.textContent = subject.code
  selectedName.textContent = subject.name
  selectedCount.textContent = `${visibleTopics.length} shown`
  selectedPercent.textContent = `${percent}%`

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

  topicList.innerHTML = renderTopicCards(subject, visibleTopics)
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

function getExamCountdownText(daysUntil) {
  if (daysUntil > 1) return `${daysUntil} days left`
  if (daysUntil === 1) return '1 day left'
  if (daysUntil === 0) return 'Today'
  return 'Completed'
}

function render401ExamSchedule() {
  if (!examScheduleCards) return

  const today = new Date()
  const todayStart = startOfDay(today)
  const todayParts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short'
  }).formatToParts(today)
  const dayPart = todayParts.find((part) => part.type === 'day')?.value || ''
  const monthPart = todayParts.find((part) => part.type === 'month')?.value || ''

  if (examTodayDay) examTodayDay.textContent = dayPart
  if (examTodayMonth) examTodayMonth.textContent = monthPart

  const scheduleWithState = midtermExamSchedule.map((exam) => {
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
      next401Exam.textContent = `Next 401 exam: ${nextExam.code} on ${formatExamDate(nextExam.date)}`
    }
    if (next401Countdown) {
      next401Countdown.textContent = `${getExamCountdownText(nextExam.daysUntil)} - ${nextExam.subjectName} at ${nextExam.time}.`
    }
  } else {
    if (nextCheckpoint) {
      nextCheckpoint.innerHTML = '<span class="checkpoint-code">Finals</span><span class="checkpoint-meta">Sep 19, 2026</span>'
    }
    if (next401Exam) next401Exam.textContent = '401 midterm schedule complete'
    if (next401Countdown) next401Countdown.textContent = 'All listed 401 midterm exams have passed.'
  }

  examScheduleCards.innerHTML = scheduleWithState.map((exam) => {
    const isNext = nextExam?.code === exam.code
    const isDone = exam.daysUntil < 0
    const statusLabel = isNext ? getExamCountdownText(exam.daysUntil) : isDone ? 'Completed' : 'Upcoming'
    const stateClass = isNext ? ' exam-card--next' : isDone ? ' exam-card--done' : ''

    return `
      <button class="exam-card${stateClass}" type="button" data-code="${exam.subjectCode}" aria-label="Open ${escapeHtml(exam.subjectName)} tracker">
        <span>${escapeHtml(exam.code)}</span>
        <strong>${escapeHtml(exam.subjectName)}</strong>
        <time datetime="${exam.date}T14:30">${exam.dayLabel} ${formatExamDate(exam.date)}</time>
        <em>${escapeHtml(exam.time)}</em>
        <small>${escapeHtml(statusLabel)}</small>
      </button>
    `
  }).join('')

  examScheduleCards.querySelectorAll('.exam-card').forEach((card) => {
    card.addEventListener('click', () => {
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
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

function renderSemesterTimeline() {
  if (!semesterFill || !todayMarker || !midtermMarker || !finalsMarker) return

  const today = new Date()
  const semesterStart = new Date('2026-05-25T00:00:00')
  const midterm = new Date('2026-07-18T00:00:00')
  const finals = new Date('2026-09-19T00:00:00')
  const todayPercent = getTimelinePercent(today, semesterStart, finals)
  const midtermPercent = getTimelinePercent(midterm, semesterStart, finals)

  semesterFill.style.width = `${todayPercent}%`
  todayMarker.style.left = `${todayPercent}%`
  midtermMarker.style.left = `${midtermPercent}%`
  finalsMarker.style.left = '100%'

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
    const nextExam = midtermExamSchedule
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
  if (!assignmentProgress) return

  const startDate = new Date(`${assignmentProgress.dataset.startDate}T00:00:00`)
  const dueDate = new Date(`${assignmentProgress.dataset.dueDate}T00:00:00`)
  const today = new Date()
  const fill = assignmentProgress.querySelector('[data-assignment-fill]')
  const daysLabel = assignmentProgress.querySelector('[data-assignment-days]')
  const caption = assignmentProgress.querySelector('[data-assignment-caption]')
  const totalDays = Math.max(1, Math.ceil((dueDate - startDate) / 86400000))
  const daysLeft = Math.ceil((dueDate - today) / 86400000)
  const elapsedDays = totalDays - daysLeft
  const percent = clamp((elapsedDays / totalDays) * 100, 0, 100)

  if (fill) fill.style.width = `${percent}%`

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
    caption.textContent = `Due Sep 5, 2026 - ${Math.round(percent)}% of the assignment window has passed.`
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

function renderWhatsappFeedback() {
  if (document.querySelector('.whatsapp-feedback')) return

  const button = document.createElement('a')
  button.className = 'whatsapp-feedback'
  button.href = whatsappFeedbackUrl
  button.target = '_blank'
  button.rel = 'noopener noreferrer'
  button.setAttribute('aria-label', 'Send improvement recommendation on WhatsApp')
  button.innerHTML = `
    <span class="whatsapp-feedback__ring" aria-hidden="true"></span>
    <span class="whatsapp-feedback__icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" role="img">
        <path d="M16 3.2c-7.05 0-12.8 5.55-12.8 12.38 0 2.25.64 4.45 1.84 6.36L3.1 28.8l7.08-1.82A13.18 13.18 0 0 0 16 28c7.05 0 12.8-5.55 12.8-12.42S23.05 3.2 16 3.2Zm0 22.64c-1.86 0-3.68-.5-5.27-1.45l-.38-.23-4.2 1.08 1.13-4.02-.25-.4a9.93 9.93 0 0 1-1.62-5.24C5.41 9.98 10.16 5.36 16 5.36s10.59 4.62 10.59 10.22S21.84 25.84 16 25.84Zm5.82-7.67c-.32-.15-1.88-.9-2.17-1-.29-.1-.5-.15-.72.15-.21.31-.82 1-.99 1.2-.18.2-.36.23-.67.08-.32-.15-1.33-.47-2.53-1.51-.94-.81-1.57-1.81-1.75-2.12-.18-.31-.02-.47.13-.62.14-.13.32-.36.47-.54.16-.18.21-.31.32-.52.1-.2.05-.38-.03-.54-.08-.15-.72-1.67-.98-2.29-.26-.6-.52-.52-.72-.53h-.61c-.21 0-.54.08-.83.38-.29.31-1.09 1.04-1.09 2.53 0 1.49 1.12 2.93 1.28 3.14.16.2 2.2 3.25 5.34 4.56.75.31 1.33.5 1.78.64.75.23 1.43.2 1.97.12.6-.09 1.88-.74 2.14-1.46.27-.72.27-1.33.19-1.46-.08-.13-.29-.2-.61-.36Z" />
      </svg>
    </span>
    <span class="whatsapp-feedback__label">Recommend</span>
  `

  document.body.append(button)
}

function renderNewsFilters() {
  if (!newsFeed) return

  const course = newsCourseFilter?.value || 'all'
  const order = newsDateFilter?.value || 'newest'
  const cards = [...newsFeed.querySelectorAll('.update-panel')]

  cards
    .sort((a, b) => {
      const priorityDifference = Number(b.dataset.priority || 0) - Number(a.dataset.priority || 0)
      if (priorityDifference) return priorityDifference
      const difference = new Date(a.dataset.date || 0) - new Date(b.dataset.date || 0)
      return order === 'oldest' ? difference : -difference
    })
    .forEach((card) => {
      card.hidden = course !== 'all' && card.dataset.course !== course
      newsFeed.append(card)
    })

  const hasVisibleCards = cards.some((card) => !card.hidden)
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

if (subjectList) {
  renderSubjects()
  if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
  else clearSubjectDetail()
  renderSemesterTimeline()
  render401ExamSchedule()
  window.setInterval(render401ExamSchedule, 3600000)
  loadRemoteTrackerData()
}

document.addEventListener('click', handleQuizClick)


if (trackerSearch && trackerStatusFilter) {
  ;[trackerSearch, trackerStatusFilter].forEach((control) => {
    control.addEventListener('input', () => {
      renderSubjects()
      if (activeSubjectCode) setActiveSubject(activeSubjectCode, 'open')
      else clearSubjectDetail()
    })
  })
}

if (newsFeed) {
  renderNewsFilters()
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

renderWhatsappFeedback()
renderAssignmentProgress()

// ========== GLOBAL CLICK GLOW EFFECT ==========

function createClickGlow(event) {
  // Only trigger on primary pointer (left click/tap)
  if (event.button !== 0 && event.button !== undefined) return
  if (!event.isPrimary) return
  
  const glow = document.createElement('div')
  glow.className = 'click-glow'
  glow.setAttribute('aria-hidden', 'true')
  glow.style.setProperty('--x', event.clientX + 'px')
  glow.style.setProperty('--y', event.clientY + 'px')
  
  document.body.appendChild(glow)
  
  // Clean up after animation
  glow.addEventListener('animationend', () => {
    glow.remove()
  }, { once: true })
  
  // Fallback cleanup for safety
  setTimeout(() => {
    if (glow.parentNode) glow.remove()
  }, 700)
}

// Attach click glow listener
document.addEventListener('pointerdown', createClickGlow, true)
