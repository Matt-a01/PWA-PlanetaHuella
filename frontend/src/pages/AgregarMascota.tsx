// src/pages/AgregarMascota.tsx
import { useState, type FormEvent } from 'react';
import { ChevronLeft, Camera } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePetStore } from '../store/usePetStore';
import { useAuthStore } from '../store/useAuthStore';

export default function AgregarMascota() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const agregarMascota = usePetStore((state) => state.agregarMascota);

    // Estados para los campos del formulario
    const [name, setName] = useState('');
    const [species, setSpecies] = useState('Perro');
    const [breed, setBreed] = useState('Golden Retriever');
    const [age, setAge] = useState('3');
    const [gender, setGender] = useState('Hembra');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Imagen por defecto según la especie si el usuario no coloca URL
        const fotoPorDefecto =
            species === 'Gato'
                ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80'
                : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=200&q=80';

        await agregarMascota(
            {
                name: name.trim(),
                species,
                breed,
                age: Number(age) || 1,
                gender,
                imageUrl: imageUrl.trim() || fotoPorDefecto,
            },
            user?.id
        );

        navigate('/mascotas');
    };

    return (
        <div className="min-h-screen bg-white pb-20">
        <header className="flex items-center p-4">
            <Link to="/inicio" className="text-gray-900 mr-4">
            <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Agregar mascota</h1>
        </header>

        <div className="p-5">
            {/* Selector de foto */}
            <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 bg-green-50 rounded-full flex items-center justify-center border-2 border-dashed border-green-200 overflow-hidden">
                {imageUrl ? (
                    <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                ) : (
                    <Camera size={32} className="text-green-600" />
                )}
                <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-100">
                <Camera size={14} className="text-gray-600" />
                </div>
            </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-gray-600 mb-1">Nombre</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Luna"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">Especie</label>
                <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none"
                >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Conejo">Conejo</option>
                <option value="Ave">Ave</option>
                </select>
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">Raza</label>
                <select
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none"
                >
                <option value="Golden Retriever">Golden Retriever</option>
                <option value="Labrador">Labrador</option>
                <option value="Bulldog">Bulldog</option>
                <option value="Beagle">Beagle</option>
                <option value="Poodle">Poodle</option>
                <option value="Europeo">Europeo</option>
                <option value="Siamés">Siamés</option>
                <option value="Mestizo">Mestizo</option>
                </select>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Edad</label>
                <div className="flex bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                    <input
                        type="number"
                        min="0"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="3"
                        className="w-16 p-3 bg-transparent text-center focus:outline-none"
                    />
                    <div className="flex items-center px-3 text-gray-500 border-l border-gray-200">años</div>
                </div>
                </div>
                
                <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Sexo</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setGender('Macho')}
                        className={`flex-1 py-2 rounded-xl border ${
                            gender === 'Macho'
                                ? 'bg-green-50 border-green-600 text-green-700 font-medium'
                                : 'border-gray-200 text-gray-500'
                        }`}
                    >
                        Macho
                    </button>
                    <button
                        type="button"
                        onClick={() => setGender('Hembra')}
                        className={`flex-1 py-2 rounded-xl border ${
                            gender === 'Hembra'
                                ? 'bg-green-50 border-green-600 text-green-700 font-medium'
                                : 'border-gray-200 text-gray-500'
                        }`}
                    >
                        Hembra
                    </button>
                </div>
                </div>
            </div>

            <div>
                <label className="block text-sm text-gray-600 mb-1">URL de foto (opcional)</label>
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-green-500 focus:outline-none text-sm"
                />
            </div>

            <button type="submit" className="w-full bg-green-700 text-white font-semibold py-4 rounded-xl mt-6 hover:bg-green-800 transition-colors cursor-pointer">
                Guardar mascota
            </button>
            </form>
        </div>
        </div>
    );
}