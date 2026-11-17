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
    <div className="p-3 bg-gray-50 rounded-md text-xs font-mono border border-gray-200 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15 focus-within:bg-white transition-colors">
      <div className="flex justify-end mb-1.5 gap-4">
        {isDirty && (
          <button 
            onClick={handleReset} 
            className="text-xs text-warning hover:underline flex items-center font-semibold"
          >
            Desfazer Edição
          </button>
        )}
        <button 
          onClick={handleCopy} 
          className="text-xs text-brand hover:underline flex items-center gap-1 font-semibold"
        >
          {copied ? <CheckCircle2 size={12} className="text-success" /> : <Copy size={12}/>}
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
        className="w-full bg-transparent border-none resize-none focus:outline-none text-ink-body leading-relaxed overflow-hidden"
      />
    </div>
  );
}