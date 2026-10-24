import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
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
  // Oculta la barra inferior en las pantallas de autenticación
  const isAuthRoute = ['/', '/login', '/registro'].includes(location.pathname.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <Routes>
        <Route path="/" element={<Auth initialMode="login" />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/AgregarMascota" element={<AgregarMascota />} />
        <Route path="/mascotas" element={<Mascotas />} />
        <Route path="/recomendaciones" element={<Recomendaciones />} />
        <Route path="/razas" element={<Razas />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/mascota/:id" element={<PerfilMascota />} />
      </Routes>

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
