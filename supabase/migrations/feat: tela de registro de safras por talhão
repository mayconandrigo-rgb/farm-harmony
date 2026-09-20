import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/safras")({
  component: SafrasPage,
});

interface Talhao { id: string; codigo: string; }
interface Cultura { id: string; nome: string; }
interface Safra {
  id: string; safra: string; status: string;
  data_plantio: string | null; area_plantada_ha: number | null;
  produtividade_prevista_sc_ha: number | null;
  talhoes: { codigo: string } | null; culturas: { nome: string } | null;
}

const selectClass =
  "h-12 w-full rounded-md border border-input bg-background px-3 text-base md:text-sm";

function SafrasPage() {
  const queryClient = useQueryClient();
  const [talhaoId, setTalhaoId] = useState("");
  const [culturaId, setCulturaId] = useState("");
  const [safra, setSafra] = useState("2026/2027");
  const [dataPlantio, setDataPlantio] = useState("");
  const [area, setArea] = useState("");
  const [prodPrev, setProdPrev] = useState("");
  const [erro, setErro] = useState("");

  const fazenda = useQuery({
    queryKey: ["fazendas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("fazendas").select("id").limit(1);
      if (error) throw error;
      return data?.[0]?.id as string | undefined;
    },
  });
  const talhoes = useQuery({
    queryKey: ["talhoes"],
    enabled: !!fazenda.data,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talhoes").select("id, codigo").eq("fazenda_id", fazenda.data!).order("codigo");
      if (error) throw error;
      return (data ?? []) as Talhao[];
    },
  });
  const culturas = useQuery({
    queryKey: ["culturas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("culturas").select("id, nome").order("nome");
      if (error) throw error;
      return (data ?? []) as Cultura[];
    },
  });
  const safras = useQuery({
    queryKey: ["safras"],
    enabled: !!fazenda.data,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("safras")
        .select("id, safra, status, data_plantio, area_plantada_ha, produtividade_prevista_sc_ha, talhoes(codigo), culturas(nome)")
        .eq("fazenda_id", fazenda.data!)
        .order("data_plantio", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Safra[];
    },
  });

  const criar = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("safras").insert({
        fazenda_id: fazenda.data,
        talhao_id: talhaoId,
        cultura_id: culturaId,
        safra: safra.trim(),
        data_plantio: dataPlantio || null,
        area_plantada_ha: area ? Number(area) : null,
        produtividade_prevista_sc_ha: prodPrev ? Number(prodPrev) : null,
        status: "plantada",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTalhaoId(""); setCulturaId(""); setDataPlantio(""); setArea(""); setProdPrev("");
      queryClient.invalidateQueries({ queryKey: ["safras"] });
    },
  });

  const pronto = !!talhaoId && !!culturaId && !!safra.trim();

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Safras</h1>
        <p className="text-sm text-muted-foreground">Plantio por talhão — base para tratos culturais, colheita e custo por saca.</p>
      </header>

      <div className="card-surface grid gap-3 p-4 sm:grid-cols-2">
        <select className={selectClass} value={talhaoId} onChange={(e) => setTalhaoId(e.target.value)} aria-label="Talhão">
          <option value="">Selecione o talhão</option>
          {(talhoes.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.codigo}</option>)}
        </select>
        <select className={selectClass} value={culturaId} onChange={(e) => setCulturaId(e.target.value)} aria-label="Cultura">
          <option value="">Selecione a cultura</option>
          {(culturas.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <Input className="h-12" placeholder="Safra (ex.: 2026/2027)" value={safra} onChange={(e) => setSafra(e.target.value)} aria-label="Ano da safra" />
        <Input className="h-12" type="date" value={dataPlantio} onChange={(e) => setDataPlantio(e.target.value)} aria-label="Data de plantio" />
        <Input className="h-12" type="number" min="0.01" step="0.01" placeholder="Área plantada (ha)" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Área plantada em hectares" />
        <Input className="h-12" type="number" min="0" step="0.01" placeholder="Produtividade prevista (sc/ha)" value={prodPrev} onChange={(e) => setProdPrev(e.target.value)} aria-label="Produtividade prevista em sacas por hectare" />
        <button
          type="button"
          disabled={!pronto || criar.isPending}
          onClick={() => { setErro(""); criar.mutate(undefined, { onError: () => setErro("Não foi possível salvar a safra.") }); }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground disabled:opacity-50 sm:col-span-2"
        >
          {criar.isPending && <Loader2 className="size-4 animate-spin" />} Registrar plantio
        </button>
        {erro && <p className="text-sm font-medium text-destructive sm:col-span-2">{erro}</p>}
      </div>

      {safras.isLoading && <p className="text-sm text-muted-foreground">Carregando safras...</p>}
      {safras.isError && <p className="text-sm font-medium text-destructive">Não foi possível carregar as safras.</p>}

      <ul className="grid gap-3 sm:grid-cols-2">
        {(safras.data ?? []).map((s) => (
          <li key={s.id} className="card-surface space-y-1 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{s.talhoes?.codigo ?? "—"} · {s.culturas?.nome ?? "—"}</p>
              <Badge variant={s.status === "colhida" ? "default" : "secondary"}>{s.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Safra {s.safra}{s.data_plantio ? ` · plantio ${s.data_plantio.split("-").reverse().join("/")}` : ""}
              {s.area_plantada_ha ? ` · ${Number(s.area_plantada_ha).toFixed(2)} ha` : ""}
              {s.produtividade_prevista_sc_ha ? ` · previsão ${Number(s.produtividade_prevista_sc_ha)} sc/ha` : ""}
            </p>
          </li>
        ))}
      </ul>
 !talhoes.isLoading && (talhoes.data ?? []).length === 0 && (
        <div className="card-surface p-8 text-center text-sm text-muted-foreground">
          Cadastre talhões primeiro em <span className="font-medium">/talhoes</span>.
        </div>
      )}
    </div>
  );
}
