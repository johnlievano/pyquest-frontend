import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Helpers ───────────────────────────────────────────────────
function getNombreFromToken(): string | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nombre ?? payload.name ?? null;
  } catch { return null; }
}

// ── Types ─────────────────────────────────────────────────────
interface Star { x: number; y: number; size: number; opacity: number; speed: number; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }

// ── Feature data ──────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: 'Editor en tiempo real',
    desc: 'Escribí y ejecutá código Python directamente en el navegador con resaltado de sintaxis y autocompletado.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.3)',
    delay: 0,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M3 3v5h5"/><path d="M3 8A9 9 0 1 0 5.7 5.7"/>
        <circle cx="12" cy="12" r="1" fill="currentColor"/>
      </svg>
    ),
    title: 'Progreso persistente',
    desc: 'Tu avance se guarda en cada ejercicio. Retomá exactamente donde lo dejaste.',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
    delay: 100,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" fillOpacity="0.15"/>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: 'Sistema de puntos',
    desc: 'Ganás puntos por cada ejercicio completado. Más difícil el reto, mayor la recompensa.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.3)',
    delay: 200,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    title: 'Módulos estructurados',
    desc: 'Tres niveles progresivos: Principiante, Intermedio y Avanzado. Cada uno desbloquea el siguiente.',
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.3)',
    delay: 300,
  },
];

