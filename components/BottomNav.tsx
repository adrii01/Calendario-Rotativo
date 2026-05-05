
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  if (path === '/' || path === '/profile') return null;

  const NavItem = ({ to, icon, label, active }: { to: string; icon: string; label: string; active: boolean }) => (
    <Link to={to} className={`flex flex-1 flex-col items-center justify-center gap-1 h-full relative z-10 transition-colors duration-300 group ${active ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-primary/70'}`}>
      
      {active && (
        <motion.div 
          layoutId="bottom-nav-indicator"
          className="absolute inset-1 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"
          initial={false}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <div className={`transition-all duration-300 ${active ? 'scale-110' : 'group-active:scale-90'}`}>
        <span className={`material-symbols-outlined ${active ? 'fill' : 'transition-transform duration-300'}`}>{icon}</span>
      </div>
      
      <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${active ? 'font-bold scale-105' : 'opacity-80'}`}>{label}</span>
    </Link>
  );

  return (
    <>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg bg-white/95 dark:bg-[#192633]/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-1 h-16 relative">
          <NavItem to="/dashboard" icon="dashboard" label="Inicio" active={path === '/dashboard'} />
          <NavItem to="/month" icon="calendar_month" label="Mensual" active={path === '/month'} />
          <NavItem to="/week" icon="view_week" label="Semanal" active={path === '/week'} />
          <NavItem to="/config" icon="autorenew" label="Rotación" active={path === '/config'} />
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
