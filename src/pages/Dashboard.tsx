import { useState, useEffect, useCallback } from 'react';
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
import axios from '../lib/axios';

// ── Helpers ───────────────────────────────────────────────────
function getIdFromToken(): number | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? payload.idUsuario ?? null;
  } catch { return null; }
}

// ── Módulos ───────────────────────────────────────────────────
const MODULOS = [
  {
    id: 'principiante',
    label: 'Principiante',
    dificultad: 'BAJO' as const,
    color: '#10b981',
    colorDim: 'rgba(16,185,129,0.12)',
    colorBorder: 'rgba(16,185,129,0.25)',
    glow: 'rgba(16,185,129,0.2)',
    descripcion: 'Conceptos básicos: print, variables y listas.',
    puntosPorEjercicio: 10,
  },
  {
    id: 'intermedio',
    label: 'Intermedio',
    dificultad: 'MEDIO' as const,
    color: '#f59e0b',
    colorDim: 'rgba(245,158,11,0.12)',
    colorBorder: 'rgba(245,158,11,0.25)',
    glow: 'rgba(245,158,11,0.2)',
    descripcion: 'Condicionales, bucles, funciones y diccionarios.',
    puntosPorEjercicio: 25,
  },
  {
    id: 'avanzado',
    label: 'Avanzado',
    dificultad: 'ALTO' as const,
    color: '#ef4444',
    colorDim: 'rgba(239,68,68,0.12)',
    colorBorder: 'rgba(239,68,68,0.25)',
    glow: 'rgba(239,68,68,0.2)',
    descripcion: 'Excepciones, list comprehension y clases.',
    puntosPorEjercicio: 50,
  },
];

// ── SVG Icons ─────────────────────────────────────────────────
const Icons = {
  Logo: () => (
    <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
      <path d="M16 3L29 10.5V21.5L16 29L3 21.5V10.5L16 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M16 3V29M3 10.5L29 10.5M3 21.5L29 21.5" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/>
      <circle cx="16" cy="16" r="3.5" fill="currentColor" fillOpacity="0.8"/>
    </svg>
  ),
  Modules: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Profile: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  ChevronUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Spinner: () => (
    <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
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
  Points: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 9h1.5a1.5 1.5 0 0 1 0 3H9v3h1.5a1.5 1.5 0 0 1 0 3"/>
      <line x1="12" y1="6" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="18"/>
    </svg>
  ),
  Flame: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0 0 10 0c0-4.5-5-10-5-10z"/>
      <path d="M12 17a2 2 0 0 1-2-2c0-1.5 2-4 2-4s2 2.5 2 4a2 2 0 0 1-2 2z" fill="currentColor" fillOpacity="0.3"/>
    </svg>
  ),
  Target: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <path d="M3 3v5h5"/><path d="M3 8A9 9 0 1 0 5.7 5.7"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  ),
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
      style={{
        cursor: bloqueado ? 'not-allowed' : 'pointer',
        background: hover ? 'rgba(15,20,40,0.95)' : 'rgba(8,12,26,0.8)',
        border: `1px solid ${
          bloqueado ? 'rgba(255,255,255,0.04)'
          : completado ? 'rgba(16,185,129,0.2)'
          : hover ? cat.accent + '40' : 'rgba(255,255,255,0.07)'
        }`,
        borderRadius: 14,
        padding: '16px 18px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s ease',
        transform: hover && !bloqueado ? 'translateY(-3px)' : 'none',
        opacity: bloqueado ? 0.4 : 1,
        boxShadow: hover && !bloqueado ? `0 8px 32px ${cat.glow}` : 'none',
      }}>

      {/* Completed indicator line */}
      {completado && !bloqueado && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, #10b981, transparent)',
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Category icon */}
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bloqueado ? 'rgba(255,255,255,0.04)' : `${cat.accent}18`,
            border: `1px solid ${bloqueado ? 'rgba(255,255,255,0.06)' : cat.accent + '30'}`,
            flexShrink: 0,
          }}>
            {bloqueado ? (
  <div style={{ width: 16, height: 16, color: 'rgba(160,185,255,0.25)' }}><Icons.Lock /></div>
) : (
  <div style={{ width: 18, height: 18, color: cat.accent }}>
    {ejercicio.dificultad === 'BAJO' && <Icons.Target />}
    {ejercicio.dificultad === 'MEDIO' && <Icons.Code />}
    {ejercicio.dificultad === 'ALTO' && <Icons.Flame />}
  </div>
)}
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: bloqueado ? 'rgba(160,185,255,0.2)' : cat.accent, marginBottom: 2 }}>
              {ejercicio.categoria}
            </p>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: bloqueado ? 'rgba(255,255,255,0.25)' : '#f0f4ff', lineHeight: 1.3 }}>
              {ejercicio.titulo}
            </h3>
          </div>
        </div>

        {completado ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', flexShrink: 0 }}>
            <div style={{ width: 12, height: 12, color: '#10b981' }}><Icons.Check /></div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>Listo</span>
          </div>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: bloqueado ? 'rgba(255,255,255,0.04)' : dif.bg, color: bloqueado ? 'rgba(160,185,255,0.25)' : dif.text, flexShrink: 0 }}>
            {mapDificultad(ejercicio.dificultad)}
          </span>
        )}
      </div>

      <p style={{ fontSize: 12, color: bloqueado ? 'rgba(160,185,255,0.2)' : 'rgba(148,163,200,0.7)', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {bloqueado ? 'Completá el módulo anterior para desbloquear.' : ejercicio.descripcion}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 10, borderTop: `1px solid ${bloqueado ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)'}` }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: bloqueado ? 'rgba(160,185,255,0.2)' : completado ? '#10b981' : cat.accent, display: 'flex', alignItems: 'center', gap: 4 }}>
          {bloqueado ? 'Bloqueado' : completado ? 'Revisar' : 'Comenzar'}
          {!bloqueado && <div style={{ width: 12, height: 12 }}><Icons.ArrowRight /></div>}
        </span>
      </div>
    </div>
  );
}

