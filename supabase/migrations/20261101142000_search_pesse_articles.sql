create or replace function public.search_pesse_articles(search_term text, page_number integer default 1, page_size integer default 12)
returns jsonb language sql stable security invoker set search_path = ''
as $$
with input as (
 select translate(lower(left(trim(coalesce(search_term,'')),120)),'áéíóúüñ','aeiouun') as q,
 greatest(1,least(coalesce(page_number,1),10000)) as n,
 greatest(1,least(coalesce(page_size,12),50)) as limit_n
), matched as (
 select a.id,a.slug,a.title,a.excerpt,a.cover_url,a.published_at,
 case when strpos(translate(lower(a.title),'áéíóúüñ','aeiouun'),i.q)>0 then 3
 when strpos(translate(lower(coalesce(a.excerpt,'')),'áéíóúüñ','aeiouun'),i.q)>0 then 2 else 1 end as rank
 from public.articles a cross join input i
 where length(i.q)>=2 and a.status='published' and a.deleted_at is null
 and a.published_at<=now()
 and (strpos(translate(lower(a.title),'áéíóúüñ','aeiouun'),i.q)>0
 or strpos(translate(lower(coalesce(a.excerpt,'')),'áéíóúüñ','aeiouun'),i.q)>0
 or strpos(translate(lower(coalesce(a.body,'')),'áéíóúüñ','aeiouun'),i.q)>0)
), page_rows as (
 select * from matched order by rank desc,published_at desc,id desc
 limit (select limit_n from input)
 offset ((select n-1 from input)*(select limit_n from input))
)
select jsonb_build_object('total',(select count(*) from matched),
'items',coalesce((select jsonb_agg(to_jsonb(p) order by p.rank desc,p.published_at desc,p.id desc) from page_rows p),'[]'::jsonb))
$$;
revoke all on function public.search_pesse_articles(text,integer,integer) from public;
grant execute on function public.search_pesse_articles(text,integer,integer) to anon,authenticated;