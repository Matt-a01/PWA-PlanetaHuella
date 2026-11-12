import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import Auth from './pages/Auth';
import Inicio from './pages/Inicio';
import Mascotas from './pages/Mascotas';
import Recomendaciones from './pages/Recomendaciones';
import Razas from './pages/Razas';
import Perfil from './pages/Perfil';
import PerfilMascota from './pages/PerfilMascota';
import AdminDashboard from './pages/AdminDashboard';
import Registro from './pages/Registro';
import AgregarMascota from './pages/AgregarMascota';
import { useAuthStore } from './store/useAuthStore';

function MainLayout() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthRoute = ['/', '/login', '/registro'].includes(location.pathname.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <NetworkStatusBanner />
      <ToastContainer />
      <Routes>
        {/* Rutas exclusivas para visitantes sin sesión activa */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Auth initialMode="login" />} />
          <Route path="/login" element={<Auth initialMode="login" />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/Registro" element={<Registro />} />
        </Route>

        {/* Rutas protegidas que exigen autenticación JWT */}
        <Route element={<ProtectedRoute />}>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/mascotas" element={<Mascotas />} />
          <Route path="/AgregarMascota" element={<AgregarMascota />} />
          <Route path="/recomendaciones" element={<Recomendaciones />} />
          <Route path="/razas" element={<Razas />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/mascota/:id" element={<PerfilMascota />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Redirección comodín para rutas inexistentes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/inicio' : '/login'} replace />}
        />
      </Routes>

      {isAuthenticated && !isAuthRoute && <BottomNav />}
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
