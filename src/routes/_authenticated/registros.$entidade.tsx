import { createFileRoute, Link } from "@tanstack/react-router";

import { CrudPage } from "@/components/CrudPage";
import { getEntity } from "@/lib/entities";

export const Route = createFileRoute("/_authenticated/registros/$entidade")({
  component: RegistrosPage,
});

function RegistrosPage() {
  const { entidade } = Route.useParams();
  const entity = getEntity(entidade);

  if (!entity) {
    return (
      <div className="card-surface p-8 text-center">
        <h1 className="text-xl font-bold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">Esse cadastro não existe no sistema.</p>
        <Link to="/painel" className="mt-4 inline-block text-primary underline">
          Voltar ao painel
        </Link>
      </div>
    );
  }

  return <CrudPage key={entity.key} entity={entity} />;
}
