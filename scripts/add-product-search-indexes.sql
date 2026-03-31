create extension if not exists pg_trgm;

create index if not exists products_name_trgm_idx
on public.products
using gin (name gin_trgm_ops);

create index if not exists products_category_trgm_idx
on public.products
using gin (category gin_trgm_ops);

create index if not exists products_description_trgm_idx
on public.products
using gin (description gin_trgm_ops);

create index if not exists products_created_at_idx
on public.products (created_at desc);

create index if not exists products_condition_idx
on public.products (condition);

create index if not exists products_is_outlet_idx
on public.products (is_outlet);

create index if not exists products_featured_idx
on public.products (featured);