const MODULES_PREVIEW = [
  { label: 'Principiante', puntos: 10, temas: ['print y variables', 'Listas y tipos', 'Operadores'], color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  { label: 'Intermedio',   puntos: 25, temas: ['Condicionales', 'Bucles for/while', 'Funciones y dict'], color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  { label: 'Avanzado',     puntos: 50, temas: ['Clases y OOP', 'List comprehension', 'Manejo de errores'], color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
];

// ── Canvas starfield ──────────────────────────────────────────
function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init stars
    starsRef.current = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.8 + 0.2,
      opacity: Math.random() * 0.7 + 0.1,
      speed: Math.random() * 0.15 + 0.02,
    }));

    const PARTICLE_COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

    const spawnParticle = (x: number, y: number) => {
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x, y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          size: Math.random() * 2 + 1,
          color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        });
      }
    };

    let frameCount = 0;
    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Nebula blobs
      const gradient1 = ctx.createRadialGradient(canvas.width * 0.2, canvas.height * 0.3, 0, canvas.width * 0.2, canvas.height * 0.3, 400);
      gradient1.addColorStop(0, 'rgba(30,50,180,0.06)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient2 = ctx.createRadialGradient(canvas.width * 0.8, canvas.height * 0.6, 0, canvas.width * 0.8, canvas.height * 0.6, 350);
      gradient2.addColorStop(0, 'rgba(100,30,180,0.05)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars with parallax
      const mx = (mouseRef.current.x / canvas.width - 0.5) * 2;
      const my = (mouseRef.current.y / canvas.height - 0.5) * 2;

      starsRef.current.forEach(star => {
        const px = star.x + mx * star.speed * 30;
        const py = star.y + my * star.speed * 30;
        const twinkle = Math.sin(frameCount * star.speed * 0.3 + star.x) * 0.3 + 0.7;

        ctx.beginPath();
        ctx.arc(
          ((px % canvas.width) + canvas.width) % canvas.width,
          ((py % canvas.height) + canvas.height) % canvas.height,
          star.size, 0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(200,210,255,${star.opacity * twinkle})`;
        ctx.fill();
      });

      // Particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.vy += 0.02;
        const alpha = (1 - p.life / p.maxLife) * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace(/rgba\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}),/, (_, r, g, b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},`);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Spawn particles near mouse occasionally
      if (frameCount % 8 === 0) {
        spawnParticle(
          mouseRef.current.x + (Math.random() - 0.5) * 60,
          mouseRef.current.y + (Math.random() - 0.5) * 60,
        );
      }

      rafRef.current = requestAnimationFrame(render);
    };
    render();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}

// ── Animated code snippet ─────────────────────────────────────
const CODE_LINES = [
  { text: 'def explorar_galaxia(planeta):', color: '#6366f1' },
  { text: '    if planeta.tiene_vida:', color: '#94a3b8' },
  { text: '        print("¡Contacto!")', color: '#10b981' },
  { text: '    return planeta.coordenadas', color: '#94a3b8' },
  { text: '', color: '' },
  { text: 'for planeta in sistema_solar:', color: '#f59e0b' },
  { text: '    resultado = explorar_galaxia(planeta)', color: '#94a3b8' },
  { text: '    print(f"Planeta: {resultado}")', color: '#10b981' },
];

function CodePreview() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines < CODE_LINES.length) {
      const t = setTimeout(() => setVisibleLines(v => v + 1), 180);
      return () => clearTimeout(t);
    }
  }, [visibleLines]);

  return (
    <div style={{
      background: 'rgba(4,7,18,0.9)',
      border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.1)',
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    }}>
      {/* Titlebar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(148,163,200,0.5)' }}>galaxia.py</span>
      </div>
      {/* Code */}
      <div style={{ padding: '20px 24px', minHeight: 220 }}>
        {CODE_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6, opacity: 1, animation: 'fadeSlideIn 0.3s ease' }}>
            <span style={{ fontSize: 11, color: 'rgba(148,163,200,0.25)', width: 16, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 13, color: line.color || 'transparent', letterSpacing: '0.01em' }}>
              {line.text || '\u00A0'}
            </span>
          </div>
        ))}
        {visibleLines < CODE_LINES.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 11, color: 'rgba(148,163,200,0.25)', width: 16, textAlign: 'right' }}>{visibleLines + 1}</span>
            <span style={{ width: 2, height: 16, background: '#6366f1', animation: 'blink 1s step-end infinite', display: 'inline-block' }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────
function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setVisible(true), feature.delay); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [feature.delay]);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '24px',
        borderRadius: 16,
        background: hover ? `linear-gradient(135deg, ${feature.color}0a, rgba(8,12,26,0.9))` : 'rgba(8,12,26,0.6)',
        border: `1px solid ${hover ? feature.color + '30' : 'rgba(255,255,255,0.07)'}`,
        transition: 'all 0.3s ease',
        transform: visible ? (hover ? 'translateY(-6px)' : 'translateY(0)') : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        cursor: 'default',
        boxShadow: hover ? `0 16px 48px ${feature.glow}` : 'none',
      }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 16,
        background: `${feature.color}18`, border: `1px solid ${feature.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: feature.color, padding: 10,
        boxShadow: hover ? `0 0 20px ${feature.glow}` : 'none',
        transition: 'box-shadow 0.3s',
      }}>
        {feature.icon}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f0f4ff', marginBottom: 8, letterSpacing: '-0.01em' }}>{feature.title}</h3>
      <p style={{ fontSize: 13, color: 'rgba(148,163,200,0.65)', lineHeight: 1.6 }}>{feature.desc}</p>
    </div>
  );
}

// ── Module preview card ───────────────────────────────────────
function ModuleCard({ mod, index }: { mod: typeof MODULES_PREVIEW[0]; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setTimeout(() => setVisible(true), index * 120); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [index]);

  return (
    <div ref={ref} style={{
      padding: '24px',
      borderRadius: 16,
      background: mod.bg,
      border: `1px solid ${mod.border}`,
      transition: 'all 0.4s ease',
      transform: visible ? 'translateY(0)' : 'translateY(32px)',
      opacity: visible ? 1 : 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: mod.color, letterSpacing: '-0.01em' }}>{mod.label}</h3>
        <div style={{ padding: '4px 12px', borderRadius: 20, background: `${mod.color}18`, border: `1px solid ${mod.color}30` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: mod.color }}>+{mod.puntos} pts / ejercicio</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mod.temas.map((tema, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: mod.color, flexShrink: 0, opacity: 0.7 }} />
            <span style={{ fontSize: 13, color: 'rgba(148,163,200,0.75)' }}>{tema}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Welcome ──────────────────────────────────────────────
export default function Welcome() {
  const navigate = useNavigate();
  const nombre = getNombreFromToken();
  const [heroVisible, setHeroVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060912',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      overflowX: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes floatOrbit { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-18px) rotate(3deg); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <Starfield />

      {/* ── HERO ── */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', textAlign: 'center' }}>

        {/* Orbiting planet decoration */}
        <div style={{ position: 'absolute', top: '15%', right: '10%', width: 120, height: 120, animation: 'floatOrbit 8s ease-in-out infinite', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #4f46e5, #1e1b4b)', boxShadow: '0 0 40px rgba(79,70,229,0.4), inset 0 0 30px rgba(0,0,0,0.3)', position: 'relative' }}>
            {/* Ring */}
            <div style={{ position: 'absolute', top: '50%', left: '-30%', width: '160%', height: 28, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.3)', transform: 'translateY(-50%) rotateX(70deg)', boxShadow: '0 0 12px rgba(99,102,241,0.2)' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '20%', left: '8%', width: 70, height: 70, animation: 'floatOrbit 12s ease-in-out infinite reverse', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #10b981, #064e3b)', boxShadow: '0 0 24px rgba(16,185,129,0.35)' }} />
        </div>

        <div style={{ position: 'absolute', top: '30%', left: '5%', width: 40, height: 40, animation: 'floatOrbit 6s ease-in-out infinite', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #f59e0b, #78350f)', boxShadow: '0 0 16px rgba(245,158,11,0.4)' }} />
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 100, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          marginBottom: 32, opacity: heroVisible ? 1 : 0, transition: 'opacity 0.6s',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px rgba(99,102,241,0.8)', animation: 'pulse-ring 2s infinite' }} />
          <span style={{ fontSize: 13, color: 'rgba(148,163,200,0.8)', fontWeight: 600, letterSpacing: '0.04em' }}>
            Plataforma de aprendizaje Python
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: 16,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(20px)',
          transition: 'all 0.7s ease 0.1s',
        }}>
          {nombre ? (
            <>
              <span style={{ color: '#f0f4ff' }}>Bienvenido,{' '}</span>
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 4s ease infinite',
              }}>{nombre}</span>
            </>
          ) : (
            <>
              <span style={{ color: '#f0f4ff' }}>Aprendé Python{' '}</span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 4s ease infinite',
              }}>en el cosmos</span>
            </>
          )}
        </h1>

        <p style={{
          fontSize: 'clamp(15px, 2vw, 18px)',
          color: 'rgba(148,163,200,0.7)',
          maxWidth: 540,
          lineHeight: 1.7,
          marginBottom: 44,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(16px)',
          transition: 'all 0.7s ease 0.2s',
        }}>
          Ejercicios interactivos, feedback inmediato y un camino de aprendizaje estructurado que te lleva de cero a Python avanzado.
        </p>

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(16px)',
          transition: 'all 0.7s ease 0.35s',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <button
            onClick={() => navigate('/register')}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              padding: '14px 36px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              background: btnHover
                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: btnHover
                ? '0 8px 32px rgba(99,102,241,0.6)'
                : '0 4px 20px rgba(99,102,241,0.4)',
              transform: btnHover ? 'translateY(-2px)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '-0.01em',
            }}>
            Registrarse →
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          <button
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(148,163,200,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#f0f4ff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(148,163,200,0.8)'; }}>
            Conocer más
          </button>
        </div>

        {/* Code preview */}
        <div style={{
          marginTop: 64,
          width: '100%', maxWidth: 520,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'none' : 'translateY(24px)',
          transition: 'all 0.8s ease 0.5s',
        }}>
          <CodePreview />
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4, animation: 'floatOrbit 3s ease-in-out infinite' }}>
          <span style={{ fontSize: 11, color: 'rgba(148,163,200,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Explorar</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, color: 'rgba(148,163,200,0.5)' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>¿Qué incluye?</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Todo lo que necesitás para<br />
              <span style={{ color: '#6366f1' }}>dominar Python</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── MODULES PREVIEW ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Ruta de aprendizaje</p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
              Tres módulos, un camino
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(148,163,200,0.55)', marginTop: 10 }}>
              Cada módulo desbloquea el siguiente al completarlo.
            </p>
          </div>

          {/* Timeline connector */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {MODULES_PREVIEW.map((mod, i) => <ModuleCard key={i} mod={mod} index={i} />)}
            </div>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: -24, left: '16.5%', right: '16.5%', height: 1, background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)', opacity: 0.25 }} />
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 24px 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {/* Planet decoration */}
          <div style={{ width: 80, height: 80, margin: '0 auto 32px', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, #6366f1, #1e1b4b)', boxShadow: '0 0 48px rgba(99,102,241,0.5)', animation: 'floatOrbit 6s ease-in-out infinite', position: 'relative' }}>
            {/* Ring */}
            <div style={{ position: 'absolute', top: '50%', left: '-25%', width: '150%', height: 22, borderRadius: '50%', border: '1.5px solid rgba(99,102,241,0.4)', transform: 'translateY(-50%) rotateX(72deg)' }} />
          </div>

          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', marginBottom: 14 }}>
            {nombre ? `Listo, ${nombre}` : 'Empezá ahora'}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(148,163,200,0.6)', marginBottom: 36, lineHeight: 1.6 }}>
            Tu ruta de aprendizaje te espera. Cada ejercicio te acerca un paso más.
          </p>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '16px 48px',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              transition: 'all 0.2s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 40px rgba(99,102,241,0.6)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'none'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)'; }}>
            Registrarse →
          </button>
        </div>
      </section>

    </div>
  );
}