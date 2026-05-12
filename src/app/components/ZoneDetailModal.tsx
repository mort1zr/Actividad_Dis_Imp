import { X, MapPin, Calendar, User, AlertCircle } from 'lucide-react';

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

export function ZoneDetailModal({ zone, onClose }: { zone: any, onClose: () => void }) {
  if (!zone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-start justify-between bg-white z-10 sticky top-0">
          <div className="flex-1 pr-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                {zone.count} reportes activos
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
                <MapPin size={12} />
                {zone.district}
              </span>
            </div>
            <h3 className="font-bold text-neutral-900 text-lg leading-tight">{zone.street}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0 bg-neutral-50"
            aria-label="Cerrar"
          >
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        {/* Scrollable List of Reports */}
        <div className="p-6 overflow-y-auto bg-neutral-50 flex-1">
          <h4 className="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-neutral-600" />
            Detalles de los registros en esta zona
          </h4>
          
          <div className="space-y-4">
            {zone.reports.map((report: any) => (
              <div key={report.id} className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                    {TYPE_LABELS[report.type] || report.type}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[report.status] || 'bg-neutral-200 text-neutral-900'}`}>
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                </div>
                
                <p className="text-sm text-neutral-800 mb-4 leading-relaxed">
                  {report.description}
                </p>

                {report.photo && (
                  <div className="mb-4 rounded-lg overflow-hidden border border-neutral-200">
                    <img 
                      src={report.photo} 
                      alt="Evidencia" 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <Calendar size={14} />
                    {new Date(report.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <User size={14} />
                    {report.reportedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
