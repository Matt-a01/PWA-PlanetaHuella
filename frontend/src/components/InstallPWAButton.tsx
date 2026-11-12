import { useEffect, useState } from 'react';
import { Download, Smartphone, CheckCircle2, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const detectarModoStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  const mediaStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return mediaStandalone || iosStandalone;
};

const detectarSafariIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  const esIOS = /iphone|ipad|ipod/.test(ua);
  const esWebkit = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  return esIOS && esWebkit;
};

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalada, setInstalada] = useState<boolean>(() => detectarModoStandalone());
  const [esIOS] = useState<boolean>(() => detectarSafariIOS());
  const [mostrarGuiaManual, setMostrarGuiaManual] = useState(false);

  useEffect(() => {
    const manejarBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const manejarAppInstalled = () => {
      setInstalada(true);
      setDeferredPrompt(null);
      setMostrarGuiaManual(false);
    };

    window.addEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);
    window.addEventListener('appinstalled', manejarAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', manejarBeforeInstallPrompt);
      window.removeEventListener('appinstalled', manejarAppInstalled);
    };
  }, []);

  const handleInstalarClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const decision = await deferredPrompt.userChoice;
      if (decision.outcome === 'accepted') {
        setInstalada(true);
      }
      setDeferredPrompt(null);
      return;
    }
    setMostrarGuiaManual((prev) => !prev);
  };

  if (instalada) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0">
          <CheckCircle2 size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-green-900">Aplicación instalada</p>
          <p className="text-xs text-green-700">
            Estás utilizando Planeta Huella como aplicación nativa con soporte sin conexión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Aplicación móvil (PWA)</p>
            <p className="text-xs text-gray-500">
              Acceso rápido desde tu pantalla de inicio y uso sin conexión
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleInstalarClick}
        className="mt-3.5 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-xs"
      >
        <Download size={17} />
        <span>Instalar aplicación en tu dispositivo</span>
      </button>

      {(esIOS || mostrarGuiaManual) && !deferredPrompt && (
        <div className="mt-3 bg-green-50/80 border border-green-100 rounded-xl p-3 text-xs text-green-900 flex items-start gap-2">
          <Share2 size={15} className="text-green-700 shrink-0 mt-0.5" />
          <p>
            {esIOS
              ? 'En Safari para iPhone/iPad: toca el botón «Compartir» en la barra inferior y selecciona «Agregar a pantalla de inicio».'
              : 'En tu navegador: abre el menú de opciones (⋮) o el ícono de instalación en la barra de direcciones y elige «Instalar aplicación» o «Agregar a pantalla de inicio».'}
          </p>
        </div>
      )}
    </div>
  );
}
