// src/App.tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';

// Importación de las vistas
import Auth from './pages/Auth';
import Inicio from './pages/Inicio';
import Mascotas from './pages/Mascotas';
import Recomendaciones from './pages/Recomendaciones';
import Razas from './pages/Razas';
import Perfil from './pages/Perfil';
import PerfilMascota from './pages/PerfilMascota';
import Registro from './pages/Registro';
import AgregarMascota from './pages/AgregarMascota';

function MainLayout() {
  const location = useLocation();
  // Ocultamos la barra de navegación en las pantallas de inicio de sesión y registro
  const isAuthRoute = ['/', '/login', '/registro'].includes(location.pathname.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Routes>
        {/* Ruta principal: Inicio de sesión con opción de Crear Cuenta */}
        <Route path="/" element={<Auth initialMode="login" />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/Registro" element={<Registro />} />

        {/* Rutas principales de la aplicación */}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/AgregarMascota" element={<AgregarMascota />} />
        <Route path="/mascotas" element={<Mascotas />} />
        <Route path="/recomendaciones" element={<Recomendaciones />} />
        <Route path="/razas" element={<Razas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/mascota/:id" element={<PerfilMascota />} />
      </Routes>

      {/* Renderizado condicional de la barra de navegación */}
      {!isAuthRoute && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}