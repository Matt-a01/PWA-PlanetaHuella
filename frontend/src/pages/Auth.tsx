import {
  useState,
  useEffect,
  useRef,
  type FormEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react';
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
  Heart,
  Info,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  loginUser,
  registerUser,
  verifyEmailCode,
  resendVerificationCode,
  requestPasswordReset,
  resetPasswordWithCode,
  oauthLogin,
} from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import ModalVentana from '../components/ModalVentana';
import heroImg from '../assets/landing-hero.jpg';

type AuthViewMode =
  | 'login'
  | 'register'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password';

interface AuthProps {
  initialMode?: 'login' | 'register';
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
  }
}

const cargarScriptExterno = (src: string, id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar el SDK (${src}).`));
    document.head.appendChild(script);
  });

const calcularNivelContrasena = (
  clave: string
): { etiqueta: string; colorBarra: string; porcentaje: string } => {
  if (!clave) return { etiqueta: '', colorBarra: 'bg-gray-200', porcentaje: 'w-0' };
  let puntos = 0;
  if (clave.length >= 6) puntos += 1;
  if (clave.length >= 10) puntos += 1;
  if (/[A-Z]/.test(clave) && /[a-z]/.test(clave)) puntos += 1;
  if (/\d/.test(clave) || /[^A-Za-z0-9]/.test(clave)) puntos += 1;

  if (puntos <= 1) {
    return { etiqueta: 'Débil', colorBarra: 'bg-red-500', porcentaje: 'w-1/4' };
  }
  if (puntos === 2) {
    return { etiqueta: 'Media', colorBarra: 'bg-amber-500', porcentaje: 'w-2/4' };
  }
  if (puntos === 3) {
    return { etiqueta: 'Buena', colorBarra: 'bg-green-500', porcentaje: 'w-3/4' };
  }
  return { etiqueta: 'Fuerte', colorBarra: 'bg-green-700', porcentaje: 'w-full' };
};

export default function Auth({ initialMode = 'login' }: AuthProps) {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado para el código OTP de 6 dígitos (verificación y recuperación)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [cooldownSegundos, setCooldownSegundos] = useState(0);

  // Previsualización de correo cuando el servidor opera en modo simulación sin SMTP
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);
  const [devEmailHtml, setDevEmailHtml] = useState<string | null>(null);
  const [modalCorreoAbierto, setModalCorreoAbierto] = useState(false);

  // Modal de inicio de sesión social (Google)
  const [modalGoogleAbierto, setModalGoogleAbierto] = useState(false);
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthNombre, setOauthNombre] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldownSegundos <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSegundos((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSegundos]);

  const limpiarMensajes = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setInfoMessage(null);
  };

  const reiniciarOtp = () => {
    setOtpDigits(['', '', '', '', '', '']);
  };

  const switchMode = (newMode: AuthViewMode) => {
    setMode(newMode);
    limpiarMensajes();
    if (newMode === 'login' || newMode === 'register') {
      setDevOtpPreview(null);
      setDevEmailHtml(null);
    }
  };

  const manejarCambioDigitoOtp = (index: number, valorRaw: string) => {
    const soloDigito = valorRaw.replace(/\D/g, '').slice(-1);
    const nuevos = [...otpDigits];
    nuevos[index] = soloDigito;
    setOtpDigits(nuevos);

    if (soloDigito && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const manejarTeclaOtp = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const manejarPegadoOtp = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pegado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pegado) return;
    const nuevos = ['', '', '', '', '', ''];
    for (let i = 0; i < pegado.length; i += 1) {
      nuevos[i] = pegado[i] ?? '';
    }
    setOtpDigits(nuevos);
    const focoIdx = Math.min(pegado.length, 5);
    otpRefs.current[focoIdx]?.focus();
  };

  const autocompletarCodigoDemo = (codigo: string) => {
    const limpio = codigo.replace(/\D/g, '').slice(0, 6);
    if (limpio.length !== 6) return;
    setOtpDigits(limpio.split(''));
  };

  // ==================== ENVÍO DE LOGIN Y REGISTRO ====================

  const handleSubmitLoginRegister = async (e: FormEvent) => {
    e.preventDefault();
    limpiarMensajes();

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

      if (response.requiresVerification) {
        reiniciarOtp();
        setCooldownSegundos(60);
        setDevOtpPreview(response.devCode ?? null);
        setDevEmailHtml(response.devEmailHtml ?? null);
        setMode('verify-email');
        setInfoMessage(
          response.message ||
            response.error ||
            'Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.'
        );
        return;
      }

      if (response.ok && response.user && response.token) {
        setSuccessMessage('¡Bienvenido! Redirigiendo...');
        setAuth(response.user, response.token);
        setTimeout(() => navigate('/inicio', { replace: true }), 350);
      } else {
        setErrorMessage(
          response.error || 'No se pudo completar la autenticación con el servidor.'
        );
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error en la conexión con el servidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== VERIFICACIÓN DE CORREO (OTP 6 DÍGITOS) ====================

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    limpiarMensajes();

    const codigoCompleto = otpDigits.join('');
    if (codigoCompleto.length !== 6) {
      setErrorMessage('Ingresa los 6 dígitos del código de verificación.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyEmailCode(email, codigoCompleto);
      if (res.ok && res.user && res.token) {
        setSuccessMessage(res.message || '¡Correo verificado! Entrando a tu cuenta...');
        setAuth(res.user, res.token);
        setTimeout(() => navigate('/inicio', { replace: true }), 400);
      } else {
        setErrorMessage(res.error || 'No se pudo verificar el código.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Código de verificación inválido.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (cooldownSegundos > 0 || loading) return;
    limpiarMensajes();
    setLoading(true);
    try {
      const res = await resendVerificationCode(email);
      if (res.ok) {
        reiniciarOtp();
        setCooldownSegundos(60);
        setDevOtpPreview(res.devCode ?? null);
        setDevEmailHtml(res.devEmailHtml ?? null);
        setSuccessMessage(
          res.message || 'Hemos enviado un nuevo código de 6 dígitos a tu correo.'
        );
      } else {
        setErrorMessage(res.error || 'No se pudo reenviar el código.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al reenviar el código.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== RECUPERACIÓN Y RESETEO DE CONTRASEÑA ====================

  const handleRequestPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    limpiarMensajes();

    if (!email.trim()) {
      setErrorMessage('Ingresa el correo electrónico de tu cuenta.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.ok) {
        reiniciarOtp();
        setPassword('');
        setConfirmPassword('');
        setCooldownSegundos(60);
        setDevOtpPreview(res.devCode ?? null);
        setDevEmailHtml(res.devEmailHtml ?? null);
        setMode('reset-password');
        setInfoMessage(
          res.message ||
            'Enviamos un código de 6 dígitos a tu correo para restablecer tu contraseña.'
        );
      } else {
        setErrorMessage(res.error || 'No se pudo procesar la solicitud.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'No se pudo enviar el código de recuperación.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    limpiarMensajes();

    const codigoCompleto = otpDigits.join('');
    if (codigoCompleto.length !== 6) {
      setErrorMessage('Ingresa los 6 dígitos del código de recuperación.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPasswordWithCode(email, codigoCompleto, password);
      if (res.ok && res.user && res.token) {
        setSuccessMessage(
          res.message || '¡Contraseña actualizada! Iniciando sesión...'
        );
        setAuth(res.user, res.token);
        setTimeout(() => navigate('/inicio', { replace: true }), 450);
      } else {
        setErrorMessage(res.error || 'No se pudo restablecer la contraseña.');
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al actualizar la contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== INICIO DE SESIÓN CON GOOGLE ====================

  const iniciarOAuthConGoogle = async () => {
    limpiarMensajes();
    const googleClientId = (
      (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? ''
    ).trim();

    if (!googleClientId) {
      setOauthEmail(email);
      setOauthNombre(fullName);
      setModalGoogleAbierto(true);
      return;
    }

    setLoading(true);
    try {
      await cargarScriptExterno(
        'https://accounts.google.com/gsi/client',
        'google-gsi-sdk'
      );

      const oauth2 = window.google?.accounts?.oauth2;
      if (!oauth2) {
        throw new Error('El SDK de Google Identity Services no está disponible.');
      }

      const tokenClient = oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setLoading(false);
            setErrorMessage('Se canceló la selección de cuenta de Google.');
            return;
          }

          try {
            const res = await oauthLogin({
              provider: 'google',
              accessToken: tokenResponse.access_token,
            });
            if (res.ok && res.user && res.token) {
              setSuccessMessage('¡Conectado con tu cuenta de Google!');
              setAuth(res.user, res.token);
              setTimeout(() => navigate('/inicio', { replace: true }), 350);
            } else {
              setErrorMessage(res.error || 'No se pudo autenticar con Google.');
            }
          } catch (err) {
            setErrorMessage(
              err instanceof Error ? err.message : 'Error al iniciar sesión con Google.'
            );
          } finally {
            setLoading(false);
          }
        },
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setLoading(false);
      setErrorMessage(
        err instanceof Error ? err.message : 'No se pudo abrir Google Sign-In.'
      );
    }
  };

  const confirmarModalOAuthAsistido = async (e: FormEvent) => {
    e.preventDefault();

    const correoLimpio = oauthEmail.trim().toLowerCase();
    if (!correoLimpio || !correoLimpio.includes('@')) {
      setErrorMessage('Ingresa un correo electrónico válido de tu cuenta de Google.');
      return;
    }

    setLoading(true);
    try {
      const res = await oauthLogin({
        provider: 'google',
        email: correoLimpio,
        fullName: oauthNombre.trim() || undefined,
      });

      if (res.ok && res.user && res.token) {
        setModalGoogleAbierto(false);
        setSuccessMessage('¡Sesión iniciada con Google!');
        setAuth(res.user, res.token);
        setTimeout(() => navigate('/inicio', { replace: true }), 350);
      } else {
        setErrorMessage(res.error || 'No se pudo iniciar sesión con Google.');
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al vincular la cuenta de Google.'
      );
    } finally {
      setLoading(false);
    }
  };

  const nivelClave = calcularNivelContrasena(password);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
        {/* Cabecera Visual */}
        <div className="bg-gradient-to-b from-green-100/70 to-white pt-6 px-6 pb-3 text-center">
          <div className="inline-flex items-center gap-2 text-green-800 font-bold text-xl mb-1">
            <PawPrint size={24} className="text-green-700" />
            <span>PetCare • Planeta Huella</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">Cuidado hoy, vidas más felices</p>

          <div className="relative mx-auto w-full h-32 rounded-2xl overflow-hidden shadow-xs border border-green-100">
            <img
              src={heroImg}
              alt="Mascotas felices"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex justify-center gap-1.5 mt-3">
            <span
              className={`h-1.5 rounded-full transition-all ${
                mode === 'login' ? 'w-5 bg-green-700' : 'w-1.5 bg-gray-300'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                mode === 'register' || mode === 'verify-email'
                  ? 'w-5 bg-green-700'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all ${
                mode === 'forgot-password' || mode === 'reset-password'
                  ? 'w-5 bg-green-700'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          </div>
        </div>

        <div className="p-6 pt-3">
          {/* Selector principal en vistas de Login y Registro */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-green-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white text-green-800 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Crear Cuenta
              </button>
            </div>
          )}

          {/* Alertas de estado */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <Info size={16} className="shrink-0 text-amber-600" />
              <span>{infoMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-green-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ==================== VISTA 1 y 2: LOGIN / REGISTRO ==================== */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <form onSubmit={handleSubmitLoginRegister} className="space-y-3.5">
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

                <div>
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
                      className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label="Mostrar u ocultar contraseña"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Enlace de recuperación de contraseña en Login */}
                  {mode === 'login' && (
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => switchMode('forgot-password')}
                        className="text-xs font-semibold text-green-700 hover:text-green-800 hover:underline cursor-pointer"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}

                  {/* Indicador de fortaleza de contraseña en Registro */}
                  {mode === 'register' && password.length > 0 && (
                    <div className="mt-2 px-1">
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>Seguridad de la contraseña</span>
                        <span className="font-semibold text-gray-700">
                          {nivelClave.etiqueta}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${nivelClave.colorBarra} ${nivelClave.porcentaje}`}
                        />
                      </div>
                    </div>
                  )}
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
                  {loading
                    ? 'Procesando...'
                    : mode === 'login'
                      ? 'Iniciar sesión'
                      : 'Crear cuenta y verificar correo'}
                </button>
              </form>

              {/* Botón OAuth: Google */}
              <div className="mt-5">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink mx-3 text-xs text-gray-400">
                    O continúa con
                  </span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void iniciarOAuthConGoogle()}
                    className="w-full py-2.5 px-4 border border-gray-200 hover:border-green-300 hover:bg-green-50/40 rounded-xl text-xs font-semibold text-gray-700 bg-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#EA4335"
                        d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-gray-500">
                  {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                  <button
                    type="button"
                    onClick={() =>
                      switchMode(mode === 'login' ? 'register' : 'login')
                    }
                    className="text-green-700 font-semibold hover:underline cursor-pointer"
                  >
                    {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ==================== VISTA 3: VERIFICAR CORREO (OTP 6 DÍGITOS) ==================== */}
          {mode === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Verifica tu correo electrónico
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Enviamos un código de 6 dígitos a{' '}
                  <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              {/* Casillas OTP de 6 dígitos */}
              <div className="flex justify-center gap-2 py-2">
                {otpDigits.map((digito, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digito}
                    onChange={(e) => manejarCambioDigitoOtp(idx, e.target.value)}
                    onKeyDown={(e) => manejarTeclaOtp(idx, e)}
                    onPaste={manejarPegadoOtp}
                    aria-label={`Dígito ${idx + 1} del código`}
                    className="w-11 h-13 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 focus:bg-white text-gray-900"
                  />
                ))}
              </div>

              {/* Previsualización en Modo Desarrollo cuando aún no hay SMTP configurado */}
              {devOtpPreview && (
                <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold inline-flex items-center gap-1 text-emerald-800">
                      <Sparkles size={14} /> Código generado (Modo Pruebas):
                    </span>
                    <span className="font-mono font-extrabold text-sm tracking-widest bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {devOtpPreview}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => autocompletarCodigoDemo(devOtpPreview)}
                      className="flex-1 py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Autocompletar código
                    </button>
                    {devEmailHtml && (
                      <button
                        type="button"
                        onClick={() => setModalCorreoAbierto(true)}
                        className="flex-1 py-1.5 px-2.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Ver diseño del correo
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Verificando...' : 'Verificar cuenta y entrar'}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Volver</span>
                </button>

                <button
                  type="button"
                  disabled={cooldownSegundos > 0 || loading}
                  onClick={() => void handleResendVerification()}
                  className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                >
                  <RefreshCw size={13} />
                  <span>
                    {cooldownSegundos > 0
                      ? `Reenviar en ${cooldownSegundos}s`
                      : 'Reenviar código'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* ==================== VISTA 4: SOLICITAR RECUPERACIÓN ==================== */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Recuperar contraseña
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos
                  para restablecer tu acceso.
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico registrado"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Enviando código...' : 'Enviar código de recuperación'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 font-semibold cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Volver a iniciar sesión</span>
                </button>
              </div>
            </form>
          )}

          {/* ==================== VISTA 5: RESTABLECER CONTRASEÑA CON OTP ==================== */}
          {mode === 'reset-password' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="text-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Crear nueva contraseña
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ingresa el código de 6 dígitos enviado a{' '}
                  <span className="font-semibold text-gray-800">{email}</span>
                </p>
              </div>

              <div className="flex justify-center gap-2 py-1">
                {otpDigits.map((digito, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digito}
                    onChange={(e) => manejarCambioDigitoOtp(idx, e.target.value)}
                    onKeyDown={(e) => manejarTeclaOtp(idx, e)}
                    onPaste={manejarPegadoOtp}
                    aria-label={`Dígito ${idx + 1} del código de recuperación`}
                    className="w-11 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 focus:bg-white text-gray-900"
                  />
                ))}
              </div>

              {devOtpPreview && (
                <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold inline-flex items-center gap-1 text-emerald-800">
                      <Sparkles size={14} /> Código de recuperación:
                    </span>
                    <span className="font-mono font-extrabold text-sm tracking-widest bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {devOtpPreview}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => autocompletarCodigoDemo(devOtpPreview)}
                      className="flex-1 py-1.5 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Autocompletar código
                    </button>
                    {devEmailHtml && (
                      <button
                        type="button"
                        onClick={() => setModalCorreoAbierto(true)}
                        className="flex-1 py-1.5 px-2.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        Ver diseño del correo
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar nueva contraseña"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Cancelar</span>
                </button>

                <button
                  type="button"
                  disabled={cooldownSegundos > 0 || loading}
                  onClick={(e) => void handleRequestPasswordReset(e)}
                  className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold disabled:text-gray-400 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>
                    {cooldownSegundos > 0
                      ? `Reenviar en ${cooldownSegundos}s`
                      : 'Reenviar código'}
                  </span>
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-[11px] text-gray-400 flex items-center justify-center gap-1">
            <span>Cuidamos cada momento</span>
            <Heart size={12} className="text-green-600 fill-green-600" />
          </p>
        </div>
      </div>

      {/* Modal para inicio de sesión con cuenta Google cuando no hay VITE_GOOGLE_CLIENT_ID configurado en .env */}
      <ModalVentana
        abierto={modalGoogleAbierto}
        onCerrar={() => setModalGoogleAbierto(false)}
        titulo="Continuar con Google"
        subtitulo="Selecciona o ingresa la cuenta de Google que deseas vincular a Planeta Huella"
      >
        <form onSubmit={confirmarModalOAuthAsistido} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Correo de tu cuenta Google
            </label>
            <input
              type="email"
              required
              value={oauthEmail}
              onChange={(e) => setOauthEmail(e.target.value)}
              placeholder="tucorreo@gmail.com"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Nombre para mostrar (opcional)
            </label>
            <input
              type="text"
              value={oauthNombre}
              onChange={(e) => setOauthNombre(e.target.value)}
              placeholder="Ej. Ana García"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-600 focus:bg-white"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setModalGoogleAbierto(false)}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? 'Conectando...' : 'Continuar con esta cuenta'}
            </button>
          </div>
        </form>
      </ModalVentana>

      {/* Modal de previsualización del diseño HTML del correo enviado */}
      <ModalVentana
        abierto={modalCorreoAbierto && Boolean(devEmailHtml)}
        onCerrar={() => setModalCorreoAbierto(false)}
        titulo="Diseño del Correo Electrónico"
        subtitulo="Vista previa real de la plantilla HTML enviada al usuario"
        maxWidthClass="max-w-lg"
      >
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <iframe
              title="Vista previa del correo electrónico"
              srcDoc={devEmailHtml ?? ''}
              className="w-full h-96 border-0"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalCorreoAbierto(false)}
            className="w-full py-2.5 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar vista previa
          </button>
        </div>
      </ModalVentana>
    </div>
  );
}
