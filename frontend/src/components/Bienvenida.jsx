// Pantalla inicial: marca, beneficios y botón para comenzar.
export default function Bienvenida({ sesion, onComenzar, onLogin }) {
  return (
    <section className="bienvenida" id="bienvenida">
      {!sesion && (
        <button className="btn-iniciar-sesion" type="button" onClick={onLogin}>
          Iniciar sesión
        </button>
      )}

      <div className="bienvenida-contenido">
        <h1>
          Talento<span>60</span>
        </h1>
        <p className="frase-bienvenida">El talento no cabe en una hoja.</p>
        <p className="texto-bienvenida">
          Conoce personas, descubre oportunidades y muestra quién eres en 60
          segundos.
        </p>

        <button className="btn-comenzar" type="button" onClick={onComenzar}>
          Comenzar →
        </button>

        <div className="beneficios-bienvenida">
          <div className="beneficio">
            <i
              className="fa-solid fa-user-group icono-beneficio"
              aria-hidden="true"
            ></i>
            <span>Conecta</span>
          </div>
          <div className="separador-beneficio" aria-hidden="true"></div>
          <div className="beneficio">
            <i
              className="fa-regular fa-star icono-beneficio"
              aria-hidden="true"
            ></i>
            <span>Muestra tu talento</span>
          </div>
          <div className="separador-beneficio" aria-hidden="true"></div>
          <div className="beneficio">
            <i
              className="fa-solid fa-rocket icono-beneficio"
              aria-hidden="true"
            ></i>
            <span>Encuentra oportunidades</span>
          </div>
        </div>
      </div>
    </section>
  );
}
