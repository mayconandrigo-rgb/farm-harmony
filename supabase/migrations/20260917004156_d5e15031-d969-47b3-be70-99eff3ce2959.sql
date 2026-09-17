-- ============ CENTROS DE CUSTO ============
create table if not exists public.centros_custo (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  atividade text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.centros_custo to authenticated;
grant all on public.centros_custo to service_role;
alter table public.centros_custo enable row level security;
create policy "cc_select" on public.centros_custo for select to authenticated using (true);
create policy "cc_insert" on public.centros_custo for insert to authenticated with check (public.can_operate());
create policy "cc_update" on public.centros_custo for update to authenticated using (public.can_operate());
create policy "cc_delete" on public.centros_custo for delete to authenticated using (public.is_gestor());
create trigger touch_centros_custo before update on public.centros_custo for each row execute function public.touch_updated_at();

insert into public.centros_custo (nome, atividade) values
  ('Lavoura','lavoura'),('Pecuária','pecuaria'),('Ovinos','ovinos'),('Aves','aves'),
  ('Piscicultura','piscicultura'),('Refeitório','refeitorio'),('Dormitório','dormitorio'),
  ('Administração','administracao'),('Máquinas','maquinas')
on conflict (nome) do nothing;

-- ============ PLANO DE CONTAS ============
create table if not exists public.plano_contas (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  nome text not null,
  natureza text not null default 'despesa',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.plano_contas to authenticated;
grant all on public.plano_contas to service_role;
alter table public.plano_contas enable row level security;
create policy "pc_select" on public.plano_contas for select to authenticated using (true);
create policy "pc_insert" on public.plano_contas for insert to authenticated with check (public.can_operate());
create policy "pc_update" on public.plano_contas for update to authenticated using (public.can_operate());
create policy "pc_delete" on public.plano_contas for delete to authenticated using (public.is_gestor());
create trigger touch_plano_contas before update on public.plano_contas for each row execute function public.touch_updated_at();

insert into public.plano_contas (codigo, nome, natureza) values
  ('1.1','Venda de grãos','receita'),
  ('1.2','Venda de animais','receita'),
  ('1.3','Venda de ovos','receita'),
  ('1.4','Venda de peixes','receita'),
  ('2.1','Insumos agrícolas','despesa'),
  ('2.2','Combustível e lubrificantes','despesa'),
  ('2.3','Peças e manutenção','despesa'),
  ('2.4','Ração e sal','despesa'),
  ('2.5','Medicamentos veterinários','despesa'),
  ('2.6','Folha de pagamento','despesa'),
  ('2.7','Frete','despesa'),
  ('2.8','Despesas administrativas','despesa')
on conflict do nothing;

alter table public.contas
  add column if not exists plano_conta_id uuid references public.plano_contas(id),
  add column if not exists centro_custo_id uuid references public.centros_custo(id),
  add column if not exists parcela integer,
  add column if not exists total_parcelas integer;

-- ============ CUSTO NO ESTOQUE ============
alter table public.produtos
  add column if not exists custo_medio numeric not null default 0;

alter table public.estoque_movimentos
  add column if not exists custo_unitario numeric,
  add column if not exists custo_total numeric,
  add column if not exists centro_custo_id uuid references public.centros_custo(id),
  add column if not exists talhao_id uuid references public.talhoes(id);

-- saldo atual de um produto
create or replace function public.saldo_produto(_produto_id uuid)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(case when tipo = 'entrada' then quantidade else -quantidade end), 0)
  from public.estoque_movimentos where produto_id = _produto_id
$$;

-- custo médio ponderado + bloqueio de saldo negativo
create or replace function public.estoque_custo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  saldo numeric;
  medio numeric;
begin
  select coalesce(sum(case when tipo = 'entrada' then quantidade else -quantidade end), 0)
    into saldo
  from public.estoque_movimentos
  where produto_id = new.produto_id and id <> new.id;

  select coalesce(custo_medio, 0) into medio from public.produtos where id = new.produto_id;

  if new.tipo = 'entrada' then
    if new.custo_unitario is null then
      new.custo_unitario := medio;
    end if;
    new.custo_total := new.custo_unitario * new.quantidade;
    update public.produtos
      set custo_medio = case
        when saldo + new.quantidade > 0
          then ((greatest(saldo, 0) * medio) + (new.quantidade * new.custo_unitario)) / (greatest(saldo, 0) + new.quantidade)
        else new.custo_unitario end
      where id = new.produto_id;
  else
    if saldo - new.quantidade < 0 then
      raise exception 'Saldo insuficiente em estoque: disponível % , solicitado %', saldo, new.quantidade;
    end if;
    new.custo_unitario := coalesce(new.custo_unitario, medio);
    new.custo_total := new.custo_unitario * new.quantidade;
  end if;
  return new;
end; $$;

drop trigger if exists estoque_custo_trg on public.estoque_movimentos;
create trigger estoque_custo_trg before insert on public.estoque_movimentos
for each row execute function public.estoque_custo();

-- ============ NOTA FISCAL ============
alter table public.notas_fiscais
  add column if not exists icms numeric,
  add column if not exists pis_cofins numeric,
  add column if not exists centro_custo_id uuid references public.centros_custo(id);

alter table public.nf_itens
  add column if not exists unidade text,
  add column if not exists cfop text,
  add column if not exists ncm text,
  add column if not exists valor_total numeric;

-- o trigger de estoque da NF passa a levar o custo unitário do item
create or replace function public.nf_item_estoque()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare nf record;
begin
  if tg_op = 'DELETE' then
    delete from public.estoque_movimentos
      where nota_fiscal_id = old.nota_fiscal_id and produto_id = old.produto_id and quantidade = old.quantidade;
    return old;
  end if;
  select * into nf from public.notas_fiscais where id = new.nota_fiscal_id;
  if new.produto_id is not null then
    insert into public.estoque_movimentos
      (produto_id, tipo, quantidade, data, area, referencia, nota_fiscal_id, custo_unitario, centro_custo_id)
    values (new.produto_id,
            case when nf.tipo = 'entrada' then 'entrada' else 'saida' end,
            new.quantidade, nf.data_emissao, 'nota_fiscal',
            concat('NF ', coalesce(nf.numero,'')), nf.id,
            new.valor_unitario, nf.centro_custo_id);
  end if;
  return new;
end; $$;

-- bloqueio de exclusão de NF que já movimentou estoque
create or replace function public.nf_bloqueia_exclusao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.estoque_movimentos where nota_fiscal_id = old.id) then
    raise exception 'Esta nota fiscal já movimentou o estoque e não pode ser excluída.';
  end if;
  return old;
end; $$;

drop trigger if exists nf_bloqueia_exclusao_trg on public.notas_fiscais;
create trigger nf_bloqueia_exclusao_trg before delete on public.notas_fiscais
for each row execute function public.nf_bloqueia_exclusao();