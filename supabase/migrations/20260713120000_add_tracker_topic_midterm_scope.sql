alter table public.tracker_topics
add column if not exists midterm_scope boolean not null default false;

alter table public.tracker_topics
add column if not exists midterm_scope_note text;

update public.tracker_topics as topic
set midterm_scope = true,
    midterm_scope_note = seed.midterm_scope_note
from (values
  ('401', 'SUR-1', 'Liver', 'SUR 401-1 scope: Liver. Source: Dr. Abu Alata PDFs and lecture recordings.'),
  ('401', 'SUR-1', 'Esophagus topics', 'SUR 401-1 scope: Esophagus. Source: Dr. Hisham''s book and lecture recordings.'),
  ('401', 'SUR-1', 'Tongue', 'SUR 401-1 scope: Tongue. Source: Dr. Abu Alata PDFs and lecture recordings.'),
  ('401', 'SUR-1', 'Stomach', 'SUR 401-1 scope: Stomach. Source: Dr. Hisham''s book and lecture recordings.'),
  ('401', 'SUR-1', 'Spleen', 'SUR 401-1 scope: Spleen. Source: Dr. Abu Alata PDFs and lecture recordings.'),
  ('401', 'MED-2', 'Chest Symptomatology', 'MED 401-2 Chest scope: cough, sputum, hemoptysis, and dyspnea.'),
  ('401', 'MED-2', 'Pulmonary Function Test', 'MED 401-2 Chest scope: PFTs, lung volumes, capacities, flow rates, diffusion, and obstructive vs restrictive clinical applications.'),
  ('401', 'MED-2', 'Diseases of the airways and bronchial asthma Part 1', 'MED 401-2 Chest scope: airway diseases, small airway diseases, subglottic stenosis, vocal cord dysfunction, and bronchial asthma basics.'),
  ('401', 'MED-2', 'Chronic Bronchitis and COPD', 'MED 401-2 Chest scope: chronic bronchitis is included; COPD is excluded.'),
  ('402', 'SUR402-1', 'Thyroid', 'SUR402-1 midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Parathyroid', 'SUR402-1 midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Breast / Fibroadenoma', 'SUR402-1 midterm scope: Breast. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Breast tumor & cancer', 'SUR402-1 midterm scope: Breast. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Hernia', 'SUR402-1 midterm scope: all hernia including abdominal and inguino-scrotal hernia. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Acromegaly', 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Geriatric assessment and changes', 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Atypical presentations of diseases', 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Prolactin', 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Comprehensive assessment', 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'DM till end of DKA', 'MED402-1 endocrinology midterm scope: DM. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Complications of DM', 'MED402-1 endocrinology midterm scope: DM. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Management of DM', 'MED402-1 endocrinology midterm scope: DM. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Osteoporosis', 'MED402-1 geriatrics midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Panhypopituitarism', 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'SIADH', 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-1', 'Diabetes insipidus', 'MED402-1 endocrinology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Intro into neuro, book p.1-15', 'MED402-2 neurology midterm scope starts from page 1. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Psych history and examination', 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Hemiplegia', 'MED402-2 neurology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Mood disorders', 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Paraplegia', 'MED402-2 neurology midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Mood stabilizers', 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Antidepressants', 'MED402-2 psychiatry midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Cranial nerves / speech / sensory system', 'MED402-2 neurology page 1-69 scope. Source: Midterm exams curriculum 402.'),
  ('402', 'MED402-2', 'Vascular occlusive syndrome and brain blood supply', 'MED402-2 neurology page 1-69 scope. Source: Midterm exams curriculum 402.'),
  ('402', 'GYNA402', 'Menstrual cycle', 'GYNA402 midterm scope. 2026 book pages 12-16.'),
  ('402', 'GYNA402', 'Abortion', 'GYNA402 midterm scope. 2026 book pages 19-25.'),
  ('402', 'GYNA402', 'Amenorrhea', 'GYNA402 midterm scope. 2026 book pages 25-29.'),
  ('402', 'GYNA402', 'Ectopic pregnancy', 'GYNA402 midterm scope. 2026 book pages 25-29.'),
  ('402', 'GYNA402', 'PCOS', 'GYNA402 midterm scope. 2026 book pages 34-36.'),
  ('402', 'GYNA402', 'Vesicular mole', 'GYNA402 midterm scope. 2026 book pages 30-33. Malignant GTD is not included.'),
  ('402', 'GYNA402', 'Antenatal care round', 'OBS rounds midterm scope. 2026 book pages 147-149, 1-13.'),
  ('402', 'GYNA402', 'Abnormal uterine bleeding', 'GYNA402 midterm scope. 2026 book pages 92-96.'),
  ('402', 'GYNA402', 'Dysmenorrhea', 'GYNA402 midterm scope. 2026 book pages 17-18.'),
  ('402', 'GYNA402', 'Hyperprolactinemia', 'GYNA402 midterm scope. 2026 book page 30.'),
  ('402', 'GYNA402', 'Antepartum hemorrhage', 'GYNA402 midterm scope. 2026 book pages 35-41.'),
  ('402', 'GYNA402', 'Lower genital tract infection', 'GYNA rounds midterm scope. 2026 book pages 61-67.'),
  ('402', 'PED402', 'Growth & Development', 'PED402 midterm scope. Source: Midterm exams curriculum 402 and PED402 notes.'),
  ('402', 'PED402', 'Nutrition', 'PED402 midterm scope. Source: Midterm exams curriculum 402 and PED402 notes.'),
  ('402', 'PED402', 'Cardiology intro/pages 323-326/362', 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.'),
  ('402', 'PED402', 'ASD / VSD / PDA', 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.'),
  ('402', 'PED402', 'F4 / TGA / AVC', 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.'),
  ('402', 'PED402', 'RHD / SBE / Cardiomyopathy', 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.'),
  ('402', 'PED402', 'AS / PS / CoA', 'PED402 midterm scope: Cardiology. Source: Midterm exams curriculum 402 and PED402 notes.')
) as seed(section, subject_code, topic_label, midterm_scope_note)
where topic.section = seed.section
  and topic.subject_code = seed.subject_code
  and topic.track = 'theoretical'
  and topic.topic_label = seed.topic_label;

-- Replace the earlier 401 draft scope with the confirmed Spring 2026 curriculum.
update public.tracker_topics
set midterm_scope = false,
    midterm_scope_note = null
where section = '401';

update public.tracker_topics as topic
set midterm_scope = true,
    midterm_scope_note = seed.midterm_scope_note
from (values
  ('SUR-1', 'Liver', 'SUR 401-1 scope: Liver. Source: Dr. Abu Alata PDFs and lecture recordings.'),
  ('SUR-1', 'Esophagus topics', 'SUR 401-1 scope: Esophagus. Source: Dr. Hisham''s book and lecture recordings.'),
  ('SUR-1', 'Tongue', 'SUR 401-1 scope: Tongue. Source: Dr. Abu Alata PDFs and lecture recordings.'),
  ('SUR-1', 'Stomach', 'SUR 401-1 scope: Stomach. Source: Dr. Hisham''s book and lecture recordings.'),
  ('SUR-1', 'Spleen', 'SUR 401-1 scope: Spleen. Source: Spring 2026 midterm curriculum, Dr. Abu Alata PDFs and lecture recordings.'),
  ('MED-1', 'GERD, Barrett''s Esophagus, Esophageal Motility Disorders', 'MED 401-1 scope: Diseases of the Esophagus. Source: Spring 2026 midterm curriculum and Dr. Hisham Samy lecture recordings.'),
  ('MED-1', 'Investigation of Acute Hepatitis', 'MED 401-1 scope: Acute viral hepatitis and investigation of liver diseases. Source: Spring 2026 midterm curriculum.'),
  ('MED-1', 'Chronic viral and non-viral hepatitis', 'MED 401-1 scope: NAFLD/NASH, autoimmune hepatitis, and chronic viral hepatitis. Source: Spring 2026 midterm curriculum.'),
  ('MED-1', 'Small intestine: diarrhea, malabsorption, celiac, Whipple', 'MED 401-1 scope: Diseases of the Small Intestine. Source: Spring 2026 midterm curriculum.'),
  ('MED-1', 'Cirrhosis complications: portal hypertension, ascites', 'MED 401-1 scope: Liver cirrhosis and portal hypertension. Source: Spring 2026 midterm curriculum.'),
  ('MED-1', 'Diseases of the Pancreas', 'MED 401-1 scope: Diseases of the Pancreas. Source: Spring 2026 midterm curriculum and Dr. Hisham Samy lecture recordings.'),
  ('MED-2', 'Rheumatic fever and infective endocarditis', 'MED 401-2 Cardiology scope: Rheumatic Fever only. Infective endocarditis is not listed in the Spring 2026 midterm curriculum.'),
  ('MED-2', 'Mitral valve diseases', 'MED 401-2 Cardiology scope: Mitral valve diseases. Source: Spring 2026 midterm curriculum.'),
  ('MED-2', 'Aortic valve diseases', 'MED 401-2 Cardiology scope: Aortic valve diseases. Source: Spring 2026 midterm curriculum.'),
  ('MED-2', 'Systemic Hypertension', 'MED 401-2 Cardiology scope: Systemic Hypertension. Source: Spring 2026 midterm curriculum.'),
  ('MED-2', 'Pulmonary Embolism', 'MED 401-2 Cardiology scope: Pulmonary Embolism. Source: Spring 2026 midterm curriculum.'),
  ('MED-2', 'Chest Symptomatology', 'MED 401-2 Chest scope: cough, sputum, hemoptysis, and dyspnea.'),
  ('MED-2', 'Pulmonary Function Test', 'MED 401-2 Chest scope: PFTs, lung volumes, capacities, flow rates, diffusion, and obstructive vs restrictive clinical applications.'),
  ('MED-2', 'Diseases of the airways and bronchial asthma Part 1', 'MED 401-2 Chest scope: airway and small-airway diseases, subglottic stenosis, vocal cord dysfunction, and bronchial asthma including severity assessment, stepwise treatment, biological treatment, and ACO/ACOS. Genetic treatment is excluded.'),
  ('MED-2', 'Chronic Bronchitis and COPD', 'MED 401-2 Chest scope: only ACO/ACOS is included from the COPD and overlaps section. COPD is excluded, and genetic treatment for asthma is excluded.')
) as seed(subject_code, topic_label, midterm_scope_note)
where topic.section = '401'
  and topic.subject_code = seed.subject_code
  and topic.track = 'theoretical'
  and topic.topic_label = seed.topic_label;

-- Add only the high-confidence Drive audit matches and preserve populated fields.
update public.tracker_topics as topic
set audio_url = coalesce(topic.audio_url, seed.audio_url),
    drive_url = coalesce(topic.drive_url, seed.drive_url)
from (values
  ('401', 'MED-1', 'Small intestine: diarrhea, malabsorption, celiac, Whipple', 'https://drive.google.com/file/d/10G1Kk8lgpPk7_N6NDp0xqdTiZZKFz0yR/view?usp=drivesdk', null),
  ('401', 'MED-1', 'Cirrhosis complications: portal hypertension, ascites', 'https://drive.google.com/file/d/17KyoPZaodfoIqTQtEzn21cTxNQOpA9ks/view?usp=drivesdk', null),
  ('401', 'MED-2', 'Diseases of the airways and bronchial asthma Part 1', 'https://drive.google.com/file/d/1w1y-MVBWAmFr78kVW7CGHADsw-CmFsBK/view?usp=drivesdk', null),
  ('401', 'ONC', 'Polycythemia vera and essential thrombocytosis', 'https://drive.google.com/file/d/1IgrJBTBINWlx0k58TiCCxWUt-u_XUJ1G/view?usp=drivesdk', null),
  ('401', 'LAB', 'Diabetes mellitus & disorders of plasma lipids and lipoproteins', 'https://drive.google.com/file/d/12gVSpb0WPGpSicqCYBXZBxipQttFp7Q1/view?usp=drivesdk', null),
  ('401', 'SUR-1', 'Spleen', 'https://drive.google.com/file/d/1_o-r7uaXAHQW8EEGixSW91tBPnpcjEDv/view?usp=drivesdk', null),
  ('401', 'SUR-2', 'Empyema', 'https://drive.google.com/file/d/1WlMpLSuqu3GBmoMLwRtxEOsUl2D8EsVK/view?usp=drivesdk', null),
  ('402', 'SUR402-1', 'Thyroid', null, 'https://docs.google.com/presentation/d/1fpmXmkNcEH_HBg8n-R3eD0-9wp_D4er7/edit?usp=drivesdk'),
  ('402', 'SUR402-1', 'Parathyroid', null, 'https://docs.google.com/presentation/d/1LlqKUnMnJXLDfb2oOlhxP6HLi3Qm0p7o/edit?usp=drivesdk'),
  ('402', 'SUR402-1', 'Breast / Fibroadenoma', null, 'https://docs.google.com/presentation/d/1s-6fayQ9x05HinNwyX0o_Fr3rxA-q-pl/edit?usp=drivesdk'),
  ('402', 'SUR402-1', 'Breast tumor & cancer', null, 'https://docs.google.com/presentation/d/1EQXEsMqAkUa9_ai37kp-QuKJ9rSeoLuc/edit?usp=drivesdk')
) as seed(section, subject_code, topic_label, audio_url, drive_url)
where topic.section = seed.section
  and topic.subject_code = seed.subject_code
  and topic.track = 'theoretical'
  and topic.topic_label = seed.topic_label;

create or replace function public.set_tracker_topic_update_metadata()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
    or row(new.section, new.subject_code, new.subject_name, new.track, new.topic_label,
      new.state, new.stop_note, new.drive_url, new.audio_url, new.midterm_scope, new.midterm_scope_note)
    is distinct from
      row(old.section, old.subject_code, old.subject_name, old.track, old.topic_label,
      old.state, old.stop_note, old.drive_url, old.audio_url, old.midterm_scope, old.midterm_scope_note)
  then
    new.updated_at = now();
    new.updated_by = auth.uid();
  end if;
  return new;
end;
$$;
