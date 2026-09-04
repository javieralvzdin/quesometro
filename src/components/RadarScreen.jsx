import { useEffect, useState } from 'react';
import Radar from '../effects/Radar';

const INITIAL_STATUS = 'Calibrando sensores de proximidad láctea...';

const STATUS_MESSAGES = [
  'Analizando emisión gaseosa...',
  'Triangulando coordenadas GPS...',
  'Detectando concentración de caseína...',
  'Filtro de lactosa completado...'
];

const CHEESE_POSITIONS = [
  { top: '25%', left: '70%' },
  { top: '75%', left: '35%' },
  { top: '40%', left: '20%' },
  { top: '60%', left: '75%' },
  { top: '20%', left: '30%' }
];

function RadarScreen({ active }) {
  const [status, setStatus] = useState(INITIAL_STATUS);

  useEffect(() => {
    if (!active) {
      setStatus(INITIAL_STATUS);
      return;
    }

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % STATUS_MESSAGES.length;
      setStatus(STATUS_MESSAGES[msgIndex]);
    }, 1600);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="label-saffron">Buscando frecuencias...</div>
      <div className="radar-container">
        <Radar
          color="#22c55e"
          backgroundColor="#000000"
          speed={1.2}
          scale={1.6}
          falloff={1.0}
          ringCount={10}
          spokeCount={8}
          ringThickness={0.045}
          sweepWidth={2.2}
          brightness={1.3}
          enableMouseInteraction={false}
        />
        {CHEESE_POSITIONS.map((pos, index) => (
          <div key={index} className="radar-cheese" style={{ top: pos.top, left: pos.left }}>
            🧀
          </div>
        ))}
      </div>
      <p className="body-ultra">{status}</p>
    </div>
  );
}

export default RadarScreen;
