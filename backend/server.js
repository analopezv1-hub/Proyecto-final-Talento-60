// Servidor Express: rutas, autenticación, datos y asistente.
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const {
  Usuario,
  Candidato,
  Video,
  Vacante,
  Postulacion,
  Contacto,
} = require("./models");
const { CANDIDATOS } = require("./datos");
const { generarSugerencias } = require("./asistente");
const {
  CARPETA,
  MAX_BYTES,
  MAX_DURACION,
  MAX_DURACION_ORIGINAL,
  configurado: cloudinaryConfigurado,
  crearFirma,
  crearUrlRecortada,
  crearPosterVideo,
} = require("./cloudinary");

const app = express();

// En producción, FRONTEND_URL limita los orígenes permitidos.
const origenes = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

if (origenes.length > 0) {
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        ...origenes,
      ],
    }),
  );
} else {
  app.use(cors());
}

app.use(express.json()); // Permite leer el cuerpo JSON que envía React.

// En local usa MongoDB; en Render viene de la variable de entorno.
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/talento60";

// Conecta a MongoDB y carga candidatos de ejemplo si hace falta.
async function conectarBase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");

    if ((await Candidato.countDocuments()) === 0) {
      await Candidato.insertMany(CANDIDATOS);
      console.log("Candidatos de ejemplo cargados");
    }
  } catch (error) {
    console.error("Error de conexión:", error.message);
  }
}

conectarBase();

// Comprueba que el servidor está vivo.
app.get("/api/salud", (req, res) => {
  res.json({ ok: true });
});

