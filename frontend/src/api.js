// Utilidad para hablar con el backend.
// En producción viene de VITE_API_URL; en local usa el puerto 3000.
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Envía una petición JSON al backend y devuelve los datos.
export async function apiFetch(
  ruta,
  { body, token, headers = {}, ...opciones } = {},
) {
  let respuesta;

  try {
    respuesta = await fetch(API + ruta, {
      ...opciones,
      // Si hay body, se envía como JSON.
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        // Si hay token, se envía como credencial de sesión.
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const datos = await respuesta.json().catch(() => ({}));
  // Convierte errores HTTP en mensajes que React puede mostrar.
  if (!respuesta.ok) throw new Error(datos.error || "Ocurrió un error.");
  return datos;
}
