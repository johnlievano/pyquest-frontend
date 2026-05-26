import { PyquestLevel } from "@/types/pyquest";
import { ModuleCard } from "@/components/ui/module-card";

// Props del panel lateral con módulos.
interface ModuleSidebarProps {
  // Lista de niveles del curso.
  levels: PyquestLevel[];
  // Último nivel desbloqueado.
  unlockedLevelId: number;
  // Nivel seleccionado actualmente.
  selectedLevelId: number;
  // Acción para cambiar de nivel.
  onSelectLevel: (levelId: number) => void;
}

export function ModuleSidebar({
  levels,
  unlockedLevelId,
  selectedLevelId,
  onSelectLevel,
}: ModuleSidebarProps) {
  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      {/* Título del panel */}
      <h2 className="mb-3 text-sm font-semibold text-white">Módulos</h2>

      {/* Lista vertical de módulos */}
      <div className="space-y-2">
        {levels.map((level) => {
          const isUnlocked = level.id <= unlockedLevelId;
          const isSelected = level.id === selectedLevelId;

          return (
            <div
              key={level.id}
              className={isSelected ? "rounded-2xl ring-2 ring-blue-400" : ""}
            >
              <ModuleCard
                level={level}
                unlocked={isUnlocked}
                onSelect={onSelectLevel}
              />
            </div>
          );
        })}
      </div>
    </aside>
  );
}
