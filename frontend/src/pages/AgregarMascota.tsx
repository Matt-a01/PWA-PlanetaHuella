import { useNavigate, useSearchParams } from 'react-router-dom';
import PetFormModal from '../components/PetFormModal';
import { usePetStore } from '../store/usePetStore';

// Mantiene compatibilidad con la ruta /AgregarMascota mostrando directamente la sub-ventana flotante
export default function AgregarMascota() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const pets = usePetStore((state) => state.pets);
  const mascotaEditar = pets.find((p) => p._id === editId) || null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PetFormModal
        abierto={true}
        onCerrar={() => navigate('/mascotas')}
        mascotaEditar={mascotaEditar}
      />
    </div>
  );
}
