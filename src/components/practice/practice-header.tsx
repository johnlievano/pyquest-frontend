import { Link } from 'react-router-dom';
import { BadgeStat } from "../ui/badge-stat";

// Props para el encabezado principal de la práctica.
interface PracticeHeaderProps {
  // Experiencia acumulada.
  xp: number;
  // Vidas disponibles.
  lives: number;
  // Nivel actual.
  currentLevel: number;
  // Cantidad total de niveles.
  totalLevels: number;
}

export function PracticeHeader({
  xp,
  lives,
  currentLevel,
  totalLevels,
}: PracticeHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Marca básica del proyecto */}
        <div>
          <p className="text-xs uppercase tracking-wide text-blue-300">PyQuest</p>
          <h1 className="text-sm font-bold text-white sm:text-base">Práctica de Python</h1>
        </div>

        {/* Indicadores del progreso */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <BadgeStat label="XP" value={xp} />
          <BadgeStat label="Vidas" value={lives} />
          <BadgeStat label="Nivel" value={`${currentLevel}/${totalLevels}`} />
        </div>

        {/* Botón para regresar al inicio */}
        <Link
          to="/"
          className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:text-white"
        >
          Inicio
        </Link>
      </div>
    </header>
  );
}
