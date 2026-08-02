-- tracker_topics already has PRIMARY KEY (id); keep one unique index only.
drop index if exists public.tracker_topics_id_uidx;
