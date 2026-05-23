import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/auth.service";

// ─── Canvas Space Background (mejorado) ───────────────────────────────────
function SpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas;
    const ctx = c.getContext("2d")!;

    let animId: number;
    let W = 0,
      H = 0;

    // ── Entidades mejoradas ──────────────────────────────────────────────
    const STAR_COUNT = 280;
    interface Star {
      x: number;
      y: number;
      r: number;
      speed: number;
      twinkle: number;
    }
    interface Comet {
      x: number;
      y: number;
      vx: number;
      vy: number;
      len: number;
      life: number;
      maxLife: number;
    }
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      color: string;
    }

    let stars: Star[] = [];
    let comets: Comet[] = [];
    let particles: Particle[] = [];
    let time = 0;

    // ── 7 Planetas (más variedad) ───────────────────────────────────────
    const planets = [
      {
        rx: 0.15,
        ry: 0.35,
        size: 0.14,
        colorA: "#1a2a6c",
        colorB: "#4a90d9",
        rings: true,
        ringTilt: 0.28,
        moons: 1,
        name: "Neptura",
      },
      {
        rx: 0.85,
        ry: 0.6,
        size: 0.09,
        colorA: "#6a0572",
        colorB: "#c850c0",
        rings: false,
        ringTilt: 0,
        moons: 0,
        name: "Lilith",
      },
      {
        rx: 0.1,
        ry: 0.8,
        size: 0.06,
        colorA: "#0b486b",
        colorB: "#43cea2",
        rings: false,
        ringTilt: 0,
        moons: 0,
        name: "Aquaria",
      },
      {
        rx: 0.7,
        ry: 0.25,
        size: 0.11,
        colorA: "#8B4513",
        colorB: "#D2691E",
        rings: true,
        ringTilt: 0.2,
        moons: 2,
        name: "Volcanis",
      },
      {
        rx: 0.45,
        ry: 0.9,
        size: 0.07,
        colorA: "#2c3e50",
        colorB: "#3498db",
        rings: false,
        ringTilt: 0,
        moons: 0,
        name: "Frigia",
      },
      {
        rx: 0.92,
        ry: 0.15,
        size: 0.05,
        colorA: "#e67e22",
        colorB: "#f39c12",
        rings: true,
        ringTilt: 0.35,
        moons: 1,
        name: "Aurora",
      },
      {
        rx: 0.55,
        ry: 0.5,
        size: 0.1,
        colorA: "#8e44ad",
        colorB: "#9b59b6",
        rings: false,
        ringTilt: 0,
        moons: 1,
        name: "Mysterion",
      },
    ];

    function resize() {
      W = c.width = c.offsetWidth;
      H = c.height = c.offsetHeight;
      initStars();
    }

    function initStars() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.2,
        speed: Math.random() * 0.005 + 0.0005,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    function spawnComet() {
      const fromTop = Math.random() > 0.5;
      const x = fromTop ? Math.random() * W : -30;
      const y = fromTop ? -30 : Math.random() * H * 0.4;
      const angle = fromTop
        ? Math.PI / 4 + (Math.random() - 0.5) * 0.5
        : Math.PI / 5 + (Math.random() - 0.5) * 0.4;
      const speed = 7 + Math.random() * 6;
      const life = 70 + Math.random() * 80;
      comets.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        len: 100 + Math.random() * 100,
        life,
        maxLife: life,
      });
    }

    function drawStars() {
      stars.forEach((s) => {
        s.twinkle += s.speed;
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.fill();
      });
    }

    function drawGalaxyBackground() {
      // Degradado profundo del espacio
      const bg = ctx.createRadialGradient(
        W * 0.5,
        H * 0.5,
        0,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.9,
      );
      bg.addColorStop(0, "#0a0a2a");
      bg.addColorStop(0.3, "#0e1030");
      bg.addColorStop(0.7, "#030318");
      bg.addColorStop(1, "#010108");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Nebulosas múltiples (más dramáticas)
      const nebulae = [
        { x: W * 0.2, y: H * 0.3, r: W * 0.4, c0: "rgba(30,80,200,0.2)", c1: "rgba(0,0,0,0)" },
        { x: W * 0.85, y: H * 0.7, r: W * 0.35, c0: "rgba(160,40,200,0.18)", c1: "rgba(0,0,0,0)" },
        { x: W * 0.5, y: H * 0.1, r: W * 0.3, c0: "rgba(20,150,180,0.15)", c1: "rgba(0,0,0,0)" },
        { x: W * 0.75, y: H * 0.85, r: W * 0.25, c0: "rgba(255,100,80,0.1)", c1: "rgba(0,0,0,0)" },
        { x: W * 0.05, y: H * 0.95, r: W * 0.2, c0: "rgba(100,200,255,0.12)", c1: "rgba(0,0,0,0)" },
      ];
      nebulae.forEach((n) => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.c0);
        g.addColorStop(1, n.c1);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Efecto de polvo estelar (puntos difusos)
      for (let i = 0; i < 400; i++) {
        if (Math.random() > 0.99) {
          ctx.fillStyle = `rgba(255,255,200,${Math.random() * 0.3})`;
          ctx.beginPath();
          ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function drawPlanet(p: (typeof planets)[0]) {
  const px = p.rx * W;
  const py = p.ry * H;
  const pr = p.size * Math.min(W, H);

  // Atmósfera
  const atmo = ctx.createRadialGradient(px, py, pr * 0.6, px, py, pr * 1.8);
  atmo.addColorStop(0, p.colorB + "66");
  atmo.addColorStop(1, "transparent");
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(px, py, pr * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // ── ANILLO TRASERO (arco π → 2π, debajo del planeta) ──
  if (p.rings) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1, p.ringTilt);
    const ro = pr * 1.85, ri = pr * 1.25;
    const rg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro);
    rg.addColorStop(0, "rgba(210,180,140,0.7)");
    rg.addColorStop(0.5, "rgba(170,130,90,0.4)");
    rg.addColorStop(1, "transparent");
    ctx.strokeStyle = rg;
    ctx.lineWidth = ro - ri;
    ctx.beginPath();
    ctx.arc(0, 0, (ri + ro) / 2, Math.PI, Math.PI * 2); // solo mitad trasera
    ctx.stroke();
    ctx.restore();
  }

  // Cuerpo del planeta
  const grad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
  grad.addColorStop(0, p.colorB);
  grad.addColorStop(0.5, p.colorA);
  grad.addColorStop(1, "#030310");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fill();

  // Textura de bandas
  ctx.save();
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.clip();
  for (let i = 0; i < 6; i++) {
    const bandY = py - pr + ((pr * 2) / 6) * i + pr * 0.1;
    ctx.fillStyle = `rgba(0,0,0,${0.05 + i * 0.01})`;
    ctx.fillRect(px - pr, bandY, pr * 2, pr * 0.14);
    ctx.fillStyle = `rgba(255,255,255,0.02)`;
    ctx.fillRect(px - pr, bandY + 2, pr * 2, pr * 0.04);
  }
  const shine = ctx.createRadialGradient(px - pr * 0.4, py - pr * 0.4, 0, px - pr * 0.2, py - pr * 0.2, pr * 0.8);
  shine.addColorStop(0, "rgba(255,255,255,0.3)");
  shine.addColorStop(1, "transparent");
  ctx.fillStyle = shine;
  ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
  ctx.restore();

  // Lunas
  if (p.moons > 0) {
    for (let m = 0; m < p.moons; m++) {
      const angleOffset = (m * Math.PI * 2) / p.moons;
      const mAngle = time * 0.006 + angleOffset;
      const mDist = pr * (2.2 + m * 0.3);
      const mx = px + Math.cos(mAngle) * mDist;
      const my = py + Math.sin(mAngle) * mDist * 0.5;
      const mr = pr * (0.15 - m * 0.02);
      const mg = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr);
      mg.addColorStop(0, "#e0e0ff");
      mg.addColorStop(1, "#5a5a8a");
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fillStyle = mg;
      ctx.fill();
    }
  }

  // ── ANILLO DELANTERO (arco 0 → π, encima del planeta) ──
  if (p.rings) {
    ctx.save();
    ctx.translate(px, py);
    ctx.scale(1, p.ringTilt);
    const ro = pr * 1.85, ri = pr * 1.25;
    const rg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro);
    rg.addColorStop(0, "rgba(210,180,140,0.7)");
    rg.addColorStop(0.5, "rgba(170,130,90,0.4)");
    rg.addColorStop(1, "transparent");
    ctx.strokeStyle = rg;
    ctx.lineWidth = ro - ri;
    ctx.beginPath();
    ctx.arc(0, 0, (ri + ro) / 2, 0, Math.PI); // solo mitad delantera
    ctx.stroke();
    ctx.restore();
  }
}

    function drawComets() {
      comets = comets.filter((c) => c.life > 0);
      comets.forEach((c) => {
        const progress = c.life / c.maxLife;
        const tail = ctx.createLinearGradient(
          c.x,
          c.y,
          c.x - c.vx * (c.len / 5),
          c.y - c.vy * (c.len / 5),
        );
        tail.addColorStop(0, `rgba(255,240,200,${progress})`);
        tail.addColorStop(0.3, `rgba(255,160,80,${progress * 0.7})`);
        tail.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * (c.len / 5), c.y - c.vy * (c.len / 5));
        ctx.strokeStyle = tail;
        ctx.lineWidth = 3 * progress;
        ctx.stroke();

        // Núcleo brillante
        const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 5);
        hg.addColorStop(0, `rgba(255,255,210,${progress})`);
        hg.addColorStop(1, "transparent");
        ctx.fillStyle = hg;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();

        c.x += c.vx;
        c.y += c.vy;
        c.life--;

        // Partículas de estela
        if (Math.random() > 0.4) {
          particles.push({
            x: c.x,
            y: c.y,
            vx: (Math.random() - 0.5) * 1.2,
            vy: (Math.random() - 0.5) * 1.2,
            r: Math.random() * 2.5 + 0.5,
            a: 0.7 + Math.random() * 0.3,
            color: `hsl(${40 + Math.random() * 30}, 100%, 70%)`,
          });
        }
      });
    }

    function drawParticles() {
      particles = particles.filter((p) => p.a > 0.02);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `,${p.a})`).replace("hsl", "hsla");
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.a *= 0.95;
        p.r *= 0.96;
      });
    }

    function render() {
      time++;
      ctx.clearRect(0, 0, W, H);
      drawGalaxyBackground();
      drawStars();
      planets.forEach(drawPlanet);
      drawComets();
      drawParticles();

      if (time % 100 === 0) spawnComet();
      if (time === 1) {
        spawnComet();
        spawnComet();
        spawnComet();
      }

      animId = requestAnimationFrame(render);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();
    render();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}

