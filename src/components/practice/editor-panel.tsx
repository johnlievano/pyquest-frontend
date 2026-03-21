import { PyquestLevel } from "@/types/pyquest";

// Props del panel del editor.
interface EditorPanelProps {
  // Nivel actual cargado.
  level: PyquestLevel;
  // Código escrito por el usuario.
  code: string;
  // Acción para actualizar el texto del editor.
  onCodeChange: (value: string) => void;
}

export function EditorPanel({ level, code, onCodeChange }: EditorPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      {/* Bloque de instrucciones */}
      <div className="mb-4 rounded-xl border border-slate-700 bg-slate-800 p-3">
        <p className="text-xs uppercase tracking-wide text-blue-300">Instrucción</p>
        <p className="mt-1 text-sm text-slate-200">{level.instruction}</p>
        <p className="mt-2 text-xs text-slate-400">Ejemplo: {level.example}</p>
      </div>

      {/* Editor de texto simple */}
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-300">
        Editor de código
      </label>
      <textarea
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
        className="min-h-[220px] w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-blue-400"
        placeholder={level.placeholder}
      />
    </section>
  );
}
