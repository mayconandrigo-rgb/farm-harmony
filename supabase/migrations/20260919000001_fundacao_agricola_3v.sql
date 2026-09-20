-- supabase/migrations/20260919000001_fundacao_agricola_3v.sql
-- Fundação agrícola Fazenda 3V — single-tenant

create table if not exists public.fazendas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text,
  municipio text,
  uf text,
  area_total_ha numeric(12,2),
  criado_em timestamptz not null default now()
);

create table if not exists public.talhoes (
  id uuid primary key default gen_random_uuid(),
  fazenda_id uuid not null references public.fazendas(id),
  codigo text not null,
  nome text,
  area_ha numeric(10,2) not null check (area_ha > 0),
  solo text,
  topografia text,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (fazenda_id, codigo)
);

create table if not exists public.culturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,           -- Soja, Milho, Algodão...
  ciclo_dias int,
  criado_em timestamptz not null default now()
);

create table if not exists public.variedades (
  id uuid primary key default gen_random_uuid(),
  cultura_id uuid not null references public.culturas(id),
  nome text not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.safras (
  id uuid primary key default gen_random_uuid(),
  fazenda_id uuid not null references public.fazendas(id),
  talhao_id uuid not null references public.talhoes(id),
  cultura_id uuid not null references public.culturas(id),
  variedade_id uuid references public.variedades(id),
  safra text not null,                 -- ex.: '2026/2027'
  data_plantio date,
  area_plantada_ha numeric(10,2),
  populacao_pl_ha numeric(10,0),
  espacamento_m numeric(5,2),
  DAP_analise_solo date,               -- campos reservados p/ agronomia
  p_analise numeric, k_analise numeric, mg_analise numeric,
  ph_analise numeric, v_analise numeric,
  produtividade_prevista_sc_ha numeric(8,2),
  status text not null default 'planejada'
    check (status in ('planejada','plantada','em_desenvolvimento','colhida','encerrada')),
  criado_em timestamptz not null default now()
);

create table if not exists public.atividades (
  id uuid primary key default gen_random_uuid(),
  safra_id uuid not null references public.safras(id),
  tipo text not null check (tipo in
    ('desseccacao','preparo_solo','plantio','adubacao','pulverizacao','irrigacao','colheita','outro')),
  data_execucao date not null,
  operador text,
  maquina text,
  insumos jsonb,                       -- [{produto, dose, unidade, custo}]
  custo_total numeric(12,2) default 0,
  observacao text,
  criado_em timestamptz not null default now()
);

create table if not exists public.anexos_agro (
  id uuid primary key default gen_random_uuid(),
  entidade text not null,              -- 'romaneio','contrato','talhao','analise_solo'
  entidade_id uuid not null,
  nome_arquivo text not null,
  storage_path text not null,
  mime_type text,
  criado_em timestamptz not null default now()
);

alter table public.fazendas        enable row level security;
alter table public.talhoes         enable row level security;
alter table public.culturas        enable row level security;
alter table public.variedades      enable row level security;
alter table public.safras          enable row level security;
alter table public.atividades      enable row level security;
alter table public.anexos_agro     enable row level security;

create policy "autenticados gerenciam fazendas"    on public.fazendas    for all to authenticated using (true) with check (true);
create policy "autenticados gerenciam talhoes"     on public.talhoes     for all to authenticated using (true) with check (true);
create policy "autenticados leem culturas"         on public.culturas     for all to authenticated using (true) with check (true);
create policy "autenticados leem variedades"       on public.variedades   for all to authenticated using (true) with check (true);
create policy "autenticados gerenciam safras"      on public.safras      for all to authenticated using (true) with check (true);
create policy "autenticados gerenciam atividades"  on public.atividades  for all to authenticated using (true) with check (true);
create policy "autenticados gerenciam anexos agro" on public.anexos_agro for all to authenticated using (true) with check (true);
