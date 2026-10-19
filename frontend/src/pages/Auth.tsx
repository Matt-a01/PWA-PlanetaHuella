// frontend/src/pages/Auth.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  PawPrint,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import landingHero from '../assets/landing-hero.jpg';

interface AuthProps {
  initialMode?: 'login' | 'register';
}

export default function Auth({ initialMode = 'login' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  // Estados del formulario (misma lógica original)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de interfaz
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
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decoración orgánica suave de fondo */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 rounded-full bg-green-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_14px_40px_rgba(21,128,61,0.08)] border border-green-100/80 overflow-hidden z-10">

        {/* BANNER HERO SUPERIOR OPTIMIZADO */}
        <div className="relative h-36 bg-[#F3F7F0] flex items-center justify-between px-6 overflow-hidden border-b border-green-50">
          <div className="z-10 max-w-[58%]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-700 text-white text-xs font-bold mb-1.5 shadow-xs">
              <PawPrint size={13} />
              <span>PetCare • Planeta Huella</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">
              Cuidado hoy, vidas más felices
            </h1>
          </div>

          <img
            src={landingHero}
            alt="Mascotas Planeta Huella"
            className="w-36 h-36 object-cover rounded-2xl translate-y-2 shadow-sm border-2 border-white"
          />
        </div>

        <div className="p-6 sm:p-7">
          {/* Indicador de pasos estilo diseño móvil */}
          <div className="flex justify-center items-center gap-1.5 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600" />
            <span className="w-2 h-2 rounded-full bg-green-200" />
            <span className="w-2 h-2 rounded-full bg-gray-200" />
            <span className="w-2 h-2 rounded-full bg-gray-200" />
          </div>

          {/* TÍTULO DINÁMICO */}
          <div className="text-center mb-5">
            <h2 className="text-2xl font-extrabold text-gray-900">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {mode === 'login'
                ? 'Bienvenido de nuevo a cuidar a tus mascotas'
                : 'Únete a PetCare y comienza a cuidar mejor a tus mascotas'}
            </p>
          </div>

          {/* SELECTOR DE MODO */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${mode === 'login'
                ? 'bg-white text-green-800 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${mode === 'register'
                ? 'bg-white text-green-800 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* ALERTAS DE ERROR O ÉXITO */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-green-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Pérez"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 ml-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 active:bg-green-900 text-white font-semibold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Conectando con la base de datos...</span>
                </div>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Iniciar Sesión' : 'Registrarme'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* SEPARADOR Y BOTONES SOCIALES (Imagen 3) */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full absolute" />
              <span className="bg-white px-3 text-xs text-gray-400 relative">
                {mode === 'login' ? 'O continúa con' : 'O regístrate con'}
              </span>
            </div>

            <div className="flex gap-3 mt-3.5">
              <button
                type="button"
                className="flex-1 py-2.5 border border-gray-200 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
              >
                <span className="font-extrabold text-sm text-red-500">G</span>
                <span>Google</span>
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 border border-gray-200 rounded-xl flex justify-center items-center gap-2 hover:bg-gray-50 text-xs font-semibold text-gray-800 transition-colors"
              >
                <span className="font-bold text-sm"></span>
                <span>Apple</span>
              </button>
            </div>
          </div>

          {/* ENLACE INFERIOR */}
          <div className="mt-5 text-center">
            <p className="text-xs text-gray-500">
              {mode === 'login' ? '¿No tienes una cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-green-700 font-semibold hover:underline cursor-pointer"
              >
                {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          {/* PIE E INDICADOR DE CONEXIÓN */}
          <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span>Cuidamos cada momento</span>
              <Heart size={11} className="text-rose-500 fill-rose-500" />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>MongoDB Atlas</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}