import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Egg, Loader2, TrendingUp, Tractor, Wallet, Warehouse } from "lucide-react";

import { db, formatMoney, formatValue } from "@/lib/db";
import { usePerfil } from "@/hooks/use-perfil";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/painel")({
  component: Painel,
});

interface Contrato {
  id: string;
  numero: string | null;
  cultura: string | null;
  quantidade_kg: number;
  percentual_entrega: number;
  status: string;
}

function Painel() {
  const { podeVerFinanceiro, nome } = usePerfil();
  const hoje = new Date().toISOString().slice(0, 10);

  const resumo = useQuery({
    queryKey: ["painel", podeVerFinanceiro],
    queryFn: async () => {
      const [talhoes, contratos, ovos, bovinos, ovinos, aves, saldo, contas] = await Promise.all([
        db.from("talhoes").select("nome, area_ha, cultura_atual, safra").order("nome"),
        db
          .from("contratos")
          .select("id, numero, cultura, quantidade_kg, percentual_entrega, status")
          .eq("status", "em_andamento")
          .order("data_contrato", { ascending: false })
          .limit(6),
        db.from("producao_ovos").select("quantidade").eq("data", hoje),
        db.from("animais").select("id", { count: "exact", head: true }).eq("especie", "bovino").eq("status", "ativo"),
        db.from("animais").select("id", { count: "exact", head: true }).eq("especie", "ovino").eq("status", "ativo"),
        db.from("lotes_aves").select("quantidade"),
        db.from("estoque_saldo").select("nome, unidade, saldo, estoque_minimo").order("nome"),
        podeVerFinanceiro
          ? db.from("contas").select("tipo, valor, status")
          : Promise.resolve({ data: [] as { tipo: string; valor: number; status: string }[] }),
      ]);

      const somaOvos = ((ovos.data ?? []) as { quantidade: number }[]).reduce((s, r) => s + (r.quantidade ?? 0), 0);
      const somaAves = ((aves.data ?? []) as { quantidade: number }[]).reduce((s, r) => s + (r.quantidade ?? 0), 0);
      const cont = (contas.data ?? []) as { tipo: string; valor: number; status: string }[];
      const aPagar = cont.filter((c) => c.tipo === "pagar" && c.status === "pendente").reduce((s, c) => s + Number(c.valor ?? 0), 0);
      const aReceber = cont.filter((c) => c.tipo === "receber" && c.status === "pendente").reduce((s, c) => s + Number(c.valor ?? 0), 0);
      const estoque = (saldo.data ?? []) as {
        nome: string;
        unidade: string;
        saldo: number;
        estoque_minimo: number | null;
      }[];

      return {
        talhoes: (talhoes.data ?? []) as { nome: string; area_ha: number; cultura_atual: string | null; safra: string | null }[],
        contratos: (contratos.data ?? []) as Contrato[],
        ovosHoje: somaOvos,
        bovinos: bovinos.count ?? 0,
        ovinos: ovinos.count ?? 0,
        aves: somaAves,
        estoque,
        alertas: estoque.filter((p) => (p.estoque_minimo ?? 0) > 0 && p.saldo < (p.estoque_minimo ?? 0)),
        aPagar,
        aReceber,
      };
    },
  });

  if (resumo.isLoading) {
    return (
      <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando o painel...
      </p>
    );
  }

  if (resumo.isError) {
    return (
      <div className="card-surface p-6">
        <p className="font-medium text-destructive">Não foi possível carregar o painel.</p>
        <button className="mt-3 text-sm text-primary underline" onClick={() => void resumo.refetch()}>
          Tentar de novo
        </button>
      </div>
    );
  }

  const d = resumo.data!;
  const areaTotal = d.talhoes.reduce((s, t) => s + Number(t.area_ha ?? 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Painel geral</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo{nome ? `, ${nome}` : ""}. Visão de hoje na fazenda.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card icone={<Tractor className="size-5" />} titulo="Área em talhões" valor={`${formatValue(areaTotal)} ha`} detalhe={`${d.talhoes.length} talhões`} />
        <Card icone={<Egg className="size-5" />} titulo="Ovos hoje" valor={formatValue(d.ovosHoje)} detalhe={`${formatValue(d.aves)} aves no galinheiro`} />
        <Card
          icone={<TrendingUp className="size-5" />}
          titulo="Rebanho"
          valor={`${formatValue(d.bovinos)} bovinos`}
          detalhe={`${formatValue(d.ovinos)} ovinos`}
        />
        {podeVerFinanceiro ? (
          <Card
            icone={<Wallet className="size-5" />}
            titulo="Saldo previsto"
            valor={formatMoney(d.aReceber - d.aPagar)}
            detalhe={`A receber ${formatMoney(d.aReceber)} · A pagar ${formatMoney(d.aPagar)}`}
          />
        ) : (
          <Card
            icone={<Warehouse className="size-5" />}
            titulo="Itens em estoque"
            valor={formatValue(d.estoque.length)}
            detalhe={`${d.alertas.length} abaixo do mínimo`}
          />
        )}
      </div>

      <section className="card-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Contratos em andamento</h2>
          <Link to="/registros/$entidade" params={{ entidade: "contratos" }} className="text-sm text-primary underline">
            Ver todos
          </Link>
        </div>
        {d.contratos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum contrato em andamento.</p>
        ) : (
          <ul className="space-y-4">
            {d.contratos.map((c) => (
              <li key={c.id}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-medium">
                    {c.numero ?? "Sem número"} · {c.cultura ?? "—"}
                  </span>
                  <span className="text-muted-foreground">
                    {formatValue(c.percentual_entrega)}% de {formatValue(c.quantidade_kg)} kg
                  </span>
                </div>
                <Progress value={Math.min(Number(c.percentual_entrega), 100)} className="mt-2" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Safra atual por talhão</h2>
          <Link to="/registros/$entidade" params={{ entidade: "talhoes" }} className="text-sm text-primary underline">
            Ver talhões
          </Link>
        </div>
        {d.talhoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cadastre os talhões para começar.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {d.talhoes.slice(0, 8).map((t) => (
              <li key={t.nome} className="flex items-center justify-between gap-2 py-2">
                <span className="font-medium">{t.nome}</span>
                <span className="text-muted-foreground">
                  {formatValue(t.area_ha)} ha · {t.cultura_atual ?? "sem cultura"} {t.safra ? `· ${t.safra}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {d.alertas.length > 0 && (
        <section className="card-surface p-4">
          <h2 className="mb-3 text-lg font-semibold">Estoque abaixo do mínimo</h2>
          <ul className="space-y-2 text-sm">
            {d.alertas.map((p) => (
              <li key={p.nome} className="flex items-center justify-between gap-2">
                <span>{p.nome}</span>
                <Badge variant="destructive">
                  {formatValue(p.saldo)} {p.unidade}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Card({
  icone,
  titulo,
  valor,
  detalhe,
}: {
  icone: React.ReactNode;
  titulo: string;
  valor: string;
  detalhe?: string;
}) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icone}
        <span className="text-sm">{titulo}</span>
      </div>
      <p className="mt-2 text-2xl font-bold">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-muted-foreground">{detalhe}</p>}
    </div>
  );
}
