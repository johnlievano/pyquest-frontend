// Este componente muestra una estadística pequeña como XP o vidas.
interface BadgeStatProps {
  // Nombre corto de la estadística.
  label: string;
  // Valor numérico o texto a mostrar.
  value: number | string;
}

export function BadgeStat({ label, value }: BadgeStatProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-center">
      {/* Etiqueta pequeña para identificar el dato */}
      <p className="text-[11px] uppercase tracking-wide text-slate-300">{label}</p>
      {/* Valor principal */}
      <p className="text-base font-semibold text-yellow-300">{value}</p>
    </div>
  );
}
