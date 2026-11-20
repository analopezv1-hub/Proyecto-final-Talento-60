// Componente raíz: controla vistas, sesión y modal.
import { useEffect, useState } from "react";
import Bienvenida from "./components/Bienvenida.jsx";
import Navbar from "./components/Navbar.jsx";
import LoginModal from "./components/LoginModal.jsx";
import Inicio from "./components/Inicio.jsx";
import Feed from "./components/Feed.jsx";
import Procesos from "./components/Procesos.jsx";
import Mensajes from "./components/Mensajes.jsx";
import Perfil from "./components/Perfil.jsx";
import CtaFinal from "./components/CtaFinal.jsx";
import Footer from "./components/Footer.jsx";
import { useAnimaciones } from "./useAnimaciones.js";

const VISTAS = ["inicio", "feed", "procesos", "mensajes", "perfil"];

// Lee la sesión guardada en el navegador.
function leerSesion() {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  return token && usuario ? { token, usuario } : null;
}

// Devuelve una vista válida a partir del hash.
function leerVista() {
  const id = location.hash.slice(1);
  return VISTAS.includes(id) ? id : "inicio";
}

export default function App() {
  // Guarda la vista visible y si ya se salió de la bienvenida.
  const [vista, setVista] = useState(leerVista);
  const [enLanding, setEnLanding] = useState(() =>
    VISTAS.includes(location.hash.slice(1)),
  );
  // Controla el modal de login; sesion guarda el usuario logueado.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [sesion, setSesion] = useState(leerSesion);

  useAnimaciones(enLanding, vista);

  useEffect(() => {
    // Mantiene la vista sincronizada si cambia el hash manualmente.
    const alCambiarHash = () => {
      setVista(leerVista());
      setEnLanding(VISTAS.includes(location.hash.slice(1)));
    };

    window.addEventListener("hashchange", alCambiarHash);
    return () => window.removeEventListener("hashchange", alCambiarHash);
  }, []);

  useEffect(() => {
    // Bloquea el scroll y permite cerrar el modal con Escape.
    document.body.classList.toggle("modal-abierto", modalAbierto);
    const alPresionar = (evento) => {
      if (evento.key === "Escape") setModalAbierto(false);
    };

    document.addEventListener("keydown", alPresionar);
    return () => {
      document.body.classList.remove("modal-abierto");
      document.removeEventListener("keydown", alPresionar);
    };
  }, [modalAbierto]);

  // Cambia de vista sin recargar y actualiza el hash.
  function navegar(id) {
    setVista(id);
    setEnLanding(true);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo(0, 0);
  }

  // Guarda la sesión y cierra el modal.
  function iniciarSesion(datos) {
    localStorage.setItem("token", datos.token);
    localStorage.setItem("usuario", JSON.stringify(datos.usuario));
    setSesion(datos);
    setModalAbierto(false);
  }

  // Borra la sesión del navegador.
  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setSesion(null);
  }

  // Vuelve a la bienvenida y limpia el hash.
  function volverAlInicio() {
    setEnLanding(false);
    history.replaceState(null, "", location.pathname + location.search);
  }

  return (
    <>
      {enLanding ? (
        <div id="pagina">
          <Navbar
            vista={vista}
            sesion={sesion}
            onNavegar={navegar}
            onInicio={volverAlInicio}
            onLogin={() => setModalAbierto(true)}
            onPerfil={() => navegar("perfil")}
            onCerrarSesion={cerrarSesion}
          />
          <main className="contenedor">
            {vista === "inicio" && <Inicio onNavegar={navegar} />}
            {vista === "feed" && <Feed />}
            {vista === "procesos" && (
              <Procesos
                sesion={sesion}
                onLogin={() => setModalAbierto(true)}
                onPerfil={() => navegar("perfil")}
                onNavegar={navegar}
              />
            )}
            {vista === "mensajes" && (
              <Mensajes
                sesion={sesion}
                onLogin={() => setModalAbierto(true)}
                onNavegar={navegar}
              />
            )}
            {vista === "perfil" && (
              <Perfil
                sesion={sesion}
                onLogin={() => setModalAbierto(true)}
                onNavegar={navegar}
              />
            )}
            <CtaFinal
              onNavegar={navegar}
              esEmpresa={sesion?.usuario?.rol === "empresa"}
            />
          </main>
          <Footer onNavegar={navegar} />
        </div>
      ) : (
        <Bienvenida
          sesion={sesion}
          onComenzar={() => navegar("inicio")}
          onLogin={() => setModalAbierto(true)}
        />
      )}

      {modalAbierto && (
        <LoginModal
          onCerrar={() => setModalAbierto(false)}
          onLogin={iniciarSesion}
        />
      )}
    </>
  );
}
