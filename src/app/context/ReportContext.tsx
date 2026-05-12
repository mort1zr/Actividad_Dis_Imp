import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ReportType = 'sin-postes' | 'luces-apagadas' | 'iluminacion-insuficiente' | 'vandalismo';

export interface Report {
  id: string;
  lat: number;
  lng: number;
  type: ReportType;
  street: string;
  district: string;
  description: string;
  photo?: string;
  date: string;
  status: 'pendiente' | 'en-proceso' | 'atendido';
  reportedBy: string;
}

interface ReportContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'date' | 'status'>) => Promise<void>;
  updateReportStatus: (id: string, status: Report['status']) => Promise<void>;
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  filterType: ReportType | 'all';
  setFilterType: (type: ReportType | 'all') => void;
  loading: boolean;
  error: string | null;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Datos de prueba estáticos para mantener la app funcionando como respaldo
const initialReports: Report[] = [
  {
    id: '1',
    lat: -34.6037,
    lng: -58.3816,
    type: 'sin-postes',
    street: 'Av. Rivadavia entre San Martín y Moreno',
    district: 'Centro',
    description: 'Cuadra completa sin postes de luz, zona muy transitada de noche',
    date: '2026-05-01',
    status: 'pendiente',
    reportedBy: 'Ana Martínez'
  },
  {
    id: '2',
    lat: -34.6050,
    lng: -58.3850,
    type: 'luces-apagadas',
    street: 'Calle Belgrano esquina Rodríguez',
    district: 'Centro',
    description: 'Tres luminarias apagadas hace una semana, vecinos reportan inseguridad',
    date: '2026-04-28',
    status: 'en-proceso',
    reportedBy: 'Carlos Gómez'
  },
  {
    id: '3',
    lat: -34.6020,
    lng: -58.3780,
    type: 'iluminacion-insuficiente',
    street: 'Pasaje Los Álamos',
    district: 'Norte',
    description: 'Solo un poste para toda la cuadra, iluminación muy débil',
    date: '2026-05-03',
    status: 'pendiente',
    reportedBy: 'María Rodríguez'
  },
  {
    id: '4',
    lat: -34.6080,
    lng: -58.3820,
    type: 'vandalismo',
    street: 'Av. Independencia altura 1200',
    district: 'Sur',
    description: 'Luminaria dañada por vandalismo, vidrio roto',
    date: '2026-05-05',
    status: 'pendiente',
    reportedBy: 'Jorge Silva'
  },
  {
    id: '5',
    lat: -34.6010,
    lng: -58.3900,
    type: 'luces-apagadas',
    street: 'Calle Sarmiento 800',
    district: 'Oeste',
    description: 'Poste completo sin funcionamiento desde temporal',
    date: '2026-04-25',
    status: 'atendido',
    reportedBy: 'Laura Benítez'
  },
  {
    id: '6',
    lat: -34.6070,
    lng: -58.3750,
    type: 'sin-postes',
    street: 'Calle Mitre entre Alsina y Dorrego',
    district: 'Este',
    description: 'Tramo de 200 metros sin iluminación pública',
    date: '2026-05-02',
    status: 'pendiente',
    reportedBy: 'Roberto Díaz'
  }
];

const GAS_URL = import.meta.env.VITE_GAS_WEB_APP_URL || '';

export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterType, setFilterType] = useState<ReportType | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si la URL está vacía, usamos los datos iniciales
    if (!GAS_URL) {
      console.log('No se ha configurado VITE_GAS_WEB_APP_URL. Usando datos de prueba locales.');
      return;
    }

    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(GAS_URL);
        if (!response.ok) throw new Error('Error al conectar con Google Apps Script');
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setReports(data);
        } else {
          // Si está vacío en GAS, podemos mantener los iniciales o dejarlo vacío
          // En este caso, si GAS responde correctamente pero vacío, mostramos vacío.
          setReports([]);
        }
      } catch (err: any) {
        console.error('Error fetching reports from GAS:', err);
        setError('Error al cargar datos desde Google Sheets. Se usarán datos locales.');
        setReports(initialReports); // Fallback a datos estáticos
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const addReport = async (report: Omit<Report, 'id' | 'date' | 'status'>) => {
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'pendiente'
    };

    // Actualización optimista en la interfaz
    setReports((prev) => [...prev, newReport]);
    setSelectedReport(newReport);

    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8', // Evita problemas de preflight CORS en GAS
          },
          body: JSON.stringify({ action: 'add', report: newReport }),
        });
      } catch (err) {
        console.error('Error guardando reporte en GAS:', err);
        // Podríamos revertir el estado aquí si falla, pero para UX a veces es mejor solo avisar.
      }
    }
  };

  const updateReportStatus = async (id: string, status: Report['status']) => {
    // Actualización optimista
    setReports((prev) => prev.map(r => r.id === id ? { ...r, status } : r));

    if (GAS_URL) {
      try {
        await fetch(GAS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({ action: 'updateStatus', id, status }),
        });
      } catch (err) {
        console.error('Error actualizando reporte en GAS:', err);
      }
    }
  };

  return (
    <ReportContext.Provider value={{
      reports,
      addReport,
      updateReportStatus,
      selectedReport,
      setSelectedReport,
      filterType,
      setFilterType,
      loading,
      error
    }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
}

