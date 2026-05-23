import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // Para saber en qué página estamos y pintar el botón activo

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => location.pathname.startsWith(path);

  // Clases CSS para los botones del menú
  const baseMenuClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors";
  const activeMenuClass = `${baseMenuClass} bg-blue-600/10 text-blue-500 border-l-4 border-blue-500`;
  const inactiveMenuClass = `${baseMenuClass} text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-l-4 border-transparent`;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] font-sans overflow-hidden">
      
      {/* SIDEBAR PERSISTENTE */}
      <aside className="w-64 bg-[#0B1120] text-slate-400 flex flex-col justify-between flex-shrink-0 shadow-2xl z-20">
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span className="text-white font-bold text-xl tracking-wide">PyQuest</span>
          </div>

          <nav className="flex flex-col gap-2 px-4 mt-4">
            <Link to="/dashboard" className={isActive('/dashboard') ? activeMenuClass : inactiveMenuClass}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Dashboard
            </Link>
            <Link to="/progreso" className={isActive('/progreso') ? activeMenuClass : inactiveMenuClass}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              Mi Progreso
            </Link>
            <Link to="/unidades" className={isActive('/unidades') && !isActive('/unidades/') ? activeMenuClass : inactiveMenuClass}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Unidades
            </Link>
          </nav>
        </div>

        <div className="p-4 mb-4">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO DINÁMICO (AQUÍ SE INYECTAN LAS PÁGINAS) */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* HEADER PERSISTENTE */}
        <header className="flex items-center justify-end gap-6 px-10 py-5 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <span className="text-sm font-bold text-slate-600">Racha: <span className="text-orange-500">12 días</span></span>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-slate-800">Mi Perfil</p>
            </div>
            <Link to="/perfil" className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=c0aede" alt="Avatar" />
            </Link>
          </div>
        </header>

        {/* EL COMPONENTE OUTLET ES LA MAGIA: Aquí React pone el contenido de cada página */}
        <Outlet />

      </main>
    </div>
  );
}