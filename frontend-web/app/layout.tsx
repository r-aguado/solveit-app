import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './contexts/AuthContext';

export const metadata: Metadata = {
  title: 'SolveIT — Gestión de Incidencias IT',
  description: 'Sistema inteligente de gestión de incidencias IT',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
