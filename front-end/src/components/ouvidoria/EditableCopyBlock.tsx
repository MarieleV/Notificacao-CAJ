import { useState, useEffect } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

interface EditableCopyBlockProps {
  defaultText: string;
}

export function EditableCopyBlock({ defaultText }: EditableCopyBlockProps) {
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState(defaultText);
  const [isDirty, setIsDirty] = useState(false);
  
  useEffect(() => {
    if (!isDirty) {
      setText(defaultText);
    }
  }, [defaultText, isDirty]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setIsDirty(false);
    setText(defaultText);
  };

  const lineCount = text.split('\n').length;
  const dynamicRows = Math.max(lineCount, 2);

  return (
    <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono border border-gray-200 focus-within:border-[#1a5fa8] focus-within:ring-1 focus-within:ring-[#1a5fa8]/20 focus-within:bg-white transition-all shadow-sm">
      <div className="flex justify-end mb-1.5 gap-4">
        {isDirty && (
          <button 
            onClick={handleReset} 
            className="text-[10px] text-amber-600 hover:underline flex items-center font-bold"
          >
            Desfazer Edição
          </button>
        )}
        <button 
          onClick={handleCopy} 
          className="text-[10px] text-[#1a5fa8] hover:underline flex items-center gap-1 font-bold"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12}/>}
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsDirty(true);
        }}
        rows={dynamicRows}
        className="w-full bg-transparent border-none resize-none focus:outline-none text-gray-700 leading-relaxed overflow-hidden"
      />
    </div>
  );
}