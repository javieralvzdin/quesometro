import GlassSurface from '../effects/GlassSurface';

function IntroScreen({ active, onStart }) {
  return (
    <div className={`screen ${active ? 'active' : ''}`}>
      <div className="label-saffron">Radar de Quesitos</div>
      <h1 className="display-title">QUESÓMETRO</h1>
      <p className="body-ultra">
        Detección de espectro lácteo de alta precisión en tiempo real sin calibración previa.
      </p>
      <GlassSurface
        width="fit-content"
        height="auto"
        borderRadius={24}
        backgroundOpacity={0.14}
        saturation={1.5}
        blur={9}
        distortionScale={-90}
        className="btn-glass"
      >
        <button className="btn-violet" style={{ width: 'auto' }} onClick={onStart}>
          Iniciar búsqueda
        </button>
      </GlassSurface>
    </div>
  );
}

export default IntroScreen;
