import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Papel = "gestor" | "financeiro" | "operador" | "consulta";

export interface Perfil {
  userId: string | null;
  email: string | null;
  nome: string | null;
  papeis: Papel[];
  carregando: boolean;
}

export function usePerfil(): Perfil & {
  podeEditar: boolean;
  podeVerFinanceiro: boolean;
  ehGestor: boolean;
} {
  const [perfil, setPerfil] = useState<Perfil>({
    userId: null,
    email: null,
    nome: null,
    papeis: [],
    carregando: true,
  });

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!ativo) return;
      if (!user) {
        setPerfil({ userId: null, email: null, nome: null, papeis: [], carregando: false });
        return;
      }
      const [{ data: roles }, { data: prof }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("nome").eq("id", user.id).maybeSingle(),
      ]);
      if (!ativo) return;
      setPerfil({
        userId: user.id,
        email: user.email ?? null,
        nome: (prof as { nome?: string } | null)?.nome ?? user.email ?? null,
        papeis: ((roles ?? []) as { role: Papel }[]).map((r) => r.role),
        carregando: false,
      });
    }

    void carregar();
    return () => {
      ativo = false;
    };
  }, []);

  const ehGestor = perfil.papeis.includes("gestor");
  return {
    ...perfil,
    ehGestor,
    podeEditar: ehGestor || perfil.papeis.includes("operador") || perfil.papeis.includes("financeiro"),
    podeVerFinanceiro: ehGestor || perfil.papeis.includes("financeiro"),
  };
}
