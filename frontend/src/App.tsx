// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';

// Importación de las vistas
import Inicio from './pages/Inicio';
import Mascotas from './pages/Mascotas';
import Recomendaciones from './pages/Recomendaciones';
import Razas from './pages/Razas';
import Perfil from './pages/Perfil';

export default function App() {
  return (
    <BrowserRouter>
      {/* Contenedor principal con fondo claro como indica el diseño */}
      <div className="min-h-screen bg-[#F8FAFC] font-sans">
        <Routes>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/recomendaciones" element={<Recomendaciones />} />
          <Route path="/razas" element={<Razas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
        
        {/* La barra se coloca fuera de <Routes> para que sea visible en todas las páginas */}
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}