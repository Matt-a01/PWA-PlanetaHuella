// backend/src/routes/catalog.routes.ts
import express from 'express';

const router = express.Router();

// Datos informativos del catálogo de razas (Perros y Gatos)
const razasCatalogo = [
    { name: 'Labrador', species: 'Perros', desc: 'Amigable y activo', img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&w=300&q=80' },
    { name: 'Golden Retriever', species: 'Perros', desc: 'Cariñoso y leal', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Bulldog', species: 'Perros', desc: 'Tranquilo y noble', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80' },
    { name: 'Beagle', species: 'Perros', desc: 'Curioso y enérgico', img: 'https://images.unsplash.com/photo-1537151608804-ea6f23b207eb?auto=format&fit=crop&w=300&q=80' },
    { name: 'Poodle', species: 'Perros', desc: 'Inteligente y dócil', img: 'https://images.unsplash.com/photo-1616149562385-1d84e79478bb?auto=format&fit=crop&w=300&q=80' },
    { name: 'Pastor Alemán', species: 'Perros', desc: 'Valiente y protector', img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=300&q=80' },
    { name: 'Europeo', species: 'Gatos', desc: 'Cariñoso y adaptable', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80' },
    { name: 'Siamés', species: 'Gatos', desc: 'Sociable y curioso', img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=300&q=80' },
];

// Datos de otros animales de compañía
const otrosAnimalesCatalogo = [
    { name: 'Aves', desc: 'Canarios, loros, periquitos...', img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=300&q=80' },
    { name: 'Conejos', desc: 'Tiernos y juguetones', img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=300&q=80' },
    { name: 'Hámsters', desc: 'Pequeños grandes amigos', img: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80' },
    { name: 'Peces', desc: 'Acuáticos y cuidados', img: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Reptiles', desc: 'Iguanas, geckos, serpientes...', img: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?auto=format&fit=crop&w=300&q=80' },
    { name: 'Hurones', desc: 'Curiosos y activos', img: 'https://images.unsplash.com/photo-1615087240969-eeff2fa558f2?auto=format&fit=crop&w=300&q=80' },
];

// Consejos y recomendaciones generales
const recomendacionesCatalogo = [
    { title: 'Rutina de ejercicio', desc: 'Ideal para su raza', detalle: 'Dedica al menos 30 a 45 minutos al día para pasear y jugar con tu mascota.' },
    { title: 'Cuidado del pelaje', desc: 'Mantén su pelaje sano y brillante', detalle: 'Cepilla su pelo de 2 a 3 veces por semana para retirar el pelo muerto.' },
    { title: 'Salud dental', desc: 'Previene problemas futuros', detalle: 'Revisa sus dientes y encías con frecuencia para evitar acumulación de sarro.' },
];

// GET /api/catalog/razas
router.get('/razas', (_req, res) => {
    res.json({ ok: true, razas: razasCatalogo, otrosAnimales: otrosAnimalesCatalogo });
});

// GET /api/catalog/recomendaciones
router.get('/recomendaciones', (_req, res) => {
    res.json({ ok: true, recomendaciones: recomendacionesCatalogo });
});

export default router;
