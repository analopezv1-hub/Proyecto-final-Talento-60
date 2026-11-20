# Talento 60

Plataforma de selección por **videocurrículum de 60 segundos**. El proyecto es full stack: React + Vite en el frontend, Express + MongoDB en el backend y un Asistente creativo para preparar el guión del video.

## Tecnologías

- React + Vite
- Express
- MongoDB + Mongoose
- JWT + bcrypt
- Asistente creativo con proveedor compatible con OpenAI y respaldo de plantillas

## Ejecutar en local

Instalar dependencias:

```bash
npm install
npm --prefix frontend install
```

Crear el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con la conexión de MongoDB y una clave para JWT. Para activar la IA real, agregar `AI_API_KEY`; sin esa clave, el Asistente creativo usa plantillas.

Levantar el backend:

```bash
npm start
```

Levantar el frontend en otra terminal:

```bash
npm run dev
```

Compilar el frontend:

```bash
npm run build
```

## Rutas principales

| Método | Ruta | Qué hace |
|--------|------|----------|
| `GET` | `/api/salud` | Comprueba que el backend está vivo |
| `POST` | `/registro` | Registra un usuario |
| `POST` | `/login` | Inicia sesión y devuelve un token JWT |
| `GET` | `/perfil` | Devuelve el usuario autenticado |
| `GET` | `/api/candidatos` | Devuelve los candidatos del feed |
| `POST` | `/api/contacto` | Guarda un mensaje de contacto |
| `POST` | `/api/ia/asistente` | Genera ideas para el guión del video |

## Variables de entorno

```env
MONGO_URI=mongodb://127.0.0.1:27017/talento60
JWT_SECRET=una_clave_larga_y_segura
FRONTEND_URL=
AI_API_KEY=
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
PORT=3000
```

El archivo `.env` no se sube al repositorio. El frontend usa `VITE_API_URL` para apuntar al backend publicado; si no se define, usa `http://localhost:3000`.

## Publicación

- **Frontend:** GitHub Pages, con el workflow `.github/workflows/pages.yml`.
- **Backend:** Render, con el blueprint `render.yaml`.
- **Base de datos:** MongoDB Atlas.

En Render hay que configurar `MONGO_URI`, `JWT_SECRET` y `FRONTEND_URL`. En GitHub hay que crear la variable `VITE_API_URL` con la URL pública de Render antes de ejecutar el workflow de Pages. El origen de `FRONTEND_URL` es el dominio de Pages, por ejemplo `https://usuario.github.io`.
