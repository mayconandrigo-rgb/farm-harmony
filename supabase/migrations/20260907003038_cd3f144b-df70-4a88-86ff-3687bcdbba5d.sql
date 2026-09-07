-- ============ ROLES ============
create type public.app_role as enum ('gestor','financeiro','operador','consulta');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_gestor()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'gestor')
$$;

create or replace function public.can_operate()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(),'gestor') or public.has_role(auth.uid(),'operador') or public.has_role(auth.uid(),'financeiro')
$$;

create or replace function public.can_finance()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(),'gestor') or public.has_role(auth.uid(),'financeiro')
$$;

create policy "user_roles_select_self_or_gestor" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.is_gestor());
create policy "user_roles_manage_gestor" on public.user_roles for all to authenticated
  using (public.is_gestor()) with check (public.is_gestor());

-- first user becomes gestor
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;
  if not exists (select 1 from public.user_roles) then
    insert into public.user_roles (user_id, role) values (new.id, 'gestor');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'consulta') on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ============ CADASTROS ============
create table public.culturas (
  id uuid primary key default gen_random_uuid(), nome text not null, ciclo text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.talhoes (
  id uuid primary key default gen_random_uuid(), nome text not null, area_ha numeric not null default 0,
  cultura_atual text, safra text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.produtos (
  id uuid primary key default gen_random_uuid(), nome text not null, categoria text not null default 'insumo',
  unidade text not null default 'kg', estoque_minimo numeric default 0, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.parceiros (
  id uuid primary key default gen_random_uuid(), nome text not null, tipo text not null default 'cliente',
  documento text, contato text, endereco text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.armazens (
  id uuid primary key default gen_random_uuid(), nome text not null, localizacao text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.funcionarios (
  id uuid primary key default gen_random_uuid(), nome text not null, cpf text, cargo text, funcao text,
  salario numeric, data_admissao date, banco text, agencia text, conta text, pix text, ativo boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.maquinas (
  id uuid primary key default gen_random_uuid(), nome text not null, tipo text not null default 'caminhao',
  marca text, modelo text, ano int, placa text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.pastos (
  id uuid primary key default gen_random_uuid(), nome text not null, area_ha numeric, capacidade int, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.tanques (
  id uuid primary key default gen_random_uuid(), nome text not null, especie text, capacidade numeric, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- ============ LAVOURA ============
create table public.plantios (
  id uuid primary key default gen_random_uuid(), talhao_id uuid references public.talhoes(id) on delete set null,
  cultura text, variedade text, data_plantio date not null default current_date,
  quantidade_semente numeric, unidade text default 'kg', safra text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.analises_solo (
  id uuid primary key default gen_random_uuid(), talhao_id uuid references public.talhoes(id) on delete set null,
  data date not null default current_date, laboratorio text, resultado text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.adubacoes (
  id uuid primary key default gen_random_uuid(), talhao_id uuid references public.talhoes(id) on delete set null,
  produto_id uuid references public.produtos(id) on delete set null, quantidade numeric, unidade text default 'kg',
  data date not null default current_date, forma_aplicacao text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.aplicacoes_defensivos (
  id uuid primary key default gen_random_uuid(), talhao_id uuid references public.talhoes(id) on delete set null,
  produto_id uuid references public.produtos(id) on delete set null, dose numeric, unidade text default 'l/ha',
  data date not null default current_date, alvo text, tipo_alvo text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.ocorrencias_lavoura (
  id uuid primary key default gen_random_uuid(), talhao_id uuid references public.talhoes(id) on delete set null,
  data date not null default current_date, tipo text, descricao text, severidade text, acao_tomada text, safra text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- ============ CONTRATOS ============
create table public.contratos (
  id uuid primary key default gen_random_uuid(), numero text, tipo text not null default 'venda',
  parceiro_id uuid references public.parceiros(id) on delete set null,
  armazem_id uuid references public.armazens(id) on delete set null,
  cultura text, quantidade_kg numeric not null default 0, preco numeric, data_contrato date default current_date,
  data_inicio_entrega date, data_conclusao_prevista date,
  percentual_entrega numeric not null default 0, status text not null default 'em_andamento', observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- ============ ROMANEIOS ============
create table public.romaneios (
  id uuid primary key default gen_random_uuid(), numero text, talhao_id uuid references public.talhoes(id) on delete set null,
  contrato_id uuid references public.contratos(id) on delete set null,
  armazem_id uuid references public.armazens(id) on delete set null,
  placa text, motorista text, data_hora timestamptz not null default now(),
  peso_bruto numeric not null default 0, peso_tara numeric not null default 0,
  peso_liquido numeric generated always as (coalesce(peso_bruto,0) - coalesce(peso_tara,0)) stored,
  origem text default 'colheita', nota_fiscal text, cultura text,
  impureza numeric, umidade numeric, avariados numeric, mofado numeric, verde numeric, quebrados numeric, outros text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create or replace function public.recalc_contrato_entrega()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid; total numeric; contratado numeric;
begin
  cid := coalesce(new.contrato_id, old.contrato_id);
  if cid is null then return coalesce(new, old); end if;
  select coalesce(sum(peso_liquido),0) into total from public.romaneios where contrato_id = cid;
  select nullif(quantidade_kg,0) into contratado from public.contratos where id = cid;
  update public.contratos set percentual_entrega = case when contratado is null then 0
    else round(least(total / contratado * 100, 999.99), 2) end,
    status = case when contratado is not null and total >= contratado then 'concluido' else status end
    where id = cid;
  return coalesce(new, old);
end; $$;
create trigger romaneios_recalc after insert or update or delete on public.romaneios
  for each row execute function public.recalc_contrato_entrega();

-- ============ PECUARIA / OVINOS ============
create table public.animais (
  id uuid primary key default gen_random_uuid(), especie text not null default 'bovino',
  identificacao text, nome text, sexo text, raca text, data_nascimento date,
  pasto_id uuid references public.pastos(id) on delete set null, lote text, status text not null default 'ativo',
  peso numeric, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.vacinacoes (
  id uuid primary key default gen_random_uuid(), especie text default 'bovino',
  animal_id uuid references public.animais(id) on delete set null, lote text,
  vacina text not null, data date not null default current_date, lote_vacina text, dose text, proximo_reforco date,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.nascimentos (
  id uuid primary key default gen_random_uuid(), especie text default 'bovino',
  data date not null default current_date, mae_id uuid references public.animais(id) on delete set null,
  sexo text, peso numeric, identificacao text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.vendas_animais (
  id uuid primary key default gen_random_uuid(), especie text default 'bovino',
  parceiro_id uuid references public.parceiros(id) on delete set null,
  data date not null default current_date, quantidade int not null default 1, valor numeric, gta text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.abates (
  id uuid primary key default gen_random_uuid(), especie text default 'bovino',
  data date not null default current_date, quantidade int not null default 1, peso numeric, finalidade text default 'consumo', observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- ============ AVES ============
create table public.lotes_aves (
  id uuid primary key default gen_random_uuid(), nome text not null, raca text, quantidade int not null default 0,
  data_entrada date default current_date, galinheiro text, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.producao_ovos (
  id uuid primary key default gen_random_uuid(), data date not null default current_date,
  lote_id uuid references public.lotes_aves(id) on delete set null, quantidade int not null default 0, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- ============ PISCICULTURA ============
create table public.povoamentos (
  id uuid primary key default gen_random_uuid(), tanque_id uuid references public.tanques(id) on delete set null,
  data date not null default current_date, especie text, quantidade_alevinos int, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.despescas (
  id uuid primary key default gen_random_uuid(), tanque_id uuid references public.tanques(id) on delete set null,
  data date not null default current_date, quantidade int, peso_kg numeric, destino text default 'venda', observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- ============ ESTOQUE ============
create table public.estoque_movimentos (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos(id) on delete cascade,
  tipo text not null default 'saida', quantidade numeric not null default 0,
  data date not null default current_date, area text, referencia text, responsavel text,
  nota_fiscal_id uuid, observacoes text, created_by uuid default auth.uid(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create view public.estoque_saldo
with (security_invoker = true) as
select p.id as produto_id, p.nome, p.categoria, p.unidade, p.estoque_minimo,
  coalesce(sum(case when m.tipo = 'entrada' then m.quantidade
                    when m.tipo = 'saida' then -m.quantidade
                    else m.quantidade end), 0) as saldo
from public.produtos p left join public.estoque_movimentos m on m.produto_id = p.id
group by p.id, p.nome, p.categoria, p.unidade, p.estoque_minimo;
grant select on public.estoque_saldo to authenticated;

-- ============ FINANCEIRO ============
create table public.notas_fiscais (
  id uuid primary key default gen_random_uuid(), numero text, tipo text not null default 'entrada',
  parceiro_id uuid references public.parceiros(id) on delete set null,
  data_emissao date not null default current_date, valor_total numeric default 0, frete numeric default 0,
  observacoes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.nf_itens (
  id uuid primary key default gen_random_uuid(),
  nota_fiscal_id uuid not null references public.notas_fiscais(id) on delete cascade,
  produto_id uuid references public.produtos(id) on delete set null,
  descricao text, quantidade numeric not null default 0, valor_unitario numeric default 0,
  created_at timestamptz not null default now());

create or replace function public.nf_item_estoque()
returns trigger language plpgsql security definer set search_path = public as $$
declare nf record;
begin
  if tg_op = 'DELETE' then
    delete from public.estoque_movimentos where nota_fiscal_id = old.nota_fiscal_id and produto_id = old.produto_id and quantidade = old.quantidade;
    return old;
  end if;
  select * into nf from public.notas_fiscais where id = new.nota_fiscal_id;
  if new.produto_id is not null then
    insert into public.estoque_movimentos (produto_id, tipo, quantidade, data, area, referencia, nota_fiscal_id)
    values (new.produto_id, case when nf.tipo = 'entrada' then 'entrada' else 'saida' end,
            new.quantidade, nf.data_emissao, 'nota_fiscal', concat('NF ', coalesce(nf.numero,'')), nf.id);
  end if;
  return new;
end; $$;
create trigger nf_itens_estoque after insert or delete on public.nf_itens
  for each row execute function public.nf_item_estoque();

create table public.contas (
  id uuid primary key default gen_random_uuid(), tipo text not null default 'pagar',
  descricao text not null, categoria text, parceiro_id uuid references public.parceiros(id) on delete set null,
  nota_fiscal_id uuid references public.notas_fiscais(id) on delete set null,
  valor numeric not null default 0, vencimento date, status text not null default 'pendente',
  forma_pagamento text, data_pagamento date, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.folha_pagamento (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  mes int not null, ano int not null, salario_base numeric not null default 0,
  adicionais numeric default 0, descontos numeric default 0,
  valor_liquido numeric generated always as (coalesce(salario_base,0) + coalesce(adicionais,0) - coalesce(descontos,0)) stored,
  status text not null default 'pendente', data_pagamento date, observacoes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (funcionario_id, mes, ano));

-- ============ ANEXOS ============
create table public.anexos (
  id uuid primary key default gen_random_uuid(), entidade text not null, registro_id uuid,
  nome text not null, path text not null, mime_type text, tamanho bigint,
  created_by uuid default auth.uid(), created_at timestamptz not null default now());

-- ============ GRANTS / RLS / POLICIES ============
do $$
declare t text;
  operacional text[] := array['culturas','talhoes','produtos','parceiros','armazens','maquinas','pastos','tanques',
    'plantios','analises_solo','adubacoes','aplicacoes_defensivos','ocorrencias_lavoura','contratos','romaneios',
    'animais','vacinacoes','nascimentos','vendas_animais','abates','lotes_aves','producao_ovos','povoamentos',
    'despescas','estoque_movimentos','anexos'];
  financeiro text[] := array['notas_fiscais','nf_itens','contas','folha_pagamento','funcionarios'];
begin
  foreach t in array operacional loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "sel_auth" on public.%I for select to authenticated using (true)', t);
    execute format('create policy "ins_op" on public.%I for insert to authenticated with check (public.can_operate())', t);
    execute format('create policy "upd_op" on public.%I for update to authenticated using (public.can_operate()) with check (public.can_operate())', t);
    execute format('create policy "del_gestor" on public.%I for delete to authenticated using (public.is_gestor())', t);
    execute format('create trigger touch_%I before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
  foreach t in array financeiro loop
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "sel_fin" on public.%I for select to authenticated using (public.can_finance())', t);
    execute format('create policy "ins_fin" on public.%I for insert to authenticated with check (public.can_finance())', t);
    execute format('create policy "upd_fin" on public.%I for update to authenticated using (public.can_finance()) with check (public.can_finance())', t);
    execute format('create policy "del_gestor" on public.%I for delete to authenticated using (public.is_gestor())', t);
  end loop;
end $$;

create trigger touch_nf_itens_skip before update on public.nf_itens for each row execute function public.touch_updated_at();

-- seed culturas
insert into public.culturas (nome, ciclo) values
 ('Soja','anual'),('Milho','anual'),('Hortaliças','curto'),('Pastagem','perene');
