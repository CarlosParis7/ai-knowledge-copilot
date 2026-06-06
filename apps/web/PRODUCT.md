# Product

## Register

product

## Users

Empleados de empresas que necesitan respuestas rápidas sobre documentación interna (manuales, políticas, contratos, wikis). No siempre son técnicos. Su contexto: están a mitad de una tarea, tienen una pregunta concreta ("¿cuál es la política de viajes?"), y quieren una respuesta confiable con la fuente citada, sin leerse 40 páginas. Administradores suben y gestionan los documentos que alimentan el sistema. Trabajan desde el escritorio en jornada laboral, bajo luz de oficina.

## Product Purpose

Atlas Copilot es una plataforma RAG empresarial: indexa los documentos de una empresa y permite chatear con un asistente que responde usando solo ese contenido, con citas verificables. Existe para convertir conocimiento disperso en respuestas inmediatas y confiables, manteniendo aislamiento estricto por empresa (tenant). El éxito se mide en: respuestas correctas con cita, confianza del usuario en lo que lee, y baja fricción para subir/consultar documentos.

## Brand Personality

Confiable y preciso. Tres palabras: **sobrio, claro, exacto**. La interfaz debe inspirar la confianza necesaria para datos corporativos sensibles: prioriza legibilidad y jerarquía sobre decoración. Referencias de sensación: Stripe (claridad y orden), Linear (precisión y foco). El tono es profesional pero no rígido; cercano lo justo para que un usuario no técnico no se sienta perdido.

## Anti-references

- **Wrapper genérico de ChatGPT**: nada de morados/gradientes de IA, burbujas de chat genéricas, ni la estética de "otro chatbot más".
- **SaaS corporativo plantilla**: nada de gris Bootstrap sin personalidad, idéntico a mil dashboards.
- **Recargado / ruidoso**: evitar exceso de tarjetas anidadas, sombras pesadas, múltiples colores compitiendo.
- **Minimalismo frío**: no debe sentirse vacío ni hostil. El espacio en blanco guía, no abandona; siempre hay orientación clara para el usuario no técnico.

## Design Principles

1. **La cita es el producto.** Toda respuesta del asistente debe hacer evidente y accesible su fuente. La confianza se gana mostrando de dónde viene cada dato.
2. **Claridad antes que estilo.** Si una decisión visual compromete la legibilidad de un dato corporativo, gana la legibilidad. Jerarquía por escala y peso, no por adorno.
3. **Calma con orientación.** Espacio en blanco generoso, pero nunca sin guía: estados vacíos, próximos pasos y affordances claras para el usuario no técnico.
4. **Un acento, usado con intención.** Paleta de neutros + un color de marca que señala acción y estado, no que decora.
5. **Velocidad percibida.** Skeletons, estados de carga y feedback inmediato; el sistema siempre comunica qué está pasando.

## Accessibility & Inclusion

WCAG 2.1 AA. Texto de cuerpo ≥4.5:1; texto grande ≥3:1; placeholders cumplen 4.5:1. Navegación completa por teclado (incluida la command palette y el flujo de chat). Estados de foco visibles. Respeto a `prefers-reduced-motion` con alternativas de crossfade/instantáneas. No depender solo del color para comunicar estado (añadir icono/texto).
