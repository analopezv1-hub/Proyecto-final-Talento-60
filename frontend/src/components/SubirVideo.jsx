// Subida real de video a Cloudinary y guardado de la URL en MongoDB.
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api.js";

const CATEGORIAS = ["Diseño UX", "Desarrollo", "Marketing", "Producto", "Otro"];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB
const MAX_DURACION = 60; // segundos que se muestran
const MAX_DURACION_ORIGINAL = 120; // límite para aceptar y recortar

// Sube el archivo directo a Cloudinary y avisa el porcentaje de avance.
function subirACloudinary(formData, cloudName, alProgresar) {
  return new Promise((resolve, reject) => {
    const peticion = new XMLHttpRequest();
    peticion.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    );

    peticion.upload.onprogress = (evento) => {
      if (evento.lengthComputable) {
        alProgresar(Math.round((evento.loaded / evento.total) * 100));
      }
    };

    peticion.onload = () => {
      let datos = {};
      try {
        datos = JSON.parse(peticion.responseText);
      } catch {
        // Si Cloudinary no responde JSON, se muestra un error genérico.
      }

      if (peticion.status >= 200 && peticion.status < 300) {
        resolve(datos);
      } else {
        // El detalle técnico se queda en la consola; la persona ve un mensaje simple.
        console.error("Error de Cloudinary:", datos.error || peticion.statusText);
        reject(
          new Error("No se pudo subir el video. Inténtalo de nuevo."),
        );
      }
    };

    peticion.onerror = () =>
      reject(new Error("No se pudo conectar con el servidor de videos."));
    peticion.send(formData);
  });
}

