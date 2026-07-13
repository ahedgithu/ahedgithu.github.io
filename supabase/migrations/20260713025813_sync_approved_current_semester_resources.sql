update public.tracker_topics
set drive_url = case
  when subject_code = 'SUR-1' and topic_label = 'Spleen'
    then 'https://docs.google.com/presentation/d/1GfFE2goGP1WRw5D14YqQHW9ptEuJkBMz/edit?usp=drivesdk'
  when subject_code = 'SUR-2' and topic_label in (
    'Chest trauma / trauma up to sternal fractures',
    'Cardiothoracic Trauma Part 1'
  ) then 'https://docs.google.com/presentation/d/1wF1XfNhzOsjS7cX8t6-xyEi92dQShVB-/edit?usp=drivesdk'
  when subject_code = 'MED-2' and topic_label = 'Pulmonary Embolism'
    then 'https://docs.google.com/presentation/d/1TicuEg59UwuZYaZ4OPBiD6vOfDupF8za/edit?usp=drivesdk'
  when subject_code = 'ONC' and topic_label = 'Hemolytic anemia'
    then 'https://drive.google.com/file/d/1gVZZDhS-d6oiNbk7WDhgG_v1kX_5_2Nm/view?usp=drivesdk'
  when subject_code = 'NUT' and topic_label = 'Iron deficiency anemia'
    then 'https://drive.google.com/file/d/1RcDNwFl91CVAErQ5IyY0cX--mJTGOhZV/view?usp=drivesdk'
  else drive_url
end
where section = '401'
  and track = 'theoretical'
  and (
    (subject_code = 'SUR-1' and topic_label = 'Spleen')
    or (subject_code = 'SUR-2' and topic_label in ('Chest trauma / trauma up to sternal fractures', 'Cardiothoracic Trauma Part 1'))
    or (subject_code = 'MED-2' and topic_label = 'Pulmonary Embolism')
    or (subject_code = 'ONC' and topic_label = 'Hemolytic anemia')
    or (subject_code = 'NUT' and topic_label = 'Iron deficiency anemia')
  );

update public.tracker_topics
set drive_url = null
where section = '401'
  and subject_code = 'MED-1'
  and track = 'theoretical'
  and topic_label = 'Small intestine: diarrhea, malabsorption, celiac, Whipple'
  and drive_url = audio_url;
