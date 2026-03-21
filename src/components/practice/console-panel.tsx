// Props del panel inferior con consola y acciones.
interface ConsolePanelProps {
  // Mensaje que simula la salida de consola.
  output: string;
  // Acción para validar respuesta.
  onEvaluate: () => void;
  // Acción para limpiar editor.
  onClear: () => void;
  // Acción para reiniciar progreso.
  onResetProgress: () => void;
}

export function ConsolePanel({
  output,
  onEvaluate,
  onClear,
  onResetProgress,
}: ConsolePanelProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      {/* Botones de acción principales */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={onEvaluate}
          className="rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-yellow-300"
        >
          Evaluar
        </button>

        <button
          onClick={onClear}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-400"
        >
          Limpiar
        </button>

        <button
          onClick={onResetProgress}
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-rose-400"
        >
          Reiniciar progreso
        </button>
      </div>

      {/* Consola visual para feedback */}
      <div className="rounded-xl border border-slate-700 bg-black p-3 font-mono text-sm text-green-300">
        <p className="mb-1 text-xs text-slate-500">Consola</p>
        <p>{output}</p>
      </div>
    </section>
  );
}
