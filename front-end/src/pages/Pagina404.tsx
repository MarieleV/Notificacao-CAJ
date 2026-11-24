import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button, buttonClass } from "../components/shared/ui";

export function Pagina404() {
  const navigate = useNavigate();

  return (
    // Renderizada dentro do <main> do Layout: ocupa só a área de conteúdo, sem rolagem extra (PA-19).
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      <span className="w-16 h-16 bg-brand-soft text-brand rounded-full flex items-center justify-center mb-6">
        <FileQuestion size={30} />
      </span>

      <p className="text-sm font-semibold text-brand mb-1">Erro 404</p>
      <h1 className="text-2xl font-semibold text-ink mb-3">Página não encontrada</h1>

      <p className="text-sm text-ink-muted max-w-md mb-8 leading-relaxed">
        O endereço acessado não existe ou foi removido. Confira o link ou volte para um dos módulos do sistema.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Voltar
        </Button>

        <Link to="/" className={buttonClass("primary")}>
          <Home size={16} />
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
