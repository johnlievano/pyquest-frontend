import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ejerciciosService,
  type EjercicioBackend,
  colorCategoria,
  colorDificultad,
  mapDificultad,
} from '../services/ejercicios.service';
import { progresoService } from '../services/progreso.service';
import { usersService, type Usuario } from '../services/users.service';

function getIdFromToken(): number | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? payload.idUsuario ?? null;
  } catch { return null; }
}

// ── Definición de módulos ─────────────────────────────────────
const MODULOS = [
  {
    id: 'principiante',
    label: 'Principiante',
    dificultad: 'BAJO' as const,
    icono: '🐣',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    descripcion: 'Conceptos básicos de Python: print, variables y listas.',
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    dificultad: 'MEDIO' as const,
    icono: '⚡',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    descripcion: 'Condicionales, bucles, funciones y diccionarios.',
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    dificultad: 'ALTO' as const,
    icono: '🔥',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    descripcion: 'Excepciones, list comprehension y clases.',
  },
];

// ── Iconos ────────────────────────────────────────────────────
const Icon = {
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Fire: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Map: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  ),
  Trophy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
  ),
};

const getNombreNivel = (nivel: number) => {
  const nombres = ['', 'Cadete', 'Piloto', 'Explorador', 'Navegante', 'Comandante', 'Almirante', 'Leyenda'];
  return nombres[Math.min(nivel, nombres.length - 1)] ?? 'Maestro';
};

// ── Tarjeta ejercicio ─────────────────────────────────────────
function TarjetaEjercicio({
  ejercicio, completado, bloqueado, onClick,
}: {
  ejercicio: EjercicioBackend;
  completado: boolean;
  bloqueado: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const cat = colorCategoria(ejercicio.categoria);
  const dif = colorDificultad(ejercicio.dificultad);

  return (
    <div
      onClick={bloqueado ? undefined : onClick}
      onMouseEnter={() => !bloqueado && setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        cursor: bloqueado ? 'not-allowed' : 'pointer',
        background: bloqueado
          ? 'rgba(10,14,30,0.4)'
          : hover
            ? 'linear-gradient(135deg,rgba(15,20,40,0.95),rgba(20,28,55,0.95))'
            : 'rgba(10,14,30,0.8)',
        border: `1px solid ${bloqueado ? 'rgba(255,255,255,0.04)' : hover ? cat.accent + '55' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hover && !bloqueado ? `0 8px 40px ${cat.glow}` : '0 2px 12px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        transition: 'all 0.3s ease',
        transform: hover && !bloqueado ? 'translateY(-4px)' : 'none',
        opacity: bloqueado ? 0.45 : 1,
      }}>

      {/* Glow de fondo */}
      {!bloqueado && (
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: cat.glow, filter: 'blur(30px)', opacity: hover ? 0.5 : 0.2, transition: 'opacity 0.3s' }} />
      )}

      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: bloqueado ? 'rgba(255,255,255,0.05)' : `${cat.accent}22`,
              border: `1px solid ${bloqueado ? 'rgba(255,255,255,0.08)' : cat.accent + '33'}`,
            }}>
            {bloqueado ? '🔒' : cat.icono}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: bloqueado ? 'rgba(160,185,255,0.25)' : cat.accent }}>
              {ejercicio.categoria}
            </p>
            <h3 className="text-sm font-bold leading-tight mt-0.5"
              style={{ color: bloqueado ? 'rgba(255,255,255,0.3)' : '#fff' }}>
              {ejercicio.titulo}
            </h3>
          </div>
        </div>

        {completado ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
            <div className="w-3 h-3"><Icon.Check /></div> Listo
          </div>
        ) : (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: bloqueado ? 'rgba(255,255,255,0.05)' : dif.bg, color: bloqueado ? 'rgba(160,185,255,0.3)' : dif.text }}>
            {mapDificultad(ejercicio.dificultad)}
          </span>
        )}
      </div>

      <p className="text-xs leading-relaxed mb-4"
        style={{
          color: bloqueado ? 'rgba(160,180,220,0.25)' : 'rgba(160,180,220,0.6)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
        {bloqueado ? 'Completá el módulo anterior para desbloquear este ejercicio.' : ejercicio.descripcion}
      </p>

      <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${bloqueado ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)'}` }}>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: bloqueado ? 'rgba(255,255,255,0.04)' : dif.bg, color: bloqueado ? 'rgba(160,185,255,0.2)' : dif.text }}>
          {mapDificultad(ejercicio.dificultad)}
        </span>
        <div className="text-xs font-semibold" style={{ color: bloqueado ? 'rgba(160,185,255,0.2)' : cat.accent }}>
          {bloqueado ? 'Bloqueado 🔒' : completado ? 'Revisar →' : 'Comenzar →'}
        </div>
      </div>
    </div>
  );
}

