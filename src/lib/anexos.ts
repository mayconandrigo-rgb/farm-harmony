import { BUCKET, db, supabase } from "@/lib/db";

/**
 * Remove os anexos de um registro: apaga os arquivos do Storage e as linhas da
 * tabela de anexos. Usado ao excluir qualquer registro do sistema.
 */
export async function removerAnexosDoRegistro(entidade: string, registroId: string): Promise<void> {
  const { data } = await db
    .from("anexos")
    .select("id, path")
    .eq("entidade", entidade)
    .eq("registro_id", registroId);

  const anexos = (data ?? []) as { id: string; path: string }[];
  if (anexos.length === 0) return;

  await supabase.storage.from(BUCKET).remove(anexos.map((a) => a.path));
  await db.from("anexos").delete().eq("entidade", entidade).eq("registro_id", registroId);
}
