
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserInfo } from '../types';
import { signInWithGoogle, auth, sendEntityEmailVerification } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface RegistrationScreenProps {
  onRegister: (userInfo: UserInfo) => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Por favor introduce tu correo electrónico para restablecer la contraseña.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Se ha enviado un enlace para cambiar tu contraseña. ¡Revisa tu correo ahora! (No olvides chequear la carpeta de SPAM).');
      setError(null);
    } catch (err: any) {
      setError('Error al enviar el correo de restablecimiento: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // App.tsx onAuthStateChanged will handle the redirect
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing in con Google');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          setError('Debes verificar tu correo electrónico antes de iniciar sesión. Por favor, revisa tu bandeja de entrada (no olvides chequear la carpeta de spam).');
          auth.signOut();
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEntityEmailVerification(userCredential.user);
        setSuccess('¡Cuenta creada! Se ha enviado un enlace de verificación a tu correo. Por favor revísalo antes de entrar. (Revisa también en SPAM).');
        auth.signOut(); // Log them out so they have to verify and log back in
        setIsLoginMode(true);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('El email ya está en uso. Por favor inicia sesión.');
      } else {
        setError(err.message || 'Error de autenticación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col justify-center items-center overflow-x-hidden bg-background-light dark:bg-background-dark p-4">
      <div className="w-full max-w-sm flex flex-col items-center bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-2xl animate-fade-up">
        
        <div className="mb-8 flex justify-center animate-pop">
          <div className="size-24 bg-gradient-to-br from-primary to-blue-400 rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20">
            <span className="material-symbols-outlined text-white text-[48px]">calendar_month</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight mb-2">
            Turnos Rotativos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Organiza tus turnos rotativos y sincroniza tu vida en segundos.
          </p>
        </div>

        {error && (
          <div className="w-full bg-rose-100 text-rose-600 p-3 rounded-xl mb-4 text-sm text-center font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="w-full bg-emerald-100 text-emerald-700 p-3 rounded-xl mb-4 text-sm text-center font-medium">
            {success}
          </div>
        )}

        <div className="flex w-full mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
            onClick={() => setIsLoginMode(true)}
          >
            Iniciar Sesión
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
            onClick={() => setIsLoginMode(false)}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <input 
              type="password" 
              placeholder="Contraseña" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              required
            />
            {isLoginMode && (
              <div className="flex justify-end mt-1">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  ¿Has olvidado tu contraseña?
                </button>
              </div>
            )}
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? 'Cargando...' : (isLoginMode ? 'Entrar' : 'Crear cuenta')}
          </button>
        </form>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
          <span className="text-xs text-slate-400 font-medium font-sans">O continuar con</span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark px-6 h-12 text-sm font-bold text-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-[0.98] shadow-sm"
          >
            <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"/>
            <span>Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;
