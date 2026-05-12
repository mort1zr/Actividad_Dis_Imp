import { X, MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { useReports } from '../context/ReportContext';

const TYPE_LABELS: Record<string, string> = {
  'sin-postes': 'Sin postes',
  'luces-apagadas': 'Luces apagadas',
  'iluminacion-insuficiente': 'Iluminación insuficiente',
  'vandalismo': 'Vandalismo'
};

const STATUS_LABELS: Record<string, string> = {
  'pendiente': 'Pendiente',
  'en-proceso': 'En proceso',
  'atendido': 'Atendido'
};

const STATUS_COLORS: Record<string, string> = {
  'pendiente': 'bg-neutral-200 text-neutral-900',
  'en-proceso': 'bg-neutral-600 text-white',
  'atendido': 'bg-neutral-900 text-white'
};

export function ReportDetailSheet() {
  const { selectedReport, setSelectedReport } = useReports();

  if (!selectedReport) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 pointer-events-auto"
        onClick={() => setSelectedReport(null)}
      ></div>

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl w-full max-w-2xl shadow-2xl pointer-events-auto animate-slide-up max-h-[70vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedReport.status]}`}>
                {STATUS_LABELS[selectedReport.status]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                {TYPE_LABELS[selectedReport.type]}
              </span>
            </div>
            <h3 className="font-bold text-neutral-900">{selectedReport.street}</h3>
          </div>
          <button
            onClick={() => setSelectedReport(null)}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Photo */}
          {selectedReport.photo && (
            <div className="rounded-lg overflow-hidden border border-neutral-200">
              <img
                src={selectedReport.photo}
                alt="Evidencia del reporte"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Descripción del problema
            </h4>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {selectedReport.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-neutral-600" />
                <span className="text-xs font-medium text-neutral-600">Distrito</span>
              </div>
              <p className="text-sm font-bold text-neutral-900">{selectedReport.district}</p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-neutral-600" />
                <span className="text-xs font-medium text-neutral-600">Fecha</span>
              </div>
              <p className="text-sm font-bold text-neutral-900">
                {new Date(selectedReport.date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="bg-neutral-50 rounded-lg p-4 col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-neutral-600" />
                <span className="text-xs font-medium text-neutral-600">Reportado por</span>
              </div>
              <p className="text-sm font-bold text-neutral-900">{selectedReport.reportedBy}</p>
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-neutral-100 rounded-lg p-4">
            <p className="text-xs font-medium text-neutral-600 mb-1">Coordenadas GPS</p>
            <p className="text-sm font-mono text-neutral-900">
              {selectedReport.lat.toFixed(6)}, {selectedReport.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
