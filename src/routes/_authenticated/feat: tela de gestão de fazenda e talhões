import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/talhoes")({
  component: TalhoesPage,
});

interface Fazenda { id: string; nome: string; }
interface Talhao {
  id: string; codigo: string; nome: string | null;
  area_ha: number; solo: string | null; topografia: string | null;
}

function TalhoesPage() {
  const queryClient = useQueryClient();
  const fazendas = useQuery({
    queryKey: ["fazendas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fazendas").select("*");
      if (error) throw error;
      return (data ?? []) as Fazenda[];
    },
  });

  if (fazendas.isLoading) {
    return (
      <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Carregando...
      </p>
    );
  }

  const fazenda = fazendas.data?.[0];
  if (!fazenda) {
    return <FazendaForm onCriada={() => queryClient.invalidateQueries({ queryKey: ["fazendas"] })} />;
  }

  return <TalhoesView fazendaId={fazenda.id} fazendaNome={fazenda.nome} />;
}

function FazendaForm({ onCriada }: { onCriada: () => void }) {
  const [nome, setNome] = useState("Fazenda 3V");
  const [municipio, setMunicipio] = useState("Nova Maringá");
  const [uf, setUf] = useState("MT");
  const [areaTotal, setAreaTotal] = useState("");
  const [erro, setErro] = useState("");

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("fazendas").insert({
        nome: nome.trim(),
        municipio: municipio.trim() || null,
        uf: uf.trim() || null,
        area_total_ha: areaTotal ? Number(areaTotal) : null,
      });
      if (error) throw error;
    },
    onSuccess: onCriada,
  });

  return (
    <div className="card-surface mx-auto max-w-md space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-bold">Criar fazenda</h1>
        <p className="text-sm text-muted-foreground">
          Passo único — a Fazenda 3V será a base de todo o sistema.
        </p>
      </div>
      <Input placeholder="Nome da fazenda" value={nome} onChange={(e) => setNome(e.target.value)} aria-label="Nome da fazenda" />
      <Input placeholder="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} aria-label="Município" />
      <Input placeholder="UF" value={uf} onChange={(e) => setUf(e.target.value)} aria-label="UF" />
      <Input type="number" min="0" step="0.01" placeholder="Área total (ha)" value={areaTotal} onChange={(e) => setAreaTotal(e.target.value)} aria-label="Área total em hectares" />
      {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}
      <button
        type="button"
        disabled={!nome.trim() || criar.isPending}
        onClick={() => { setErro(""); criar.mutate(undefined, { onError: () => setErro("Não foi possível criar a fazenda.") }); }}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground disabled:opacity-50"
      >
        {criar.isPending && <Loader2 className="size-4 animate-spin" />} Criar fazenda
      </button>
    </div>
  );
}

function TalhoesView({ fazendaId, fazendaNome }: { fazendaId: string; fazendaNome: string }) {
  const queryClient = useQueryClient();
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [area, setArea] = useState("");
  const [solo, setSolo] = useState("");
  const [erro, setErro] = useState("");

  const talhoes = useQuery({
    queryKey: ["talhoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talhoes").select("*").eq("fazenda_id", fazendaId).order("codigo");
      if (error) throw error;
      return (data ?? []) as Talhao[];
    },
  });

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("talhoes").insert({
        fazenda_id: fazendaId,
        codigo: codigo.trim().toUpperCase(),
        nome: nome.trim() || null,
        area_ha: Number(area),
        solo: solo.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setCodigo(""); setNome(""); setArea(""); setSolo("");
      queryClient.invalidateQueries({ queryKey: ["talhoes"] });
    },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Talhões</h1>
        <p className="text-sm text-muted-foreground">{fazendaNome} — unidade de custo e produtividade da operação.</p>
      </header>

      <div className="card-surface grid gap-3 p-4 sm:grid-cols-2">
        <Input className="h-12" placeholder="Código (ex.: T01)" value={codigo} onChange={(e) => setCodigo(e.target.value)} aria-label="Código do talhão" />
        <Input className="h-12" placeholder="Nome (ex.: Baixada do córrego)" value={nome} onChange={(e) => setNome(e.target.value)} aria-label="Nome do talhão" />
        <Input className="h-12" type="number" min="0.01" step="0.01" placeholder="Área (ha)" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Área em hectares" />
        <Input className="h-12" placeholder="Tipo de solo (ex.: latossolo)" value={solo} onChange={(e) => setSolo(e.target.value)} aria-label="Tipo de solo" />
        <button
          type="button"
          disabled={!codigo.trim() || !area || Number(area) <= 0 || criar.isPending}
          onClick={() => { setErro(""); criar.mutate(undefined, { onError: () => setErro("Não foi possível salvar. Verifique se o código já não existe.") }); }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground disabled:opacity-50 sm:col-span-2"
        >
          {criar.isPending && <Loader2 className="size-4 animate-spin" />} Adicionar talhão
        </button>
        {erro && <p className="text-sm font-medium text-destructive sm:col-span-2">{erro}</p>}
      </div>

      {talhoes.isLoading && <p className="text-sm text-muted-foreground">Carregando talhões...</p>}
      {talhoes.isError && <p className="text-sm font-medium text-destructive">Não foi possível carregar os talhões.</p>}

      <ul className="grid gap-3 sm:grid-cols-2">
        {(talhoes.data ?? []).map((t) => (
          <li key={t.id} className="card-surface flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="font-medium">{t.codigo}{t.nome ? ` — ${t.nome}` : ""}</p>
              <p className="text-xs text-muted-foreground capitalize">{(t.solo ?? "solo não informado").toLowerCase()}</p>
            </div>
            <p className="shrink-0 text-lg font-bold">{Number(t.area_ha).toFixed(2)} <span className="text-sm font-normal">ha</span></p>
          </li>
        ))}
      </ul>
      {!talhoes.isLoading && (talhoes.data ?? []).length === 0 && (
        <div className="card-surface p-8 text-center text-sm text-muted-foreground">Nenhum talhão cadastrado ainda.</div>
      )}
    </div>
  );
}
