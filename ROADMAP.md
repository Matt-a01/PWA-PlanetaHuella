# 🐾 Planeta Huella - Roadmap de Desarrollo y Código

Este documento rastrea el progreso técnico y la implementación de código para el proyecto Planeta Huella. Marca con una `x` dentro de los corchetes `[x]` conforme vayas completando cada módulo de código.

## Fase 1: Infraestructura y Enrutamiento (Completado) ✅
- [x] Inicializar monorepositorio (Frontend/Backend).
- [x] Configurar Vite + React + TypeScript.
- [x] Configurar Tailwind CSS v4.
- [x] Implementar React Router para navegación SPA (Single Page Application).
- [x] Codificar el componente `BottomNav.tsx` con iconos de Lucide.
- [x] Configurar `render.yaml` para despliegues automatizados.

## Fase 2: Maquetación de Interfaces (Frontend - Código UI) ⏳
- [ ] **Pantalla de Inicio:** Codificar tarjetas de resumen (Mascotas, Tareas del día).
- [ ] **Pantalla de Perfil de Mascota:** Maquetar vista de detalles (Nombre, Raza, Edad, Salud).
- [ ] **Formulario "Agregar Mascota":** Crear inputs controlados en React para recopilar datos de la mascota.
- [ ] **Pantalla "Crear Cuenta / Login":** Diseñar el formulario de autenticación respetando los colores del diseño.
- [ ] **Pantalla "Recomendaciones" y "Razas":** Construir grillas (grids) en Tailwind para mostrar listas de información.

## Fase 3: Gestión de Estado y Lógica de Cliente
- [ ] Instalar y configurar `zustand` para el manejo del estado global.
- [ ] Crear el *store* `usePetStore` para guardar temporalmente las mascotas en la memoria del navegador.
- [ ] Crear el *store* `useAuthStore` para manejar la sesión del usuario.
- [ ] Programar la lógica de los botones para agregar o eliminar tareas diarias.

## Fase 4: Desarrollo del Backend y Base de Datos (Node.js/Prisma)
- [ ] Diseñar el esquema de Prisma (`schema.prisma`) con los modelos: `User`, `Pet`, `Task`.
- [ ] Ejecutar migraciones de Prisma para crear las tablas en PostgreSQL.
- [ ] Programar endpoints REST (Controladores) en Express:
  - [ ] `POST /api/auth/register` (Registro de usuarios).
  - [ ] `GET /api/pets` (Obtener lista de mascotas).
  - [ ] `POST /api/pets` (Crear nueva mascota).
- [ ] Implementar middleware de autenticación (JWT o verificación de tokens).

## Fase 5: Integración y Funcionalidades PWA
- [ ] Configurar Axios o Fetch API en el Frontend para conectar con el Backend (Express).
- [ ] Configurar `vite-plugin-pwa` en `vite.config.ts`.
- [ ] Generar y enlazar el archivo `manifest.json` (iconos, colores, nombre corto).
- [ ] Programar el *Service Worker* para habilitar el funcionamiento offline (caché de red).
- [ ] Implementar un botón en la interfaz para "Instalar Aplicación" usando la API web nativa.

## Fase 6: Pruebas y Despliegue Final
- [ ] Realizar pruebas de código en dispositivos móviles (Responsive UI).
- [ ] Desplegar la base de datos PostgreSQL en la nube (ej. Render o Supabase).
- [ ] Desplegar el Backend (API Express) en la nube.
- [ ] Actualizar las variables de entorno (`.env`) en producción.