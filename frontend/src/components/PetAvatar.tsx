import { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { mejorarCalidadImagenUrl } from '../utils/imageUtils';

interface PetAvatarProps {
  imageUrl?: string;
  name: string;
  species?: string;
  className?: string;
  imgClassName?: string;
  iconSize?: number;
  showLabel?: boolean;
}

// Siluetas vectoriales limpias según la especie cuando la mascota no tiene foto asignada
function SiluetaEspecie({ species, size }: { species?: string; size: number }) {
  const esp = (species || '').toLowerCase();

  if (esp.includes('perro')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M19 20C14 19 10 24 11 31C12 36 16 38 19 36L21 26L19 20Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M45 20C50 19 54 24 53 31C52 36 48 38 45 36L43 26L45 20Z"
          fill="currentColor"
          opacity="0.3"
        />
        <path
          d="M32 16C23.5 16 18 22.5 18 31.5C18 41 24 48 32 48C40 48 46 41 46 31.5C46 22.5 40.5 16 32 16Z"
          fill="currentColor"
          opacity="0.2"
        />
        <circle cx="26.5" cy="29.5" r="2.3" fill="currentColor" />
        <circle cx="37.5" cy="29.5" r="2.3" fill="currentColor" />
        <ellipse cx="32" cy="36" rx="4.2" ry="3" fill="currentColor" />
        <path
          d="M28 41.5C29.5 43 34.5 43 36 41.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (esp.includes('gato')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M18 28L16 14L27 21C28.6 20.5 30.3 20.2 32 20.2C33.7 20.2 35.4 20.5 37 21L48 14L46 28C47.5 30.8 48.2 34 48.2 37.2C48.2 45.4 41 50 32 50C23 50 15.8 45.4 15.8 37.2C15.8 34 16.5 30.8 18 28Z"
          fill="currentColor"
          opacity="0.22"
        />
        <circle cx="26" cy="33" r="2.2" fill="currentColor" />
        <circle cx="38" cy="33" r="2.2" fill="currentColor" />
        <path d="M32 39L29.5 36.5H34.5L32 39Z" fill="currentColor" />
        <path
          d="M20 37H13M20 40.5H14M44 37H51M44 40.5H50"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (esp.includes('conejo')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="21" y="9" width="7.5" height="22" rx="3.75" fill="currentColor" opacity="0.28" />
        <rect x="35.5" y="9" width="7.5" height="22" rx="3.75" fill="currentColor" opacity="0.28" />
        <circle cx="32" cy="39" r="13.5" fill="currentColor" opacity="0.22" />
        <circle cx="27" cy="37" r="2" fill="currentColor" />
        <circle cx="37" cy="37" r="2" fill="currentColor" />
        <circle cx="32" cy="42" r="2.2" fill="currentColor" />
      </svg>
    );
  }

  return <PawPrint size={Math.round(size * 0.72)} strokeWidth={1.9} />;
}

export default function PetAvatar({
  imageUrl,
  name,
  species,
  className = 'w-20 h-20 rounded-2xl',
  imgClassName = '',
  iconSize = 42,
  showLabel = false,
}: PetAvatarProps) {
  const [urlFallida, setUrlFallida] = useState<string | null>(null);
  const urlOptimizada = mejorarCalidadImagenUrl(imageUrl);
  const tieneImagen = Boolean(urlOptimizada) && urlFallida !== urlOptimizada;

  if (tieneImagen) {
    return (
      <div className={`overflow-hidden bg-green-50/60 ${className}`}>
        <img
          src={urlOptimizada}
          alt={name}
          onError={() => setUrlFallida(urlOptimizada)}
          className={`w-full h-full object-cover object-center ${imgClassName}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-green-50 via-emerald-50/80 to-green-100/70 text-green-700/80 flex flex-col items-center justify-center select-none ${className}`}
      aria-label={`Silueta de ${name}`}
    >
      <SiluetaEspecie species={species} size={iconSize} />
      {showLabel && (
        <span className="text-[10px] font-semibold text-green-700/70 mt-1">Sin foto</span>
      )}
    </div>
  );
}
