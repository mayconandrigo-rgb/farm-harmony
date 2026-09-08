import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, formatMoney, formatValue } from "@/lib/db";
import { usePerfil } from "@/hooks/use-perfil";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: Relatorios,
});

function inicioDoAno() {
  return `${new Date().getFullYear()}-01-01`;
}

function Relatorios() {
  const { podeVerFinanceiro } = usePerfil();
  const [de, setDe] = useState(inicioDoAno());
  const [ate, setAte] = useState(new Date().toISOString().slice(0, 10));

  const dados = useQuery({
    queryKey: ["relatorios", de, ate, podeVerFinanceiro],
    queryFn: async () => {
      const [romaneios, talhoes, contratos, parceiros, consumos, produtos, contas, folha] = await Promise.all([
        db.from("romaneios").select("talhao_id, contrato_id, peso_liquido, data_hora").gte("data_hora", `${de}T00:00:00`).lte("data_hora", `${ate}T23:59:59`),
        db.from("talhoes").select("id, nome"),
        db.from("contratos").select("id, numero, cultura, quantidade_kg, percentual_entrega"),
        db.from("parceiros").select("id, nome"),
        db.from("estoque_movimentos").select("produto_id, tipo, quantidade, area, data").gte("data", de).lte("data", ate),
        db.from("produtos").select("id, nome, unidade"),
        podeVerFinanceiro
          ? db.from("contas").select("tipo, categoria, valor, status, vencimento").gte("vencimento", de).lte("vencimento", ate)
          : Promise.resolve({ data: [] }),
        podeVerFinanceiro
          ? db.from("folha_pagamento").select("mes, ano, valor_liquido, status")
          : Promise.resolve({ data: [] }),
      ]);

      const nomeTalhao = new Map(((talhoes.data ?? []) as { id: string; nome: string }[]).map((t) => [t.id, t.nome]));
      const nomeProduto = new Map(
        ((produtos.data ?? []) as { id: string; nome: string; unidade: string }[]).map((p) => [p.id, p]),
      );

      const porTalhao = new Map<string, number>();
      const porContrato = new Map<string, number>();
      for (const r of (romaneios.data ?? []) as {
        talhao_id: string | null;
        contrato_id: string | null;
        peso_liquido: number;
      }[]) {
        const t = r.talhao_id ? (nomeTalhao.get(r.talhao_id) ?? "Sem talhão") : "Sem talhão";
        porTalhao.set(t, (porTalhao.get(t) ?? 0) + Number(r.peso_liquido ?? 0));
        if (r.contrato_id) porContrato.set(r.contrato_id, (porContrato.get(r.contrato_id) ?? 0) + Number(r.peso_liquido ?? 0));
      }

      const porArea = new Map<string, Map<string, number>>();
      for (const m of (consumos.data ?? []) as {
        produto_id: string;
        tipo: string;
        quantidade: number;
        area: string | null;
      }[]) {
        if (m.tipo !== "saida") continue;
        const area = m.area ?? "sem área";
        const prod = nomeProduto.get(m.produto_id);
        const chave = prod ? `${prod.nome} (${prod.unidade})` : "produto";
        if (!porArea.has(area)) porArea.set(area, new Map());
        const mapa = porArea.get(area)!;
        mapa.set(chave, (mapa.get(chave) ?? 0) + Number(m.quantidade ?? 0));
      }

      const cont = (contas.data ?? []) as { tipo: string; categoria: string | null; valor: number; status: string }[];
      const despesasPorCategoria = new Map<string, number>();
      for (const c of cont.filter((x) => x.tipo === "pagar")) {
        const cat = c.categoria ?? "sem categoria";
        despesasPorCategoria.set(cat, (despesasPorCategoria.get(cat) ?? 0) + Number(c.valor ?? 0));
      }
      const receitas = cont.filter((c) => c.tipo === "receber").reduce((s, c) => s + Number(c.valor ?? 0), 0);
      const despesas = cont.filter((c) => c.tipo === "pagar").reduce((s, c) => s + Number(c.valor ?? 0), 0);
      const folhaTotal = ((folha.data ?? []) as { valor_liquido: number }[]).reduce(
        (s, f) => s + Number(f.valor_liquido ?? 0),
        0,
      );

      return {
        porTalhao: [...porTalhao.entries()].sort((a, b) => b[1] - a[1]),
        contratos: ((contratos.data ?? []) as { id: string; numero: string | null; cultura: string | null; quantidade_kg: number; percentual_entrega: number }[]).map((c) => ({
          ...c,
          entregue: porContrato.get(c.id) ?? 0,
        })),
        porArea: [...porArea.entries()],
        despesasPorCategoria: [...despesasPorCategoria.entries()].sort((a, b) => b[1] - a[1]),
        receitas,
        despesas,
        folhaTotal,
        parceiros: (parceiros.data ?? []) as { id: string; nome: string }[],
      };
    },
  });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Produção, entregas, consumo por área e finanças no período.</p>
      </header>

      <div className="card-surface grid gap-3 p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="de">De</Label>
          <Input id="de" type="date" className="h-12" value={de} onChange={(e) => setDe(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ate">Até</Label>
          <Input id="ate" type="date" className="h-12" value={ate} onChange={(e) => setAte(e.target.value)} />
        </div>
      </div>

      {dados.isLoading && (
        <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Calculando...
        </p>
      )}
      {dados.isError && <p className="text-sm font-medium text-destructive">Não foi possível gerar os relatórios.</p>}

      {dados.data && (
        <>
          <Bloco titulo="Produção entregue por talhão (kg)">
            {dados.data.porTalhao.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {dados.data.porTalhao.map(([talhao, peso]) => (
                  <li key={talhao} className="flex justify-between py-2">
                    <span>{talhao}</span>
                    <span className="font-medium">{formatValue(peso)} kg</span>
                  </li>
                ))}
              </ul>
            )}
          </Bloco>

          <Bloco titulo="Entregas por contrato">
            {dados.data.contratos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {dados.data.contratos.map((c) => (
                  <li key={c.id} className="flex flex-wrap justify-between gap-2 py-2">
                    <span>
                      {c.numero ?? "sem número"} · {c.cultura ?? "—"}
                    </span>
                    <span className="font-medium">
                      {formatValue(c.entregue)} kg no período · {formatValue(c.percentual_entrega)}% do contrato
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Bloco>

          <Bloco titulo="Consumo de insumos por área">
            {dados.data.porArea.length === 0 ? (
              <Vazio />
            ) : (
              <div className="space-y-4">
                {dados.data.porArea.map(([area, itens]) => (
                  <div key={area}>
                    <p className="font-medium capitalize">{area.replace(/_/g, " ")}</p>
                    <ul className="mt-1 divide-y divide-border text-sm">
                      {[...itens.entries()].map(([produto, qtd]) => (
                        <li key={produto} className="flex justify-between py-1.5">
                          <span>{produto}</span>
                          <span className="font-medium">{formatValue(qtd)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Bloco>

          {podeVerFinanceiro && (
            <>
              <Bloco titulo="Fluxo de caixa no período">
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Receitas previstas</span>
                    <span className="font-medium">{formatMoney(dados.data.receitas)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Despesas previstas</span>
                    <span className="font-medium">{formatMoney(dados.data.despesas)}</span>
                  </li>
                  <li className="flex justify-between border-t border-border pt-2">
                    <span className="font-semibold">Resultado</span>
                    <span className="font-bold">{formatMoney(dados.data.receitas - dados.data.despesas)}</span>
                  </li>
                </ul>
              </Bloco>

              <Bloco titulo="Despesas por categoria">
                {dados.data.despesasPorCategoria.length === 0 ? (
                  <Vazio />
                ) : (
                  <ul className="divide-y divide-border text-sm">
                    {dados.data.despesasPorCategoria.map(([cat, valor]) => (
                      <li key={cat} className="flex justify-between py-2 capitalize">
                        <span>{cat.replace(/_/g, " ")}</span>
                        <span className="font-medium">{formatMoney(valor)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Bloco>

              <Bloco titulo="Folha de pagamento (total lançado)">
                <p className="text-lg font-bold">{formatMoney(dados.data.folhaTotal)}</p>
              </Bloco>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="card-surface p-4">
      <h2 className="mb-3 text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function Vazio() {
  return <p className="text-sm text-muted-foreground">Sem dados no período escolhido.</p>;
}
