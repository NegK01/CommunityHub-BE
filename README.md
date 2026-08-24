# CommunityHub - Backend API

API REST para la plataforma comunitaria CommunityHub, construida con Node.js, Express, TypeScript y MongoDB.

---

## Requisitos Previos

- Node.js 20.x o superior
- npm 10.x o superior
- Instancia de MongoDB (local o MongoDB Atlas)

---

## Instalacion y Configuracion

1. Clonar el repositorio e instalar las dependencias:

```bash
git clone https://github.com/NegK01/CommunityHub-BE.git
cd CommunityHub-BE
npm install
```

2. Configurar las variables de entorno:
Crear un archivo `.env` en la raiz del proyecto con las siguientes variables:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/communityhub
JWT_SECRET=clave_secreta_para_firmar_tokens
JWT_EXPIRES_IN=7d
```

3. Poblar la base de datos con datos de prueba (opcional pero recomendado):

```bash
npm run seed
```

Este comando inicializa categorias, eventos e inserta tres usuarios de prueba:
- Administrador: `admin@communityhub.com` / `password123`
- Organizador: `organizer@communityhub.com` / `password123`
- Usuario: `user@communityhub.com` / `password123`

---

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automatica (`tsx watch`).
- `npm run build`: Compila el proyecto TypeScript a JavaScript en el directorio `dist/`.
- `npm start`: Inicia la aplicacion compilada en produccion (`node dist/server.js`).
- `npm run seed`: Limpia y puebla la base de datos con registros iniciales.

---

## Documentacion de Endpoints

Todas las rutas protegidas requieren la cabecera `Authorization: Bearer <token>`.

### 1. Autenticacion (`/api/auth`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Publico | Registra un nuevo usuario |
| POST | `/api/auth/login` | Publico | Inicia sesion y devuelve el token JWT |
| GET | `/api/auth/me` | Autenticado | Devuelve el perfil del usuario autenticado |
| POST | `/api/auth/logout` | Autenticado | Cierra la sesion |

### 2. Categorias (`/api/categories`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| GET | `/api/categories` | Publico | Lista categorias activas (usar `?all=true` para ver todas) |
| GET | `/api/categories/:id` | Publico | Obtiene una categoria por ID |
| POST | `/api/categories` | Admin | Crea una nueva categoria |
| PUT | `/api/categories/:id` | Admin | Actualiza una categoria |
| DELETE | `/api/categories/:id` | Admin | Desactiva una categoria (bloquea si tiene eventos asociados) |

### 3. Eventos y Actividades (`/api/events`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| GET | `/api/events` | Publico | Lista eventos con filtros (`search`, `category`, `location`, `date`, `upcoming`, `available`) |
| GET | `/api/events/:id` | Publico | Detalle del evento con participantes y cupos disponibles |
| POST | `/api/events` | Organizador / Admin | Crea un nuevo evento |
| PUT | `/api/events/:id` | Duenio / Admin | Actualiza un evento existente |
| DELETE | `/api/events/:id` | Duenio / Admin | Cancela un evento (`estado: "cancelado"`) |

### 4. Inscripciones (`/api/events/:id/register` y `/api/users/me/registrations`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| POST | `/api/events/:id/register` | Autenticado | Inscribe al usuario en un evento |
| DELETE | `/api/events/:id/register` | Autenticado | Cancela la inscripcion del usuario |
| GET | `/api/users/me/registrations` | Autenticado | Lista las actividades en las que el usuario esta inscrito |

### 5. Favoritos (`/api/events/:id/favorite` y `/api/users/me/favorites`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| POST | `/api/events/:id/favorite` | Autenticado | Guarda un evento en favoritos |
| DELETE | `/api/events/:id/favorite` | Autenticado | Elimina un evento de favoritos |
| GET | `/api/users/me/favorites` | Autenticado | Lista los eventos favoritos del usuario |

### 6. Notificaciones (`/api/notifications`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| GET | `/api/notifications` | Autenticado | Lista las notificaciones del usuario ordenadas por fecha |
| PATCH | `/api/notifications/:id/read` | Autenticado | Marca una notificacion como leida |
| PATCH | `/api/notifications/read-all` | Autenticado | Marca todas las notificaciones del usuario como leidas |

### 7. Dashboard (`/api/dashboard`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| GET | `/api/dashboard` | Autenticado | Devuelve metricas y resumen segun el rol del usuario (`user`, `organizer`, `admin`) |

### 8. Administracion de Usuarios (`/api/users`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| GET | `/api/users` | Admin | Lista todos los usuarios con filtros de busqueda y rol |
| GET | `/api/users/:id` | Propio / Admin | Obtiene el perfil de un usuario |
| PUT | `/api/users/:id` | Propio / Admin | Actualiza perfil (solo Admin puede cambiar roles) |
| DELETE | `/api/users/:id` | Admin | Elimina una cuenta de usuario |

---

## Formato de Respuestas de Error

En caso de error, la API responde con la siguiente estructura JSON estandar:

```json
{
  "success": false,
  "message": "mensaje descriptivo del error"
}
```
