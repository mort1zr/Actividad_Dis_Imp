import { useState } from 'react';
import { Plus } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { ReportModal } from './ReportModal';
import { ReportDetailSheet } from './ReportDetailSheet';
import { FilterChips } from './FilterChips';
import { useReports } from '../context/ReportContext';

export function MapView() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { selectedReport } = useReports();

  const handleMapClick = (lat: number, lng: number) => {
    setClickedLocation({ lat, lng });
    setIsReportModalOpen(true);
  };

  return (
    <div className="h-full relative">
      {/* Filters */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <FilterChips />
      </div>

      {/* Map */}
      <InteractiveMap onMapClick={handleMapClick} />

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setIsReportModalOpen(true)}
        className="absolute bottom-6 right-6 z-10 bg-neutral-900 text-white p-4 rounded-full shadow-2xl hover:bg-neutral-800 active:scale-95 transition-all"
        aria-label="Reportar zona oscura"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setClickedLocation(null);
        }}
        initialLocation={clickedLocation}
      />

      {/* Report Detail Sheet */}
      {selectedReport && <ReportDetailSheet />}
    </div>
  );
}
