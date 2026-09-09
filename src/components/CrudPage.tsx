import { useMemo, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Paperclip, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AnexosDialog } from "@/components/AnexosDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePerfil } from "@/hooks/use-perfil";
import { db, formatMoney, formatValue } from "@/lib/db";
import type { EntityDef, FieldDef } from "@/lib/entities";
import { labelFor } from "@/lib/entities";

type Registro = Record<string, unknown>;

function valorInicial(entity: EntityDef): Registro {
  const hoje = new Date().toISOString().slice(0, 10);
  const base: Registro = {};
  for (const f of entity.fields) {
    if (f.type === "date") base[f.name] = hoje;
    else if (f.type === "datetime") base[f.name] = new Date().toISOString().slice(0, 16);
    else if (f.type === "boolean") base[f.name] = true;
    else if (f.type === "select") base[f.name] = f.options?.[0] ?? "";
    else base[f.name] = "";
  }
  return base;
}

export function CrudPage({ entity }: { entity: EntityDef }) {
  const { podeEditar, ehGestor } = usePerfil();
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Registro | null>(null);
  const [valores, setValores] = useState<Registro>(() => valorInicial(entity));
  const [anexoDe, setAnexoDe] = useState<Registro | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);

  const refTables = useMemo(() => {
    const set = new Map<string, FieldDef>();
    for (const f of entity.fields) if (f.ref) set.set(f.ref.table, f);
    return [...set.entries()];
  }, [entity]);

  const refQueries = useQueries({
    queries: refTables.map(([table, field]) => ({
      queryKey: ["ref", table],
      queryFn: async () => {
        const { data, error } = await db
          .from(table)
          .select(`id, ${field.ref!.label}`)
          .order(field.ref!.label, { ascending: true })
          .limit(1000);
        if (error) throw error;
        return (data ?? []) as { id: string }[];
      },
      staleTime: 60_000,
    })),
  });

  const refMap = useMemo(() => {
    const map: Record<string, { id: string; label: string }[]> = {};
    refTables.forEach(([table, field], i) => {
      const rows = (refQueries[i]?.data ?? []) as Record<string, string>[];
      map[table] = rows.map((r) => ({
        id: r["id"] as string,
        label: (r[field.ref!.label] as string) ?? "(sem nome)",
      }));
    });
    return map;
  }, [refQueries, refTables]);

  const lista = useQuery({
    queryKey: ["lista", entity.key],
    queryFn: async () => {
      let q = db.from(entity.table).select("*");
      for (const [k, v] of Object.entries(entity.fixed ?? {})) q = q.eq(k, v);
      const order = entity.order ?? { column: "created_at", asc: false };
      q = q.order(order.column, { ascending: order.asc ?? false }).limit(1000);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Registro[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (payload: Registro) => {
      const limpo: Registro = { ...entity.fixed };
      for (const f of entity.fields) {
        const raw = payload[f.name];
        if (f.type === "boolean") limpo[f.name] = Boolean(raw);
        else if (raw === "" || raw === undefined || raw === null) limpo[f.name] = null;
        else if (f.type === "number" || f.type === "money")
          limpo[f.name] = Number(String(raw).replace(/\./g, "").replace(",", "."));
        else limpo[f.name] = raw;
      }
      if (editando) {
        const { error } = await db.from(entity.table).update(limpo).eq("id", editando["id"] as string);
        if (error) throw error;
      } else {
        const { error } = await db.from(entity.table).insert(limpo);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editando ? "Registro atualizado." : "Registro salvo.");
      setFormAberto(false);
      setEditando(null);
      void queryClient.invalidateQueries();
    },
    onError: (e: { message?: string }) => {
      setErroForm(e?.message ?? "Não foi possível salvar. Confira os campos e tente de novo.");
    },
  });

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(entity.table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registro excluído.");
      void queryClient.invalidateQueries();
    },
    onError: () => toast.error("Não foi possível excluir este registro."),
  });

  function rotuloRef(field: FieldDef, id: unknown): string {
    if (!id || !field.ref) return "—";
    return refMap[field.ref.table]?.find((o) => o.id === id)?.label ?? "—";
  }

  function celula(row: Registro, coluna: string) {
    const field = entity.fields.find((f) => f.name === coluna);
    const valor = row[coluna];
    if (field?.type === "ref") return rotuloRef(field, valor);
    if (field?.type === "money" || coluna === "valor_liquido") return formatMoney(valor as number);
    if (coluna === "percentual_entrega") return `${formatValue(valor)}%`;
    if (coluna === "status" || coluna === "tipo") {
      return <Badge variant="secondary">{formatValue(valor)}</Badge>;
    }
    return formatValue(valor);
  }

  const filtrados = useMemo(() => {
    const rows = lista.data ?? [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return rows;
    return rows.filter((row) => {
      const texto = entity.list
        .map((c) => {
          const f = entity.fields.find((x) => x.name === c);
          return f?.type === "ref" ? rotuloRef(f, row[c]) : String(row[c] ?? "");
        })
        .join(" ")
        .toLowerCase();
      return texto.includes(termo);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista.data, busca, refMap, entity]);

  function abrirNovo() {
    setEditando(null);
    setValores(valorInicial(entity));
    setErroForm(null);
    setFormAberto(true);
  }

  function abrirEdicao(row: Registro) {
    const v: Registro = {};
    for (const f of entity.fields) {
      const raw = row[f.name];
      v[f.name] =
        f.type === "datetime" && typeof raw === "string"
          ? new Date(raw).toISOString().slice(0, 16)
          : (raw ?? (f.type === "boolean" ? false : ""));
    }
    setValores(v);
    setEditando(row);
    setErroForm(null);
    setFormAberto(true);
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{entity.label}</h1>
        <p className="text-sm text-muted-foreground">{entity.descricao}</p>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar..."
            className="h-12 pl-9"
            aria-label="Buscar registros"
          />
        </div>
        {podeEditar && (
          <Button size="lg" className="h-12" onClick={abrirNovo}>
            <Plus className="size-5" /> Novo
          </Button>
        )}
      </div>

      {lista.isLoading && (
        <p className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Carregando registros...
        </p>
      )}
      {lista.isError && (
        <div className="card-surface p-4 text-sm">
          <p className="font-medium text-destructive">Não foi possível carregar os dados.</p>
          <Button variant="outline" className="mt-3" onClick={() => void lista.refetch()}>
            Tentar de novo
          </Button>
        </div>
      )}

      {!lista.isLoading && !lista.isError && filtrados.length === 0 && (
        <div className="card-surface p-8 text-center text-sm text-muted-foreground">
          Nenhum registro encontrado.
        </div>
      )}

      {/* Lista em cartões: leitura fácil no celular */}
      <ul className="grid gap-3 md:hidden">
        {filtrados.map((row) => (
          <li key={row["id"] as string} className="card-surface p-4">
            <dl className="space-y-1">
              {entity.list.map((c) => (
                <div key={c} className="flex justify-between gap-3 text-sm">
                  <dt className="text-muted-foreground capitalize">{labelFor(entity, c)}</dt>
                  <dd className="text-right font-medium">{celula(row, c)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setAnexoDe(row)}>
                <Paperclip className="size-4" /> Arquivos
              </Button>
              {podeEditar && (
                <Button variant="outline" size="sm" onClick={() => abrirEdicao(row)}>
                  <Pencil className="size-4" /> Editar
                </Button>
              )}
              {ehGestor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => excluir.mutate(row["id"] as string)}
                  aria-label="Excluir"
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {filtrados.length > 0 && (
        <div className="card-surface hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {entity.list.map((c) => (
                  <th key={c} className="px-3 py-3 text-left font-semibold capitalize">
                    {labelFor(entity, c)}
                  </th>
                ))}
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtrados.map((row) => (
                <tr key={row["id"] as string} className="border-t border-border">
                  {entity.list.map((c) => (
                    <td key={c} className="px-3 py-3 align-top">
                      {celula(row, c)}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setAnexoDe(row)} aria-label="Arquivos">
                        <Paperclip className="size-4" />
                      </Button>
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => abrirEdicao(row)} aria-label="Editar">
                          <Pencil className="size-4" />
                        </Button>
                      )}
                      {ehGestor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => excluir.mutate(row["id"] as string)}
                          aria-label="Excluir"
                        >
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

      <Dialog open={formAberto} onOpenChange={setFormAberto}>
        <DialogContent className="max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? `Editar ${entity.singular}` : `Novo ${entity.singular.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>{entity.descricao}</DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setErroForm(null);
              const faltando = entity.fields.find(
                (f) => f.required && (valores[f.name] === "" || valores[f.name] === null),
              );
              if (faltando) {
                setErroForm(`Preencha o campo "${faltando.label}".`);
                return;
              }
              salvar.mutate(valores);
            }}
          >
            {entity.fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={f.name}>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </Label>

                {f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    value={String(valores[f.name] ?? "")}
                    onChange={(e) => setValores({ ...valores, [f.name]: e.target.value })}
                  />
                ) : f.type === "select" ? (
                  <select
                    id={f.name}
                    className="h-12 w-full rounded-lg border border-input bg-background px-3"
                    value={String(valores[f.name] ?? "")}
                    onChange={(e) => setValores({ ...valores, [f.name]: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                ) : f.type === "ref" ? (
                  <select
                    id={f.name}
                    className="h-12 w-full rounded-lg border border-input bg-background px-3"
                    value={String(valores[f.name] ?? "")}
                    onChange={(e) => setValores({ ...valores, [f.name]: e.target.value })}
                  >
                    <option value="">Selecione</option>
                    {(refMap[f.ref!.table] ?? []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "boolean" ? (
                  <div className="flex h-12 items-center">
                    <Switch
                      id={f.name}
                      checked={Boolean(valores[f.name])}
                      onCheckedChange={(v) => setValores({ ...valores, [f.name]: v })}
                    />
                  </div>
                ) : (
                  <Input
                    id={f.name}
                    className="h-12"
                    inputMode={f.type === "number" || f.type === "money" ? "decimal" : undefined}
                    type={
                      f.type === "date"
                        ? "date"
                        : f.type === "datetime"
                          ? "datetime-local"
                          : f.type === "number" || f.type === "money"
                            ? "number"
                            : "text"
                    }
                    step={f.type === "number" || f.type === "money" ? "any" : undefined}
                    value={String(valores[f.name] ?? "")}
                    onChange={(e) => setValores({ ...valores, [f.name]: e.target.value })}
                  />
                )}
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
              </div>
            ))}

            {erroForm && <p className="text-sm font-medium text-destructive">{erroForm}</p>}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setFormAberto(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={salvar.isPending}>
                {salvar.isPending && <Loader2 className="size-4 animate-spin" />} Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {anexoDe && (
        <AnexosDialog
          entidade={entity.table}
          registroId={anexoDe["id"] as string}
          titulo={`${entity.singular} — ${String(anexoDe[entity.list[0]!] ?? "")}`}
          aberto
          onFechar={() => setAnexoDe(null)}
        />
      )}
    </div>
  );
}
