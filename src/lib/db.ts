import { supabase } from "@/integrations/supabase/client";

/**
 * Cliente do banco sem tipagem estrita: o esquema do ERP é muito amplo e as
 * telas são geradas a partir do registro de entidades (src/lib/entities.ts).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export { supabase };

export const BUCKET = "documentos";

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
  }
  const str = String(value);
  const isoDate = /^\d{4}-\d{2}-\d{2}$/.exec(str);
  if (isoDate) {
    const [y, m, d] = str.split("-");
    return `${d}/${m}/${y}`;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    return new Date(str).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  }
  return str.replace(/_/g, " ");
}

export function formatMoney(value: number | null | undefined): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value ?? 0);
}
