import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { db, formatValue } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/estoque")({
  component: EstoquePage,
});

interface Saldo {
  produto_id: string;
  nome: string;
  categoria: string;
  unidade: string;
  saldo: number;
  estoque_minimo: number | null;
}

function EstoquePage() {
  const [busca, setBusca] = useState("");
  const saldos = useQuery({
    queryKey: ["estoque_saldo"],
    queryFn: async () => {
      const { data, error } = await db.from("estoque_saldo").select("*").order("nome");
      if (error) throw error;
      return (data ?? []) as Saldo[];
    },
  });

  const lista = (saldos.data ?? []).filter((s) =>
    `${s.nome} ${s.categoria}`.toLowerCase().includes(busca.trim().toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Saldo de estoque</h1>
        <p className="text-sm text-muted-foreground">
          Calculado automaticamente pelas notas fiscais e pelos consumos lançados por área.
        </p>
      </header>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 pl-9"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar produto"
        />
      </div>

      <p className="text-sm">
        <Link to="/registros/$entidade" params={{ entidade: "estoque_movimentos" }} className="text-primary underline">
          Lançar entrada, saída ou ajuste
        </Link>
      </p>

      {saldos.isLoading && (
        <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando saldos...
        </p>
      )}
      {saldos.isError && <p className="text-sm font-medium text-destructive">Não foi possível carregar o estoque.</p>}
      {!saldos.isLoading && lista.length === 0 && (
        <div className="card-surface p-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {lista.map((s) => {
          const abaixo = (s.estoque_minimo ?? 0) > 0 && Number(s.saldo) < Number(s.estoque_minimo);
          return (
            <li key={s.produto_id} className="card-surface flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{s.nome}</p>
                <p className="text-xs text-muted-foreground capitalize">{s.categoria.replace(/_/g, " ")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatValue(s.saldo)} <span className="text-sm font-normal">{s.unidade}</span>
                </p>
                {abaixo && <Badge variant="destructive">abaixo do mínimo</Badge>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
