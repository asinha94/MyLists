alter table categories drop constraint categories_category_title_uk;
alter table categories drop constraint categories_pk cascase;
alter table items drop constraint items_title_uk;
alter table items drop constraint items_pk cascade;
alter table items RENAME TO olditems;
alter table categories RENAME TO oldcategories;

-- Create new tables here

insert into categories (user_id, category_title, category_unit, category_consume_verb) select 1, category_title, '', '' from oldcategories order by id;
insert into items (category_id, title, order_key) select category_id, title, order_key from olditems