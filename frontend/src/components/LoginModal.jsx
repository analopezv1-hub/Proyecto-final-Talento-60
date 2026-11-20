// Modal de login y registro conectado al backend.
import { useState } from "react";
import { apiFetch } from "../api.js";

export default function LoginModal({ onCerrar, onLogin }) {
  // registro cambia entre login y registro; mensaje muestra el estado.
  const [registro, setRegistro] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Envía el formulario al backend: registro o login.
  async function enviar(evento) {
    evento.preventDefault();
    const datos = Object.fromEntries(new FormData(evento.currentTarget));
    setMensaje("Enviando...");

    try {
      // Si es registro, crea la cuenta; si no, inicia sesión.
      if (registro) {
        await apiFetch("/registro", { method: "POST", body: datos });
        setRegistro(false);
        setMensaje("Cuenta creada. Ahora inicia sesión.");
        return;
      }

      const respuesta = await apiFetch("/login", {
        method: "POST",
        body: datos,
      });
      onLogin(respuesta);
    } catch (error) {
      setMensaje(error.message);
    }
  }

  return (
    <div
      className="modal-login"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loginTitulo"
      onClick={(evento) => {
        // Cierra el modal al hacer clic fuera del contenido.
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="modal-login-contenido">
        <button
          className="modal-cerrar"
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="login-card">
          <h1 id="loginTitulo">
            Talento<span>60</span>
          </h1>
          <p>
            {registro
              ? "Crea tu cuenta para continuar."
              : "Inicia sesión para continuar."}
          </p>

          <form className="login-form" onSubmit={enviar}>
            {registro && (
              <>
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Tu nombre"
                  autoComplete="name"
                />

                <label htmlFor="rol">Soy</label>
                <select id="rol" name="rol" defaultValue="candidato">
                  <option value="candidato">Candidato</option>
                  <option value="empresa">Empresa</option>
                </select>
              </>
            )}

            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@correo.com"
              autoComplete="email"
              required
              autoFocus
            />

            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete={registro ? "new-password" : "current-password"}
              required
            />

            <button className="btn-comenzar" type="submit">
              {registro ? "Crear cuenta" : "Entrar"}
            </button>
            <p className="login-msg" role="status">
              {mensaje}
            </p>
          </form>

          <p className="login-nota">
            <span>
              {registro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
            </span>{" "}
            <a
              href="#"
              onClick={(evento) => {
                evento.preventDefault();
                setRegistro(!registro);
                setMensaje("");
              }}
            >
              {registro ? "Inicia sesión" : "Regístrate"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
