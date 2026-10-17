// frontend/src/pages/Auth.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, PawPrint, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

interface AuthProps {
  initialMode?: 'login' | 'register';
}

export default function Auth({ initialMode = 'login' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validaciones en cliente
    if (mode === 'register') {
      if (!fullName.trim()) {
        setErrorMessage('Por favor ingresa tu nombre completo.');
        return;
      }
      if (!email.trim() || !password) {
        setErrorMessage('Todos los campos son obligatorios.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('La contraseña debe tener mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Por favor ingresa tu correo y contraseña.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const response = await registerUser(fullName, email, password);
        if (response.ok && response.user && response.token) {
          setSuccessMessage('¡Cuenta creada exitosamente en MongoDB Atlas! Iniciando sesión...');
          setAuth(response.user, response.token);
          setTimeout(() => {
            navigate('/inicio');
          }, 1200);
        }
      } else {
        const response = await loginUser(email, password);
        if (response.ok && response.user && response.token) {
          setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo...');
          setAuth(response.user, response.token);
          setTimeout(() => {
            navigate('/inicio');
          }, 800);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en la conexión con la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/60 via-white to-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_10px_35px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8">
        
        {/* LOGO Y ENCABEZADO */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 text-green-700 mb-3 shadow-inner">
            <PawPrint size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Planeta Huella
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login'
              ? 'Bienvenido de nuevo a cuidar a tus mascotas'
              : 'Crea tu cuenta para comenzar tus registros'}
          </p>
        </div>

        {/* SELECTOR DE MODO: INICIAR SESIÓN / CREAR CUENTA */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              mode === 'login'
                ? 'bg-white text-green-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
              mode === 'register'
                ? 'bg-white text-green-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* MENSAJES DE ERROR O ÉXITO */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* NOMBRE COMPLETO (Solo en Registro) */}
          {mode === 'register' && (
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 text-gray-400" size={19} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre completo"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>
          )}

          {/* CORREO ELECTRÓNICO */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={19} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={19} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Contraseña (mínimo 6 caracteres)' : 'Contraseña'}
              required
              className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* CONFIRMAR CONTRASEÑA (Solo en Registro) */}
          {mode === 'register' && (
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={19} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar contraseña"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>
          )}

          {/* BOTÓN DE ACCIÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Conectando con la base de datos...</span>
              </div>
            ) : (
              <>
                <span>{mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* PIE Y ENLACE DE CAMBIO */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {mode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta registrada?'}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-green-700 font-semibold hover:underline"
            >
              {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
            </button>
          </p>
        </div>

        {/* INDICADOR DE CONEXIÓN A BASE DE DATOS */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>MongoDB Atlas conectado en tiempo real</span>
        </div>

      </div>
    </div>
  );
}
