alter table email_settings add column sender_display_name text;
comment on column email_settings.sender_display_name IS 'Le nom de l''expediteur';