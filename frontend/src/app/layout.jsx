import './globals.css';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata = {
  title: 'RADISTES - MTs Al Amiriyyah',
  description: 'Aplikasi Raport Sumatif Tengah Semester (STS) Terpadu MTs Al Amiriyyah Blokagung',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="stylesheet" href="/vendor/fontawesome/css/all.min.css" />
      </head>
      <body>
        <AppProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AppProvider>
      </body>
    </html>
  );
}
