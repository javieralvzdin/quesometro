import { useEffect, useRef, useState } from 'react';
import GhostFibers from '../effects/GhostFibers';
import GlassSurface from '../effects/GlassSurface';

const SCAN_MESSAGES = [
  'Escaneando ojitos de quesito...',
  'Analizando carita de ángel...',
  'Midiendo la simetría de esos labios...',
  'Comprobando nivel de lácteo...',
  'Verificando pureza de la cuajada...'
];

function VictimOverlay({ node }) {
  const [step, setStep] = useState(1);
  const [instaUser, setInstaUser] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFallback, setCameraFallback] = useState(false);
  const [scanningText, setScanningText] = useState('Iniciando sensores ópticos...');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (node) {
      setStep(1);
      setInstaUser('');
      setCameraActive(false);
      setCameraFallback(false);
      setScanningText('Iniciando sensores ópticos...');
    }
  }, [node]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (!node) return null;

  const handleAnalyze = async () => {
    setStep(2);
    setScanningText('Conectando sensores ópticos...');

    try {
      // Como el dueño ya aceptó el permiso al iniciar la búsqueda, esto carga al
      // instante sin aviso molesto para la víctima.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraFallback(false);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log('Cámara denegada o sin acceso:', err);
      setCameraActive(false);
      setCameraFallback(true);
    }

    let index = 0;
    intervalRef.current = setInterval(() => {
      setScanningText(SCAN_MESSAGES[index]);
      index = (index + 1) % SCAN_MESSAGES.length;
    }, 1400);

    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setStep(3);
    }, 7000);
  };

  const handleSubmitInsta = () => {
    let username = instaUser.trim();
    if (!username) {
      username = 'quesito_supremo';
    } else if (!username.startsWith('@')) {
      username = '@' + username;
    }

    const cleanUser = username.replace('@', '');
    window.location.href = `https://instagram.com/${cleanUser}`;
  };

  return (
    <div className="victim-overlay active">
      <div className="victim-fiber-backdrop">
        <GhostFibers
          lineColor="#052e16"
          glowColor="#22c55e"
          speed={0.25}
          scale={2.2}
          layers={4}
          brightness={0.9}
          vignette={0.92}
          grain={0.04}
        />
      </div>

      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={28}
        backgroundOpacity={0.5}
        saturation={1.3}
        blur={14}
        distortionScale={-90}
        className="victim-card"
        style={{ maxWidth: 420 }}
      >
        <div className="victim-card-content">
          {step === 1 && (
            <div className="victim-step">
              <div className="label-saffron" style={{ marginBottom: 12 }}>
                Alerta de Quesito
              </div>
              <h2 className="victim-title">{node.title}</h2>
              <p className="body-ultra" style={{ fontSize: 17, marginBottom: 20 }}>
                {node.desc}
              </p>
              <div className="pass-phone-banner">📱 Pásale el móvil al quesito 📱</div>
              <GlassSurface
                width="100%"
                height="auto"
                borderRadius={24}
                backgroundOpacity={0.14}
                saturation={1.5}
                blur={9}
                distortionScale={-90}
                className="btn-glass"
              >
                <button className="btn-violet" onClick={handleAnalyze}>
                  Analizar quesito
                </button>
              </GlassSurface>
            </div>
          )}

          {step === 2 && (
            <div className="victim-step">
              <div className="label-saffron" style={{ marginBottom: 16 }}>
                Escáner Biométrico
              </div>
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-feed"
                  style={{ display: cameraActive ? 'block' : 'none' }}
                />
                {cameraFallback && <div className="camera-fallback">👤</div>}
                <div className="scanner-line" />
              </div>
              <p className="scanning-text">{scanningText}</p>
            </div>
          )}

          {step === 3 && (
            <div className="victim-step">
              <div className="detected-banner">
                <div className="detected-emoji">🧀🔥🚨</div>
                <h2 className="detected-title">¡QUESITO DETECTADO!</h2>
              </div>
              <div className="instagram-prompt-banner">
                📸 <span style={{ color: 'var(--color-saffron-spark)' }}>Introduce tu Instagram</span> para
                oficializar el título 📸
              </div>
              <input
                type="text"
                className="insta-input"
                placeholder="@tu_usuario_ig"
                autoComplete="off"
                autoCapitalize="none"
                value={instaUser}
                onChange={event => setInstaUser(event.target.value)}
              />
              <GlassSurface
                width="100%"
                height="auto"
                borderRadius={24}
                backgroundOpacity={0.14}
                saturation={1.5}
                blur={9}
                distortionScale={-90}
                className="btn-glass"
              >
                <button className="btn-violet" onClick={handleSubmitInsta}>
                  Vincular con Instagram
                </button>
              </GlassSurface>
            </div>
          )}
        </div>
      </GlassSurface>
    </div>
  );
}

export default VictimOverlay;