// REGISTRO: crea un usuario con la contraseña cifrada.
app.post("/registro", async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "El correo no es válido" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }
  if (rol && !["candidato", "empresa"].includes(rol)) {
    return res.status(400).json({ error: "Rol no válido" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    await Usuario.create({ nombre, email, password: hash, rol });
    res.status(201).json({ mensaje: "Usuario creado" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Ese correo ya está registrado" });
    }
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// LOGIN: valida la contraseña y devuelve un token.
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const coincide = await bcrypt.compare(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET || "clave-de-desarrollo",
      { expiresIn: "2h" },
    );

    res.json({
      token,
      usuario: {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// Middleware: exige un token Bearer válido.
function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    req.usuario = jwt.verify(
      header.split(" ")[1],
      process.env.JWT_SECRET || "clave-de-desarrollo",
    );
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
}

// Middleware: una vacante solo la maneja una empresa.
function soloEmpresa(req, res, next) {
  if (req.usuario?.rol !== "empresa") {
    return res.status(403).json({ error: "Solo una empresa puede hacer esto" });
  }
  next();
}

// Middleware: las postulaciones las crea un candidato.
function soloCandidato(req, res, next) {
  if (req.usuario?.rol !== "candidato") {
    return res
      .status(403)
      .json({ error: "Solo un candidato puede postularse" });
  }
  next();
}

// Convierte las habilidades separadas por coma en una lista limpia.
function limpiarSkills(skills) {
  const lista = Array.isArray(skills)
    ? skills
    : typeof skills === "string"
      ? skills.split(",")
      : [];
  return [
    ...new Set(lista.map((skill) => String(skill).trim()).filter(Boolean)),
  ].slice(0, 10);
}

// Ficha pública de una vacante, sin datos privados de la empresa.
function datosVacante(vacante, postulaciones = 0) {
  return {
    _id: vacante._id,
    titulo: vacante.titulo,
    descripcion: vacante.descripcion,
    ciudad: vacante.ciudad,
    modalidad: vacante.modalidad,
    categoria: vacante.categoria,
    skills: vacante.skills,
    estado: vacante.estado,
    creado: vacante.creado,
    empresaNombre:
      vacante.empresa?.nombre || vacante.empresaNombre || "Empresa",
    postulaciones,
  };
}

// PERFIL: devuelve el usuario autenticado.
app.get("/perfil", verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select("-password");
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// CANDIDATOS: alimenta el feed desde MongoDB y suma los videos subidos.
app.get("/api/candidatos", async (req, res) => {
  try {
    const candidatos = await Candidato.find().sort({ id: 1 });

    // Los videos subidos se convierten en tarjetas del feed.
    let videos = [];
    try {
      videos = await Video.find({ estado: "publicado" })
        .populate("usuario", "nombre")
        .sort({ creado: -1 });
    } catch (error) {
      console.error("No se pudieron cargar los videos del feed:", error.message);
    }

    const deVideos = videos.map((video) => {
      const segundos = Math.round(Number(video.duracion) || 0);
      const minutos = Math.floor(segundos / 60);
      const resto = String(segundos % 60).padStart(2, "0");

      return {
        id: `video-${video._id}`,
        nombre: video.usuario?.nombre || "Candidato",
        edad: video.edad || null,
        cargo: video.cargo || "Candidato",
        categoria: video.categoria || "Otro",
        skills: Array.isArray(video.skills) ? video.skills : [],
        duracion: `${minutos}:${resto}`,
        match: null,
        imagen:
          video.posterUrl ||
          (video.publicId ? crearPosterVideo(video.publicId) : ""),
        videoUrl: video.url,
        esVideoSubido: true,
      };
    });

    res.json([...deVideos, ...candidatos]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar los candidatos" });
  }
});

// CONTACTO: guarda el mensaje del formulario.
app.post("/api/contacto", async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: "Completa todos los campos" });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "El correo no es válido" });
  }

  try {
    await Contacto.create({ nombre, email, mensaje });
    res.status(201).json({ mensaje: "Mensaje recibido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo enviar el mensaje" });
  }
});

// VACANTES: lista pública de vacantes abiertas.
app.get("/api/vacantes", async (req, res) => {
  try {
    const vacantes = await Vacante.find({ estado: "abierta" })
      .populate("empresa", "nombre")
      .sort({ creado: -1 });
    res.json(vacantes.map((vacante) => datosVacante(vacante)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar las vacantes" });
  }
});

// VACANTES: lista las vacantes de la empresa autenticada.
app.get("/api/vacantes/mias", verificarToken, soloEmpresa, async (req, res) => {
  try {
    const vacantes = await Vacante.find({ empresa: req.usuario.id })
      .populate("empresa", "nombre")
      .sort({ creado: -1 });
    const respuesta = await Promise.all(
      vacantes.map(async (vacante) => {
        const total = await Postulacion.countDocuments({ vacante: vacante._id });
        return datosVacante(vacante, total);
      }),
    );
    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar tus vacantes" });
  }
});

// VACANTES: publica una vacante nueva.
app.post("/api/vacantes", verificarToken, soloEmpresa, async (req, res) => {
  const {
    titulo,
    descripcion,
    ciudad,
    modalidad,
    categoria,
    skills,
  } = req.body;

  if (!titulo || !descripcion) {
    return res.status(400).json({ error: "Completa título y descripción" });
  }
  if (!["Presencial", "Remoto", "Híbrido"].includes(modalidad || "Presencial")) {
    return res.status(400).json({ error: "Modalidad no válida" });
  }

  try {
    const vacante = await Vacante.create({
      empresa: req.usuario.id,
      titulo: String(titulo).trim().slice(0, 100),
      descripcion: String(descripcion).trim().slice(0, 1200),
      ciudad: String(ciudad || "").trim().slice(0, 80),
      modalidad: modalidad || "Presencial",
      categoria: String(categoria || "Otro").trim().slice(0, 60),
      skills: limpiarSkills(skills),
    });

    await vacante.populate("empresa", "nombre");
    res.status(201).json(datosVacante(vacante));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "No se pudo publicar la vacante" });
  }
});

// VACANTES: abre o cierra una vacante propia.
app.patch("/api/vacantes/:id", verificarToken, soloEmpresa, async (req, res) => {
  const { estado } = req.body;
  if (!["abierta", "cerrada"].includes(estado)) {
    return res.status(400).json({ error: "Estado no válido" });
  }

  try {
    const vacante = await Vacante.findOneAndUpdate(
      { _id: req.params.id, empresa: req.usuario.id },
      { estado },
      { new: true },
    ).populate("empresa", "nombre");

    if (!vacante) {
      return res.status(404).json({ error: "Vacante no encontrada" });
    }

    const total = await Postulacion.countDocuments({ vacante: vacante._id });
    res.json(datosVacante(vacante, total));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ error: "Vacante no encontrada" });
    }
    console.error(error);
    res.status(400).json({ error: "No se pudo actualizar la vacante" });
  }
});