// ── Sección de módulo ─────────────────────────────────────────
function SeccionModulo({
  modulo, ejercicios, completados, desbloqueado, onClick,
}: {
  modulo: typeof MODULOS[0];
  ejercicios: EjercicioBackend[];
  completados: Set<number>;
  desbloqueado: boolean;
  onClick: (id: number) => void;
}) {
  const [expandido, setExpandido] = useState(desbloqueado);
  const completadosModulo = ejercicios.filter(e => completados.has(e.idEjercicio)).length;
  const porcentaje = ejercicios.length > 0 ? Math.round((completadosModulo / ejercicios.length) * 100) : 0;
  const moduloCompleto = completadosModulo === ejercicios.length && ejercicios.length > 0;

  return (
    <div className="mb-6">
      {/* Header del módulo */}
      <div
        onClick={() => desbloqueado && setExpandido(e => !e)}
        className="flex items-center gap-4 p-5 rounded-2xl mb-3 transition-all"
        style={{
          background: desbloqueado
            ? moduloCompleto
              ? `linear-gradient(135deg,${modulo.color}22,${modulo.color}11)`
              : 'rgba(10,14,30,0.8)'
            : 'rgba(10,14,30,0.4)',
          border: `1px solid ${desbloqueado ? (moduloCompleto ? modulo.color + '44' : 'rgba(255,255,255,0.08)') : 'rgba(255,255,255,0.04)'}`,
          cursor: desbloqueado ? 'pointer' : 'not-allowed',
          opacity: desbloqueado ? 1 : 0.5,
          boxShadow: moduloCompleto ? `0 0 24px ${modulo.glow}` : 'none',
        }}>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: desbloqueado ? `${modulo.color}22` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${desbloqueado ? modulo.color + '44' : 'rgba(255,255,255,0.08)'}`,
          }}>
          {!desbloqueado ? '🔒' : moduloCompleto ? '✅' : modulo.icono}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-base" style={{ color: desbloqueado ? '#fff' : 'rgba(255,255,255,0.3)' }}>
              {modulo.label}
            </h3>
            {!desbloqueado && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(160,185,255,0.4)' }}>
                Bloqueado
              </span>
            )}
            {moduloCompleto && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: `${modulo.color}22`, color: modulo.color }}>
                ¡Completado!
              </span>
            )}
          </div>
          <p className="text-xs mb-2" style={{ color: 'rgba(160,185,255,0.5)' }}>{modulo.descripcion}</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${porcentaje}%`, background: modulo.color, boxShadow: `0 0 8px ${modulo.glow}` }} />
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ color: desbloqueado ? modulo.color : 'rgba(160,185,255,0.3)' }}>
              {completadosModulo}/{ejercicios.length}
            </span>
          </div>
        </div>

        {desbloqueado && (
          <div className="text-xs flex-shrink-0" style={{ color: 'rgba(160,185,255,0.4)' }}>
            {expandido ? '▲' : '▼'}
          </div>
        )}
      </div>

      {/* Ejercicios del módulo */}
      {desbloqueado && expandido && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-2">
          {ejercicios.map(ejercicio => (
            <TarjetaEjercicio
              key={ejercicio.idEjercicio}
              ejercicio={ejercicio}
              completado={completados.has(ejercicio.idEjercicio)}
              bloqueado={false}
              onClick={() => onClick(ejercicio.idEjercicio)}
            />
          ))}
        </div>
      )}

      {/* Módulo bloqueado expandido vacío */}
      {!desbloqueado && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-2">
          {ejercicios.map(ejercicio => (
            <TarjetaEjercicio
              key={ejercicio.idEjercicio}
              ejercicio={ejercicio}
              completado={false}
              bloqueado={true}
              onClick={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const idUsuario = getIdFromToken();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioBackend[]>([]);
  const [completados, setCompletados] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'modulos' | 'perfil'>('modulos');
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2 + 0.5, opacity: Math.random() * 0.6 + 0.1,
    }))
  );

  useEffect(() => {
    if (!idUsuario) { navigate('/login'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    if (!idUsuario) return;
    try {
      setLoading(true);
      setError(null);
      const [resUser, resEj, resProg] = await Promise.all([
        usersService.getById(idUsuario),
        ejerciciosService.getAll(),
        progresoService.getByUsuario(idUsuario),
      ]);
      setUsuario(resUser.data);
      setEjercicios(resEj.data ?? []);
      const ids = new Set<number>(
        (resProg.data ?? []).filter((p: any) => p.completado).map((p: any) => Number(p.idEjercicio))
      );
      setCompletados(ids);
    } catch {
      setError('No se pudieron cargar los datos. Verificá tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  // ── Lógica de módulos y desbloqueo ───────────────────────────
  const ejerciciosPorModulo = MODULOS.map(modulo => ({
    modulo,
    ejercicios: ejercicios.filter(e => e.dificultad === modulo.dificultad),
  }));

  const moduloDesbloqueado = (idx: number): boolean => {
    if (idx === 0) return true; // Principiante siempre desbloqueado
    // El módulo N se desbloquea cuando todos los ejercicios del módulo N-1 están completados
    const moduloAnterior = ejerciciosPorModulo[idx - 1];
    return moduloAnterior.ejercicios.every(e => completados.has(e.idEjercicio));
  };

  const totalEjercicios = ejercicios.length;
  const totalCompletados = completados.size;
  const porcentajeGlobal = totalEjercicios > 0 ? Math.round((totalCompletados / totalEjercicios) * 100) : 0;
  const nivel = usuario?.perfil?.nivel ?? 1;
  const experiencia = usuario?.perfil?.experiencia ?? 0;
  const racha = usuario?.perfil?.racha ?? 0;
  const xpParaSiguiente = nivel * 500;
  const xpPorcentaje = Math.min((experiencia / xpParaSiguiente) * 100, 100);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Exo 2','Segoe UI',sans-serif", background: '#050812' }}>
      {/* Fondo */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        {particles.map(p => (
          <div key={p.id} className="absolute rounded-full bg-white"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }} />
        ))}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%,rgba(30,60,180,0.08) 0%,transparent 60%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 20%,rgba(100,30,180,0.07) 0%,transparent 55%)' }} />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20"
        style={{ background: 'rgba(5,8,18,0.9)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 p-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-xl blur-md" style={{ background: 'rgba(59,130,246,0.4)' }} />
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
          </div>
          <div>
            <span className="text-white font-black text-lg tracking-widest">PyQuest</span>
            <p className="text-xs" style={{ color: 'rgba(160,185,255,0.45)' }}>Aprendé Python</p>
          </div>
        </div>

        {/* Card usuario */}
        <div className="mx-4 mt-5 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(99,102,241,0.12))', border: '1px solid rgba(99,102,241,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
              🚀
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(160,185,255,0.5)' }}>
                Nivel {nivel} · {getNombreNivel(nivel)}
              </p>
              <p className="text-sm font-bold text-white truncate">{usuario?.nombre ?? '...'}</p>
            </div>
          </div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(160,185,255,0.5)' }}>
            <span>{experiencia} XP</span><span>{xpParaSiguiente} XP</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpPorcentaje}%`, background: 'linear-gradient(90deg,#f59e0b,#f97316)', boxShadow: '0 0 8px rgba(245,158,11,0.6)' }} />
          </div>
          <p className="text-xs mt-2" style={{ color: 'rgba(245,158,11,0.7)' }}>
            ⚡ {xpParaSiguiente - experiencia} XP para nivel {nivel + 1}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4 mt-2 flex-1">
          {[
            { id: 'modulos', label: 'Módulos', icon: Icon.Map },
            { id: 'perfil',  label: 'Mi Perfil', icon: Icon.User },
          ].map(item => (
            <button key={item.id}
              onClick={() => setTabActiva(item.id as typeof tabActiva)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
              style={{
                background: tabActiva === item.id ? 'rgba(59,130,246,0.12)' : 'transparent',
                color: tabActiva === item.id ? '#60a5fa' : 'rgba(160,185,255,0.55)',
                border: tabActiva === item.id ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              }}>
              <div className="w-4 h-4 shrink-0"><item.icon /></div>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Racha + Logout */}
        <div className="p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: racha > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${racha > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}` }}>
            <div className="w-4 h-4" style={{ color: racha > 0 ? '#f97316' : 'rgba(160,185,255,0.3)' }}><Icon.Fire /></div>
            <span className="text-sm font-bold" style={{ color: racha > 0 ? '#fb923c' : 'rgba(160,185,255,0.4)' }}>
              {racha > 0 ? `${racha} días seguidos` : 'Sin racha aún'}
            </span>
          </div>
          <button
            onClick={() => { localStorage.removeItem('accessToken'); navigate('/login'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full transition-colors"
            style={{ color: 'rgba(160,185,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(160,185,255,0.4)')}>
            <div className="w-4 h-4 shrink-0"><Icon.Logout /></div>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4"
          style={{ background: 'rgba(5,8,18,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-xl font-black text-white">
              {tabActiva === 'modulos' ? 'Módulos de Python' : 'Mi Perfil'}
            </h1>
            <p className="text-xs" style={{ color: 'rgba(160,185,255,0.45)' }}>
              {totalCompletados} de {totalEjercicios} ejercicios completados · {porcentajeGlobal}% total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-3.5 h-3.5" style={{ color: '#f59e0b' }}><Icon.Star /></div>
              <span className="text-xs font-bold text-white">{experiencia} XP</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-3.5 h-3.5" style={{ color: '#10b981' }}><Icon.Check /></div>
              <span className="text-xs font-bold text-white">{totalCompletados}/{totalEjercicios}</span>
            </div>
          </div>
        </div>

        {/* Tab: Módulos */}
        {tabActiva === 'modulos' && (
          <div className="p-8">
            {/* Progreso global */}
            <div className="mb-8 p-5 rounded-2xl" style={{ background: 'rgba(10,14,30,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Progreso Global</h2>
                  <p className="text-sm" style={{ color: 'rgba(160,185,255,0.5)' }}>
                    {totalEjercicios} ejercicios · Nivel {nivel} — {getNombreNivel(nivel)}
                  </p>
                </div>
                <p className="text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {porcentajeGlobal}%
                </p>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${porcentajeGlobal}%`, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }} />
              </div>

              {/* Resumen módulos */}
              <div className="flex gap-4 mt-4">
                {ejerciciosPorModulo.map(({ modulo, ejercicios: ejs }, idx) => {
                  const comp = ejs.filter(e => completados.has(e.idEjercicio)).length;
                  const desbloq = moduloDesbloqueado(idx);
                  return (
                    <div key={modulo.id} className="flex items-center gap-2 text-xs">
                      <span>{desbloq ? (comp === ejs.length && ejs.length > 0 ? '✅' : modulo.icono) : '🔒'}</span>
                      <span style={{ color: desbloq ? modulo.color : 'rgba(160,185,255,0.3)' }}>
                        {modulo.label}: {desbloq ? `${comp}/${ejs.length}` : 'Bloqueado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <div style={{ color: '#60a5fa' }}><Icon.Spinner /></div>
                <span className="ml-3 text-sm" style={{ color: 'rgba(160,185,255,0.5)' }}>Cargando módulos...</span>
              </div>
            )}

            {error && !loading && (
              <div className="p-4 rounded-xl text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                {error} <button onClick={cargarDatos} className="ml-3 underline">Reintentar</button>
              </div>
            )}

            {!loading && !error && ejerciciosPorModulo.map(({ modulo, ejercicios: ejs }, idx) => (
              <SeccionModulo
                key={modulo.id}
                modulo={modulo}
                ejercicios={ejs}
                completados={completados}
                desbloqueado={moduloDesbloqueado(idx)}
                onClick={(id) => navigate(`/ejercicios/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Tab: Perfil */}
        {tabActiva === 'perfil' && (
          <div className="p-8 max-w-2xl">
            <div className="p-6 rounded-2xl mb-4" style={{ background: 'rgba(10,14,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>🚀</div>
                <div>
                  <h2 className="text-xl font-black text-white">{usuario?.nombre ?? '...'}</h2>
                  <p className="text-sm" style={{ color: '#f59e0b' }}>{getNombreNivel(nivel)} · Nivel {nivel}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(160,185,255,0.4)' }}>{usuario?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'XP Total',               val: `${experiencia.toLocaleString()} XP`, color: '#f59e0b' },
                  { label: 'Ejercicios completados',  val: `${totalCompletados}/${totalEjercicios}`, color: '#10b981' },
                  { label: 'Racha actual',            val: racha > 0 ? `${racha} días 🔥` : 'Sin racha', color: racha > 0 ? '#ef4444' : 'rgba(160,185,255,0.4)' },
                  { label: 'Progreso global',         val: `${porcentajeGlobal}%`, color: '#3b82f6' },
                ].map((stat, i) => (
                  <div key={i} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs" style={{ color: 'rgba(160,185,255,0.5)' }}>{stat.label}</p>
                    <p className="text-xl font-black mt-1" style={{ color: stat.color }}>{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* Barra XP */}
              <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between text-xs mb-2" style={{ color: 'rgba(160,185,255,0.5)' }}>
                  <span>Nivel {nivel} — {experiencia} XP</span>
                  <span>Nivel {nivel + 1} — {xpParaSiguiente} XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${xpPorcentaje}%`, background: 'linear-gradient(90deg,#f59e0b,#f97316)', boxShadow: '0 0 8px rgba(245,158,11,0.4)', transition: 'width 0.7s ease' }} />
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: 'rgba(245,158,11,0.6)' }}>
                  ⚡ {xpParaSiguiente - experiencia} XP para el siguiente nivel
                </p>
              </div>

              {/* Estado de módulos en perfil */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(160,185,255,0.4)' }}>Estado de módulos</p>
                {ejerciciosPorModulo.map(({ modulo, ejercicios: ejs }, idx) => {
                  const comp = ejs.filter(e => completados.has(e.idEjercicio)).length;
                  const desbloq = moduloDesbloqueado(idx);
                  const pct = ejs.length > 0 ? Math.round((comp / ejs.length) * 100) : 0;
                  return (
                    <div key={modulo.id} className="p-3 rounded-xl flex items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', opacity: desbloq ? 1 : 0.5 }}>
                      <span className="text-xl">{!desbloq ? '🔒' : comp === ejs.length && ejs.length > 0 ? '✅' : modulo.icono}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold" style={{ color: desbloq ? '#fff' : 'rgba(255,255,255,0.3)' }}>{modulo.label}</span>
                          <span style={{ color: desbloq ? modulo.color : 'rgba(160,185,255,0.3)' }}>{desbloq ? `${comp}/${ejs.length}` : 'Bloqueado'}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: modulo.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ejercicios completados */}
            {totalCompletados > 0 && (
              <div className="p-5 rounded-2xl" style={{ background: 'rgba(10,14,30,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 className="text-sm font-bold text-white mb-3">Ejercicios completados</h3>
                <div className="flex flex-col gap-2">
                  {ejercicios.filter(e => completados.has(e.idEjercicio)).map(e => {
                    const cat = colorCategoria(e.categoria);
                    return (
                      <div key={e.idEjercicio}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer"
                        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
                        onClick={() => navigate(`/ejercicios/${e.idEjercicio}`)}>
                        <span>{cat.icono}</span>
                        <span className="text-sm text-white flex-1">{e.titulo}</span>
                        <div className="w-4 h-4" style={{ color: '#10b981' }}><Icon.Check /></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}