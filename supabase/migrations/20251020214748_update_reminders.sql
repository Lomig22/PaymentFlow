alter table reminders 
alter column reminder_type type smallint 
using (
    case 
        when reminder_type='pre' THEN 0
        when reminder_type='first' THEN 1
        when reminder_type='second' THEN 2
        when reminder_type='third' THEN 3
        when reminder_type='final' THEN 4
    end
);

create table delays (
    reminder_type small_int not null,
    target_id uuid not null,
    target_type varchar(15) not null check (target_type in ('clients', 'reminder_profile')),
    delay jsonb not null,
    primary key (reminder_type, target_id, target_type)
);

