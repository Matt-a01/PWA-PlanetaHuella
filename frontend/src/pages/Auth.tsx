import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, PawPrint, AlertCircle, CheckCircle2, Heart } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import heroImg from '../assets/landing-hero.jpg';

interface AuthProps {
  initialMode?: 'login' | 'register';
}

export default function Auth({ initialMode = 'login' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    } else if (!email.trim() || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response =
        mode === 'register'
          ? await registerUser(fullName, email, password)
          : await loginUser(email, password);

      if (response.ok && response.user && response.token) {
        setSuccessMessage(
          mode === 'register'
            ? '¡Cuenta creada exitosamente! Redirigiendo...'
            : '¡Bienvenido de nuevo! Redirigiendo...'
        );
        setAuth(response.user, response.token);
        setTimeout(() => navigate('/inicio'), 800);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-b from-green-100/70 to-white pt-6 px-6 pb-3 text-center">
          <div className="inline-flex items-center gap-2 text-green-800 font-bold text-xl mb-1">
            <PawPrint size={24} className="text-green-700" />
            <span>PetCare • Planeta Huella</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Cuidado hoy, vidas más felices</p>

          <div className="relative mx-auto w-full h-36 rounded-2xl overflow-hidden shadow-xs border border-green-100">
            <img src={heroImg} alt="Mascotas felices" className="w-full h-full object-cover" />
          </div>

          <div className="flex justify-center gap-1.5 mt-3">
            <span className={`h-1.5 rounded-full transition-all ${mode === 'login' ? 'w-5 bg-green-700' : 'w-1.5 bg-gray-300'}`} />
            <span className={`h-1.5 rounded-full transition-all ${mode === 'register' ? 'w-5 bg-green-700' : 'w-1.5 bg-gray-300'}`} />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>

        <div className="p-6 pt-3">
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                mode === 'login' ? 'bg-white text-green-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                mode === 'register' ? 'bg-white text-green-800 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-green-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nombre completo"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar contraseña"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Conectando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-5">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink mx-3 text-xs text-gray-400">O continúa con</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => navigate('/inicio')}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="font-bold text-red-500">G</span> Google
              </button>
              <button
                type="button"
                onClick={() => navigate('/inicio')}
                className="flex-1 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="font-bold text-gray-900"></span> Apple
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-gray-500">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="text-green-700 font-semibold hover:underline"
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
            <p className="mt-3 text-[11px] text-gray-400 flex items-center justify-center gap-1">
              <span>Cuidamos cada momento</span>
              <Heart size={12} className="text-green-600 fill-green-600" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
