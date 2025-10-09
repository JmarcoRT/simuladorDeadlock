import React from 'react';
import type { GraphData } from './buildGraph';
import { GraphCanvas } from './GraphCanvas';
import { GraphLegend } from './GraphLegend';
import type { Session } from '../../engine/session';

export const GraphView: React.FC<{
  data: GraphData;
  height?: number;
  shapes?: { process: 'circle'; resource: 'rect' | 'circle' };
  session?: Session; 
}> = ({ data, height = 520, shapes = { process: 'circle', resource: 'rect' }, session }) => {
  const finished = React.useMemo(() => {
    if (!session) return new Set<string>();
    const set = new Set<string>();
    for (const p of session.procs) if (p.state === 'done') set.add(p.id);
    return set;
  }, [session]);

  return (
    <div style={{ position: 'relative' }}>
      <GraphLegend />
      <div style={{ padding: '16px 16px 16px 220px' }}>
        <GraphCanvas
          data={data}
          height={height}
          shapes={shapes}
          statuses={{ finished }}
        />
      </div>
    </div>
  );
};