// ─── Login Page (diseño mitad y mitad) ─────────────────────────────────────
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, ingresa tus credenciales.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await authService.login(email, password);
      if (res.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate("/dashboard");
      }
    } catch (err: any) {
      const backendError = err.response?.data?.message;
      let msg = "Error de autenticación. Verifica tus datos.";
      if (Array.isArray(backendError)) msg = backendError[0];
      else if (typeof backendError === "string") msg = backendError;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Exo 2', 'Segoe UI', sans-serif" }}
    >
      {/* Fondo espacial */}
      <div className="absolute inset-0 z-0">
        <SpaceCanvas />
      </div>

      {/* Contenedor principal (mitad y mitad) */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full h-full">
        {/* Lado izquierdo - Mensaje de aventura (50%) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start px-12 pl-20">
          <div className="max-w-lg">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-blue-300/80 mb-4">
              Bienvenido a bordo
            </p>
            <h1
              className="text-6xl font-black text-white leading-tight mb-6"
              style={{ textShadow: "0 0 30px rgba(59,130,246,0.5)" }}
            >
              Comienza tu
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Aventura Python
              </span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Explora el cosmos del código, domina desafíos galácticos y
              conviértete en un legendario explorador PyQuest.
            </p>
            <div className="flex gap-4">
              <div className="h-1 w-16 bg-blue-500/50 rounded-full"></div>
              <div className="h-1 w-8 bg-purple-500/30 rounded-full"></div>
              <div className="h-1 w-8 bg-indigo-500/20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Lado derecho - Formulario (50%) - Sin bordes redondeados a la derecha */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-0">
          <div
            className="w-full max-w-md p-8 sm:p-10"
            style={{
              background: "rgba(8, 12, 30, 0.8)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(100,160,255,0.2)",
              borderRight: "none", // para que se fusione con el borde derecho
              borderRadius: "28px 0 0 28px", // solo redondeado izquierdo
              boxShadow: "-10px 0 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Logo y título */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-lg blur-md"
                  style={{ background: "rgba(59,130,246,0.5)" }}
                />
                <div
                  className="relative w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                  }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
              </div>
              <span className="text-white font-bold text-2xl tracking-wider">
                PyQuest
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Iniciar sesión</h2>
            <p className="text-sm mb-8 text-blue-200/60">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Regístrate gratis
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 tracking-wider uppercase text-blue-300/70"
                  style={{ color: focused === "email" ? "#60a5fa" : undefined }}
                >
                  Correo electrónico
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-blue-500/20 text-white placeholder-transparent focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition"
                    style={{
                      background: focused === "email" ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
                    }}
                    placeholder="nombre@empresa.com"
                  />
                  {!email && (
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-blue-200/40 pointer-events-none">
                      nombre@empresa.com
                    </span>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-semibold mb-2 tracking-wider uppercase text-blue-300/70"
                  style={{ color: focused === "password" ? "#60a5fa" : undefined }}
                >
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400/60">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-blue-500/20 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition"
                    style={{
                      background: focused === "password" ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)",
                    }}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Recordarme */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-blue-500/30 bg-blue-500/10 accent-blue-500"
                />
                <label htmlFor="remember" className="text-xs text-blue-200/60">
                  Recordarme
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-red-500/10 border border-red-500/30 text-red-300">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Botón (sin emoji) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                style={{
                  background: loading
                    ? "rgba(59,130,246,0.5)"
                    : "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                  color: "#fff",
                  boxShadow: loading ? "none" : "0 4px 20px rgba(59,130,246,0.4)",
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Verificando...
                    </>
                  ) : (
                    <>
                      Iniciar Sesión
                      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* OAuth */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-blue-500/20" />
                <span className="text-xs text-blue-300/40">O continúa con</span>
                <div className="flex-1 h-px bg-blue-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "G", label: "Google", color: "#ea4335" },
                  { icon: "f", label: "Facebook", color: "#1877f2" },
                ].map(({ icon, label, color }) => (
                  <button
                    key={label}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 bg-white/5 border border-blue-500/20 text-blue-200/80 hover:bg-white/10 hover:border-blue-400/40"
                  >
                    <span className="font-black text-sm" style={{ color }}>
                      {icon}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}