// src/pages/Landing.tsx
import { Link } from 'react-router-dom';
import { PawPrint, Heart } from 'lucide-react';
import landingHero from '../assets/landing-hero.jpg';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between items-center p-6">
            <div className="w-full max-w-sm flex flex-col items-center my-auto">
                {/* Logo principal de PetCare / Planeta Huella */}
                <div className="bg-white border-2 border-purple-200 rounded-2xl px-6 py-4 shadow-sm flex flex-col items-center mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center mb-1">
                        <PawPrint size={32} />
                    </div>
                    <span className="text-3xl font-light text-green-700">
                        Pet<span className="font-semibold">Care</span>
                    </span>
                </div>

                <h1 className="text-center text-gray-800 font-bold text-lg mb-4">
                    Cuidado hoy,
                    <br />
                    vidas más felices
                </h1>

                {/* Imagen central */}
                <div className="w-full rounded-3xl overflow-hidden shadow-md border border-green-100 mb-6">
                    <img
                        src={landingHero}
                        alt="Perro y gato en Planeta Huella"
                        className="w-full h-64 object-cover"
                    />
                </div>

                {/* Botones de navegación */}
                <div className="w-full space-y-3">
                    <Link
                        to="/registro"
                        className="block w-full text-center py-3.5 rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold shadow-sm transition-colors"
                    >
                        Comenzar
                    </Link>

                    <Link
                        to="/login"
                        className="block w-full text-center py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-semibold border border-gray-300 transition-colors"
                    >
                        Ya tengo una cuenta
                    </Link>
                </div>

                {/* Enlace directo al catálogo público (enfoque PWA) */}
                <Link to="/razas" className="mt-4 text-xs text-green-700 font-medium hover:underline">
                    Ver catálogo de razas y consejos →
                </Link>
            </div>

            <footer className="mt-4 text-center">
                <p className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <span>Cuidamos cada momento</span>
                    <Heart size={13} className="text-rose-500 fill-rose-500" />
                </p>
            </footer>
        </div>
    );
}
