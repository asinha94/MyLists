alter table items drop constraint items_title_uk;
alter table items drop constraint items_pk cascade;
alter table items drop constraint items_categories_fk;
alter table items RENAME TO olditems;
alter table categories drop constraint categories_category_title_uk;
alter table categories drop constraint categories_pk cascade;
alter table categories RENAME TO oldcategories;

-- Create new tables here


ALTER TABLE site_users ADD COLUMN display_name TEXT;
ALTER TABLE site_users ADD COLUMN user_guid TEXT;
ALTER TABLE site_users ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE site_users ALTER COLUMN user_guid SET DEFAULT gen_random_uuid();
ALTER TABLE site_users ADD constraint siteusers_userguid_uk UNIQUE(user_guid);

insert into categories (user_id, category_title, category_unit, category_consume_verb) select 1, category_title, '', '' from oldcategories order by id;
insert into items (category_id, title, order_key) select category_id, title, order_key from olditems