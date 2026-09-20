-- Módulo de originação: contratos de grãos e romaneios — Fazenda 3V

create table if not exists public.contratos_graos (
  id uuid primary key default gen_random_uuid(),
  fazenda_id uuid not null references public.fazendas(id),
  tipo text not null check (tipo in
    ('compra_venda','a_fixar','antecipado','deposito','troca','cpr','barter')),
  contraparte text not null,           -- comprador/vendedor/armazém
  cultura_id uuid references public.culturas(id),
  safra text,
  quantidade_sc numeric(12,2) not null check (quantidade_sc > 0),
  saldo_sc numeric(12,2) not null,
  preco_sc numeric(10,2),              -- nulo quando 'a_fixar'
  valor_total numeric(14,2),
  data_assinatura date not null default current_date,
  data_limite_fixacao date,            -- prazo para fixar preço (a_fixar/CPR)
  status text not null default 'aberto'
    check (status in ('aberto','parcial','executado','cancelado')),
  observacao text,
  criado_em timestamptz not null default now()
);

create table if not exists public.romaneios (
  id uuid primary key default gen_random_uuid(),
  fazenda_id uuid not null references public.fazendas(id),
  numero_romaneio text not null,
  tipo_movimento text not null check (tipo_movimento in ('entrada','saida')),
  data_pesagem date not null default current_date,
  safra_id uuid references public.safras(id),
  talhao_id uuid references public.talhoes(id),
  contrato_id uuid references public.contratos_graos(id),
  cultura_id uuid references public.culturas(id),
  placa text,
  motorista text,
  peso_bruto_kg numeric(12,2) not null check (peso_bruto_kg > 0),
  tara_kg numeric(12,2) not null check (tara_kg >= 0),
  peso_liquido_kg numeric(12,2) generated always as
    (peso_bruto_kg - tara_kg) stored,
  sacas_60kg numeric(12,2) generated always as
    ((peso_bruto_kg - tara_kg) / 60) stored,
  umidade_pct numeric(5,2),
  impureza_pct numeric(5,2),
  avariados_pct numeric(5,2),
  descontos_kg numeric(12,2) default 0,
  sacas_liquidas numeric(12,2),
  retencao_funrural_pct numeric(5,2) default 0,
  observacao text,
  criado_em timestamptz not null default now(),
  unique (fazenda_id, numero_romaneio)
);

alter table public.contratos_graos enable row level security;
alter table public.romaneios      enable row level security;

create policy "autenticados gerenciam contratos" on public.contratos_graos
  for all to authenticated using (true) with check (true);
create policy "autenticados gerenciam romaneios" on public.romaneios
  for all to authenticated using (true) with check (true);

-- Baixa automática do saldo do contrato a cada romaneio vinculado
create or replace function public.baixa_saldo_contrato()
returns trigger language plpgsql as $$
begin
  if new.contrato_id is not null and new.sacas_liquidas is not null then
    update public.contratos_graos
      set saldo_sc = saldo_sc - new.sacas_liquidas,
          status = case
            when saldo_sc - new.sacas_liquidas <= 0 then 'executado'
            else 'parcial' end
      where id = new.contrato_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_baixa_saldo_contrato on public.romaneios;
create trigger trg_baixa_saldo_contrato
  after insert on public.romaneios
  for each row execute function public.baixa_saldo_contrato();
