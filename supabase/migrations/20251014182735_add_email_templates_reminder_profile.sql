alter table reminder_profile add column if not exists email_template_1 text;

comment on column reminder_profile.email_template_1 is 'Modèle de corps d''email en fonction du profil - Relance 1';

alter table reminder_profile add column if not exists email_template_2 text;

comment on column reminder_profile.email_template_2 is 'Modèle de corps d''email en fonction du profil - Relance 2';

alter table reminder_profile add column if not exists email_template_3 text;

comment on column reminder_profile.email_template_3 is 'Modèle de corps d''email en fonction du profil - Relance 3';

alter table reminder_profile add column if not exists email_template_4 text;

comment on column reminder_profile.email_template_4 is 'Modèle de corps d''email en fonction du profil - Relance 4';