// POSTULACIONES: lista los candidatos de una vacante de la empresa.
app.get(
  "/api/vacantes/:id/postulaciones",
  verificarToken,
  soloEmpresa,
  async (req, res) => {
    try {
      const vacante = await Vacante.findOne({
        _id: req.params.id,
        empresa: req.usuario.id,
      });
      if (!vacante) {
        return res.status(404).json({ error: "Vacante no encontrada" });
      }

      const postulaciones = await Postulacion.find({ vacante: vacante._id })
        .populate("candidato", "nombre email")
        .sort({ creado: -1 });

      const ids = postulaciones
        .map((postulacion) => postulacion.candidato?._id)
        .filter(Boolean);
      const videos = await Video.find({ usuario: { $in: ids } }).sort({
        creado: -1,
      });
      const videoPorUsuario = new Map();
      for (const video of videos) {
        const clave = String(video.usuario);
        if (!videoPorUsuario.has(clave)) videoPorUsuario.set(clave, video);
      }

      res.json(
        postulaciones.map((postulacion) => {
          const video = videoPorUsuario.get(
            String(postulacion.candidato?._id || ""),
          );
          return {
            _id: postulacion._id,
            mensaje: postulacion.mensaje,
            estado: postulacion.estado,
            creado: postulacion.creado,
            candidato: postulacion.candidato
              ? {
                  _id: postulacion.candidato._id,
                  nombre: postulacion.candidato.nombre,
                  email: postulacion.candidato.email,
                }
              : null,
            video: video
              ? {
                  url: video.url,
                  posterUrl: video.posterUrl,
                  edad: video.edad,
                  cargo: video.cargo,
                  skills: video.skills,
                  duracion: video.duracion,
                }
              : null,
          };
        }),
      );
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(404).json({ error: "Vacante no encontrada" });
      }
      console.error(error);
      res.status(500).json({ error: "No se pudieron cargar los postulantes" });
    }
  },
);

// POSTULACIONES: un candidato se postula a una vacante abierta.
app.post(
  "/api/vacantes/:id/postular",
  verificarToken,
  soloCandidato,
  async (req, res) => {
    const { mensaje } = req.body;

    try {
      const vacante = await Vacante.findOne({
        _id: req.params.id,
        estado: "abierta",
      });
      if (!vacante) {
        return res.status(404).json({ error: "La vacante no está disponible" });
      }

      const tieneVideo = await Video.exists({ usuario: req.usuario.id });
      if (!tieneVideo) {
        return res.status(400).json({
          error: "Sube tu videocurrículum antes de postularte",
        });
      }

      const postulacion = await Postulacion.create({
        vacante: vacante._id,
        candidato: req.usuario.id,
        mensaje: String(mensaje || "").trim().slice(0, 600),
      });

      res.status(201).json({
        mensaje: "Postulación enviada",
        postulacion,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ error: "Ya te postulaste a esta vacante" });
      }
      if (error.name === "CastError") {
        return res.status(404).json({ error: "La vacante no está disponible" });
      }
      console.error(error);
      res.status(400).json({ error: "No se pudo enviar la postulación" });
    }
  },
);

// POSTULACIONES: lista las postulaciones del candidato autenticado.
app.get(
  "/api/postulaciones/mias",
  verificarToken,
  soloCandidato,
  async (req, res) => {
    try {
      const postulaciones = await Postulacion.find({
        candidato: req.usuario.id,
      })
        .populate({
          path: "vacante",
          populate: { path: "empresa", select: "nombre" },
        })
        .sort({ creado: -1 });

      res.json(
        postulaciones.map((postulacion) => ({
          _id: postulacion._id,
          estado: postulacion.estado,
          mensaje: postulacion.mensaje,
          creado: postulacion.creado,
          vacante: postulacion.vacante
            ? {
                _id: postulacion.vacante._id,
                titulo: postulacion.vacante.titulo,
                empresaNombre:
                  postulacion.vacante.empresa?.nombre || "Empresa",
              }
            : null,
        })),
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "No se pudieron cargar tus postulaciones" });
    }
  },
);

