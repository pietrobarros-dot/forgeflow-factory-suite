create type public.app_role as enum ('admin','gestor','supervisor','operador','almoxarife','comprador','vendedor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  email text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Mapa de acesso por módulo
create table public.permissoes_modulo (
  role public.app_role not null,
  modulo text not null,
  pode_editar boolean not null default false,
  primary key (role, modulo)
);
grant select on public.permissoes_modulo to authenticated;
grant all on public.permissoes_modulo to service_role;
alter table public.permissoes_modulo enable row level security;
create policy "Ler permissões" on public.permissoes_modulo for select to authenticated using (true);
create policy "Admin gerencia permissões" on public.permissoes_modulo for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.permissoes_modulo (role, modulo, pode_editar)
select r::public.app_role, m, true from
  (values ('gestor')) as x(r), unnest(array['painel','mrp','producao','wms','tms','compras','vendas','produtos','etiquetas','qualidade','relatorios']) m
union all select 'supervisor', m, true from unnest(array['painel','mrp','producao','wms','qualidade','etiquetas']) m
union all select 'supervisor', m, false from unnest(array['produtos','tms','relatorios']) m
union all select 'operador', m, true from unnest(array['producao']) m
union all select 'operador', m, false from unnest(array['painel','etiquetas','qualidade']) m
union all select 'almoxarife', m, true from unnest(array['wms','etiquetas']) m
union all select 'almoxarife', m, false from unnest(array['painel','produtos','compras','tms']) m
union all select 'comprador', m, true from unnest(array['compras','mrp']) m
union all select 'comprador', m, false from unnest(array['painel','produtos','wms']) m
union all select 'vendedor', m, true from unnest(array['vendas']) m
union all select 'vendedor', m, false from unnest(array['painel','produtos','tms']) m;

create or replace function public.pode_acessar(_modulo text, _editar boolean default false)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(),'admin') or exists (
    select 1 from public.user_roles ur join public.permissoes_modulo pm on pm.role = ur.role
    where ur.user_id = auth.uid() and pm.modulo = _modulo and (not _editar or pm.pode_editar))
$$;

create policy "Ver próprio perfil ou admin/gestor" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'gestor'));
create policy "Editar próprio perfil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "Admin edita perfis" on public.profiles for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Ver próprios papéis ou admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "Admin atribui papéis" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));
create policy "Admin remove papéis" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(),'admin') and user_id <> auth.uid());

-- Registro de atividades / auditoria
create table public.atividades (
  id bigint generated always as identity primary key,
  user_id uuid,
  modulo text not null,
  acao text not null,
  entidade text,
  entidade_id text,
  antes jsonb,
  depois jsonb,
  created_at timestamptz not null default now()
);
create index atividades_created_idx on public.atividades (created_at desc);
grant select, insert on public.atividades to authenticated;
grant all on public.atividades to service_role;
alter table public.atividades enable row level security;
create policy "Registrar própria atividade" on public.atividades for insert to authenticated
  with check (user_id = auth.uid());
create policy "Admin/gestor leem atividades" on public.atividades for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'gestor') or user_id = auth.uid());

create or replace function public.auditar_papeis() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.atividades (user_id, modulo, acao, entidade, entidade_id, antes, depois)
  values (auth.uid(), 'seguranca', tg_op, 'user_roles', coalesce(new.user_id, old.user_id)::text,
    case when tg_op = 'DELETE' then to_jsonb(old) end, case when tg_op = 'INSERT' then to_jsonb(new) end);
  return coalesce(new, old);
end $$;
create trigger trg_auditar_papeis after insert or delete on public.user_roles
  for each row execute function public.auditar_papeis();

-- Novo usuário: cria perfil; o primeiro usuário vira administrador
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email);
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();