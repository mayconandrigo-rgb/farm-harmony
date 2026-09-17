import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Paperclip, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AnexosDialog } from "@/components/AnexosDialog";
import { ConfirmarExclusao } from "@/components/ConfirmarExclusao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePerfil } from "@/hooks/use-perfil";
import { removerAnexosDoRegistro } from "@/lib/anexos";
import { db, formatMoney, formatValue } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/notas-fiscais")({
  component: NotasFiscaisPage,
  head: () => ({
    meta: [
      { title: "Notas fiscais — Gestão da Fazenda" },
      {
        name: "description",
        content:
          "Lance notas fiscais de entrada e saída com itens, gerando estoque valorizado e contas a pagar automaticamente.",
      },
      { property: "og:title", content: "Notas fiscais — Gestão da Fazenda" },
      {
        property: "og:description",
        content: "Notas fiscais com itens, estoque automático e parcelas no contas a pagar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const FORMAS = ["pix", "boleto", "transferencia", "dinheiro", "cartao", "cheque", "permuta"];
const UNIDADES = ["kg", "saco", "litro", "dose", "unidade", "tonelada", "ha", "l/ha"];

interface ItemForm {
  descricao: string;
  produto_id: string;
  quantidade: string;
  unidade: string;
  valor_unitario: string;
  cfop: string;
  ncm: string;
}

interface ParcelaForm {
  vencimento: string;
  valor: string;
  forma_pagamento: string;
  plano_conta_id: string;
}

const hoje = () => new Date().toISOString().slice(0, 10);
const num = (v: string) => Number(String(v ?? "").replace(/\./g, "").replace(",", ".")) || 0;
const itemVazio = (): ItemForm => ({
  descricao: "",
  produto_id: "",
  quantidade: "",
  unidade: "",
  valor_unitario: "",
  cfop: "",
  ncm: "",
});
const parcelaVazia = (): ParcelaForm => ({
  vencimento: hoje(),
  valor: "",
  forma_pagamento: "boleto",
  plano_conta_id: "",
});

interface NotaLista {
  id: string;
  numero: string | null;
  tipo: string;
  parceiro_id: string | null;
  data_emissao: string;
  valor_total: number | null;
  frete: number | null;
  nf_itens: { id: string }[];
}

function NotasFiscaisPage() {
  const { podeEditar, ehGestor } = usePerfil();
  const queryClient = useQueryClient();

  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [capa, setCapa] = useState({
    numero: "",
    tipo: "entrada",
    parceiro_id: "",
    data_emissao: hoje(),
    frete: "",
    icms: "",
    pis_cofins: "",
    centro_custo_id: "",
    observacoes: "",
  });
  const [itens, setItens] = useState<ItemForm[]>([itemVazio()]);
  const [parcelas, setParcelas] = useState<ParcelaForm[]>([parcelaVazia()]);
  const [anexoDe, setAnexoDe] = useState<NotaLista | null>(null);
  const [excluindo, setExcluindo] = useState<NotaLista | null>(null);

  const parceiros = useQuery({
    queryKey: ["ref", "parceiros"],
    queryFn: async () => {
      const { data, error } = await db.from("parceiros").select("id, nome, tipo").order("nome");
      if (error) throw error;
      return (data ?? []) as { id: string; nome: string; tipo: string }[];
    },
  });
  const produtos = useQuery({
    queryKey: ["ref", "produtos"],
    queryFn: async () => {
      const { data, error } = await db.from("produtos").select("id, nome, unidade").order("nome");
      if (error) throw error;
      return (data ?? []) as { id: string; nome: string; unidade: string }[];
    },
  });
  const centros = useQuery({
    queryKey: ["ref", "centros_custo"],
    queryFn: async () => {
      const { data, error } = await db.from("centros_custo").select("id, nome").order("nome");
      if (error) throw error;
      return (data ?? []) as { id: string; nome: string }[];
    },
  });
  const planoContas = useQuery({
    queryKey: ["ref", "plano_contas"],
    queryFn: async () => {
      const { data, error } = await db
        .from("plano_contas")
        .select("id, nome, natureza")
        .order("codigo");
      if (error) throw error;
      return (data ?? []) as { id: string; nome: string; natureza: string }[];
    },
  });

  const notas = useQuery({
    queryKey: ["notas_fiscais", filtroTipo, de, ate],
    queryFn: async () => {
      let q = db
        .from("notas_fiscais")
        .select("id, numero, tipo, parceiro_id, data_emissao, valor_total, frete, nf_itens(id)")
        .order("data_emissao", { ascending: false })
        .limit(300);
      if (filtroTipo) q = q.eq("tipo", filtroTipo);
      if (de) q = q.gte("data_emissao", de);
      if (ate) q = q.lte("data_emissao", ate);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as NotaLista[];
    },
  });

  const nomeParceiro = (id: string | null) =>
    (parceiros.data ?? []).find((p) => p.id === id)?.nome ?? "—";

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const rows = notas.data ?? [];
    if (!termo) return rows;
    return rows.filter((n) =>
      `${n.numero ?? ""} ${n.tipo} ${nomeParceiro(n.parceiro_id)}`.toLowerCase().includes(termo),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notas.data, busca, parceiros.data]);

  const totalItens = itens.reduce((s, i) => s + num(i.quantidade) * num(i.valor_unitario), 0);
  const frete = num(capa.frete);
  const totalNota = totalItens + frete;
  const totalParcelas = parcelas.reduce((s, p) => s + num(p.valor), 0);

  function abrirNovo() {
    setCapa({
      numero: "",
      tipo: "entrada",
      parceiro_id: "",
      data_emissao: hoje(),
      frete: "",
      icms: "",
      pis_cofins: "",
      centro_custo_id: "",
      observacoes: "",
    });
    setItens([itemVazio()]);
    setParcelas([parcelaVazia()]);
    setErro(null);
    setAberto(true);
  }

  const salvar = useMutation({
    mutationFn: async () => {
      const { data: nf, error: errNf } = await db
        .from("notas_fiscais")
        .insert({
          numero: capa.numero || null,
          tipo: capa.tipo,
          parceiro_id: capa.parceiro_id || null,
          data_emissao: capa.data_emissao,
          valor_total: totalNota,
          frete: frete || null,
          icms: num(capa.icms) || null,
          pis_cofins: num(capa.pis_cofins) || null,
          centro_custo_id: capa.centro_custo_id || null,
          observacoes: capa.observacoes || null,
        })
        .select("id")
        .single();
      if (errNf) throw errNf;
      const notaId = (nf as { id: string }).id;

      try {
        const linhas = itens.map((i) => {
          const qtd = num(i.quantidade);
          const vu = num(i.valor_unitario);
          const valorItem = qtd * vu;
          const rateio = totalItens > 0 ? (frete * valorItem) / totalItens : 0;
          return {
            nota_fiscal_id: notaId,
            produto_id: i.produto_id,
            descricao: i.descricao || null,
            quantidade: qtd,
            unidade: i.unidade || null,
            valor_unitario: vu,
            valor_total: valorItem,
            custo_unitario: qtd > 0 ? (valorItem + rateio) / qtd : vu,
            cfop: i.cfop || null,
            ncm: i.ncm || null,
          };
        });
        const { error: errItens } = await db.from("nf_itens").insert(linhas);
        if (errItens) throw errItens;

        if (capa.tipo === "entrada") {
          const contas = parcelas.map((p, idx) => ({
            tipo: "pagar",
            descricao: `NF ${capa.numero || "s/nº"} — parcela ${idx + 1}/${parcelas.length}`,
            categoria: "insumos",
            plano_conta_id: p.plano_conta_id || null,
            centro_custo_id: capa.centro_custo_id || null,
            parceiro_id: capa.parceiro_id || null,
            nota_fiscal_id: notaId,
            valor: num(p.valor),
            vencimento: p.vencimento,
            status: "pendente",
            forma_pagamento: p.forma_pagamento || null,
            parcela: idx + 1,
            total_parcelas: parcelas.length,
          }));
          const { error: errContas } = await db.from("contas").insert(contas);
          if (errContas) throw errContas;
        }
      } catch (e) {
        // desfaz a capa para não deixar nota pela metade
        await db.from("nf_itens").delete().eq("nota_fiscal_id", notaId);
        await db.from("estoque_movimentos").delete().eq("nota_fiscal_id", notaId);
        await db.from("contas").delete().eq("nota_fiscal_id", notaId);
        await db.from("notas_fiscais").delete().eq("id", notaId);
        throw e;
      }
    },
    onSuccess: () => {
      toast.success("Nota fiscal lançada: estoque e financeiro atualizados.");
      setAberto(false);
      void queryClient.invalidateQueries();
    },
    onError: (e: { message?: string }) =>
      setErro(e?.message ?? "Não foi possível lançar a nota fiscal."),
  });

  const excluir = useMutation({
    mutationFn: async (nota: NotaLista) => {
      const { error } = await db.from("notas_fiscais").delete().eq("id", nota.id);
      if (error) throw error;
      await removerAnexosDoRegistro("notas_fiscais", nota.id);
    },
    onSuccess: () => {
      toast.success("Nota fiscal excluída.");
      void queryClient.invalidateQueries();
    },
    onError: (e: { message?: string }) =>
      toast.error(
        e?.message?.includes("movimentou o estoque")
          ? "Esta nota já movimentou o estoque e não pode ser excluída."
          : "Não foi possível excluir esta nota fiscal.",
      ),
  });

  function validar(): string | null {
    if (!capa.data_emissao) return "Informe a data de emissão.";
    const parceiro = (parceiros.data ?? []).find((p) => p.id === capa.parceiro_id);
    if (!parceiro) return "Escolha o fornecedor (entrada) ou o cliente (saída).";
    if (capa.tipo === "entrada" && parceiro.tipo === "cliente")
      return "Nota de entrada exige um fornecedor.";
    if (capa.tipo === "saida" && parceiro.tipo === "fornecedor")
      return "Nota de saída exige um cliente.";
    if (itens.length === 0) return "Inclua pelo menos um item.";
    for (const [i, item] of itens.entries()) {
      if (!item.produto_id) return `Escolha o produto do item ${i + 1}.`;
      if (num(item.quantidade) <= 0) return `A quantidade do item ${i + 1} deve ser maior que zero.`;
      if (num(item.valor_unitario) < 0) return `O valor unitário do item ${i + 1} não pode ser negativo.`;
    }
    if (capa.tipo === "entrada") {
      if (parcelas.length === 0) return "Informe pelo menos uma parcela a pagar.";
      for (const [i, p] of parcelas.entries()) {
        if (!p.vencimento) return `Informe o vencimento da parcela ${i + 1}.`;
        if (num(p.valor) <= 0) return `Informe o valor da parcela ${i + 1}.`;
      }
      if (Math.abs(totalParcelas - totalNota) > 0.05)
        return `A soma das parcelas (${formatMoney(totalParcelas)}) precisa fechar com o total da nota (${formatMoney(totalNota)}).`;
    }
    return null;
  }

  function distribuirParcelas(qtd: number) {
    const valor = totalNota / qtd;
    const base = new Date(`${capa.data_emissao}T12:00:00`);
    setParcelas(
      Array.from({ length: qtd }, (_, i) => {
        const d = new Date(base);
        d.setMonth(d.getMonth() + i + 1);
        return {
          vencimento: d.toISOString().slice(0, 10),
          valor: valor.toFixed(2).replace(".", ","),
          forma_pagamento: "boleto",
          plano_conta_id: parcelas[0]?.plano_conta_id ?? "",
        };
      }),
    );
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Notas fiscais</h1>
        <p className="text-sm text-muted-foreground">
          Lance a nota com seus itens: o estoque entra valorizado e as parcelas vão para o contas a
          pagar automaticamente.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por número ou parceiro..."
            className="h-12 pl-9"
            aria-label="Buscar notas fiscais"
          />
        </div>
        <select
          aria-label="Tipo"
          className="h-12 rounded-lg border border-input bg-background px-3"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <Input
          type="date"
          aria-label="Data inicial"
          className="h-12"
          value={de}
          onChange={(e) => setDe(e.target.value)}
        />
        <Input
          type="date"
          aria-label="Data final"
          className="h-12"
          value={ate}
          onChange={(e) => setAte(e.target.value)}
        />
      </div>

      {podeEditar && (
        <Button size="lg" className="h-12 w-full sm:w-auto" onClick={abrirNovo}>
          <Plus className="size-5" /> Nova nota fiscal
        </Button>
      )}

      {notas.isLoading && (
        <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando notas...
        </p>
      )}
      {notas.isError && (
        <div className="card-surface p-4 text-sm">
          <p className="font-medium text-destructive">Não foi possível carregar as notas fiscais.</p>
          <Button variant="outline" className="mt-3" onClick={() => void notas.refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}
      {!notas.isLoading && !notas.isError && filtradas.length === 0 && (
        <div className="card-surface p-8 text-center text-sm text-muted-foreground">
          Nenhuma nota fiscal encontrada.
        </div>
      )}

      <ul className="grid gap-3 md:hidden">
        {filtradas.map((n) => (
          <li key={n.id} className="card-surface p-4 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">NF {n.numero ?? "s/nº"}</span>
              <Badge variant="secondary">{n.tipo}</Badge>
            </div>
            <p className="text-muted-foreground">{nomeParceiro(n.parceiro_id)}</p>
            <p>{formatValue(n.data_emissao)}</p>
            <p className="font-medium">{formatMoney(n.valor_total)}</p>
            <p className="text-muted-foreground">{n.nf_itens?.length ?? 0} item(ns)</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setAnexoDe(n)}>
                <Paperclip className="size-4" /> Arquivos
              </Button>
              {ehGestor && (
                <Button variant="ghost" size="sm" onClick={() => setExcluindo(n)} aria-label="Excluir">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {filtradas.length > 0 && (
        <div className="card-surface hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Número</th>
                <th className="px-3 py-3 text-left font-semibold">Tipo</th>
                <th className="px-3 py-3 text-left font-semibold">Parceiro</th>
                <th className="px-3 py-3 text-left font-semibold">Emissão</th>
                <th className="px-3 py-3 text-left font-semibold">Valor total</th>
                <th className="px-3 py-3 text-left font-semibold">Itens</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtradas.map((n) => (
                <tr key={n.id} className="border-t border-border">
                  <td className="px-3 py-3">{n.numero ?? "s/nº"}</td>
                  <td className="px-3 py-3">
                    <Badge variant="secondary">{n.tipo}</Badge>
                  </td>
                  <td className="px-3 py-3">{nomeParceiro(n.parceiro_id)}</td>
                  <td className="px-3 py-3">{formatValue(n.data_emissao)}</td>
                  <td className="px-3 py-3">{formatMoney(n.valor_total)}</td>
                  <td className="px-3 py-3">{n.nf_itens?.length ?? 0}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setAnexoDe(n)} aria-label="Arquivos">
                        <Paperclip className="size-4" />
                      </Button>
                      {ehGestor && (
                        <Button variant="ghost" size="icon" onClick={() => setExcluindo(n)} aria-label="Excluir">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova nota fiscal</DialogTitle>
            <DialogDescription>
              Capa, itens e parcelas são lançados juntos em um único salvamento.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              const problema = validar();
              setErro(problema);
              if (!problema) salvar.mutate();
            }}
          >
            {/* CAPA */}
            <section className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  className="h-12"
                  value={capa.numero}
                  onChange={(e) => setCapa({ ...capa, numero: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tipo">Tipo</Label>
                <select
                  id="tipo"
                  className="h-12 w-full rounded-lg border border-input bg-background px-3"
                  value={capa.tipo}
                  onChange={(e) => setCapa({ ...capa, tipo: e.target.value })}
                >
                  <option value="entrada">Entrada (compra)</option>
                  <option value="saida">Saída (venda)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parceiro">
                  {capa.tipo === "entrada" ? "Fornecedor" : "Cliente"}
                  <span className="text-destructive"> *</span>
                </Label>
                <select
                  id="parceiro"
                  className="h-12 w-full rounded-lg border border-input bg-background px-3"
                  value={capa.parceiro_id}
                  onChange={(e) => setCapa({ ...capa, parceiro_id: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {(parceiros.data ?? [])
                    .filter((p) =>
                      capa.tipo === "entrada" ? p.tipo !== "cliente" : p.tipo !== "fornecedor",
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emissao">
                  Data de emissão<span className="text-destructive"> *</span>
                </Label>
                <Input
                  id="emissao"
                  type="date"
                  className="h-12"
                  value={capa.data_emissao}
                  onChange={(e) => setCapa({ ...capa, data_emissao: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="frete">Frete</Label>
                <Input
                  id="frete"
                  className="h-12"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={capa.frete}
                  onChange={(e) => setCapa({ ...capa, frete: e.target.value.replace(/[^\d.,]/g, "") })}
                />
                <p className="text-xs text-muted-foreground">
                  Rateado nos itens pelo valor de cada um.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="centro">Centro de custo</Label>
                <select
                  id="centro"
                  className="h-12 w-full rounded-lg border border-input bg-background px-3"
                  value={capa.centro_custo_id}
                  onChange={(e) => setCapa({ ...capa, centro_custo_id: e.target.value })}
                >
                  <option value="">Selecione</option>
                  {(centros.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="icms">ICMS</Label>
                <Input
                  id="icms"
                  className="h-12"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={capa.icms}
                  onChange={(e) => setCapa({ ...capa, icms: e.target.value.replace(/[^\d.,]/g, "") })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pis">PIS / COFINS</Label>
                <Input
                  id="pis"
                  className="h-12"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={capa.pis_cofins}
                  onChange={(e) =>
                    setCapa({ ...capa, pis_cofins: e.target.value.replace(/[^\d.,]/g, "") })
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  value={capa.observacoes}
                  onChange={(e) => setCapa({ ...capa, observacoes: e.target.value })}
                />
              </div>
            </section>

            {/* ITENS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Itens da nota</h2>
                <Button type="button" variant="outline" size="sm" onClick={() => setItens([...itens, itemVazio()])}>
                  <Plus className="size-4" /> Item
                </Button>
              </div>

              {itens.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Item {idx + 1}</span>
                    {itens.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover item ${idx + 1}`}
                        onClick={() => setItens(itens.filter((_, i) => i !== idx))}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      aria-label={`Produto do item ${idx + 1}`}
                      className="h-12 rounded-lg border border-input bg-background px-3 sm:col-span-2"
                      value={item.produto_id}
                      onChange={(e) => {
                        const prod = (produtos.data ?? []).find((p) => p.id === e.target.value);
                        setItens(
                          itens.map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  produto_id: e.target.value,
                                  unidade: it.unidade || prod?.unidade || "",
                                  descricao: it.descricao || prod?.nome || "",
                                }
                              : it,
                          ),
                        );
                      }}
                    >
                      <option value="">Produto (obrigatório)</option>
                      {(produtos.data ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                    <Input
                      className="h-12 sm:col-span-2"
                      placeholder="Descrição na nota"
                      aria-label={`Descrição do item ${idx + 1}`}
                      value={item.descricao}
                      onChange={(e) =>
                        setItens(itens.map((it, i) => (i === idx ? { ...it, descricao: e.target.value } : it)))
                      }
                    />
                    <Input
                      className="h-12"
                      inputMode="decimal"
                      placeholder="Quantidade"
                      aria-label={`Quantidade do item ${idx + 1}`}
                      value={item.quantidade}
                      onChange={(e) =>
                        setItens(
                          itens.map((it, i) =>
                            i === idx ? { ...it, quantidade: e.target.value.replace(/[^\d.,]/g, "") } : it,
                          ),
                        )
                      }
                    />
                    <select
                      aria-label={`Unidade do item ${idx + 1}`}
                      className="h-12 rounded-lg border border-input bg-background px-3"
                      value={item.unidade}
                      onChange={(e) =>
                        setItens(itens.map((it, i) => (i === idx ? { ...it, unidade: e.target.value } : it)))
                      }
                    >
                      <option value="">Unidade</option>
                      {UNIDADES.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <Input
                      className="h-12"
                      inputMode="decimal"
                      placeholder="Valor unitário"
                      aria-label={`Valor unitário do item ${idx + 1}`}
                      value={item.valor_unitario}
                      onChange={(e) =>
                        setItens(
                          itens.map((it, i) =>
                            i === idx ? { ...it, valor_unitario: e.target.value.replace(/[^\d.,]/g, "") } : it,
                          ),
                        )
                      }
                    />
                    <div className="flex h-12 items-center rounded-lg bg-muted/50 px-3 text-sm font-medium">
                      Total: {formatMoney(num(item.quantidade) * num(item.valor_unitario))}
                    </div>
                    <Input
                      className="h-12"
                      placeholder="CFOP"
                      aria-label={`CFOP do item ${idx + 1}`}
                      value={item.cfop}
                      onChange={(e) =>
                        setItens(itens.map((it, i) => (i === idx ? { ...it, cfop: e.target.value } : it)))
                      }
                    />
                    <Input
                      className="h-12"
                      placeholder="NCM"
                      aria-label={`NCM do item ${idx + 1}`}
                      value={item.ncm}
                      onChange={(e) =>
                        setItens(itens.map((it, i) => (i === idx ? { ...it, ncm: e.target.value } : it)))
                      }
                    />
                  </div>
                </div>
              ))}

              <div className="rounded-xl bg-muted/50 p-3 text-sm">
                <p>Itens: {formatMoney(totalItens)}</p>
                <p>Frete: {formatMoney(frete)}</p>
                <p className="font-semibold">Total da nota: {formatMoney(totalNota)}</p>
              </div>
            </section>

            {/* PARCELAS */}
            {capa.tipo === "entrada" && (
              <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">Parcelas a pagar</h2>
                  <div className="flex gap-2">
                    {[1, 2, 3, 6].map((q) => (
                      <Button
                        key={q}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => distribuirParcelas(q)}
                      >
                        {q}x
                      </Button>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setParcelas([...parcelas, parcelaVazia()])}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>

                {parcelas.map((p, idx) => (
                  <div key={idx} className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-4">
                    <Input
                      type="date"
                      className="h-12"
                      aria-label={`Vencimento da parcela ${idx + 1}`}
                      value={p.vencimento}
                      onChange={(e) =>
                        setParcelas(parcelas.map((x, i) => (i === idx ? { ...x, vencimento: e.target.value } : x)))
                      }
                    />
                    <Input
                      className="h-12"
                      inputMode="decimal"
                      placeholder="Valor"
                      aria-label={`Valor da parcela ${idx + 1}`}
                      value={p.valor}
                      onChange={(e) =>
                        setParcelas(
                          parcelas.map((x, i) =>
                            i === idx ? { ...x, valor: e.target.value.replace(/[^\d.,]/g, "") } : x,
                          ),
                        )
                      }
                    />
                    <select
                      aria-label={`Forma de pagamento da parcela ${idx + 1}`}
                      className="h-12 rounded-lg border border-input bg-background px-3"
                      value={p.forma_pagamento}
                      onChange={(e) =>
                        setParcelas(
                          parcelas.map((x, i) => (i === idx ? { ...x, forma_pagamento: e.target.value } : x)),
                        )
                      }
                    >
                      {FORMAS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <select
                        aria-label={`Categoria da parcela ${idx + 1}`}
                        className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-background px-3"
                        value={p.plano_conta_id}
                        onChange={(e) =>
                          setParcelas(
                            parcelas.map((x, i) => (i === idx ? { ...x, plano_conta_id: e.target.value } : x)),
                          )
                        }
                      >
                        <option value="">Categoria</option>
                        {(planoContas.data ?? [])
                          .filter((c) => c.natureza === "despesa")
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nome}
                            </option>
                          ))}
                      </select>
                      {parcelas.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remover parcela ${idx + 1}`}
                          onClick={() => setParcelas(parcelas.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground">
                  Soma das parcelas: <strong>{formatMoney(totalParcelas)}</strong> — total da nota:{" "}
                  <strong>{formatMoney(totalNota)}</strong>
                </p>
              </section>
            )}

            {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={salvar.isPending}>
                {salvar.isPending && <Loader2 className="size-4 animate-spin" />} Lançar nota
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {anexoDe && (
        <AnexosDialog
          entidade="notas_fiscais"
          registroId={anexoDe.id}
          titulo={`Nota fiscal ${anexoDe.numero ?? "s/nº"}`}
          aberto
          onFechar={() => setAnexoDe(null)}
        />
      )}

      <ConfirmarExclusao
        aberto={!!excluindo}
        titulo={`Excluir nota fiscal nº ${excluindo?.numero ?? excluindo?.id ?? ""}?`}
        descricao="Notas que já movimentaram o estoque não podem ser excluídas."
        onCancelar={() => setExcluindo(null)}
        onConfirmar={() => {
          if (excluindo) excluir.mutate(excluindo);
          setExcluindo(null);
        }}
      />
    </div>
  );
}
