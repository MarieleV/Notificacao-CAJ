import { FileQuestion, ArrowLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router"; 

export function Pagina404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafe] p-6 text-center">
      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-blue-100">
        <FileQuestion size={48} className="text-[#1a5fa8]" />
      </div>
      
      <h1 className="text-4xl font-bold text-[#0b1e35] mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
      
      <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
        Desculpe, a página que você está procurando não existe, foi removida ou você digitou o endereço incorretamente.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
        
        <Link 
          to="/"
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1a5fa8] hover:bg-[#154d8a] text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg"
        >
          <Home size={16} />
          Ir para o Início
        </Link>
      </div>
    </div>
  );
}