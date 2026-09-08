import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, LayoutDashboard, LogOut, Menu, Package, Sprout, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ENTITIES, MODULOS } from "@/lib/entities";
import { usePerfil } from "@/hooks/use-perfil";
import { supabase } from "@/integrations/supabase/client";

export function AppShell({ children }: { children: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const { nome, papeis, podeVerFinanceiro } = usePerfil();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const entidadesVisiveis = ENTITIES.filter((e) => !e.financeiro || podeVerFinanceiro);

  async function sair() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  const nav = (
    <nav className="space-y-5 pb-10">
      <div className="space-y-1">
        <Link
          to="/painel"
          onClick={() => setMenuAberto(false)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/painel" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
          }`}
        >
          <LayoutDashboard className="size-4" /> Painel geral
        </Link>
        <Link
          to="/estoque"
          onClick={() => setMenuAberto(false)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/estoque" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
          }`}
        >
          <Package className="size-4" /> Saldo de estoque
        </Link>
        <Link
          to="/relatorios"
          onClick={() => setMenuAberto(false)}
          className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
            pathname === "/relatorios"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/60"
          }`}
        >
          <BarChart3 className="size-4" /> Relatórios
        </Link>
      </div>

      {MODULOS.map((m) => {
        const itens = entidadesVisiveis.filter((e) => e.modulo === m.key);
        if (itens.length === 0) return null;
        return (
          <div key={m.key}>
            <p className="px-3 pb-1 text-xs font-semibold tracking-wide uppercase opacity-60">{m.label}</p>
            <div className="space-y-0.5">
              {itens.map((e) => {
                const ativo = pathname === `/registros/${e.key}`;
                return (
                  <Link
                    key={e.key}
                    to="/registros/$entidade"
                    params={{ entidade: e.key }}
                    onClick={() => setMenuAberto(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm ${
                      ativo ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/60"
                    }`}
                  >
                    {e.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Menu lateral no computador */}
      <aside className="bg-sidebar text-sidebar-foreground hidden w-72 shrink-0 overflow-y-auto p-4 md:block md:h-screen md:sticky md:top-0">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg">
            <Sprout className="size-5" />
          </span>
          <span className="font-display text-lg font-bold">Fazenda</span>
        </div>
        {nav}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-sidebar text-sidebar-foreground sticky top-0 z-30 flex items-center gap-3 px-4 py-3 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground md:hidden"
            onClick={() => setMenuAberto(true)}
            aria-label="Abrir menu"
          >
            <Menu className="size-6" />
          </Button>
          <span className="flex-1 truncate font-display text-lg font-bold md:hidden">Fazenda</span>
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm">{nome}</span>
            {papeis.map((p) => (
              <Badge key={p} variant="secondary">
                {p}
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground" onClick={() => void sair()} aria-label="Sair">
            <LogOut className="size-5" />
          </Button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">{children}</main>
      </div>

      {/* Menu no celular */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setMenuAberto(false)}
          />
          <div className="bg-sidebar text-sidebar-foreground absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Fazenda</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground"
                onClick={() => setMenuAberto(false)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </Button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
