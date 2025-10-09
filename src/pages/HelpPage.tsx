import React from 'react';
import { Card } from '../ui/Card';

export const HelpPage: React.FC = () => (
  <div style={{ display: 'grid', gap: 16 }}>
    <h2>Ayuda / Instrucciones</h2>

    <Card title="¿Qué es este simulador?">
      <p>
        Esta herramienta te permite <strong>configurar un escenario</strong> con recursos y procesos,
        <strong>visualizar</strong> cómo se produce un <em>deadlock</em> y <strong>resolverlo</strong> con distintos algoritmos:
        Prevención, Evitación y Detección.
      </p>
    </Card>

    <Card title="Flujo en 4 pasos">
      <ol>
        <li><strong>Paso 1 — Definir recursos y procesos:</strong> ajusta las cantidades de recursos y crea procesos indicando el <em>orden de asignación</em>.</li>
        <li><strong>Paso 2 — Visualizar deadlocks:</strong> ejecuta la simulación, ajusta la velocidad y observa cómo cambian los estados. Puedes ver el flujo de acciones y el grafo.</li>
        <li><strong>Paso 3 — Elegir algoritmo:</strong> selecciona Prevención (ordena prioridad de recursos), Evitación (usa matrices) o Detección (podrás liberar procesos).</li>
        <li><strong>Paso 4 — Visualizar solución:</strong> según el algoritmo, el deadlock no ocurrirá (Prevención/Evitación) o podrás resolverlo liberando un proceso (Detección). Al finalizar, verás un resumen.</li>
      </ol>
    </Card>

    <Card title="Consejos">
      <ul>
        <li>Si no puedes avanzar en el Paso 3 con Prevención, verifica que hayas <em>priorizado todos los recursos disponibles</em>.</li>
        <li>En Evitación, la concesión sólo ocurre si el estado es <em>seguro</em>. Consulta el modal <strong>Ver matrices</strong> en el Paso 4.</li>
        <li>En Detección, cuando aparezca el deadlock, usa <strong>Liberar proceso…</strong> para elegir cuál desbloquear.</li>
        <li>Usa <strong>Reiniciar</strong> para recomenzar la simulación si cambiaste mucho la configuración.</li>
      </ul>
    </Card>
  </div>
);