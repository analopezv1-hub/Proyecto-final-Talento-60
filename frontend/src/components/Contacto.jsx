// Formulario de contacto: envía nombre, correo y mensaje al backend.
import { useState } from "react";
import { apiFetch } from "../api.js";

export default function Contacto({ empresa = false }) {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    // Convierte los campos del formulario en un objeto.
    const datos = Object.fromEntries(new FormData(formulario));
    setEnviando(true);
    setMensaje("");

    try {
      const respuesta = await apiFetch("/api/contacto", {
        method: "POST",
        body: datos,
      });
      setMensaje(respuesta.mensaje);
      // Limpia el formulario después de guardar.
      formulario.reset();
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <article className="card contacto-card">
      <span className="badge badge-coral">
        {empresa ? "Empresa" : "Contacto"}
      </span>
      <h2>{empresa ? "Publica tu vacante" : "¿Hablamos?"}</h2>
      <p>
        {empresa
          ? "Describe el cargo y el perfil que buscas. Te responderemos pronto."
          : "¿Tienes dudas? Escríbenos y te responderemos pronto."}
      </p>

      <form className="login-form contacto-form" onSubmit={enviar}>
        <label htmlFor="contacto-nombre">Nombre</label>
        <input
          id="contacto-nombre"
          name="nombre"
          type="text"
          placeholder="Tu nombre"
          required
        />

        <label htmlFor="contacto-email">Correo</label>
        <input
          id="contacto-email"
          name="email"
          type="email"
          placeholder="tu@correo.com"
          required
        />

        <label htmlFor="contacto-mensaje">
          {empresa ? "Descripción de la vacante" : "Mensaje"}
        </label>
        <textarea
          id="contacto-mensaje"
          name="mensaje"
          rows="4"
          placeholder={
            empresa
              ? "Cargo, habilidades y ciudad o remoto"
              : "Cuéntanos qué necesitas"
          }
          required
        />

        <button className="btn btn-morado" type="submit" disabled={enviando}>
          {enviando
            ? "Enviando..."
            : empresa
              ? "Enviar vacante"
              : "Enviar mensaje"}
        </button>
        <p className="login-msg" role="status">
          {mensaje}
        </p>
      </form>
    </article>
  );
}
