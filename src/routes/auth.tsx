import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | Gestão da Fazenda" },
      {
        name: "description",
        content:
          "Acesse o sistema de gestão da fazenda: lavoura, contratos, romaneios, rebanho, estoque e financeiro em um só lugar.",
      },
      { property: "og:title", content: "Entrar | Gestão da Fazenda" },
      {
        property: "og:description",
        content: "Acesso ao sistema integrado de gestão da fazenda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      if (modo === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        void navigate({ to: "/painel" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (data.session) {
          void navigate({ to: "/painel" });
          return;
        }
        toast.success("Conta criada. Confirme o e-mail que enviamos e depois entre.");
        setModo("entrar");
      }
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "";
      setErro(
        /invalid login/i.test(msg)
          ? "E-mail ou senha incorretos."
          : /already registered/i.test(msg)
            ? "Esse e-mail já tem conta. Faça login."
            : /6 characters/i.test(msg)
              ? "A senha precisa ter pelo menos 6 caracteres."
              : "Não foi possível continuar. Tente de novo.",
      );
    } finally {
      setCarregando(false);
    }
  }

  async function entrarComGoogle() {
    setErro(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErro("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/painel" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="card-surface w-full max-w-md p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Gestão da Fazenda</h1>
            <p className="text-sm text-muted-foreground">Lavoura, rebanho, estoque e financeiro</p>
          </div>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          {modo === "criar" && (
            <div className="space-y-1.5">
              <Label htmlFor="nome">Seu nome</Label>
              <Input id="nome" className="h-12" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              required
              minLength={6}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              className="h-12"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}

          <Button type="submit" size="lg" className="h-12 w-full" disabled={carregando}>
            {carregando && <Loader2 className="size-4 animate-spin" />}
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </Button>
        </form>

        <Button variant="outline" size="lg" className="mt-3 h-12 w-full" onClick={() => void entrarComGoogle()}>
          Entrar com Google
        </Button>

        <button
          type="button"
          className="mt-4 w-full text-sm text-muted-foreground underline-offset-2 hover:underline"
          onClick={() => {
            setModo(modo === "entrar" ? "criar" : "entrar");
            setErro(null);
          }}
        >
          {modo === "entrar" ? "Não tenho conta ainda" : "Já tenho conta"}
        </button>
      </div>
    </main>
  );
}
