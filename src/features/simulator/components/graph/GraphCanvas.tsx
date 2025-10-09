import React from 'react';
import type { GraphData } from './buildGraph';

const PADDING_X = 40;
const COL_GAP = 220;
const ROW_GAP = 90;
const NODE_R = 28;
const RES_W = 120, RES_H = 36;
const ATTACH_PAD = 2;

type NodeStates = {
  finished?: Set<string> | string[];
};

type Props = {
  data: GraphData;
  height?: number;
  shapes?: { process: 'circle'; resource: 'rect' | 'circle' };
  statuses?: NodeStates;
};

export const GraphCanvas: React.FC<Props> = ({
  data,
  height = 520,
  shapes = { process: 'circle', resource: 'rect' },
  statuses
}) => {
  const nProc = data.processes.length;
  const nRes = data.resources.length;

  const rows = Math.max(nProc, nRes);
  const svgH = Math.max(height, rows * ROW_GAP + 2 * PADDING_X);
  const col1X = PADDING_X + NODE_R;
  const col2X = PADDING_X + COL_GAP + RES_W / 2;

  const procY = (i: number) => PADDING_X + i * ROW_GAP + NODE_R;
  const resY  = (i: number) => PADDING_X + i * ROW_GAP + RES_H / 2;

  const procIdx = new Map(data.processes.map((p, i) => [p.id, i]));
  const resIdx  = new Map(data.resources.map((r, i) => [r.id, i]));

  // === sets de estado para nodos (derivados de edges + finished) ===
  const finishedSet = React.useMemo(() => {
    if (!statuses?.finished) return new Set<string>();
    return statuses.finished instanceof Set ? statuses.finished : new Set(statuses.finished);
  }, [statuses]);

  const processHasAnyEdge = new Set<string>();
  const resHasAssign = new Set<string>();
  const resHasRequestOrWait = new Set<string>();

  for (const e of data.edges) {
    const fromIsProc = procIdx.has(e.from);
    const toIsProc   = procIdx.has(e.to);
    if (fromIsProc) processHasAnyEdge.add(e.from);
    if (toIsProc) processHasAnyEdge.add(e.to);
    // recurso en assign: R -> P
    if (resIdx.has(e.from) && toIsProc && e.kind === 'assign') {
      resHasAssign.add(e.from);
    }
    // recurso con solicitudes: P -> R (request|waiting)
    if (procIdx.has(e.from) && resIdx.has(e.to) && (e.kind === 'request' || e.kind === 'waiting')) {
      resHasRequestOrWait.add(e.to);
    }
  }

  // defs puntas flecha
  const defs = (
    <defs>
      {[
        { id: 'arrow-assign',  color: 'var(--graph-edge-assign)'  },
        { id: 'arrow-request', color: 'var(--graph-edge-request)' },
        { id: 'arrow-wait',    color: 'var(--graph-edge-wait)'    },
      ].map(a => (
        <marker key={a.id} id={a.id} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={a.color} />
        </marker>
      ))}
    </defs>
  );

  const edgeColor = (k: 'assign'|'request'|'waiting') =>
    k === 'assign' ? 'var(--graph-edge-assign)' :
    k === 'request' ? 'var(--graph-edge-request)' : 'var(--graph-edge-wait)';

  const markerUrl = (k: 'assign'|'request'|'waiting') =>
    k === 'assign' ? 'url(#arrow-assign)' :
    k === 'request' ? 'url(#arrow-request)' : 'url(#arrow-wait)';

  const edges = data.edges.map((e, i) => {
    const fromIsProc = procIdx.get(e.from) !== undefined;
    const toIsProc   = procIdx.get(e.to)   !== undefined;

    let x1=0, y1=0, x2=0, y2=0;

    if (fromIsProc) {
      const iP = procIdx.get(e.from)!;
      const iR = resIdx.get(e.to)!;
      y1 = procY(iP);
      y2 = resY(iR);
      x1 = col1X + NODE_R + ATTACH_PAD;
      x2 = col2X - RES_W / 2 - ATTACH_PAD;
    } else if (toIsProc) {
      const iR = resIdx.get(e.from)!;
      const iP = procIdx.get(e.to)!;
      y1 = resY(iR);
      y2 = procY(iP);
      x1 = col2X - RES_W / 2 - ATTACH_PAD;
      x2 = col1X + NODE_R + ATTACH_PAD;
    } else {
      return null;
    }

    const color  = edgeColor(e.kind);
    const marker = markerUrl(e.kind);

    return (
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={2.5}
        markerEnd={marker}
        opacity={0.95}
      />
    );
  });

  return (
    <svg width="100%" height={svgH} style={{ display: 'block' }}>
      {defs}
      <rect x={0} y={0} width="100%" height="100%" fill="var(--graph-bg)" />

      {/* Recursos (derecha) */}
      {data.resources.map((r, i) => {
        const x = col2X, y = resY(i);

        const isBusy = resHasAssign.has(r.id);
        const hasReq = resHasRequestOrWait.has(r.id);
        const isContended = isBusy && hasReq;

        const fill = isContended
          ? 'var(--graph-node-res-fill-contended)'
          : isBusy
            ? 'var(--graph-node-res-fill-busy)'
            : 'var(--graph-node-res-fill-idle)';

        const stroke = isContended
          ? 'var(--graph-node-res-stroke-contended)'
          : isBusy
            ? 'var(--graph-node-res-stroke-busy)'
            : 'var(--graph-node-res-stroke-idle)';

        if (shapes.resource === 'circle') {
          const rr = 24;
          return (
            <g key={r.id} className={isContended ? 'is-contended' : undefined}>
              <circle cx={x} cy={y} r={rr} fill={fill} stroke={stroke} strokeWidth={2}/>
              <text x={x} y={y+4} textAnchor="middle" fontSize="12" fill="var(--graph-node-text)">R</text>
              <text x={x + rr + 10} y={y + 4} fontSize="13" fill="var(--graph-node-text)">{r.label}</text>
            </g>
          );
        }
        return (
          <g key={r.id} className={isContended ? 'is-contended' : (isBusy ? 'is-busy' : undefined)}>
            <rect
              x={x - RES_W/2}
              y={y - RES_H/2}
              width={RES_W}
              height={RES_H}
              rx={10} ry={10}
              fill={fill}
              stroke={stroke}
              strokeWidth={2}
            />
            <text x={x} y={y+4} textAnchor="middle" fontSize="13" fill="var(--graph-node-text)">{r.label}</text>
          </g>
        );
      })}

      {/* Procesos (izquierda) */}
      {data.processes.map((p, i) => {
        const x = col1X, y = procY(i);

        const isDone = finishedSet.has(p.id);
        const hasEdges = processHasAnyEdge.has(p.id);
        const fill = isDone
          ? 'var(--graph-node-proc-fill-done)'
          : hasEdges
            ? 'var(--graph-node-proc-fill-active)'
            : 'var(--graph-node-proc-fill-idle)';
        const stroke = isDone
          ? 'var(--graph-node-proc-stroke-done)'
          : hasEdges
            ? 'var(--graph-node-proc-stroke-active)'
            : 'var(--graph-node-proc-stroke-idle)';
        const procClass = !isDone && hasEdges ? 'is-active' : undefined;

        return (
          <g key={p.id} className={procClass}>
            <circle cx={x} cy={y} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={2}/>
            <text x={x} y={y+4} textAnchor="middle" fontSize="12" fill="var(--graph-node-text)">P</text>
            <text x={x} y={y + NODE_R + 18} textAnchor="middle" fontSize="13" fill="var(--graph-node-text-muted)">{p.label}</text>
          </g>
        );
      })}

      {edges}
    </svg>
  );
};