// POSTULACIONES: la empresa actualiza el estado de un candidato.
app.patch(
  "/api/postulaciones/:id",
  verificarToken,
  soloEmpresa,
  async (req, res) => {
    const estados = [
      "recibida",
      "revisada",
      "entrevista",
      "contratada",
      "rechazada",
    ];
    const { estado } = req.body;
    if (!estados.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    try {
      const postulacion = await Postulacion.findById(req.params.id);
      if (!postulacion) {
        return res.status(404).json({ error: "Postulación no encontrada" });
      }

      const vacante = await Vacante.findOne({
        _id: postulacion.vacante,
        empresa: req.usuario.id,
      });
      if (!vacante) {
        return res.status(404).json({ error: "Postulación no encontrada" });
      }

      postulacion.estado = estado;
      await postulacion.save();
      res.json({ _id: postulacion._id, estado: postulacion.estado });
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(404).json({ error: "Postulación no encontrada" });
      }
      console.error(error);
      res.status(400).json({ error: "No se pudo actualizar la postulación" });
    }
  },
);

// VIDEO: entrega una firma temporal para subir directo a Cloudinary.
app.post("/api/videos/firma", verificarToken, (req, res) => {
  if (!cloudinaryConfigurado()) {
    return res.status(503).json({
      error: "Cloudinary no está configurado en el servidor",
    });
  }

  res.json(crearFirma());
});

// VIDEO: guarda en MongoDB la URL y los datos del video ya subido.
app.post("/api/videos", verificarToken, async (req, res) => {
  const {
    publicId,
    titulo,
    cargo,
    categoria,
    edad,
    skills,
    recortar,
    url: urlSubida,
    duracion: duracionSubida,
    bytes: bytesSubida,
    formato: formatoSubida,
  } = req.body;

  if (!publicId) {
    return res.status(400).json({ error: "Falta el identificador del video" });
  }
  if (!cloudinaryConfigurado()) {
    return res.status(503).json({
      error: "Cloudinary no está configurado en el servidor",
    });
  }

  // Solo se aceptan videos subidos a la carpeta firmada por este backend.
  if (!publicId.startsWith(`${CARPETA}/`)) {
    return res.status(400).json({ error: "El video no pertenece a Talento 60" });
  }

  try {
    // La subida firmada ya fue aceptada por Cloudinary. Se validan la URL
    // y los límites con los datos que devolvió esa misma subida.
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const urlValida =
      urlSubida &&
      urlSubida.startsWith(
        `https://res.cloudinary.com/${cloud}/video/upload/`,
      );

    if (!urlValida || !Number.isFinite(Number(duracionSubida))) {
      return res.status(400).json({
        error: "La subida no contiene datos válidos. Inténtalo de nuevo.",
      });
    }

    const recurso = {
      duration: Number(duracionSubida),
      bytes: Number(bytesSubida) || 0,
      secure_url: urlSubida,
      public_id: publicId,
      format: formatoSubida || "",
    };

    const duracion = Number(recurso.duration);
    const aceptaRecorte = recortar === true || recortar === "true";

    if (duracion > MAX_DURACION_ORIGINAL + 0.5) {
      return res.status(400).json({
        error: `El video dura más de ${MAX_DURACION_ORIGINAL / 60} minutos. Recórtalo antes de subirlo.`,
      });
    }

    if (!aceptaRecorte && duracion > MAX_DURACION + 0.5) {
      return res.status(400).json({
        error: `El video dura ${duracion.toFixed(1)} s. El máximo es ${MAX_DURACION} s.`,
        requiereRecorte: true,
        duracion,
      });
    }

    if (Number(recurso.bytes) > MAX_BYTES) {
      return res.status(400).json({ error: "El video supera los 50 MB" });
    }

    // Si el usuario aceptó, se guarda una URL que reproduce solo 60 segundos.
    const seRecorta = aceptaRecorte && duracion > MAX_DURACION + 0.5;
    const url = seRecorta
      ? crearUrlRecortada(recurso.public_id)
      : recurso.secure_url;

    // Edad y habilidades son opcionales, pero deben ser válidas.
    let edadFinal = null;
    if (edad !== undefined && edad !== null && edad !== "") {
      const numeroEdad = Number(edad);
      if (!Number.isFinite(numeroEdad) || numeroEdad < 18 || numeroEdad > 100) {
        return res.status(400).json({
          error: "La edad debe estar entre 18 y 100 años.",
        });
      }
      edadFinal = numeroEdad;
    }

    const listaSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
        ? skills.split(",")
        : [];
    const skillsFinal = [
      ...new Set(listaSkills.map((skill) => String(skill).trim()).filter(Boolean)),
    ].slice(0, 10);

    const video = await Video.create({
      usuario: req.usuario.id,
      titulo: (titulo || "Mi videocurrículum").trim(),
      cargo: (cargo || "").trim(),
      categoria: (categoria || "").trim(),
      edad: edadFinal,
      skills: skillsFinal,
      url,
      urlOriginal: recurso.secure_url,
      posterUrl: crearPosterVideo(recurso.public_id),
      publicId: recurso.public_id,
      duracion: seRecorta
        ? MAX_DURACION
        : Math.round(duracion * 10) / 10,
      duracionOriginal: Math.round(duracion * 10) / 10,
      recortado: seRecorta,
      formato: recurso.format || "",
      bytes: Number(recurso.bytes) || 0,
    });

    res.status(201).json(video);
  } catch (error) {
    console.error("Error al guardar el video:", error.message || error);
    res.status(400).json({
      error: "No se pudo guardar el video. Inténtalo de nuevo.",
    });
  }
});

