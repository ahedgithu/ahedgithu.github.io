create index question_imports_source_scope_idx
  on public.question_imports (
    source_id, university_id, section, subject_code, topic_label
  );

create index questions_import_scope_idx
  on public.questions (
    import_id, source_id, university_id, section, subject_code, topic_label
  );

create index questions_source_scope_idx
  on public.questions (
    source_id, university_id, section, subject_code, topic_label
  );

create index question_validation_question_import_idx
  on public.question_validation_issues (question_id, import_id);
