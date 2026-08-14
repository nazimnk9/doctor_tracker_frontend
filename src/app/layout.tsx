import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { ModalProvider } from '../context/ModalContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doctor Tracker Portal',
  description: 'Secure Administrative Web Portal for Doctor & Patient Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ModalProvider>{children}</ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
