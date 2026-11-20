<<<<<<< HEAD
// Barra superior: navegación, sesión y botón de login.
=======
// Barra superior: logo, navegación, sesión y botón de login.
>>>>>>> c357cb59b3765412cbead97dff2bf4c26e8bc65e
import avatar from "../Imagenes/avatar.svg";

// Enlaces de las cuatro vistas principales.
const ENLACES = [
  { id: "inicio", texto: "Inicio & Explorar" },
  { id: "feed", texto: "Feed de Evaluación" },
  { id: "procesos", texto: "Estudio de Grabación" },
  { id: "mensajes", texto: "Gestión de Vacantes" },
];

export default function Navbar({
  vista,
  sesion,
  onNavegar,
  onInicio,
  onLogin,
  onPerfil,
  onCerrarSesion,
}) {
  const esEmpresa = sesion?.usuario?.rol === "empresa";

  // La empresa no ve las opciones de candidato.
  const enlaces = esEmpresa
    ? [
        { id: "inicio", texto: "Inicio & Explorar" },
        { id: "feed", texto: "Feed de Evaluación" },
        { id: "mensajes", texto: "Publicar vacante" },
      ]
    : ENLACES;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-fila">
          <button
            className="logo"
            type="button"
            onClick={onInicio}
            aria-label="Volver a la bienvenida"
          >
            Talento<span>60</span>
          </button>

<<<<<<< HEAD
=======
          <nav className="menu" aria-label="Navegación principal">
            {enlaces.map(({ id, texto }) => (
              <a
                key={id}
                href={`#${id}`}
                className={vista === id ? "activo" : ""}
                onClick={(evento) => {
                  evento.preventDefault();
                  onNavegar(id);
                }}
              >
                {texto}
              </a>
            ))}
            {sesion && (
              <a
                href="#perfil"
                className={vista === "perfil" ? "activo" : ""}
                onClick={(evento) => {
                  evento.preventDefault();
                  onPerfil?.();
                }}
              >
                {esEmpresa ? "Perfil de empresa" : "Mi perfil"}
              </a>
            )}
          </nav>

>>>>>>> c357cb59b3765412cbead97dff2bf4c26e8bc65e
          <div className="navbar-acciones">
            {esEmpresa ? (
              <button
                className="btn btn-coral btn-sm"
                type="button"
                onClick={() => onNavegar("mensajes")}
              >
                <i className="fa-solid fa-briefcase" aria-hidden="true"></i>{" "}
                Publicar vacante
              </button>
            ) : (
              <button
                className="btn btn-coral btn-sm"
                type="button"
                onClick={() => onNavegar("procesos")}
              >
                <i className="fa-solid fa-video" aria-hidden="true"></i> Subir
                Video
              </button>
            )}
            <button className="icono" type="button" aria-label="Notificaciones">
              <i className="fa-regular fa-bell" aria-hidden="true"></i>
            </button>
            {sesion && (
              <>
                {/* Si hay sesión, muestra el nombre y el botón de cerrar. */}
                <span className="saludo-usuario">
                  Hola, {sesion.usuario.nombre || sesion.usuario.email}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={onCerrarSesion}
                >
                  Cerrar sesión
                </button>
              </>
            )}
            <button
              className="avatar"
              type="button"
              aria-label={
                sesion
                  ? esEmpresa
                    ? "Ver perfil de empresa"
                    : "Ver mi perfil"
                  : "Iniciar sesión"
              }
              onClick={() => (sesion ? onPerfil?.() : onLogin())}
            >
              <img src={avatar} alt="" />
            </button>
          </div>
        </div>
<<<<<<< HEAD

        <nav className="menu" aria-label="Navegación principal">
          {enlaces.map(({ id, texto }) => (
            <a
              key={id}
              href={`#${id}`}
              className={vista === id ? "activo" : ""}
              onClick={(evento) => {
                evento.preventDefault();
                onNavegar(id);
              }}
            >
              {texto}
            </a>
          ))}
          {sesion && (
            <a
              href="#perfil"
              className={vista === "perfil" ? "activo" : ""}
              onClick={(evento) => {
                evento.preventDefault();
                onPerfil?.();
              }}
            >
              {esEmpresa ? "Perfil de empresa" : "Mi perfil"}
            </a>
          )}
        </nav>
=======
>>>>>>> c357cb59b3765412cbead97dff2bf4c26e8bc65e
      </div>
    </header>
  );
}
