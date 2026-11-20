// Pie de página con enlaces y créditos.
const ENLACES = [
  { id: "inicio", texto: "Inicio" },
  { id: "feed", texto: "Candidatos" },
  { id: "procesos", texto: "Cómo funciona" },
  { id: "mensajes", texto: "Vacantes" },
];

export default function Footer({ onNavegar }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">
            Talento<span>60</span>
          </div>
          <div className="footer-copy">© 2026 Talento 60</div>
        </div>

        <nav className="footer-links" aria-label="Enlaces del pie">
          {ENLACES.map(({ id, texto }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(evento) => {
                evento.preventDefault();
                onNavegar(id);
              }}
            >
              {texto}
            </a>
          ))}
        </nav>

        <div className="footer-stats">
          <div>
            <strong>4</strong>
            <span>Candidatos</span>
          </div>
          <div>
            <strong>60s</strong>
            <span>Video</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
