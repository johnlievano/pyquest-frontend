import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UNIDADES, totalEjercicios, type Unidad } from "../exercises";

// ── Tipos ──────────────────────────────────────────────────────
interface ProgresoUsuario {
  xp: number;
  nivel: number;
  ejerciciosCompletados: string[]; // IDs de ejercicios
  unidadesCompletadas: number[];
  racha: number; // días seguidos
  ultimaActividad: string;
}

// ── Helpers ────────────────────────────────────────────────────
const getNivel = (xp: number) => Math.floor(xp / 500) + 1;
const getXpEnNivel = (xp: number) => xp % 500;
const getNombreNivel = (nivel: number) => {
  const nombres = [
    "",
    "Cadete",
    "Piloto",
    "Explorador",
    "Navegante",
    "Comandante",
    "Almirante",
    "Leyenda",
  ];
  return nombres[Math.min(nivel, nombres.length - 1)] ?? "Maestro";
};

// Progreso simulado (en producción vendría del backend)
const PROGRESO_DEMO: ProgresoUsuario = {
  xp: 750,
  nivel: 2,
  ejerciciosCompletados: ["u1e1", "u1e2", "u1e3", "u1e4", "u1e5", "u2e1"],
  unidadesCompletadas: [],
  racha: 5,
  ultimaActividad: new Date().toISOString(),
};

// ── Iconos SVG inline ──────────────────────────────────────────
const Icon = {
  Rocket: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M4.5 16.5c-1.5 1.5-1 5.5-1 5.5s4-.5 5.5-2L18 10.5c2-2 2-5 0-7s-5-2-7 0L4.5 12.5" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
      <path d="m9 11-4.5 4.5M13 15l-2 4.5M9 9l-4.5 2" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Lock: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Flash: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  Trophy: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 22V18" />
      <path d="M14 22V18" />
      <path d="M6 4v8a6 6 0 0 0 12 0V4H6z" />
    </svg>
  ),
  Fire: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
      <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0 0 10 0c0-4.5-5-10-5-10zm0 13a2 2 0 0 1-2-2c0-1.5 2-4 2-4s2 2.5 2 4a2 2 0 0 1-2 2z" />
    </svg>
  ),
  Map: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  ),
  User: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

