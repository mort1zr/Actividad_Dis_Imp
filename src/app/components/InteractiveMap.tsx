import React, { useCallback, useState, useEffect } from 'react';
import { useReports, ReportType } from '../context/ReportContext';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { MapPin, AlertCircle, Lightbulb, Construction, Navigation } from 'lucide-react';

interface InteractiveMapProps {
  onMapClick?: (lat: number, lng: number) => void;
}

const REPORT_ICONS: Record<ReportType, typeof MapPin> = {
  'sin-postes': AlertCircle,
  'luces-apagadas': Lightbulb,
  'iluminacion-insuficiente': Construction,
  'vandalismo': MapPin
};

const REPORT_COLORS: Record<ReportType, string> = {
  'sin-postes': 'bg-neutral-900 border-neutral-700',
  'luces-apagadas': 'bg-neutral-700 border-neutral-600',
  'iluminacion-insuficiente': 'bg-neutral-500 border-neutral-400',
  'vandalismo': 'bg-neutral-800 border-neutral-600'
};

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Coordenadas del centro de Lima
const LIMA_CENTER = {
  lat: -12.046374,
  lng: -77.042793
};

// Límites aproximados de Lima Metropolitana para restringir el mapa
const LIMA_BOUNDS = {
  north: -11.7, // Ancón
  south: -12.3, // Lurín
  west: -77.2,  // Callao
  east: -76.7   // Chosica/Ate
};

const MAP_OPTIONS = {
  disableDefaultUI: true, // Ocultar controles por defecto para un look más limpio
  zoomControl: true,
  restriction: {
    latLngBounds: LIMA_BOUNDS,
    strictBounds: false, // Permitir un poco de rebote al llegar al límite
  },
  styles: [
    // Estilo minimalista/grisáceo para mantener el look de la app original
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] }
  ]
};

export function InteractiveMap({ onMapClick }: InteractiveMapProps) {
  const { reports, setSelectedReport, filterType } = useReports();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const filteredReports = filterType === 'all'
    ? reports
    : reports.filter(r => r.type === filterType);

  const onClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (onMapClick && e.latLng) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  }, [onMapClick]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const handleCenterLocation = () => {
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(16);
    } else if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          if (map) {
            map.panTo(loc);
            map.setZoom(16);
          }
        },
        (error) => {
          alert("No se pudo obtener tu ubicación. Por favor, asegura dar los permisos necesarios al navegador.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-full w-full bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-500 font-medium">Cargando mapa...</div>
      </div>
    );
  }

  // Si no hay API key configurada, mostramos un aviso
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="h-full w-full bg-neutral-100 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="text-neutral-400 mb-4" />
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Falta configurar Google Maps</h3>
        <p className="text-neutral-600 max-w-md">
          Para ver el mapa real, necesitas agregar tu VITE_GOOGLE_MAPS_API_KEY en el archivo .env y reiniciar el servidor.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={LIMA_CENTER}
        zoom={13}
        options={MAP_OPTIONS}
        onClick={onClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Report Markers - Using OverlayView to use custom React components as markers */}
        {filteredReports.map((report) => {
          const Icon = REPORT_ICONS[report.type];
          
          return (
            <OverlayView
              key={report.id}
              position={{ lat: report.lat, lng: report.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <button
                className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer hover:scale-110 transition-transform z-20 ${
                  report.status === 'atendido' ? 'opacity-40' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReport(report);
                }}
                aria-label={`Reporte: ${report.street}`}
              >
                <div className={`${REPORT_COLORS[report.type]} border-2 rounded-full p-2 shadow-lg`}>
                  <Icon size={20} className="text-white" strokeWidth={2} />
                </div>
                {/* Marker Pin tail */}
                <div className="w-0.5 h-4 bg-neutral-900 mx-auto"></div>
              </button>
            </OverlayView>
          );
        })}

        {/* User GPS Location Marker */}
        {userLocation && (
          <OverlayView
            position={userLocation}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
              <div className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-500 border-2 border-white shadow-md"></span>
              </div>
            </div>
          </OverlayView>
        )}
      </GoogleMap>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-neutral-200 text-xs z-[1]">
        <p className="font-bold mb-2 text-neutral-900">Leyenda</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-900"></div>
            <span className="text-neutral-600">Sin postes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-700"></div>
            <span className="text-neutral-600">Luces apagadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-500"></div>
            <span className="text-neutral-600">Iluminación insuficiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
            <span className="text-neutral-600">Tu ubicación</span>
          </div>
        </div>
      </div>

      {/* Locate Me Button */}
      <button 
        onClick={handleCenterLocation}
        className="absolute bottom-6 right-4 bg-white p-3 rounded-full shadow-lg border border-neutral-200 z-[1] hover:bg-neutral-50 transition-colors"
        title="Centrar en mi ubicación"
        aria-label="Mi ubicación"
      >
        <Navigation size={20} className={userLocation ? "text-blue-500" : "text-neutral-600"} />
      </button>
    </div>
  );
}
