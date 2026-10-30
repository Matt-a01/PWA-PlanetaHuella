import PetAvatar from './PetAvatar';

interface PetCardProps {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  imageUrl?: string;
  seleccionada?: boolean;
  onClick?: () => void;
}

export default function PetCard({
  name,
  species,
  breed,
  age,
  imageUrl,
  seleccionada = false,
  onClick,
}: PetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left bg-white rounded-3xl p-3 shadow-xs border transition-all cursor-pointer flex flex-col justify-between ${
        seleccionada
          ? 'border-green-600 ring-2 ring-green-100 shadow-sm'
          : 'border-gray-100 hover:border-green-200 hover:shadow-md'
      }`}
    >
      <div className="relative w-full">
        <PetAvatar
          imageUrl={imageUrl}
          name={name}
          species={species}
          className="w-full h-36 sm:h-40 rounded-2xl mb-2.5"
          imgClassName="group-hover:scale-105 transition-transform duration-300"
          iconSize={58}
        />
        {seleccionada && (
          <span className="absolute top-2.5 right-2.5 bg-green-700 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
            Activa
          </span>
        )}
      </div>

      <div className="px-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="font-bold text-gray-900 text-base truncate">{name}</h3>
          <span className="text-[11px] font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
            {age}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {species} • {breed}
        </p>
      </div>
    </button>
  );
}
