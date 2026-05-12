import { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin } from 'lucide-react';
import { useReports, ReportType } from '../context/ReportContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export function ReportModal({ isOpen, onClose, initialLocation }: ReportModalProps) {
  const { addReport } = useReports();
  const [type, setType] = useState<ReportType>('sin-postes');
  const [street, setStreet] = useState('Buscando dirección...');
  const [district, setDistrict] = useState('Buscando distrito...');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [reportedBy, setReportedBy] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setType('sin-postes');
      setStreet('Buscando dirección...');
      setDistrict('Buscando distrito...');
      setDescription('');
      setPhoto(null);
      setReportedBy('');

      // Geocodificación inversa
      if (initialLocation && window.google) {
        setIsGeocoding(true);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: initialLocation }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const routeComponent = results[0].address_components.find(c => c.types.includes('route'));
            const streetNumber = results[0].address_components.find(c => c.types.includes('street_number'));
            
            // En Perú, los distritos suelen venir como administrative_area_level_3 o locality
            let districtName = 'Lima';
            
            const getComponent = (type: string) => {
              // Buscamos en todos los results porque a veces el result[0] no tiene el nivel jerárquico completo
              for (const result of results) {
                const comp = result.address_components.find(c => c.types.includes(type));
                if (comp) return comp.long_name;
              }
              return null;
            };

            const district = getComponent('administrative_area_level_3') 
                          || getComponent('sublocality_level_1') 
                          || getComponent('locality');
                          
            if (district) {
              districtName = district;
            }

            const streetName = routeComponent ? `${routeComponent.long_name} ${streetNumber ? streetNumber.long_name : ''}`.trim() : results[0].formatted_address.split(',')[0];
            
            setStreet(streetName);
            setDistrict(districtName);
          } else {
            setStreet('Ubicación seleccionada en mapa');
            setDistrict('Lima');
          }
          setIsGeocoding(false);
        });
      }
    }
  }, [isOpen, initialLocation]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const location = initialLocation || { lat: -34.6037, lng: -58.3816 };

    addReport({
      lat: location.lat,
      lng: location.lng,
      type,
      street,
      district,
      description,
      photo: photo || undefined,
      reportedBy: reportedBy || 'Usuario Anónimo'
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-neutral-900">Reportar Zona Oscura</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} className="text-neutral-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Location Info & Geocoded Address */}
          {initialLocation && (
            <div className="bg-neutral-100 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-neutral-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-bold text-neutral-900">Ubicación del reporte</p>
                  {isGeocoding ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin"></div>
                      <p className="text-neutral-500">Obteniendo dirección...</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-neutral-800 font-medium">{street}</p>
                      <p className="text-neutral-500">{district}</p>
                    </>
                  )}
                  <p className="text-neutral-400 font-mono text-xs mt-1">
                    {initialLocation.lat.toFixed(6)}, {initialLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Tipo de problema
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'sin-postes', label: 'Sin postes' },
                { value: 'luces-apagadas', label: 'Luces apagadas' },
                { value: 'iluminacion-insuficiente', label: 'Iluminación insuficiente' },
                { value: 'vandalismo', label: 'Vandalismo' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as ReportType)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    type === option.value
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>



          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-neutral-900 mb-2">
              Descripción del problema
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la situación con el mayor detalle posible..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-neutral-900 focus:outline-none transition-colors resize-none"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-bold text-neutral-900 mb-2">
              Foto de evidencia (opcional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photo ? (
              <div className="relative rounded-lg overflow-hidden border-2 border-neutral-200">
                <img src={photo} alt="Evidencia" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-neutral-400 hover:bg-neutral-50 transition-all flex flex-col items-center gap-2"
              >
                <Camera size={24} className="text-neutral-400" />
                <span className="text-sm text-neutral-600">Subir fotografía</span>
              </button>
            )}
          </div>

          {/* Reported By */}
          <div>
            <label htmlFor="reportedBy" className="block text-sm font-bold text-neutral-900 mb-2">
              Tu nombre (opcional)
            </label>
            <input
              id="reportedBy"
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="Dejar en blanco para reporte anónimo"
              className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-lg focus:border-neutral-900 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isGeocoding}
            className="w-full bg-neutral-900 text-white py-3.5 rounded-lg font-bold hover:bg-neutral-800 active:scale-98 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeocoding ? 'Obteniendo ubicación...' : 'Enviar Reporte'}
          </button>
        </form>
      </div>
    </div>
  );
}
