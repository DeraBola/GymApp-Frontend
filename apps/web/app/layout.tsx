import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MuiProvider from '../components/providers/MuiProvider';
import "./globals.css";
import { Metadata } from 'next';
import { APP_NAME } from '../lib/brand';

export const metadata: Metadata = {
  title: APP_NAME,
  description: `${APP_NAME}: gym management for every location`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <MuiProvider>
          <AuthProvider>
            {children}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          </AuthProvider>
        </MuiProvider>
      </body>
    </html>
  );
}
