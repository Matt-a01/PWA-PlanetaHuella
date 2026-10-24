import { Link } from 'react-router-dom';

interface PetCardProps {
  id: string;
  name: string;
  age: string;
  imageUrl: string;
}

export default function PetCard({ id, name, age, imageUrl }: PetCardProps) {
  return (
    <Link
      to={`/mascota/${id}`}
      className="flex flex-col items-center min-w-[100px] bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mr-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <img
        src={imageUrl}
        alt={`Foto de ${name}`}
        className="w-20 h-20 object-cover rounded-xl mb-2"
      />
      <h3 className="font-bold text-gray-800 text-sm">{name}</h3>
      <p className="text-xs text-gray-500">{age}</p>
    </Link>
  );
}
