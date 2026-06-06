---
target: Chat page
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-06-03T06-16-31Z
slug: apps-web-src-pages-chat-tsx
---
# Critique: Chat (apps/web/src/pages/Chat.tsx)

## Design Health Score: 30/40 (Bueno)

Heuristics: status 3, real-world 4, control 2, consistency 4, error-prevention 2, recognition 3, flexibility 3, minimalist 4, error-recovery 2, help 3.

## Anti-Patterns
No obvious AI slop. 1 detector hit: animate-bounce (line 365, typing indicator). Inter font (inherited identity).

## Priority Issues
- [P1] Afordancias falsas: Adjuntar archivo, Búsqueda web, menú "⋯" del historial no hacen nada. → harden
- [P1] No se puede detener el streaming (no Stop button). → harden
- [P2] Error de envío pierde el texto escrito; solo toast. → harden + clarify
- [P2] Historial inaccesible en móvil (hidden md:flex, sin drawer). → adapt
- [P3] animate-bounce en typing indicator. → animate

## Persona Red Flags
- Alex: no stop, sin atajos, textarea no recupera foco.
- Sam: typing indicator sin aria-live; icon buttons sin label accesible; streaming no anunciado.
- Casey: historial no existe en móvil.

## Minor
- Falta aria-live en contenedor de mensajes.
