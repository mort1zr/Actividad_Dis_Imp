import { useReports, ReportType } from '../context/ReportContext';
import { Filter } from 'lucide-react';

const FILTER_OPTIONS: { value: ReportType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'sin-postes', label: 'Sin postes' },
  { value: 'luces-apagadas', label: 'Luces apagadas' },
  { value: 'iluminacion-insuficiente', label: 'Ilum. insuficiente' },
  { value: 'vandalismo', label: 'Vandalismo' }
];

export function FilterChips() {
  const { filterType, setFilterType } = useReports();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-neutral-200">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={14} className="text-neutral-600" />
        <span className="text-xs font-bold text-neutral-900">Filtrar por tipo</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterType(option.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterType === option.value
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