// ── Sección módulo ─────────────────────────────────────────────
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
  const puntosModulo = completadosModulo * modulo.puntosPorEjercicio;
  const puntosTotales = ejercicios.length * modulo.puntosPorEjercicio;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Header */}
      <div
        onClick={() => desbloqueado && setExpandido(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
          borderRadius: 14, marginBottom: expandido ? 12 : 0,
          background: moduloCompleto ? modulo.colorDim : 'rgba(8,12,26,0.7)',
          border: `1px solid ${moduloCompleto ? modulo.colorBorder : desbloqueado ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
          cursor: desbloqueado ? 'pointer' : 'not-allowed',
          opacity: desbloqueado ? 1 : 0.5,
          transition: 'all 0.2s',
        }}>

        {/* Indicator */}
        <div style={{
          width: 4, height: 40, borderRadius: 2, flexShrink: 0,
          background: desbloqueado ? modulo.color : 'rgba(255,255,255,0.1)',
        }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: desbloqueado ? '#f0f4ff' : 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em' }}>
              {modulo.label}
            </h3>
            {!desbloqueado && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.05)' }}>
                <div style={{ width: 11, height: 11, color: 'rgba(160,185,255,0.35)' }}><Icons.Lock /></div>
                <span style={{ fontSize: 11, color: 'rgba(160,185,255,0.35)', fontWeight: 600 }}>Bloqueado</span>
              </div>
            )}
            {moduloCompleto && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: modulo.colorDim, border: `1px solid ${modulo.colorBorder}` }}>
                <div style={{ width: 11, height: 11, color: modulo.color }}><Icons.Check /></div>
                <span style={{ fontSize: 11, color: modulo.color, fontWeight: 600 }}>Completado</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${porcentaje}%`, background: modulo.color, borderRadius: 2, transition: 'width 0.7s ease', boxShadow: porcentaje > 0 ? `0 0 6px ${modulo.glow}` : 'none' }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: desbloqueado ? modulo.color : 'rgba(160,185,255,0.25)', flexShrink: 0 }}>
              {completadosModulo}/{ejercicios.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: desbloqueado ? modulo.color : 'rgba(160,185,255,0.25)' }}>
            {puntosModulo}/{puntosTotales} pts
          </span>
          {desbloqueado && (
            <div style={{ width: 16, height: 16, color: 'rgba(160,185,255,0.4)' }}>
              {expandido ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
            </div>
          )}
        </div>
      </div>

      {/* Ejercicios */}
      {(desbloqueado && expandido || !desbloqueado) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {ejercicios.map(ejercicio => (
            <TarjetaEjercicio
              key={ejercicio.idEjercicio}
              ejercicio={ejercicio}
              completado={completados.has(ejercicio.idEjercicio)}
              bloqueado={!desbloqueado}
              onClick={() => onClick(ejercicio.idEjercicio)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(8,12,26,0.7)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(148,163,200,0.6)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ width: 18, height: 18, color }}>{icon}</div>
      </div>
      <div>
        <p style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'rgba(148,163,200,0.45)', marginTop: 4 }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const idUsuario = getIdFromToken();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioBackend[]>([]);
  const [completados, setCompletados] = useState<Set<number>>(new Set());
  const [puntos, setPuntos] = useState<number>(0);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'modulos' | 'perfil'>('modulos');

  useEffect(() => {
    if (!idUsuario) { navigate('/login'); return; }
    cargarDatos();
  }, []);

  const cargarDatos = useCallback(async () => {
  if (!idUsuario) return;
  try {
    setLoading(true);
    setError(null);

    // 1. Datos esenciales (si fallan, sí mostramos error)
    const [resUser, resEj, resProg] = await Promise.all([
      usersService.getById(idUsuario),
      ejerciciosService.getAll(),
      progresoService.getByUsuario(idUsuario),
    ]);

    setUsuario(resUser.data);
    setEjercicios(resEj.data ?? []);
    const ids = new Set<number>(
      (resProg.data ?? [])
        .filter((p: any) => p.completado)
        .map((p: any) => Number(p.idEjercicio))
    );
    setCompletados(ids);

    // 2. Datos secundarios (puntos e historial) con fallback silencioso
    try {
      const resPuntos = await axios.get(`/puntos/${idUsuario}`);
      setPuntos(resPuntos.data?.puntos ?? 0);
    } catch {
      setPuntos(0); // valor por defecto si el endpoint no funciona
    }

    try {
      const resHistorial = await axios.get(`/puntos/${idUsuario}/historial`);
      setHistorial(resHistorial.data ?? []);
    } catch {
      setHistorial([]); // array vacío si falla
    }

  } catch {
    setError('No se pudieron cargar los datos principales. Verificá tu conexión.');
  } finally {
    setLoading(false);
  }
}, [idUsuario]);

  const ejerciciosPorModulo = MODULOS.map(modulo => ({
    modulo,
    ejercicios: ejercicios.filter(e => e.dificultad === modulo.dificultad),
  }));

  const moduloDesbloqueado = (idx: number): boolean => {
    if (idx === 0) return true;
    return ejerciciosPorModulo[idx - 1].ejercicios.every(e => completados.has(e.idEjercicio));
  };

  const totalEjercicios = ejercicios.length;
  const totalCompletados = completados.size;
  const porcentajeGlobal = totalEjercicios > 0 ? Math.round((totalCompletados / totalEjercicios) * 100) : 0;
  const racha = usuario?.perfil?.racha ?? 0;

  const NAV = [
    { id: 'modulos', label: 'Módulos', icon: <Icons.Modules /> },
    { id: 'perfil',  label: 'Mi Perfil', icon: <Icons.Profile /> },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#060912' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, height: '100vh', width: 240,
        display: 'flex', flexDirection: 'column', zIndex: 20,
        background: 'rgba(4,7,18,0.95)', backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              padding: 7, color: 'white', flexShrink: 0,
            }}>
              <Icons.Logo />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.01em' }}>PyQuest</p>
              <p style={{ fontSize: 11, color: 'rgba(148,163,200,0.5)' }}>Aprendé Python</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: '16px 12px 0', padding: '16px', borderRadius: 12, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 16, fontWeight: 800,
            }}>
              {usuario?.nombre?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f4ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {usuario?.nombre ?? '...'}
              </p>
              <p style={{ fontSize: 11, color: 'rgba(148,163,200,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {usuario?.email ?? ''}
              </p>
            </div>
          </div>
          {/* Points display */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 14, color: '#818cf8' }}><Icons.Points /></div>
              <span style={{ fontSize: 11, color: 'rgba(148,163,200,0.6)', fontWeight: 600 }}>Puntos</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#818cf8' }}>{puntos.toLocaleString()}</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map(item => {
            const active = tabActiva === item.id;
            return (
              <button key={item.id}
                onClick={() => setTabActiva(item.id as typeof tabActiva)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10, width: '100%',
                  background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(59,130,246,0.25)' : 'transparent'}`,
                  color: active ? '#60a5fa' : 'rgba(148,163,200,0.5)',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                <div style={{ width: 16, height: 16, flexShrink: 0 }}>{item.icon}</div>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Racha + logout */}
        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {racha > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ width: 15, height: 15, color: '#f97316' }}><Icons.Flame /></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fb923c' }}>{racha} días de racha</span>
            </div>
          )}
          <button
            onClick={() => { localStorage.removeItem('accessToken'); navigate('/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, width: '100%', background: 'transparent', border: '1px solid transparent', color: 'rgba(148,163,200,0.4)', fontSize: 13, cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,200,0.4)'; }}>
            <div style={{ width: 15, height: 15, flexShrink: 0 }}><Icons.Logout /></div>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ marginLeft: 240, flex: 1, minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(4,7,18,0.8)', backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
              {tabActiva === 'modulos' ? 'Módulos de Python' : 'Mi Perfil'}
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(148,163,200,0.45)', marginTop: 2 }}>
              {totalCompletados} de {totalEjercicios} ejercicios completados · {porcentajeGlobal}% total
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {[
              { icon: <Icons.Points />, val: `${puntos.toLocaleString()} pts`, color: '#818cf8' },
              { icon: <Icons.Check />, val: `${totalCompletados}/${totalEjercicios}`, color: '#10b981' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 14, height: 14, color: s.color }}>{s.icon}</div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f0f4ff' }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAB: Módulos ── */}
        {tabActiva === 'modulos' && (
          <div style={{ padding: '28px 32px' }}>

            {/* Progreso global */}
            <div style={{ marginBottom: 28, padding: '22px 26px', borderRadius: 16, background: 'rgba(8,12,26,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff', marginBottom: 3 }}>Progreso Global</h2>
                  <p style={{ fontSize: 12, color: 'rgba(148,163,200,0.5)' }}>{totalEjercicios} ejercicios en total</p>
                </div>
                <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {porcentajeGlobal}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ height: '100%', width: `${porcentajeGlobal}%`, borderRadius: 3, background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)', transition: 'width 1s ease', boxShadow: '0 0 10px rgba(99,102,241,0.4)' }} />
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {ejerciciosPorModulo.map(({ modulo, ejercicios: ejs }, idx) => {
                  const comp = ejs.filter(e => completados.has(e.idEjercicio)).length;
                  const desbloq = moduloDesbloqueado(idx);
                  return (
                    <div key={modulo.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: desbloq ? modulo.color : 'rgba(255,255,255,0.15)' }} />
                      <span style={{ fontSize: 12, color: desbloq ? modulo.color : 'rgba(148,163,200,0.3)', fontWeight: 600 }}>
                        {modulo.label}: {desbloq ? `${comp}/${ejs.length}` : 'Bloqueado'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
                <div style={{ width: 22, height: 22, color: '#60a5fa' }}><Icons.Spinner /></div>
                <span style={{ fontSize: 14, color: 'rgba(148,163,200,0.5)' }}>Cargando módulos...</span>
              </div>
            )}

            {error && !loading && (
              <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {error}
                <button onClick={cargarDatos} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'underline' }}>Reintentar</button>
              </div>
            )}

            {!loading && !error && ejerciciosPorModulo.map(({ modulo, ejercicios: ejs }, idx) => (
              <SeccionModulo
                key={modulo.id}
                modulo={modulo}
                ejercicios={ejs}
                completados={completados}
                desbloqueado={moduloDesbloqueado(idx)}
                onClick={id => navigate(`/ejercicios/${id}`)}
              />
            ))}
          </div>
        )}

        {/* ── TAB: Perfil ── */}
        {tabActiva === 'perfil' && (
          <div style={{ padding: '28px 32px' }}>

            {/* Header perfil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '24px 28px', borderRadius: 16, background: 'rgba(8,12,26,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, fontWeight: 800, color: 'white',
                boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              }}>
                {usuario?.nombre?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {usuario?.nombre ?? '...'}
                </h2>
                <p style={{ fontSize: 13, color: 'rgba(148,163,200,0.55)' }}>{usuario?.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ width: 20, height: 20, color: '#818cf8' }}><Icons.Points /></div>
                <div>
                  <p style={{ fontSize: 11, color: 'rgba(148,163,200,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Puntos totales</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#818cf8', lineHeight: 1.1 }}>{puntos.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
              <StatCard icon={<Icons.Trophy />} label="Ejercicios" value={`${totalCompletados}/${totalEjercicios}`} color="#10b981" sub={`${porcentajeGlobal}% completado`} />
              <StatCard icon={<Icons.Points />} label="Puntos" value={puntos.toLocaleString()} color="#818cf8" sub="acumulados" />
              <StatCard icon={<Icons.Flame />} label="Racha" value={racha > 0 ? `${racha} días` : '—'} color="#f97316" sub={racha > 0 ? 'consecutivos' : 'Sin racha aún'} />
              <StatCard icon={<Icons.Target />} label="Progreso" value={`${porcentajeGlobal}%`} color="#3b82f6" sub="del curso total" />
            </div>

            {/* Estado módulos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(8,12,26,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(148,163,200,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 18 }}>
                  Estado de módulos
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {ejerciciosPorModulo.map(({ modulo, ejercicios: ejs }, idx) => {
                    const comp = ejs.filter(e => completados.has(e.idEjercicio)).length;
                    const desbloq = moduloDesbloqueado(idx);
                    const pct = ejs.length > 0 ? Math.round((comp / ejs.length) * 100) : 0;
                    const pts = comp * modulo.puntosPorEjercicio;
                    const ptsTotal = ejs.length * modulo.puntosPorEjercicio;
                    return (
                      <div key={modulo.id} style={{ opacity: desbloq ? 1 : 0.45 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {!desbloq && <div style={{ width: 13, height: 13, color: 'rgba(148,163,200,0.3)' }}><Icons.Lock /></div>}
                            <span style={{ fontSize: 13, fontWeight: 700, color: desbloq ? '#f0f4ff' : 'rgba(255,255,255,0.3)' }}>{modulo.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12 }}>
                            <span style={{ fontSize: 12, color: desbloq ? modulo.color : 'rgba(148,163,200,0.3)', fontWeight: 700 }}>{comp}/{ejs.length}</span>
                            <span style={{ fontSize: 12, color: 'rgba(148,163,200,0.4)' }}>{pts}/{ptsTotal} pts</span>
                          </div>
                        </div>
                        <div style={{ height: 5, borderRadius: 2.5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: modulo.color, borderRadius: 2.5, transition: 'width 0.7s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Historial de puntos */}
              <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(8,12,26,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                  <div style={{ width: 15, height: 15, color: 'rgba(148,163,200,0.5)' }}><Icons.History /></div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(148,163,200,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Historial de puntos
                  </h3>
                </div>
                {historial.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(148,163,200,0.35)', textAlign: 'center', padding: '24px 0' }}>
                    Completá ejercicios para ver tu historial
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                    {historial.slice(0, 8).map((h: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#f0f4ff' }}>{h.descripcion ?? 'Ejercicio completado'}</p>
                          <p style={{ fontSize: 11, color: 'rgba(148,163,200,0.4)', marginTop: 2 }}>
                            {h.fecha ? new Date(h.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) : ''}
                          </p>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#818cf8' }}>+{h.cantidad}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ejercicios completados */}
            {totalCompletados > 0 && (
              <div style={{ padding: '22px 24px', borderRadius: 16, background: 'rgba(8,12,26,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(148,163,200,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
                  Ejercicios completados — {totalCompletados}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
                  {ejercicios.filter(e => completados.has(e.idEjercicio)).map(e => {
                    const cat = colorCategoria(e.categoria);
                    const dif = colorDificultad(e.dificultad);
                    return (
                      <div key={e.idEjercicio}
                        onClick={() => navigate(`/ejercicios/${e.idEjercicio}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                        onMouseEnter={e2 => { (e2.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.3)'; }}
                        onMouseLeave={e2 => { (e2.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.12)'; }}>
                        <div style={{ width: 14, height: 14, color: '#10b981', flexShrink: 0 }}><Icons.Check /></div>
                        <span style={{ fontSize: 13, color: '#f0f4ff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titulo}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: dif.bg, color: dif.text, flexShrink: 0 }}>{mapDificultad(e.dificultad)}</span>
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