import { useCallback, useRef, useState } from 'react';
import GhostFibers from './effects/GhostFibers';
import IntroScreen from './components/IntroScreen';
import RadarScreen from './components/RadarScreen';
import MapScreen from './components/MapScreen';
import VictimOverlay from './components/VictimOverlay';
import './App.css';

const DEFAULT_LAT = 42.3982;
const DEFAULT_LON = -8.8115;

function App() {
  const [screen, setScreen] = useState('intro');
  const [coords, setCoords] = useState(null);
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

    const savedLat = localStorage.getItem('queso_lat');
    const savedLon = localStorage.getItem('queso_lon');

    const proceedWithCoords = (lat, lon) => {
      proceedTimerRef.current = setTimeout(() => {
        setCoords({ lat, lon });
        setScreen('map');
      }, 4000);
    };

    if (savedLat && savedLon) {
      proceedWithCoords(parseFloat(savedLat), parseFloat(savedLon));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          localStorage.setItem('queso_lat', lat);
          localStorage.setItem('queso_lon', lon);
          proceedWithCoords(lat, lon);
        },
        () => proceedWithCoords(DEFAULT_LAT, DEFAULT_LON),
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      proceedWithCoords(DEFAULT_LAT, DEFAULT_LON);
    }
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
      <MapScreen active={screen === 'map'} coords={coords} onNodeClick={handleNodeClick} />

      <VictimOverlay node={victimNode} />
    </div>
  );
}

export default App;
