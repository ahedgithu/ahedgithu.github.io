update public.tracker_topics
set audio_url = 'https://drive.google.com/file/d/1_o-r7uaXAHQW8EEGixSW91tBPnpcjEDv/view?usp=drivesdk'
where section = '401'
  and subject_code = 'SUR-1'
  and track = 'theoretical'
  and topic_label = 'Spleen';

insert into public.tracker_topics
  (section, subject_code, subject_name, track, topic_label, state, drive_url, midterm_scope, midterm_scope_note)
values
  ('402', 'SUR402-1', 'Surgery 402-1', 'theoretical', 'Thyroid', 'taken', 'https://docs.google.com/presentation/d/1fpmXmkNcEH_HBg8n-R3eD0-9wp_D4er7/edit?usp=drivesdk', true, 'SUR402-1 midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Surgery 402-1', 'theoretical', 'Parathyroid', 'taken', 'https://docs.google.com/presentation/d/1LlqKUnMnJXLDfb2oOlhxP6HLi3Qm0p7o/edit?usp=drivesdk', true, 'SUR402-1 midterm scope. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Surgery 402-1', 'theoretical', 'Breast / Fibroadenoma', 'taken', 'https://docs.google.com/presentation/d/1s-6fayQ9x05HinNwyX0o_Fr3rxA-q-pl/edit?usp=drivesdk', true, 'SUR402-1 midterm scope: Breast. Source: Midterm exams curriculum 402.'),
  ('402', 'SUR402-1', 'Surgery 402-1', 'theoretical', 'Breast tumor & cancer', 'taken', 'https://docs.google.com/presentation/d/1EQXEsMqAkUa9_ai37kp-QuKJ9rSeoLuc/edit?usp=drivesdk', true, 'SUR402-1 midterm scope: Breast. Source: Midterm exams curriculum 402.')
on conflict (section, subject_code, track, topic_label)
do update set
  drive_url = excluded.drive_url,
  midterm_scope = excluded.midterm_scope,
  midterm_scope_note = excluded.midterm_scope_note;
