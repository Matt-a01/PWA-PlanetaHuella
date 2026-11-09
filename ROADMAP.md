# 🐾 Planeta Huella — Roadmap de Desarrollo e Ingeniería

Este documento registra el progreso real de arquitectura, implementación, seguridad y calidad para el monorepo **PWA-PlanetaHuella** sobre el stack **React 19 + VitePWA + Zustand** y **Express 5 + Mongoose + MongoDB Atlas**.

---

## Fase 0 y Base del Monorepo: Infraestructura, UI y Persistencia Inicial ✅
- [x] Inicializar monorepo TypeScript separado en `frontend/` y `backend/` (Node.js ESM).
- [x] Configurar Vite 8 + React 19 + Tailwind CSS v4 (`@tailwindcss/vite`) con paleta unificada (`#15803d` / `green-700`).
- [x] Implementar navegación SPA móvil con React Router v7 y barra inferior `BottomNav.tsx` con Lucide Icons.
- [x] Construir pantallas principales y sub-ventanas modales (`ModalVentana.tsx`):
  - [x] Autenticación y registro de cuentas (`Auth.tsx`, `Registro.tsx`).
  - [x] Panel de inicio con cuadrícula 2x2 de mascotas y filtro de tareas diarias (`Inicio.tsx`).
  - [x] Gestión de mascotas, siluetas por especie y ficha detallada (`Mascotas.tsx`, `AgregarMascota.tsx`, `PerfilMascota.tsx`, `PetDetailModal.tsx`).
  - [x] Catálogo interactivo de razas y recomendaciones por especie (`Razas.tsx`, `Recomendaciones.tsx`).
  - [x] Vista de perfil de usuario con visualización de rol en base de datos (`Perfil.tsx`).
- [x] Gestionar estado global con Zustand v5 (`useAuthStore` y `usePetStore`).
- [x] Conectar backend Express 5 con **MongoDB Atlas** mediante **Mongoose 9** (`database.ts`).
- [x] Definir modelos Mongoose en producción (`User`, `Pet`, `Task`, `MedicalRecord`, `Breed`, `Tip`) y endpoints REST iniciales (`/api/auth`, `/api/pets`, `/api/tasks`, `/api/medical`, `/api/catalog`).
- [x] Documentar plantillas `.env.example`, guía técnica `README.md` y limpiar estilos residuales del template inicial.

---

## Fase 1: Seguridad Backend, Autenticación JWT, RBAC y Protección Anti-IDOR 🔒
- [ ] Validar estrictamente variables de entorno críticas al arranque (`MONGO_URI`, `JWT_SECRET` sin secretos fallback en código, `PORT`, `CORS_ORIGIN`).
- [ ] Incorporar cabeceras de seguridad HTTP (`helmet`), compresión de respuestas (`compression`) y endpoint `GET /api/health`.
- [ ] Aplicar limitación de tasa (`express-rate-limit`) contra fuerza bruta en `/api/auth` y abuso general en `/api/*`.
- [ ] Implementar middlewares `requireAuth` (verificación JWT Bearer) y `requireAdmin` (validación RBAC en tiempo real contra MongoDB Atlas).
- [ ] Validar payloads de entrada con esquemas `Zod` en español y manejador centralizado de errores sin fuga de stack traces.
- [ ] Blindar `/api/pets`, `/api/tasks` y `/api/medical` contra vulnerabilidades IDOR forzando pertenencia por `req.user.id`.
- [ ] Restringir mutaciones (`POST`, `PUT`, `DELETE`) de `/api/catalog` exclusivamente a administradores autenticados.

---

## Fase 2: Cliente HTTP Autenticado, Guardianes de Ruta y Saneamiento de Estado 🛡️
- [ ] Crear cliente HTTP centralizado (`apiClient.ts`) con adjunción automática de `Authorization: Bearer <token>` e interceptor `401`.
- [ ] Eliminar respaldos inseguros de usuarios/contraseñas en `localStorage` y desactivar accesos OAuth simulados sin autenticación real.
- [ ] Implementar guardianes de navegación `ProtectedRoute` y `PublicOnlyRoute` en `App.tsx`.
- [ ] Corregir manejo de colecciones vacías `[]` desde MongoDB, remover historiales médicos ficticios y limpiar memoria al ejecutar `logout()` (`resetStore`).

---

## Fase 3: Optimización MongoDB, Reinicio Diario de Tareas y Multimedia ⚡
- [ ] Añadir índices compuestos en modelos Mongoose (`Pet`, `Task`, `MedicalRecord`, `Catalog`) y restricción `unique` en nombres de razas.
- [ ] Extraer inicialización del catálogo a un seed idempotente al arranque (`bulkWrite` con `upsert: true`) libre de condiciones de carrera.
- [ ] Implementar reinicio diario automático de tareas de cuidado mediante `lastCompletedDate` (`YYYY-MM-DD`).
- [ ] Optimizar compresión de imágenes en cliente a formato `image/webp` con validación estricta de tipo MIME y peso máximo.

---

## Fase 4: Capacidades PWA Offline-First (Iconos, Workbox, IndexedDB y Outbox) 📲
- [ ] Generar conjunto completo de iconos PNG válidos (`192x192`, `512x512`, `maskable` y `apple-touch-icon`).
- [ ] Configurar `workbox.runtimeCaching` en `vite.config.ts` (`StaleWhileRevalidate` para catálogo y `CacheFirst` para imágenes externas).
- [ ] Migrar caché local de mascotas, tareas y registros médicos a `IndexedDB` (`idb-keyval`) aislado por usuario.
- [ ] Implementar cola persistente `Outbox` y gestor de sincronización FIFO automática al recuperar conexión (`online`).
- [ ] Añadir barra de estado de conexión/sincronización (`NetworkStatusBanner`) y botón nativo de instalación PWA (`InstallPWAButton`).

---

## Fase 5: Pulido UI/UX, Accesibilidad WCAG y Panel de Administración ✨
- [ ] Integrar sistema global de notificaciones flotantes (`ToastContainer`) y modal de confirmación para acciones destructivas (`ConfirmDialog`).
- [ ] Mejorar accesibilidad WCAG en `ModalVentana.tsx` (`role="dialog"`, `aria-modal`, foco inicial y bloqueo de scroll) y `safe-area` en `BottomNav.tsx`.
- [ ] Implementar endpoints administrativos protegidos (`/api/admin/stats`, `/api/admin/users`) y vista `AdminDashboard.tsx` (`/admin`).

---

## Fase 6: Pruebas Automatizadas, Pruebas de Carga (k6) y Despliegue Full-Stack 🚀
- [ ] Separar instancia Express (`app.ts`) del arranque HTTP (`Index.ts`) e implementar pruebas de integración de seguridad, RBAC y anti-IDOR (`Vitest` + `Supertest` + `mongodb-memory-server`).
- [ ] Añadir pruebas unitarias en Frontend (`Vitest`) para verificación de roles, cierre de sesión limpio y cola offline `Outbox`.
- [ ] Crear script de pruebas de carga y picos con `k6` (`tests/load/k6-semi-controlled.js`) con umbrales `p(95) < 400ms` y fallos `< 1%`.
- [ ] Actualizar `render.yaml` como Blueprint Full-Stack (Web Service Node + Static Site SPA/PWA con cabeceras `Cache-Control` para `sw.js`) y configurar CI en GitHub Actions (`.github/workflows/ci.yml`).
