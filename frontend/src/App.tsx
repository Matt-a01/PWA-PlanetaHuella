// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';

// Importación de las vistas
import Inicio from './pages/Inicio';
import Mascotas from './pages/Mascotas';
import Recomendaciones from './pages/Recomendaciones';
import Razas from './pages/Razas';
import Perfil from './pages/Perfil';
import PerfilMascota from './pages/PerfilMascota';
import Registro from './pages/Registro';
import AgregarMascota from './pages/AgregarMascota';

export default function App() {
  return (
    <BrowserRouter>
      {/* Contenedor principal con fondo claro como indica el diseño */}
      <div className="min-h-screen bg-[#F8FAFC] font-sans">
        <Routes>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/Registro" element={<Registro />} />
          <Route path="/AgregarMascota" element={<AgregarMascota />} />
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/recomendaciones" element={<Recomendaciones />} />
          <Route path="/razas" element={<Razas />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mascota/:id" element={<PerfilMascota />} />
        </Routes>
        

        <BottomNav />
      </div>
    </BrowserRouter>
  );
}