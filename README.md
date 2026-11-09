# Planeta Huella — PetCare PWA

**Planeta Huella** es una Aplicación Web Progresiva (PWA) orientada al cuidado diario y seguimiento integral del bienestar de mascotas. Permite registrar perfiles personalizados por especie y raza, organizar rutinas de cuidado diario, llevar una bitácora médica (vacunas, desparasitaciones y consultas) y consultar un catálogo curado de razas y recomendaciones veterinarias.

---

## Arquitectura del Monorepo

El proyecto está organizado como un monorepo con separación clara entre cliente PWA y API RESTful:

```text
PWA-PlanetaHuella/
├── backend/                # API RESTful (Node.js ESM + Express 5 + TypeScript + Mongoose 9)
│   ├── src/
│   │   ├── models/         # Esquemas Mongoose: User, Pet, Task, MedicalRecord, Catalog (Breed/Tip)
│   │   ├── routes/         # Endpoints REST: auth, pets, tasks, medical, catalog
│   │   ├── database.ts     # Conexión asíncrona a MongoDB Atlas
│   │   └── Index.ts        # Punto de entrada del servidor Express
│   └── .env.example        # Plantilla de variables de entorno del servidor
├── frontend/               # Cliente PWA (React 19 + TypeScript + Vite 8 + Tailwind CSS v4)
│   ├── public/             # Activos estáticos e iconos de instalación PWA
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (ModalVentana, BottomNav, tarjetas y formularios)
│   │   ├── pages/          # Vistas de aplicación (Inicio, Mascotas, Razas, Recomendaciones, Perfil, Auth)
│   │   ├── services/       # Servicios de comunicación HTTP con el backend
│   │   ├── store/          # Estado global con Zustand v5 (useAuthStore, usePetStore)
│   │   └── utils/          # Utilidades cliente (compresión y validación de imágenes)
│   ├── vite.config.ts      # Configuración de Vite 8, Tailwind v4 y vite-plugin-pwa
│   └── .env.example        # Plantilla de variables de entorno del cliente
├── ROADMAP.md              # Hoja de ruta técnica e hitos de ingeniería
└── render.yaml             # Definición de despliegue en la nube (Render)
```

### Stack Tecnológico

| Capa | Tecnologías Principales |
| :--- | :--- |
| **Frontend (PWA)** | React 19, TypeScript, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), React Router v7, Zustand v5, Lucide Icons, Framer Motion y `vite-plugin-pwa`. Identidad visual móvil en paleta verde (`green-700` / `#15803d`) sobre fondo `#F8FAFC`. |
| **Backend (API)** | Node.js ESM (`"type": "module"`), Express 5, TypeScript, Mongoose 9, `bcryptjs` (hash de contraseñas) y `jsonwebtoken` (autenticación JWT stateless). |
| **Base de Datos** | **MongoDB Atlas** (NoSQL documental en la nube gestionado mediante modelos tipados con Mongoose). |

> **Convención técnica Backend ESM:** Dado que `backend/package.json` utiliza `"type": "module"`, todas las importaciones relativas entre módulos TypeScript internos deben incluir explícitamente la extensión `.js` (por ejemplo: `import User from '../models/User.js'`). Todas las respuestas HTTP siguen el contrato JSON uniforme `{ ok: boolean, ... }`.

---

## Requisitos Previos

- **Node.js** `v20.x` LTS o superior.
- **npm** `v10.x` o superior.
- Cuenta y clúster activo en **MongoDB Atlas** (con usuario de base de datos configurado e IP autorizada en *Network Access*).

---

## Configuración de Variables de Entorno

Antes de iniciar el proyecto, crea los archivos `.env` locales a partir de las plantillas `.env.example` incluidas en cada paquete (los archivos `.env` reales están excluidos en `.gitignore`).

### 1. Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

| Variable | Ejemplo / Formato | Descripción |
| :--- | :--- | :--- |
| `PORT` | `3000` | Puerto HTTP donde escucha el servidor Express. |
| `MONGO_URI` | `mongodb+srv://<usuario>:<password>@cluster.mongodb.net/planeta_huella` | Cadena de conexión al clúster de MongoDB Atlas. |
| `JWT_SECRET` | Cadena aleatoria de al menos 32 caracteres | Secreto criptográfico empleado para firmar y validar tokens JWT. |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen(es) del frontend autorizados por la política CORS. |

### 2. Frontend (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Ejemplo / Formato | Descripción |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:3000/api` | URL base donde se expone la API REST del backend. |

---

## Instalación y Comandos de Ejecución

### Instalación de dependencias

```bash
# 1. Instalar dependencias del backend
cd backend
npm install

# 2. Instalar dependencias del frontend
cd ../frontend
npm install
```

### Entorno de Desarrollo

Abre dos terminales independientes en la raíz del proyecto:

```bash
# Terminal 1 — Servidor Backend con recarga en caliente (http://localhost:3000)
cd backend
npm run dev
```

```bash
# Terminal 2 — Cliente Frontend Vite PWA (http://localhost:5173)
cd frontend
npm run dev
```

### Compilación y Producción

```bash
# Compilar y ejecutar Backend en modo producción
cd backend
npm run build
npm start

# Analizar código, compilar bundle PWA y previsualizar Frontend
cd ../frontend
npm run lint
npm run build
npm run preview
```

---

## Estructura de Roles (`user` y `admin`)

Planeta Huella implementa separación de privilegios basada en dos roles sincronizados directamente con **MongoDB Atlas**:

| Rol | Asignación | Permisos y Alcance |
| :--- | :--- | :--- |
| **`user`** | Automática al registrarse (`POST /api/auth/register`) | Gestión aislada de sus propias mascotas, tareas diarias personalizadas y registros médicos; consulta de lectura del catálogo global de razas y recomendaciones. |
| **`admin`** | Asignación exclusiva en **MongoDB Atlas** | Todos los permisos de `user`, más administración del catálogo global (creación, edición y eliminación de razas, tareas sugeridas por raza y recomendaciones de bienestar) y acceso a herramientas de supervisión. |

### Cómo asignar el rol `admin` en MongoDB Atlas

Por seguridad, ningún endpoint público permite crear cuentas con privilegios administrativos. Para promover una cuenta a administrador:

1. Registra el usuario normalmente desde la aplicación.
2. Ingresa a **MongoDB Atlas** → **Browse Collections** → base de datos `planeta_huella` → colección `users`.
3. Localiza el documento del usuario por su `email` y actualiza el campo `role` a `"admin"` (o incluye `"admin"` dentro del arreglo `roles: ["user", "admin"]`).
4. Guarda el cambio; la aplicación sincronizará el rol actualizado desde la base de datos.

---

## Módulos Principales de la API REST

- `/api/auth` — Registro de cuentas, inicio de sesión con emisión de JWT y verificación de sesión/rol activo.
- `/api/pets` — CRUD de mascotas asociadas al propietario autenticado e inicialización de rutinas sugeridas según raza o especie.
- `/api/tasks` — Listado, creación, alternancia de cumplimiento y eliminación de tareas de cuidado por mascota.
- `/api/medical` — Consulta, alta y eliminación de registros del historial médico veterinario.
- `/api/catalog` — Consulta pública de `/razas` y `/recomendaciones`, y operaciones de gestión administrativa sobre el catálogo global.
