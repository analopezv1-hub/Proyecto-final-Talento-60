// Activa la aparición de bloques al hacer scroll.
import { useEffect } from "react";

const SELECTOR =
  ".hero-texto, .hero-video, .metrica, .empresas-contenido, .seccion-cabecera, .tarjeta, .paso, .categoria, .cta";

// Anima la aparición de los bloques cuando entran en pantalla.
export function useAnimaciones(activo, vista) {
  useEffect(() => {
    if (!activo) return;

    const elementos = [...document.querySelectorAll(SELECTOR)];
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.15 },
    );

    elementos.forEach((elemento) => {
      elemento.classList.add("reveal");
      const posicion = [...elemento.parentElement.children].indexOf(elemento);
      elemento.style.setProperty("--retraso", `${posicion * 0.08}s`);
      observador.observe(elemento);
    });

    return () => observador.disconnect();
  }, [activo, vista]);
}
