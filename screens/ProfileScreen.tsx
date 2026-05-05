
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '../types';
import BottomNav from '../components/BottomNav';
import { logoutGoogle, auth } from '../services/firebase';

interface ProfileScreenProps {
  user: UserInfo;
  onUpdate: (user: UserInfo) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onUpdate, onLogout, isDarkMode, onThemeToggle }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    await logoutGoogle();
    onLogout();
    navigate('/', { replace: true });
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Límite de 2MB para evitar saturar localStorage
        alert("La imagen es demasiado grande. Por favor elige una de menos de 2MB.");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = { ...user, avatarUrl: base64String };
        setFormData(updatedUser);
        onUpdate(updatedUser);
        setTimeout(() => setIsUploading(false), 500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-24 shadow-2xl bg-white dark:bg-background-dark min-h-screen">
        {/* Input de archivo oculto */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="flex items-center bg-white dark:bg-[#111a22]/95 backdrop-blur-md p-4 pb-2 justify-between sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 animate-fade-up">
        <button onClick={() => navigate(-1)} className="text-[#111418] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Perfil de Usuario</h2>
      </div>

      <div className="flex flex-col items-center px-4 py-8 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 mb-6 shadow-sm animate-fade-up stagger-1">
        <div className="relative mb-4 group">
          <div 
            className={`bg-center bg-no-repeat bg-cover rounded-full size-28 ring-4 ring-primary/10 shadow-xl transition-all duration-500 group-hover:ring-primary/40 group-hover:scale-105 ${isUploading ? 'opacity-50 blur-sm' : 'opacity-100'}`} 
            style={{backgroundImage: `url("${user.avatarUrl}")`}}
          ></div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <button 
            onClick={handlePhotoClick}
            className="absolute bottom-0 right-0 size-11 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-surface-dark hover:scale-110 active:scale-95 transition-all duration-300"
            title="Cambiar foto de perfil"
          >
            <span className="material-symbols-outlined text-[22px]">photo_camera</span>
          </button>
        </div>
        <h3 className="text-xl font-bold dark:text-white animate-pop">{user.name}</h3>
        <p className="text-slate-500 dark:text-[#9eaec0] text-sm">{user.email}</p>
      </div>

      <div className="flex flex-col gap-6 px-4 animate-fade-up stagger-2">
        {/* Profile Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Información Personal</h4>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="text-primary text-sm font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">edit</span> Editar
              </button>
            ) : (
              <button onClick={handleSave} className="text-green-600 text-sm font-bold flex items-center gap-1 hover:underline active:scale-95 transition-all">
                <span className="material-symbols-outlined text-sm">check</span> Guardar
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-3 bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-primary/20 transition-all">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Nombre Completo</label>
              {isEditing ? (
                <input 
                  className="bg-gray-50 dark:bg-[#1a2633] border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all animate-pop"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  autoFocus
                />
              ) : (
                <p className="text-sm font-semibold dark:text-white transition-all">{user.name}</p>
              )}
            </div>
            <div className="h-px bg-gray-50 dark:bg-gray-800"></div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Correo Electrónico (Solo Lectura)</label>
              <p className="text-sm font-semibold dark:text-white">{user.email}</p>
            </div>
            
            {auth.currentUser?.providerData[0]?.providerId === 'password' && (
              <>
                <div className="h-px bg-gray-50 dark:bg-gray-800"></div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Contraseña</label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold dark:text-white font-mono">
                      {showPassword ? '••••••••' : '••••••••'} 
                      <span className="text-[10px] text-slate-400 ml-2 font-sans normal-case">(No recuperable)</span>
                    </p>
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-primary active:scale-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Apariencia</h4>
          <button 
            onClick={onThemeToggle}
            className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm transition-all flex items-center justify-between group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined p-2 rounded-full transition-all ${isDarkMode ? 'text-amber-400 bg-amber-400/10' : 'text-blue-500 bg-blue-500/10'}`}>
                {isDarkMode ? 'dark_mode' : 'light_mode'}
              </span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Modo {isDarkMode ? 'Oscuro' : 'Claro'}
              </span>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex ${isDarkMode ? 'bg-primary justify-end' : 'bg-slate-200 justify-start'}`}>
              <div className="size-4 bg-white rounded-full shadow-sm"></div>
            </div>
          </button>
        </div>

        {/* Security / Account type */}
        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Seguridad</h4>
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm transition-all flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-2 rounded-full">lock</span>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Cuenta vinculada {(() => {
                  const provider = auth.currentUser?.providerData[0]?.providerId;
                  if (provider === 'google.com') return 'con Google';
                  if (provider === 'password') return 'por correo electrónico';
                  return '';
                })()}
              </span>
            </div>
            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
          </div>
        </div>

        {/* Logout */}
        <div className="flex flex-col gap-3 mt-4 animate-fade-up stagger-3">
          <button 
            onClick={handleLogoutClick}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold hover:bg-rose-500 hover:text-white active:scale-[0.98] transition-all duration-300 shadow-sm group"
          >
            <span className="material-symbols-outlined transition-transform group-hover:scale-110">logout</span>
            Cerrar Sesión
          </button>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
            <p className="text-[11px] text-slate-400 font-medium">Sincronizado a través de la nube</p>
            <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-dark w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-pop border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center animate-bounce">
                <span className="material-symbols-outlined text-3xl">logout</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold dark:text-white">Cerrar Sesión</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">¿Estás seguro de que deseas salir?</p>
              </div>
              <div className="flex flex-col w-full gap-2 mt-2">
                <button 
                  onClick={confirmLogout}
                  className="w-full py-3.5 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                >
                  Sí, cerrar sesión
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-3.5 bg-gray-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    );
};

export default ProfileScreen;
