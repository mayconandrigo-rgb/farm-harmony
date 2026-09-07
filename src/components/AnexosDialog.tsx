import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Paperclip, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BUCKET, db, supabase } from "@/lib/db";
import { usePerfil } from "@/hooks/use-perfil";

interface Anexo {
  id: string;
  nome: string;
  path: string;
  mime_type: string | null;
}

export function AnexosDialog({
  entidade,
  registroId,
  titulo,
  aberto,
  onFechar,
}: {
  entidade: string;
  registroId: string;
  titulo: string;
  aberto: boolean;
  onFechar: () => void;
}) {
  const { podeEditar, ehGestor } = usePerfil();
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    const { data, error } = await db
      .from("anexos")
      .select("id, nome, path, mime_type")
      .eq("entidade", entidade)
      .eq("registro_id", registroId)
      .order("created_at", { ascending: false });
    if (error) setErro("Não foi possível carregar os arquivos.");
    setAnexos((data ?? []) as Anexo[]);
    setCarregando(false);
  }, [entidade, registroId]);

  useEffect(() => {
    if (aberto) void carregar();
  }, [aberto, carregar]);

  async function enviar(file: File) {
    setEnviando(true);
    try {
      const path = `${entidade}/${registroId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
      if (upErr) throw upErr;
      const { error } = await db.from("anexos").insert({
        entidade,
        registro_id: registroId,
        nome: file.name,
        path,
        mime_type: file.type,
        tamanho: file.size,
      });
      if (error) throw error;
      toast.success("Arquivo anexado.");
      await carregar();
    } catch (e) {
      toast.error("Não foi possível anexar o arquivo.");
      console.error(e);
    } finally {
      setEnviando(false);
    }
  }

  async function abrir(anexo: Anexo) {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(anexo.path, 300);
    if (error || !data) {
      toast.error("Não foi possível abrir o arquivo.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener");
  }

  async function excluir(anexo: Anexo) {
    await supabase.storage.from(BUCKET).remove([anexo.path]);
    const { error } = await db.from("anexos").delete().eq("id", anexo.id);
    if (error) {
      toast.error("Não foi possível excluir o arquivo.");
      return;
    }
    toast.success("Arquivo excluído.");
    await carregar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Arquivos anexados</DialogTitle>
          <DialogDescription>{titulo}</DialogDescription>
        </DialogHeader>

        {podeEditar && (
          <label className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-sm font-medium">
            {enviando ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {enviando ? "Enviando..." : "Enviar foto ou PDF"}
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              disabled={enviando}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void enviar(file);
                e.target.value = "";
              }}
            />
          </label>
        )}

        {carregando && (
          <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Carregando...
          </p>
        )}
        {erro && <p className="py-2 text-sm text-destructive">{erro}</p>}
        {!carregando && anexos.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground">Nenhum arquivo anexado ainda.</p>
        )}

        <ul className="space-y-2">
          {anexos.map((a) => (
            <li key={a.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
              <Paperclip className="size-4 shrink-0 text-muted-foreground" />
              <button
                type="button"
                onClick={() => void abrir(a)}
                className="flex-1 truncate text-left text-sm underline-offset-2 hover:underline"
              >
                {a.nome}
              </button>
              {ehGestor && (
                <Button variant="ghost" size="icon" onClick={() => void excluir(a)} aria-label="Excluir">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
