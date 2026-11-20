// Modelos de MongoDB: usuarios, candidatos, videos y contactos.
const mongoose = require("mongoose");

// Usuario que se registra o inicia sesión.
const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true, default: "" },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    rol: {
      type: String,
      enum: ["candidato", "empresa"],
      default: "candidato",
    },
    creado: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// Candidato que se muestra en el feed.
const candidatoSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    nombre: { type: String, required: true, trim: true },
    edad: { type: Number, required: true },
    cargo: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, trim: true },
    // Habilidades que se muestran como etiquetas en la tarjeta.
    skills: [{ type: String, trim: true }],
    duracion: { type: String, required: true },
    match: { type: Number, required: true },
    imagen: { type: String, required: true },
  },
  { versionKey: false },
);

// Video subido a Cloudinary y asociado a un usuario.
const videoSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    titulo: { type: String, trim: true, default: "Mi videocurrículum" },
    cargo: { type: String, trim: true, default: "" },
    categoria: { type: String, trim: true, default: "" },
    edad: { type: Number, min: 18, max: 100, default: null },
    skills: [{ type: String, trim: true }],
    // URL pública del video en Cloudinary.
    url: { type: String, required: true },
    // URL original, por si el video se recortó a 60 segundos.
    urlOriginal: { type: String, default: "" },
    posterUrl: { type: String, default: "" },
    publicId: { type: String, required: true },
    duracion: { type: Number, required: true },
    duracionOriginal: { type: Number, default: 0 },
    recortado: { type: Boolean, default: false },
    formato: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ["publicado", "oculto"],
      default: "publicado",
    },
    creado: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// Vacante publicada por una empresa.
const vacanteSchema = new mongoose.Schema(
  {
    empresa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    titulo: { type: String, required: true, trim: true, maxlength: 100 },
    descripcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    ciudad: { type: String, trim: true, default: "" },
    modalidad: {
      type: String,
      enum: ["Presencial", "Remoto", "Híbrido"],
      default: "Presencial",
    },
    categoria: { type: String, trim: true, default: "Otro" },
    skills: [{ type: String, trim: true }],
    estado: {
      type: String,
      enum: ["abierta", "cerrada"],
      default: "abierta",
      index: true,
    },
    creado: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// Postulación de un candidato a una vacante.
const postulacionSchema = new mongoose.Schema(
  {
    vacante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vacante",
      required: true,
      index: true,
    },
    candidato: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
      index: true,
    },
    mensaje: { type: String, trim: true, default: "", maxlength: 600 },
    estado: {
      type: String,
      enum: ["recibida", "revisada", "entrevista", "contratada", "rechazada"],
      default: "recibida",
    },
    creado: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// Un candidato solo puede postularse una vez a la misma vacante.
postulacionSchema.index({ vacante: 1, candidato: 1 }, { unique: true });

// Mensaje que llega desde el formulario de contacto.
const contactoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    mensaje: { type: String, required: true, trim: true },
    creado: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

module.exports = {
  Usuario: mongoose.model("Usuario", usuarioSchema),
  Candidato: mongoose.model("Candidato", candidatoSchema),
  Video: mongoose.model("Video", videoSchema),
  Vacante: mongoose.model("Vacante", vacanteSchema),
  Postulacion: mongoose.model("Postulacion", postulacionSchema),
  Contacto: mongoose.model("Contacto", contactoSchema),
};
