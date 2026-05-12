import { useState } from 'react';
import { CheckCircle, TrendingUp, Download, Calendar, MapPin } from 'lucide-react';
import { useReports } from '../context/ReportContext';
import { ZoneDetailModal } from './ZoneDetailModal';

type Tab = 'atendidos' | 'criticas';

export function DashboardView() {
  const [activeTab, setActiveTab] = useState<Tab>('atendidos');
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const { reports } = useReports();

  const attendedReports = reports.filter(r => r.status === 'atendido');
  const criticalZones = getCriticalZones(reports);

  const handleDownloadReport = () => {
    // Simulate download
    const data = {
      fecha: new Date().toISOString(),
      zonasAtendidas: attendedReports.length,
      zonasCriticas: criticalZones.length,
      reportes: reports
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-operativo-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-5">
        <h1 className="font-bold text-neutral-900 mb-2">Panel de Gestión</h1>
        <p className="text-sm text-neutral-600">Vista exclusiva para funcionarios municipales</p>
      </div>

      {/* Stats Overview */}
      <div className="px-6 py-5 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <p className="text-xs font-medium text-neutral-600 mb-1">Total Reportes</p>
          <p className="font-bold text-neutral-900">{reports.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <p className="text-xs font-medium text-neutral-600 mb-1">Atendidos</p>
          <p className="font-bold text-green-700">{attendedReports.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-neutral-200">
          <p className="text-xs font-medium text-neutral-600 mb-1">Pendientes</p>
          <p className="font-bold text-neutral-700">
            {reports.filter(r => r.status === 'pendiente').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-4">
        <div className="bg-white rounded-lg p-1 inline-flex border border-neutral-200">
          <button
            onClick={() => setActiveTab('atendidos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'atendidos'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Reportes Atendidos
          </button>
          <button
            onClick={() => setActiveTab('criticas')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'criticas'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            Zonas Críticas
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-6">
        {activeTab === 'atendidos' ? (
          <AttendedReportsTab reports={attendedReports} />
        ) : (
          <CriticalZonesTab 
            zones={criticalZones} 
            onDownload={handleDownloadReport} 
            onSelectZone={setSelectedZone}
          />
        )}
      </div>

      {selectedZone && (
        <ZoneDetailModal zone={selectedZone} onClose={() => setSelectedZone(null)} />
      )}
    </div>
  );
}

const LIMA_DISTRICTS = [
  'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 
  'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima', 
  'Lince', 'Los Olivos', 'Lurigancho', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Pachacámac', 
  'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa', 'Punta Negra', 'Rímac', 
  'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 
  'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 
  'Santa Rosa', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
];

function AttendedReportsTab({ reports }: { reports: any[] }) {
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');

  const activeDistricts = Array.from(new Set(reports.map(r => r.district)));
  const filteredReports = reports.filter(r => {
    if (filterDistrict !== 'all' && r.district !== filterDistrict) return false;
    
    // Si se pone solo día, no debería salir nada porque no hay suficiente información
    if (filterDay !== 'all' && filterMonth === 'all') return false;

    // Asegurar formato de fecha para extracción (ej. 2026-05-01)
    if (r.date) {
      const [yearStr, monthStr, dayStr] = r.date.split('-');
      if (yearStr && monthStr && dayStr) {
        const dYear = parseInt(yearStr, 10).toString();
        const dMonth = parseInt(monthStr, 10).toString();
        const dDay = parseInt(dayStr, 10).toString();

        if (filterDay !== 'all' && dDay !== filterDay) return false;
        if (filterMonth !== 'all' && dMonth !== filterMonth) return false;
        if (filterYear !== 'all' && dYear !== filterYear) return false;
      }
    }

    return true;
  });

  const reportsByDistrict = activeDistricts.reduce((acc, district) => {
    acc[district] = reports.filter(r => r.district === district).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border border-neutral-200">
        <p className="text-sm font-bold text-neutral-900 mb-3">Filtros</p>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Distrito</label>
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none bg-white"
            >
              <option value="all">Todos los distritos</option>
              {LIMA_DISTRICTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-neutral-600 mb-1.5 block">Fecha de atención</label>
            <div className="flex gap-2">
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="all">Día</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d.toString()}>{d}</option>
                ))}
              </select>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="all">Mes</option>
                <option value="1">Ene</option>
                <option value="2">Feb</option>
                <option value="3">Mar</option>
                <option value="4">Abr</option>
                <option value="5">May</option>
                <option value="6">Jun</option>
                <option value="7">Jul</option>
                <option value="8">Ago</option>
                <option value="9">Sep</option>
                <option value="10">Oct</option>
                <option value="11">Nov</option>
                <option value="12">Dic</option>
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:border-neutral-900 focus:outline-none bg-white"
              >
                <option value="all">Año</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            {filterDay !== 'all' && filterMonth === 'all' && (
              <p className="text-red-500 text-[10px] mt-1 font-medium">Requiere seleccionar un mes</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats by District */}
      <div className="bg-white rounded-lg p-4 border border-neutral-200">
        <p className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <TrendingUp size={16} />
          Resumen por Distrito
        </p>
        <div className="space-y-2">
          {Object.entries(reportsByDistrict).map(([district, count]) => (
            <div key={district} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">{district}</span>
              <span className="text-sm font-bold text-neutral-900">{count} resueltos</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg p-8 border border-neutral-200 text-center">
            <p className="text-sm text-neutral-600">No hay reportes atendidos con estos filtros</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-lg p-4 border border-neutral-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <CheckCircle size={20} className="text-green-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 mb-1">{report.street}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {report.district}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(report.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CriticalZonesTab({ zones, onDownload, onSelectZone }: { zones: any[]; onDownload: () => void; onSelectZone: (zone: any) => void }) {
  return (
    <div className="space-y-4">
      {/* Download Button */}
      <button
        onClick={onDownload}
        className="w-full bg-neutral-900 text-white py-3 rounded-lg font-bold hover:bg-neutral-800 active:scale-98 transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Descargar Informe Operativo
      </button>

      {/* Critical Zones List */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <div className="bg-neutral-900 text-white px-4 py-3">
          <p className="text-sm font-bold">Zonas Ordenadas por Prioridad</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            Basado en acumulación de reportes activos
          </p>
        </div>
        <div className="divide-y divide-neutral-200">
          {zones.map((zone, index) => (
            <div 
              key={zone.street} 
              className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
              onClick={() => onSelectZone(zone)}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-neutral-900 text-white' :
                  index === 1 ? 'bg-neutral-700 text-white' :
                  index === 2 ? 'bg-neutral-500 text-white' :
                  'bg-neutral-200 text-neutral-700'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-neutral-900 mb-1">{zone.street}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {zone.district}
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-medium">
                      {zone.count} reportes activos
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 mt-2 line-clamp-2">{zone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getCriticalZones(reports: any[]) {
  const activeReports = reports.filter(r => r.status !== 'atendido');
  const streetCounts = activeReports.reduce((acc, report) => {
    if (!acc[report.street]) {
      acc[report.street] = {
        street: report.street,
        district: report.district,
        count: 0,
        description: report.description,
        reports: []
      };
    }
    acc[report.street].count++;
    acc[report.street].reports.push(report);
    return acc;
  }, {} as Record<string, any>);

  return Object.values(streetCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 10);
}