// ── Componente: Tarjeta de Unidad ──────────────────────────────
function TarjetaUnidad({
  unidad,
  progreso,
  desbloqueada,
  completada,
  onClick,
}: {
  unidad: Unidad;
  progreso: number; // 0–100
  desbloqueada: boolean;
  completada: boolean;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);

  const ejerciciosTotal = unidad.ejercicios.length;
  const xpTotal = unidad.ejercicios.reduce((s, e) => s + e.xp, 0);

  const baseStyle: React.CSSProperties = {
    background:
      hover && desbloqueada
        ? `linear-gradient(135deg, rgba(15,20,40,0.95) 0%, rgba(20,28,55,0.95) 100%)`
        : "rgba(10,14,30,0.8)",
    border: `1px solid ${hover && desbloqueada ? unidad.colorAccent + "55" : "rgba(255,255,255,0.07)"}`,
    boxShadow:
      hover && desbloqueada
        ? `0 8px 40px ${unidad.colorGlow}`
        : "0 2px 12px rgba(0,0,0,0.4)",
    backdropFilter: "blur(16px)",
    cursor: desbloqueada ? "pointer" : "not-allowed",
    transition: "all 0.3s ease",
    transform: hover && desbloqueada ? "translateY(-4px)" : "none",
    opacity: desbloqueada ? 1 : 0.45,
  };

  return (
    <div
      style={baseStyle}
      className="rounded-2xl p-5 relative overflow-hidden"
      onClick={desbloqueada ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Glow orb decorativo */}
      {desbloqueada && (
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background: unidad.colorGlow,
            filter: "blur(30px)",
            opacity: hover ? 0.5 : 0.2,
            transition: "opacity 0.3s",
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: desbloqueada
                ? `${unidad.colorAccent}22`
                : "rgba(255,255,255,0.05)",
              border: `1px solid ${desbloqueada ? unidad.colorAccent + "33" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            {desbloqueada ? unidad.icono : "🔒"}
          </div>
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{
                color: desbloqueada
                  ? unidad.colorAccent
                  : "rgba(255,255,255,0.3)",
              }}
            >
              Unidad {unidad.id}
            </p>
            <h3
              className="text-sm font-bold text-white leading-tight mt-0.5"
              style={{ color: desbloqueada ? "#fff" : "rgba(255,255,255,0.4)" }}
            >
              {unidad.titulo}
            </h3>
          </div>
        </div>

        {/* Badge estado */}
        {completada ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(16,185,129,0.15)",
              color: "#10b981",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <div className="w-3 h-3">
              <Icon.Check />
            </div>{" "}
            Completada
          </div>
        ) : progreso > 0 ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${unidad.colorAccent}18`,
              color: unidad.colorAccent,
              border: `1px solid ${unidad.colorAccent}33`,
            }}
          >
            En Progreso
          </div>
        ) : !desbloqueada ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Bloqueada
          </div>
        ) : null}
      </div>

      {/* Descripción */}
      <p
        className="text-xs leading-relaxed mb-4"
        style={{ color: "rgba(160,180,220,0.6)" }}
      >
        {unidad.descripcion}
      </p>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs" style={{ color: "rgba(160,180,220,0.5)" }}>
            {ejerciciosTotal} ejercicios
          </span>
          <span
            className="text-xs font-semibold"
            style={{
              color: desbloqueada
                ? unidad.colorAccent
                : "rgba(255,255,255,0.25)",
            }}
          >
            {progreso}%
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progreso}%`,
              background: desbloqueada
                ? `linear-gradient(90deg, ${unidad.colorAccent}, ${unidad.colorAccent}cc)`
                : "rgba(255,255,255,0.15)",
              boxShadow:
                progreso > 0 && desbloqueada
                  ? `0 0 8px ${unidad.colorAccent}`
                  : "none",
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex items-center gap-1"
          style={{ color: "rgba(245,158,11,0.7)" }}
        >
          <div className="w-3.5 h-3.5">
            <Icon.Star />
          </div>
          <span className="text-xs font-semibold">{xpTotal} XP</span>
        </div>
        {desbloqueada && (
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: unidad.colorAccent }}
          >
            {progreso > 0 ? "Continuar" : "Comenzar"} →
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard Principal ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [progreso] = useState<ProgresoUsuario>(PROGRESO_DEMO);
  const [tabActiva, setTabActiva] = useState<"mapa" | "logros" | "perfil">(
    "mapa",
  );
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; opacity: number }>
  >([]);

  // Genera partículas decorativas de fondo
  useEffect(() => {
    const pts = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
    }));
    setParticles(pts);
  }, []);

  const nivel = getNivel(progreso.xp);
  const xpEnNivel = getXpEnNivel(progreso.xp);
  const xpPorcentaje = (xpEnNivel / 500) * 100;

  const getProgresoUnidad = (unidad: Unidad) => {
    const completados = unidad.ejercicios.filter((e) =>
      progreso.ejerciciosCompletados.includes(e.id),
    ).length;
    return Math.round((completados / unidad.ejercicios.length) * 100);
  };

  const esDesbloqueada = (unidad: Unidad) => {
    if (!unidad.prerequisito) return true;
    const unidadPrev = UNIDADES.find((u) => u.id === unidad.prerequisito);
    if (!unidadPrev) return true;
    return getProgresoUnidad(unidadPrev) >= 50;
  };

  const esCompletada = (unidad: Unidad) => getProgresoUnidad(unidad) === 100;

  const entrarUnidad = (unidadId: number) => {
    const unidad = UNIDADES.find((u) => u.id === unidadId);
    if (!unidad) return;
    // Busca el primer ejercicio no completado
    const siguiente = unidad.ejercicios.find(
      (e) => !progreso.ejerciciosCompletados.includes(e.id),
    );
    const ejercicioId = siguiente?.id ?? unidad.ejercicios[0].id;
    navigate(`/unidades/${unidadId}/ejercicios/${ejercicioId}`);
  };

  const totalCompletados = progreso.ejerciciosCompletados.length;
  const porcentajeGlobal = Math.round(
    (totalCompletados / totalEjercicios) * 100,
  );

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Exo 2', 'Segoe UI', sans-serif",
        background: "#050812",
      }}
    >
      {/* ── Fondo estrellas ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(30,60,180,0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(100,30,180,0.07) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* ──────────── SIDEBAR ──────────── */}
      <aside
        className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20"
        style={{
          background: "rgba(5,8,18,0.9)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 p-6 pb-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-xl blur-md"
              style={{ background: "rgba(59,130,246,0.4)" }}
            />
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)" }}
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-white font-black text-lg tracking-widest">
              PyQuest
            </span>
            <p className="text-xs" style={{ color: "rgba(160,185,255,0.45)" }}>
              Aprende Python
            </p>
          </div>
        </div>

        {/* Card de nivel */}
        <div
          className="mx-4 mt-5 p-4 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.12))",
            border: "1px solid rgba(99,102,241,0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
              }}
            >
              🚀
            </div>
            <div>
              <p
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: "rgba(160,185,255,0.5)" }}
              >
                Nivel {nivel}
              </p>
              <p className="text-sm font-bold text-white">
                {getNombreNivel(nivel)}
              </p>
            </div>
          </div>
          <div
            className="flex justify-between text-xs mb-1.5"
            style={{ color: "rgba(160,185,255,0.5)" }}
          >
            <span>{xpEnNivel} XP</span>
            <span>500 XP</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${xpPorcentaje}%`,
                background: "linear-gradient(90deg, #f59e0b, #f97316)",
                boxShadow: "0 0 8px rgba(245,158,11,0.6)",
              }}
            />
          </div>
          <p className="text-xs mt-2" style={{ color: "rgba(245,158,11,0.7)" }}>
            ⚡ {500 - xpEnNivel} XP para nivel {nivel + 1}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 p-4 mt-2 flex-1">
          {[
            { id: "mapa", label: "Mapa de Misiones", icon: Icon.Map },
            { id: "logros", label: "Logros", icon: Icon.Trophy },
            { id: "perfil", label: "Mi Perfil", icon: Icon.User },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTabActiva(item.id as typeof tabActiva)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
              style={{
                background:
                  tabActiva === item.id
                    ? "rgba(59,130,246,0.12)"
                    : "transparent",
                color:
                  tabActiva === item.id ? "#60a5fa" : "rgba(160,185,255,0.55)",
                border:
                  tabActiva === item.id
                    ? "1px solid rgba(59,130,246,0.2)"
                    : "1px solid transparent",
              }}
            >
              <div className="w-4 h-4 shrink-0">
                <item.icon />
              </div>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Racha y logout */}
        <div
          className="p-4 space-y-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
            }}
          >
            <div className="w-4 h-4 text-orange-400">
              <Icon.Fire />
            </div>
            <span className="text-sm font-bold text-orange-300">
              {progreso.racha} días seguidos
            </span>
          </div>
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full transition-colors"
            style={{ color: "rgba(160,185,255,0.4)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(160,185,255,0.4)")
            }
            onClick={() => {
              localStorage.removeItem("pq_completados");
              window.location.href = "/login";
            }}
          >
            <div className="w-4 h-4 shrink-0">
              <Icon.Logout />
            </div>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ──────────── CONTENIDO PRINCIPAL ──────────── */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(5,8,18,0.85)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div>
            <h1 className="text-xl font-black text-white">
              {tabActiva === "mapa"
                ? "Mapa de Misiones"
                : tabActiva === "logros"
                  ? "Mis Logros"
                  : "Mi Perfil"}
            </h1>
            <p className="text-xs" style={{ color: "rgba(160,185,255,0.45)" }}>
              {totalCompletados} de {totalEjercicios} ejercicios completados
            </p>
          </div>

          {/* Stats rápidos */}
          <div className="flex items-center gap-4">
            {[
              {
                icon: <Icon.Flash />,
                val: `${progreso.xp} XP`,
                color: "#f59e0b",
              },
              {
                icon: <Icon.Check />,
                val: `${totalCompletados}/${totalEjercicios}`,
                color: "#10b981",
              },
              {
                icon: <Icon.Fire />,
                val: `${progreso.racha} días`,
                color: "#ef4444",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="w-3.5 h-3.5" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <span className="text-xs font-bold text-white">{stat.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── TAB: Mapa ── */}
        {tabActiva === "mapa" && (
          <div className="p-8">
            {/* Barra de progreso global */}
            <div
              className="mb-8 p-5 rounded-2xl"
              style={{
                background: "rgba(10,14,30,0.7)",
                border: "1px solid rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Progreso Global de la Misión
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(160,185,255,0.5)" }}
                  >
                    {UNIDADES.length} unidades · {totalEjercicios} ejercicios en
                    total
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-3xl font-black"
                    style={{
                      background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {porcentajeGlobal}%
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(160,185,255,0.4)" }}
                  >
                    completado
                  </p>
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${porcentajeGlobal}%`,
                    background:
                      "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)",
                    boxShadow: "0 0 12px rgba(99,102,241,0.5)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                {UNIDADES.map((u, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: esDesbloqueada(u)
                          ? u.colorAccent
                          : "rgba(255,255,255,0.15)",
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: "rgba(160,185,255,0.3)",
                        fontSize: "10px",
                      }}
                    >
                      U{u.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid de unidades */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {UNIDADES.map((unidad) => (
                <TarjetaUnidad
                  key={unidad.id}
                  unidad={unidad}
                  progreso={getProgresoUnidad(unidad)}
                  desbloqueada={esDesbloqueada(unidad)}
                  completada={esCompletada(unidad)}
                  onClick={() => entrarUnidad(unidad.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Logros ── */}
        {tabActiva === "logros" && (
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: "🚀",
                  nombre: "Primer Despegue",
                  desc: "Completa tu primer ejercicio",
                  desbloqueado: totalCompletados >= 1,
                },
                {
                  icon: "⭐",
                  nombre: "Cinco Estrellas",
                  desc: "Completa 5 ejercicios",
                  desbloqueado: totalCompletados >= 5,
                },
                {
                  icon: "🔥",
                  nombre: "En Llamas",
                  desc: "Mantén racha de 5 días",
                  desbloqueado: progreso.racha >= 5,
                },
                {
                  icon: "🎯",
                  nombre: "Explorador",
                  desc: "Completa la Unidad 1",
                  desbloqueado: getProgresoUnidad(UNIDADES[0]) === 100,
                },
                {
                  icon: "💫",
                  nombre: "Maestro Python",
                  desc: "Completa 20 ejercicios",
                  desbloqueado: totalCompletados >= 20,
                },
                {
                  icon: "🌌",
                  nombre: "Interestelar",
                  desc: "Completa todas las unidades",
                  desbloqueado: UNIDADES.every(
                    (u) => getProgresoUnidad(u) === 100,
                  ),
                },
                {
                  icon: "⚡",
                  nombre: "Velocidad Warp",
                  desc: "Completa 3 ejercicios en un día",
                  desbloqueado: false,
                },
                {
                  icon: "🏆",
                  nombre: "Comandante",
                  desc: "Alcanza nivel 5",
                  desbloqueado: nivel >= 5,
                },
              ].map((logro, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl flex flex-col items-center text-center gap-2"
                  style={{
                    background: logro.desbloqueado
                      ? "rgba(10,14,30,0.8)"
                      : "rgba(6,9,20,0.6)",
                    border: `1px solid ${logro.desbloqueado ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.05)"}`,
                    opacity: logro.desbloqueado ? 1 : 0.4,
                  }}
                >
                  <div
                    className="text-3xl"
                    style={{
                      filter: logro.desbloqueado ? "none" : "grayscale(1)",
                    }}
                  >
                    {logro.icon}
                  </div>
                  <p className="text-sm font-bold text-white">{logro.nombre}</p>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(160,185,255,0.5)" }}
                  >
                    {logro.desc}
                  </p>
                  {logro.desbloqueado && (
                    <div className="w-3 h-3 text-yellow-400">
                      <Icon.Check />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Perfil ── */}
        {tabActiva === "perfil" && (
          <div className="p-8 max-w-2xl">
            <div
              className="p-6 rounded-2xl mb-6"
              style={{
                background: "rgba(10,14,30,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                  }}
                >
                  🚀
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">
                    Astronauta #001
                  </h2>
                  <p style={{ color: "#f59e0b" }} className="font-semibold">
                    {getNombreNivel(nivel)} · Nivel {nivel}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "XP Total",
                    val: `${progreso.xp.toLocaleString()} XP`,
                    color: "#f59e0b",
                  },
                  {
                    label: "Ejercicios",
                    val: `${totalCompletados}/${totalEjercicios}`,
                    color: "#10b981",
                  },
                  {
                    label: "Racha actual",
                    val: `${progreso.racha} días`,
                    color: "#ef4444",
                  },
                  {
                    label: "Progreso",
                    val: `${porcentajeGlobal}%`,
                    color: "#3b82f6",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "rgba(160,185,255,0.5)" }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="text-xl font-black mt-1"
                      style={{ color: stat.color }}
                    >
                      {stat.val}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
