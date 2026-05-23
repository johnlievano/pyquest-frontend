import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/auth.service";

// ── SpaceCanvas con anillos correctos (por encima del planeta) ──
function SpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let animId: number;
    let W = 0, H = 0;
    let stars: { x: number; y: number; r: number; twinkle: number; speed: number }[] = [];
    let comets: { x: number; y: number; vx: number; vy: number; len: number; life: number; maxLife: number }[] = [];
    let particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; color: string }[] = [];
    let time = 0;

    const planets = [
      { rx: 0.74, ry: 0.20, size: 0.13, colorA: "#1a0a40", colorB: "#c850c0", rings: true,  ringTilt: 0.28, moons: 1 },
      { rx: 0.90, ry: 0.68, size: 0.065, colorA: "#0b1f40", colorB: "#43cea2", rings: false, ringTilt: 0,    moons: 0 },
      { rx: 0.62, ry: 0.78, size: 0.038, colorA: "#1a1a2e", colorB: "#e96c4a", rings: false, ringTilt: 0,    moons: 0 },
    ];

    function resize() {
      W = canvas!.width = canvas!.offsetWidth;
      H = canvas!.height = canvas!.offsetHeight;
      stars = Array.from({ length: 220 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.6 + 0.3,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.004 + 0.001,
      }));
    }

    function spawnComet() {
      const fromTop = Math.random() > 0.5;
      const x = fromTop ? Math.random() * W : -20;
      const y = fromTop ? -20 : Math.random() * H * 0.5;
      const angle = fromTop ? Math.PI / 4 + (Math.random() - 0.5) * 0.4 : Math.PI / 6 + (Math.random() - 0.5) * 0.3;
      const speed = 6 + Math.random() * 5;
      const life = 60 + Math.random() * 60;
      comets.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, len: 80 + Math.random() * 80, life, maxLife: life });
    }

    function drawBackground() {
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#130d2e"); bg.addColorStop(0.4, "#0a0a1e"); bg.addColorStop(1, "#05050f");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      [
        { x: W * 0.75, y: H * 0.25, r: W * 0.35, c0: "rgba(110,30,180,0.20)" },
        { x: W * 0.2,  y: H * 0.75, r: W * 0.28, c0: "rgba(30,80,180,0.14)" },
        { x: W * 0.5,  y: H * 0.9,  r: W * 0.22, c0: "rgba(180,40,120,0.10)" },
      ].forEach((n) => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, n.c0); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
    }

    function drawStars() {
      stars.forEach((s) => {
        s.twinkle += s.speed;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.6 * Math.abs(Math.sin(s.twinkle))})`; ctx.fill();
      });
    }

    // Dibuja SOLO el cuerpo del planeta (sin anillos)
    function drawPlanetBody(p: typeof planets[0]) {
      const px = p.rx * W, py = p.ry * H, pr = p.size * Math.min(W, H);
      // Atmósfera
      const atmo = ctx.createRadialGradient(px, py, pr * 0.7, px, py, pr * 1.6);
      atmo.addColorStop(0, p.colorB + "55"); atmo.addColorStop(1, "transparent");
      ctx.fillStyle = atmo; ctx.beginPath(); ctx.arc(px, py, pr * 1.6, 0, Math.PI * 2); ctx.fill();
      // Esfera
      const grad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr);
      grad.addColorStop(0, p.colorB); grad.addColorStop(0.5, p.colorA); grad.addColorStop(1, "#050810");
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      // Bandas y brillo
      ctx.save(); ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.clip();
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.022 - i * 0.003})`;
        ctx.fillRect(px - pr, py - pr + ((pr * 2) / 5) * i + pr * 0.1, pr * 2, pr * 0.18);
      }
      const shine = ctx.createRadialGradient(px - pr * 0.35, py - pr * 0.35, 0, px - pr * 0.2, py - pr * 0.2, pr * 0.7);
      shine.addColorStop(0, "rgba(255,255,255,0.22)"); shine.addColorStop(1, "transparent");
      ctx.fillStyle = shine; ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2); ctx.restore();
    }

    // Dibuja la mitad TRASERA del anillo (debajo del planeta)
    function drawRingBack(p: typeof planets[0]) {
      if (!p.rings) return;
      const px = p.rx * W, py = p.ry * H, pr = p.size * Math.min(W, H);
      const ro = pr * 1.75, ri = pr * 1.2;
      ctx.save(); ctx.translate(px, py); ctx.scale(1, p.ringTilt);
      const rg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro);
      rg.addColorStop(0, "rgba(200,150,255,0.60)");
      rg.addColorStop(0.5, "rgba(160,100,220,0.35)");
      rg.addColorStop(1, "transparent");
      ctx.strokeStyle = rg; ctx.lineWidth = ro - ri;
      // Solo la mitad inferior (parte trasera = π a 2π)
      ctx.beginPath(); ctx.arc(0, 0, (ri + ro) / 2, Math.PI, Math.PI * 2);
      ctx.stroke(); ctx.restore();
    }

    // Dibuja la mitad DELANTERA del anillo (encima del planeta)
    function drawRingFront(p: typeof planets[0]) {
      if (!p.rings) return;
      const px = p.rx * W, py = p.ry * H, pr = p.size * Math.min(W, H);
      const ro = pr * 1.75, ri = pr * 1.2;
      ctx.save(); ctx.translate(px, py); ctx.scale(1, p.ringTilt);
      const rg = ctx.createRadialGradient(0, 0, ri, 0, 0, ro);
      rg.addColorStop(0, "rgba(200,150,255,0.60)");
      rg.addColorStop(0.5, "rgba(160,100,220,0.35)");
      rg.addColorStop(1, "transparent");
      ctx.strokeStyle = rg; ctx.lineWidth = ro - ri;
      // Solo la mitad superior (parte delantera = 0 a π)
      ctx.beginPath(); ctx.arc(0, 0, (ri + ro) / 2, 0, Math.PI);
      ctx.stroke(); ctx.restore();
    }

    function drawMoon(p: typeof planets[0]) {
      if (!p.moons) return;
      const px = p.rx * W, py = p.ry * H, pr = p.size * Math.min(W, H);
      const mAngle = time * 0.009;
      const mx = px + Math.cos(mAngle) * pr * 2.3;
      const my = py + Math.sin(mAngle) * pr * 0.45 * 2.3;
      const mr = pr * 0.18;
      const mg = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr);
      mg.addColorStop(0, "#d4b8e0"); mg.addColorStop(1, "#3a2850");
      ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fillStyle = mg; ctx.fill();
    }

    function drawComets() {
      comets = comets.filter((c) => c.life > 0);
      comets.forEach((c) => {
        const p = c.life / c.maxLife;
        const tail = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * (c.len / 6), c.y - c.vy * (c.len / 6));
        tail.addColorStop(0, `rgba(220,180,255,${p * 0.9})`);
        tail.addColorStop(0.4, `rgba(180,120,255,${p * 0.4})`);
        tail.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * (c.len / 6), c.y - c.vy * (c.len / 6));
        ctx.strokeStyle = tail; ctx.lineWidth = 2 * p; ctx.stroke();
        const hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 4);
        hg.addColorStop(0, `rgba(255,255,255,${p})`); hg.addColorStop(1, "transparent");
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(c.x, c.y, 4, 0, Math.PI * 2); ctx.fill();
        c.x += c.vx; c.y += c.vy; c.life--;
        if (Math.random() > 0.5) particles.push({
          x: c.x, y: c.y,
          vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
          r: Math.random() * 1.5 + 0.5, a: 0.6 + Math.random() * 0.4,
          color: `hsl(${260 + Math.random() * 60},90%,80%)`,
        });
      });
    }

    function drawParticles() {
      particles = particles.filter((p) => p.a > 0.01);
      particles.forEach((p) => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `,${p.a})`).replace("hsl", "hsla"); ctx.fill();
        p.x += p.vx; p.y += p.vy; p.a *= 0.94; p.r *= 0.97;
      });
    }

    function render() {
      time++;
      ctx.clearRect(0, 0, W, H);
      drawBackground();
      drawStars();

      // Orden correcto para anillos 3D:
      // 1. Mitad trasera del anillo (debajo del planeta)
      // 2. Cuerpo del planeta
      // 3. Luna
      // 4. Mitad delantera del anillo (encima del planeta)
      planets.forEach(drawRingBack);
      planets.forEach(drawPlanetBody);
      planets.forEach(drawMoon);
      planets.forEach(drawRingFront);

      drawComets();
      drawParticles();
      if (time % 120 === 0) spawnComet();
      if (time === 1) { spawnComet(); spawnComet(); }
      animId = requestAnimationFrame(render);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas); resize(); render();
    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// ── Iconos SVG profesionales ───────────────────────────────────
const IcoUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);
const IcoMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);
const IcoLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);
const IcoAlert = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
  </svg>
);
const IcoSpin = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);
const IcoRocket = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
  </svg>
);
const IcoStar = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);
const IcoFire = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
  </svg>
);
const IcoGoogle = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#ea4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
    <path fill="#34a853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3L16.04 18.013Z"/>
    <path fill="#4a90e2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
    <path fill="#fbbc05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
  </svg>
);
const IcoFacebook = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877f2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z"/>
  </svg>
);

// ── Register ───────────────────────────────────────────────────
export default function Register() {
  const [nombre, setNombre]     = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) { setError("Por favor, completa todos los campos."); return; }
    try {
      setLoading(true); setError(null);
      const res = await authService.register({ nombre, email, password } as any);
      if (res.success) navigate("/login");
    } catch (err: any) {
      const be = err.response?.data?.message;
      let msg = "Error al registrar. Revisa los datos.";
      if (Array.isArray(be)) msg = be[0];
      else if (typeof be === "string") msg = be;
      setError(msg);
    } finally { setLoading(false); }
  };

  const fields = [
    { id: "nombre",   label: "Nombre Completo",     type: "text",     val: nombre,   set: setNombre,   ph: "Ana García",           icon: <IcoUser /> },
    { id: "email",    label: "Correo Electrónico",   type: "email",    val: email,    set: setEmail,    ph: "nombre@empresa.com",   icon: <IcoMail /> },
    { id: "password", label: "Contraseña",           type: "password", val: password, set: setPassword, ph: "Mínimo 8 caracteres",  icon: <IcoLock /> },
  ];

  const features = [
    { icon: <IcoRocket />, title: "Aprende haciendo",  desc: "Ejercicios reales con Python desde cero" },
    { icon: <IcoStar />,   title: "Sistema de XP",     desc: "Sube de nivel y desbloquea nuevas misiones" },
    { icon: <IcoFire />,   title: "Rachas diarias",    desc: "Consolida el aprendizaje cada día" },
  ];

  return (
    <div className="relative flex h-screen w-full overflow-hidden" style={{ fontFamily: "'Exo 2', 'Segoe UI', sans-serif" }}>
      {/* Canvas fondo */}
      <div className="absolute inset-0 z-0"><SpaceCanvas /></div>

      <div className="relative z-10 flex w-full h-full">

        {/* ── IZQUIERDA: formulario ── */}
        <div className="flex items-center justify-center w-full lg:w-[48%] px-4 sm:px-8">
          <div
            className="w-full rounded-2xl"
            style={{
              maxWidth: "420px",
              padding: "clamp(1.25rem, 3vw, 2.5rem)",
              background: "rgba(10,6,25,0.75)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(160,100,255,0.18)",
              boxShadow: "0 8px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg blur-md" style={{ background: "rgba(139,92,246,0.5)" }} />
                <div className="relative w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)" }}>
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                </div>
              </div>
              <span className="text-white font-bold text-lg tracking-widest">PyQuest</span>
            </div>

            <h1 className="font-bold text-white mb-1" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)" }}>Crear cuenta</h1>
            <p className="text-xs mb-5" style={{ color: "rgba(200,180,255,0.55)" }}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="font-semibold" style={{ color: "#a78bfa" }}>Inicia sesión</Link>
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {fields.map((f) => (
                <div key={f.id}>
                  <label className="block text-xs font-semibold mb-1 tracking-widest uppercase"
                    style={{ color: focused === f.id ? "#a78bfa" : "rgba(190,170,255,0.6)", transition: "color 0.2s" }}>
                    {f.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: focused === f.id ? "#a78bfa" : "rgba(150,120,200,0.5)" }}>
                      {f.icon}
                    </span>
                    <input
                      type={f.type} value={f.val}
                      onChange={(e) => f.set(e.target.value)}
                      onFocus={() => setFocused(f.id)} onBlur={() => setFocused(null)}
                      placeholder={f.ph}
                      className="w-full pl-10 pr-4 text-sm text-white outline-none transition-all duration-200"
                      style={{
                        padding: "0.6rem 0.75rem 0.6rem 2.5rem",
                        borderRadius: "0.75rem",
                        background: focused === f.id ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${focused === f.id ? "rgba(167,139,250,0.6)" : "rgba(140,100,220,0.18)"}`,
                        boxShadow: focused === f.id ? "0 0 20px rgba(139,92,246,0.15)" : "none",
                      }}
                    />
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                  <IcoAlert />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full font-bold text-sm tracking-widest uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  padding: "0.7rem",
                  borderRadius: "0.75rem",
                  background: loading ? "rgba(139,92,246,0.5)" : "linear-gradient(135deg,#8b5cf6 0%,#ec4899 100%)",
                  color: "#fff",
                  boxShadow: loading ? "none" : "0 4px 24px rgba(139,92,246,0.4)",
                }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2"><IcoSpin />Procesando...</span>
                  : "Crear mi Cuenta"}
              </button>
            </form>

            {/* OAuth */}
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px" style={{ background: "rgba(140,100,220,0.15)" }} />
                <span className="text-xs" style={{ color: "rgba(190,170,255,0.4)" }}>O continúa con</span>
                <div className="flex-1 h-px" style={{ background: "rgba(140,100,220,0.15)" }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <IcoGoogle />,   label: "Google",   hoverBg: "rgba(234,67,53,0.1)",  hoverBorder: "rgba(234,67,53,0.35)" },
                  { icon: <IcoFacebook />, label: "Facebook", hoverBg: "rgba(24,119,242,0.1)", hoverBorder: "rgba(24,119,242,0.35)" },
                ].map(({ icon, label, hoverBg, hoverBorder }) => (
                  <button key={label}
                    className="flex items-center justify-center gap-2 text-xs font-semibold transition-all duration-150"
                    style={{ padding: "0.55rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(140,100,220,0.18)", color: "rgba(210,200,255,0.8)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg; (e.currentTarget as HTMLButtonElement).style.borderColor = hoverBorder; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(140,100,220,0.18)"; }}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center" style={{ fontSize: "0.7rem", color: "rgba(160,145,200,0.45)" }}>
                Al registrarte aceptas nuestros{" "}
                <span className="underline cursor-pointer" style={{ color: "rgba(167,139,250,0.7)" }}>Términos y Condiciones</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── DERECHA: planetas + features (solo desktop) ── */}
        <div className="hidden lg:flex flex-col items-center justify-center w-[52%] relative select-none px-10">
          {/* Features */}
          <div className="flex flex-col gap-3 w-full max-w-sm mt-auto mb-8">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-4 px-5 py-3 rounded-2xl"
                style={{ background: "rgba(10,6,25,0.55)", backdropFilter: "blur(12px)", border: "1px solid rgba(160,100,255,0.15)" }}>
                <div style={{ color: "#a78bfa" }}>{f.icon}</div>
                <div>
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "rgba(190,170,255,0.55)" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <div className="text-right self-end mb-8 mr-2">
            <p className="text-xs font-semibold tracking-[0.35em] uppercase mb-1" style={{ color: "rgba(200,150,255,0.7)" }}>Únete a la</p>
            <h2 className="font-black text-white leading-none" style={{ fontSize: "clamp(2rem,4vw,3rem)", textShadow: "0 0 40px rgba(180,100,255,0.6)" }}>
              MISIÓN<br />
              <span style={{ WebkitTextStroke: "1px rgba(200,120,255,0.8)", color: "transparent" }}>PYTHON</span>
            </h2>
          </div>
        </div>

      </div>
    </div>
  );
}