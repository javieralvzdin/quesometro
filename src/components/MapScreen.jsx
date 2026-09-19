import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import GlassSurface from '../effects/GlassSurface';

const FALLBACK_LAT = 40.9701;
const FALLBACK_LON = -5.6635;

const CHEESE_NODES = [
  {
    lat: 0.00015,
    lon: 0.00015,
    emoji: '🧀',
    type: 'Cheddar Añejo',
    msg: 'Concentración sospechosa de Cheddar envejecido en este establecimiento cercano.'
  },
  {
    lat: -0.00015,
    lon: 0.00015,
    emoji: '🧀',
    type: 'Queso de Cabra',
    msg: 'Alerta máxima: Queso de cabra artesano detectado a pocos metros.'
  },
  {
    lat: 0.00018,
    lon: -0.00012,
    emoji: '🧀',
    type: 'Roquefort Azul',
    msg: 'Señal intensa de Roquefort. Emisión de esporas de penicillium detectada.'
  },
  {
    lat: -0.00018,
    lon: -0.00012,
    emoji: '🫕',
    type: 'Provolone Fundido',
    msg: '¡Alerta de alta temperatura! Provolone fundido o fondue en las inmediaciones.'
  },
  {
    lat: 0.00025,
    lon: 0.00005,
    emoji: '🧀',
    type: 'Emmental Suizo',
    msg: 'Burbujas de gas lácteo características del Emmental suizo.'
  },
  {
    lat: -0.00025,
    lon: 0.00005,
    emoji: '🧀',
    type: 'Manchego Curado',
    msg: 'Señal de denominación de origen protegida: Manchego gran reserva.'
  },
  {
    lat: 0.00005,
    lon: 0.00028,
    emoji: '🧀',
    type: 'Mozzarella Fresca',
    msg: 'Rastro lácteo fluido de Mozzarella de búfala pura.'
  }
];

const RANDOM_CHEESE_COUNT = 14;
const RANDOM_CHEESE_RADIUS = 0.0006;

function randomScatteredNodes(count) {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * RANDOM_CHEESE_RADIUS;
    const template = CHEESE_NODES[i % CHEESE_NODES.length];
    nodes.push({
      lat: Math.sin(angle) * radius,
      lon: Math.cos(angle) * radius,
      emoji: template.emoji,
      type: template.type,
      msg: template.msg
    });
  }
  return nodes;
}

function MapScreen({ active, onNodeClick }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!active) return;

    // Invalidamos cualquier ubicación previa (p.ej. de una apertura anterior
    // del mapa) para no renderizar nunca con una posición obsoleta mientras
    // llega la nueva.
    setCoords(null);

    let cancelled = false;
    const useFallback = () => {
      if (!cancelled) setCoords({ lat: FALLBACK_LAT, lon: FALLBACK_LON });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (cancelled) return;
          setCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
        },
        useFallback,
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      useFallback();
    }

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (!active || !coords || !mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([coords.lat, coords.lon], 18);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc'
      }).addTo(map);

      const allNodes = [...CHEESE_NODES, ...randomScatteredNodes(RANDOM_CHEESE_COUNT)];

      allNodes.forEach(node => {
        const cheeseIcon = L.divIcon({
          className: 'custom-cheese-marker',
          html: `<div class="cheese-marker-icon">${node.emoji}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = L.marker([coords.lat + node.lat, coords.lon + node.lon], { icon: cheeseIcon }).addTo(map);
        marker.on('click', () => {
          onNodeClick({ title: `Quesito: ${node.type}`, desc: node.msg });
        });
      });

      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div class="user-marker-icon"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([coords.lat, coords.lon], { icon: userIcon }).addTo(map);

      mapRef.current = map;
    } else {
      mapRef.current.invalidateSize();
      mapRef.current.setView([coords.lat, coords.lon], 18);
    }
  }, [active, coords, onNodeClick]);

  return (
    <div className={`screen screen-map ${active ? 'active' : ''}`}>
      <div className="map-header-overlay">
        <GlassSurface
          width="fit-content"
          height="auto"
          borderRadius={9999}
          backgroundOpacity={0.16}
          saturation={1.6}
          blur={10}
          distortionScale={-80}
          className="map-badge-glass"
        >
          <div className="label-saffron map-header-badge">Red de quesitos desplegada</div>
        </GlassSurface>
      </div>
      <div ref={mapContainerRef} className="leaflet-map" />
    </div>
  );
}

export default MapScreen;
