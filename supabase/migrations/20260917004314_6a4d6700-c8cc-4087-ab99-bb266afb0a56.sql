alter table public.nf_itens
  add column if not exists custo_unitario numeric;

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
            coalesce(new.custo_unitario, new.valor_unitario), nf.centro_custo_id);
  end if;
  return new;
end; $$;

revoke all on function public.nf_item_estoque() from public, anon, authenticated;