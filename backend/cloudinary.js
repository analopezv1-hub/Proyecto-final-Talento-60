// Configuración y firma de subidas de video con Cloudinary.
// La clave secreta vive solo aquí, en el backend.
const cloudinary = require("cloudinary").v2;

const CARPETA = "talento60/videos";
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_DURACION = 60; // segundos que se muestran
const MAX_DURACION_ORIGINAL = 120; // límite para aceptar y recortar

// Comprueba si las tres variables están configuradas.
function configurado() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

if (configurado()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Devuelve los datos que React necesita para subir directo a Cloudinary.
// La firma demuestra que el pedido fue autorizado por este backend.
function crearFirma() {
  if (!configurado()) {
    throw new Error("Cloudinary no está configurado");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: CARPETA },
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder: CARPETA,
    signature,
    maxBytes: MAX_BYTES,
    maxDuracion: MAX_DURACION,
    maxDuracionOriginal: MAX_DURACION_ORIGINAL,
  };
}

// Genera una URL que reproduce solo los primeros 60 segundos.
function crearUrlRecortada(publicId) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    transformation: [{ start_offset: 0, end_offset: MAX_DURACION }],
  });
}

// Genera una imagen de portada a partir del primer fotograma.
function crearPosterVideo(publicId) {
  return cloudinary.url(publicId, {
    resource_type: "video",
    secure: true,
    format: "jpg",
    transformation: [{ start_offset: 0 }],
  });
}

// Consulta el archivo en Cloudinary para comprobar duración y tamaño reales.
function buscarVideo(publicId) {
  return cloudinary.api.resource(publicId, { resource_type: "video" });
}

module.exports = {
  CARPETA,
  MAX_BYTES,
  MAX_DURACION,
  MAX_DURACION_ORIGINAL,
  configurado,
  crearFirma,
  crearUrlRecortada,
  crearPosterVideo,
  buscarVideo,
};
