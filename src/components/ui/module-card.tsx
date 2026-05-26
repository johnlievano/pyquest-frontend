import { PyquestLevel } from "@/types/pyquest";

// Props para la tarjeta de módulo.
interface ModuleCardProps {
  // Datos visuales del nivel.
  level: PyquestLevel;
  // Indica si el módulo está desbloqueado.
  unlocked: boolean;
  // Acción cuando se selecciona el módulo.
  onSelect: (levelId: number) => void;
}

export function ModuleCard({ level, unlocked, onSelect }: ModuleCardProps) {
  return (
    <button
      // Si el módulo no está desbloqueado, no se puede usar.
      disabled={!unlocked}
      // Al hacer clic, enviamos el id del módulo al componente padre.
      onClick={() => onSelect(level.id)}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        unlocked
          ? "border-slate-600 bg-slate-800 hover:border-blue-400"
          : "cursor-not-allowed border-slate-800 bg-slate-900/70 opacity-60"
      }`}
    >
      {/* Título y estado del módulo */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">{level.title}</h3>
        <span className="text-xs text-slate-300">
          {unlocked ? "Disponible" : "Bloqueado"}
        </span>
      </div>

      {/* Información corta del reto */}
      <p className="text-xs text-slate-400">Tema: {level.topic}</p>
    </button>
  );
}