// VIDEO: actualiza los datos visibles de un video del usuario.
app.patch("/api/videos/:id", verificarToken, async (req, res) => {
  const { titulo, cargo, categoria, edad, skills } = req.body;

  try {
    const video = await Video.findOne({
      _id: req.params.id,
      usuario: req.usuario.id,
    });

    if (!video) {
      return res.status(404).json({ error: "Video no encontrado" });
    }

    if (titulo !== undefined) {
      video.titulo = String(titulo).trim() || "Mi videocurrículum";
    }
    if (cargo !== undefined) video.cargo = String(cargo).trim();
    if (categoria !== undefined) video.categoria = String(categoria).trim();

    if (edad !== undefined) {
      if (edad === "" || edad === null) {
        video.edad = null;
      } else {
        const numeroEdad = Number(edad);
        if (!Number.isFinite(numeroEdad) || numeroEdad < 18 || numeroEdad > 100) {
          return res.status(400).json({
            error: "La edad debe estar entre 18 y 100 años.",
          });
        }
        video.edad = numeroEdad;
      }
    }

    if (skills !== undefined) {
      const listaSkills = Array.isArray(skills)
        ? skills
        : String(skills).split(",");
      video.skills = [
        ...new Set(
          listaSkills.map((skill) => String(skill).trim()).filter(Boolean),
        ),
      ].slice(0, 10);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ error: "Video no encontrado" });
    }
    console.error("Error al editar el video:", error.message || error);
    res.status(400).json({
      error: "No se pudieron guardar los datos del video.",
    });
  }
});

// VIDEO: lista los videos del usuario autenticado.
app.get("/api/videos/mios", verificarToken, async (req, res) => {
  try {
    const videos = await Video.find({ usuario: req.usuario.id }).sort({
      creado: -1,
    });
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudieron cargar tus videos" });
  }
});

// ASISTENTE CREATIVO: propone ideas para el video de 60 segundos.
app.post("/api/ia/asistente", async (req, res) => {
  const { rol, detalles } = req.body;

  if (!rol && !detalles) {
    return res.status(400).json({ error: "Cuéntanos un poco sobre ti" });
  }

  const sugerencias = await generarSugerencias({ rol, detalles });
  res.json(sugerencias);
});

const puerto = process.env.PORT || 3000;
// Render asigna el puerto automáticamente.
app.listen(puerto, () => {
  console.log(`Servidor en http://localhost:${puerto}`);
});