export default function SubirVideo({ sesion, onLogin, onPerfil }) {
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState("");
  const [duracion, setDuracion] = useState(0);
  const [titulo, setTitulo] = useState("Mi videocurrículum");
  const [cargo, setCargo] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [edad, setEdad] = useState("");
  const [skills, setSkills] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [excedeDuracion, setExcedeDuracion] = useState(false);
  const [recortar, setRecortar] = useState(false);
  const [videoGuardado, setVideoGuardado] = useState(null);
  const [videos, setVideos] = useState([]);
  const [cargandoVideos, setCargandoVideos] = useState(false);
  const inputArchivo = useRef(null);
  const exitoRef = useRef(null);

  // Lleva la vista al aviso cuando el video termina de guardarse.
  useEffect(() => {
    if (videoGuardado) {
      exitoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [videoGuardado]);

  // Libera la URL temporal del navegador al cambiar o salir.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Carga los videos que el usuario ya tiene guardados.
  useEffect(() => {
    if (!sesion?.token) {
      setVideos([]);
      return undefined;
    }

    let activo = true;
    setCargandoVideos(true);

    apiFetch("/api/videos/mios", { token: sesion.token })
      .then((datos) => {
        if (activo && Array.isArray(datos)) setVideos(datos);
      })
      .catch(() => {})
      .finally(() => {
        if (activo) setCargandoVideos(false);
      });

    return () => {
      activo = false;
    };
  }, [sesion?.token]);

  // Valida el archivo y obtiene su duración antes de subirlo.
  function elegirVideo(evento) {
    const seleccionado = evento.target.files?.[0];
    setMensaje("");
    setError("");
    setVideoGuardado(null);
    setProgreso(0);
    setArchivo(null);
    setPreview("");
    setDuracion(0);
    setExcedeDuracion(false);
    setRecortar(false);

    if (!seleccionado) return;

    if (!seleccionado.type.startsWith("video/")) {
      setError("Selecciona un archivo de video.");
      evento.target.value = "";
      return;
    }
    if (seleccionado.size > MAX_BYTES) {
      setError("El video supera los 50 MB.");
      evento.target.value = "";
      return;
    }

    const url = URL.createObjectURL(seleccionado);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const segundos = Number(video.duration);

      if (!Number.isFinite(segundos) || segundos <= 0) {
        URL.revokeObjectURL(url);
        setError("No se pudo leer la duración del video.");
        return;
      }

      // Más de dos minutos: se pide recortarlo antes de subirlo.
      if (segundos > MAX_DURACION_ORIGINAL + 0.5) {
        URL.revokeObjectURL(url);
        setError(
          "El video dura más de 2 minutos. Recórtalo antes de subirlo.",
        );
        evento.target.value = "";
        return;
      }

      // Si supera 60 segundos, se conserva para ofrecer el recorte.
      setArchivo(seleccionado);
      setPreview(url);
      setDuracion(segundos);
      setExcedeDuracion(segundos > MAX_DURACION + 0.5);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      setError("No se pudo leer el video. Prueba con MP4, WebM o MOV.");
    };

    video.src = url;
  }

  // El usuario acepta que se muestren solo los primeros 60 segundos.
  function aceptarRecorte() {
    setRecortar(true);
    setError("");
  }

  // Pide la firma, sube a Cloudinary y guarda la URL en el backend.
  async function enviarVideo(evento) {
    evento.preventDefault();

    if (!sesion?.token) {
      onLogin?.();
      return;
    }
    if (!archivo) {
      setError("Selecciona un video primero.");
      return;
    }
    if (excedeDuracion && !recortar) {
      setError("El video supera los 60 segundos. Acepta el recorte o elige otro video.");
      return;
    }

    setSubiendo(true);
    setError("");
    setMensaje("");
    setProgreso(0);
    setVideoGuardado(null);

    try {
      const firma = await apiFetch("/api/videos/firma", {
        method: "POST",
        token: sesion.token,
      });

      if (
        duracion >
        (firma.maxDuracionOriginal || MAX_DURACION_ORIGINAL) + 0.5
      ) {
        throw new Error(
          "El video dura más de 2 minutos. Recórtalo antes de subirlo.",
        );
      }

      if (duracion > (firma.maxDuracion || MAX_DURACION) + 0.5 && !recortar) {
        throw new Error(
          "El video supera los 60 segundos. Acepta el recorte o elige otro video.",
        );
      }

      const formulario = new FormData();
      formulario.append("file", archivo);
      formulario.append("api_key", firma.apiKey);
      formulario.append("timestamp", String(firma.timestamp));
      formulario.append("signature", firma.signature);
      formulario.append("folder", firma.folder);

      const subido = await subirACloudinary(
        formulario,
        firma.cloudName,
        setProgreso,
      );

      const guardado = await apiFetch("/api/videos", {
        method: "POST",
        token: sesion.token,
        body: {
          publicId: subido.public_id,
          titulo,
          cargo,
          categoria,
          recortar,
          url: subido.secure_url,
          duracion: subido.duration,
          bytes: subido.bytes,
          formato: subido.format,
          edad,
          skills,
        },
      });

      setVideoGuardado(guardado);
      setVideos((anteriores) => [guardado, ...anteriores]);
      setMensaje("Video subido y guardado correctamente.");
      setProgreso(100);

      // Se limpia la selección para que se pueda subir otro video.
      setArchivo(null);
      setPreview("");
      setDuracion(0);
      setExcedeDuracion(false);
      setRecortar(false);
      if (inputArchivo.current) inputArchivo.current.value = "";
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <article className="card subir-video">
      <div className="subir-cabecera">
        <span className="subir-icono" aria-hidden="true">
          <i className="fa-solid fa-cloud-arrow-up" />
        </span>
        <div>
          <h2>Sube tu videocurrículum</h2>
          <p>Sube tu video y guárdalo en tu perfil.</p>
        </div>
      </div>

      {videoGuardado && (
        <div className="subir-exito" role="status" ref={exitoRef}>
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          <div>
            <strong>¡Video subido!</strong>
            <p>Ya está guardado y puedes verlo en tu perfil.</p>
          </div>
          <button
            className="btn btn-morado btn-sm"
            type="button"
            onClick={onPerfil}
          >
            Ver mi perfil
          </button>
        </div>
      )}

      {!sesion ? (
        <div className="subir-bloqueado">
          <p>Inicia sesión para subir y guardar tu video de 60 segundos.</p>
          <button className="btn btn-morado" type="button" onClick={onLogin}>
            Iniciar sesión
          </button>
        </div>
      ) : (
        <>
          <form
            className="asistente-form subir-form"
            onSubmit={enviarVideo}
          >
            <label htmlFor="video-archivo">Archivo de video</label>
            <input
              ref={inputArchivo}
              id="video-archivo"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={elegirVideo}
              disabled={subiendo}
            />
            <p className="subir-ayuda">
              MP4, WebM o MOV · máximo 50 MB. Si dura hasta 2 minutos, puedes
              recortarlo a 60 segundos.
            </p>

            {archivo && (
              <div className="subir-preview">
                <video src={preview} controls playsInline />
                <p>
                  <strong>{archivo.name}</strong>
                  <span>
                    {duracion.toFixed(1)} s ·{" "}
                    {(archivo.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </p>
              </div>
            )}

            {excedeDuracion && !recortar && (
              <div className="subir-aviso">
                <strong>
                  El video dura {duracion.toFixed(1)} s y supera los 60 s.
                </strong>
                <p>
                  Talento 60 solo muestra los primeros 60 segundos. ¿Quieres
                  recortar los últimos {Math.ceil(duracion - MAX_DURACION)} s?
                </p>
                <div className="subir-acciones">
                  <button
                    className="btn btn-coral btn-sm"
                    type="button"
                    onClick={aceptarRecorte}
                    disabled={subiendo}
                  >
                    Sí, recortar a 60 s
                  </button>
                  <button
                    className="btn btn-blanco btn-sm"
                    type="button"
                    onClick={() => inputArchivo.current?.click()}
                    disabled={subiendo}
                  >
                    Elegir otro video
                  </button>
                </div>
              </div>
            )}

            {recortar && (
              <div className="subir-aviso ok">
                <strong>Recorte aceptado.</strong>
                <p>
                  Se subirá el video completo, pero solo se mostrarán los
                  primeros 60 segundos.
                </p>
              </div>
            )}

            <label htmlFor="video-titulo">Título</label>
            <input
              id="video-titulo"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              maxLength={80}
              disabled={subiendo}
            />

            <label htmlFor="video-cargo">Cargo o profesión</label>
            <input
              id="video-cargo"
              value={cargo}
              onChange={(evento) => setCargo(evento.target.value)}
              placeholder="Ej.: Diseñadora UX"
              maxLength={80}
              disabled={subiendo}
            />

            <label htmlFor="video-edad">Edad (opcional)</label>
            <input
              id="video-edad"
              type="number"
              min="18"
              max="100"
              value={edad}
              onChange={(evento) => setEdad(evento.target.value)}
              placeholder="Ej.: 25"
              disabled={subiendo}
            />

            <label htmlFor="video-skills">
              Habilidades (separadas por coma)
            </label>
            <input
              id="video-skills"
              value={skills}
              onChange={(evento) => setSkills(evento.target.value)}
              placeholder="Ej.: Figma, investigación, ventas"
              maxLength={200}
              disabled={subiendo}
            />

            <label htmlFor="video-categoria">Categoría</label>
            <select
              id="video-categoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              disabled={subiendo}
            >
              {CATEGORIAS.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>

            <button
              className="btn btn-coral"
              type="submit"
              disabled={subiendo || !archivo || (excedeDuracion && !recortar)}
            >
              {subiendo
                ? "Subiendo..."
                : recortar
                  ? "Subir video recortado"
                  : "Subir video"}
            </button>

            {subiendo && (
              <div className="subir-progreso">
                <progress max="100" value={progreso} />
                <span>{progreso}%</span>
              </div>
            )}

            {mensaje && (
              <p className="login-msg exito" role="status">
                {mensaje}
              </p>
            )}
            {error && (
              <p className="login-msg error" role="alert">
                {error}
              </p>
            )}
          </form>

          {videoGuardado && (
            <div className="subir-guardado">
              <h3>Tu video quedó guardado</h3>
              <video src={videoGuardado.url} controls playsInline />
              <button
                className="btn btn-blanco btn-sm"
                type="button"
                onClick={onPerfil}
              >
                Ver en mi perfil
              </button>
            </div>
          )}

          <div className="mis-videos">
            <h3>Mis videos</h3>
            {cargandoVideos && <p>Cargando...</p>}
            {!cargandoVideos && videos.length === 0 && (
              <p>Aún no has subido ningún video.</p>
            )}
            {videos.map((video) => (
              <article key={video._id} className="mis-video-item">
                <video src={video.url} controls playsInline preload="metadata" />
                <div>
                  <strong>{video.titulo}</strong>
                  <span>
                    {video.cargo || "Sin cargo"} ·{" "}
                    {Number(video.duracion || 0).toFixed(1)} s
                    {video.recortado ? " · recortado a 60 s" : ""}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
