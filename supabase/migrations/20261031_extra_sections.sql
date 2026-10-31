-- Agregar secciones editoriales sin modificar las existentes.
insert into public.categories (slug, name)
values ('musica','Música'),('turismo','Turismo'),('entretenimiento','Entretenimiento')
on conflict (slug) do update set name = excluded.name;
