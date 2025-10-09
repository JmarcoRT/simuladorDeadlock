import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IcResources, IcEye, IcGear, IcCheckView } from '../../assets/icons/StepperIcons';
import '../../styles/stepper.css';

type Step = { n: 1|2|3|4; label: string; desc: string; icon: React.FC };

const STEPS: Step[] = [
  { n: 1, label: 'Definir recursos y procesos', desc: 'Configura recursos y el orden de cada proceso.', icon: IcResources },
  { n: 2, label: 'Visualizar deadlocks',       desc: 'Observa cómo se bloquean los procesos.',       icon: IcEye },
  { n: 3, label: 'Definir algoritmo de solución', desc: 'Prevención, evitación o detección.',          icon: IcGear },
  { n: 4, label: 'Visualizar solución',         desc: 'Ejecución con el algoritmo elegido.',          icon: IcCheckView },
];

export const Stepper: React.FC = () => {
  const { pathname } = useLocation();
  const match = pathname.match(/\/step\/(\d)/);
  const current = match ? Number(match[1]) : 1;

  return (
    <nav className="stepper" aria-label="Progreso">
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {STEPS.map((s) => {
        const status: 'active'|'done'|'upcoming' =
          s.n === current ? 'active' : s.n < current ? 'done' : 'upcoming';
        const Icon = s.icon;

        return (
          <li key={s.n} className={`step step--${status}`}>
            <div className="step__icon" aria-hidden="true">
              <Icon />
            </div>
            <div className="step__content">
              <Link
                to={`/step/${s.n}`}
                aria-current={s.n === current ? 'step' : undefined}
              >
                {s.n}. {s.label}
              </Link>
              <div className="step__desc">{s.desc}</div>
            </div>
          </li>
        );
      })}
      </ol>
    </nav>
  );
};
