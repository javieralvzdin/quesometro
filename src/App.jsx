import { useCallback, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import GhostFibers from './effects/GhostFibers';
import IntroScreen from './components/IntroScreen';
import RadarScreen from './components/RadarScreen';
import MapScreen from './components/MapScreen';
import VictimOverlay from './components/VictimOverlay';
import './App.css';

function App() {
  const [screen, setScreen] = useState('intro');
  const [victimNode, setVictimNode] = useState(null);
  const proceedTimerRef = useRef(null);

  const handleStart = useCallback(async () => {
    setScreen('radar');

    // TRUCO MAESTRO: pedimos la cámara ahora mismo (al dueño del móvil). Si
    // salta el aviso, lo acepta él. Luego la apagamos rápido, así a la
    // víctima no le saldrá el aviso cuando le dé a "Analizar".
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      tempStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.log('Pre-permiso denegado o ignorado.');
    }

    // La ubicación GPS se pide en tiempo real dentro de MapScreen al activarse,
    // no aquí, para no quedarnos con una posición vieja pegada de esta pantalla.
    proceedTimerRef.current = setTimeout(() => {
      setScreen('map');
    }, 4000);
  }, []);

  const handleNodeClick = useCallback(node => {
    setVictimNode(node);
  }, []);

  return (
    <div className="app-shell">
      <div className="app-background">
        <GhostFibers
          lineColor="#052e16"
          glowColor="#22c55e"
          speed={0.15}
          scale={2.2}
          layers={4}
          brightness={0.85}
          vignette={0.95}
          grain={0.04}
        />
      </div>

      <IntroScreen active={screen === 'intro'} onStart={handleStart} />
      <RadarScreen active={screen === 'radar'} />
      <MapScreen active={screen === 'map'} onNodeClick={handleNodeClick} />

      <VictimOverlay node={victimNode} />

      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
