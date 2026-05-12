import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ReportProvider } from './context/ReportContext';

export default function App() {
  return (
    <ReportProvider>
      <RouterProvider router={router} />
    </ReportProvider>
  );
}