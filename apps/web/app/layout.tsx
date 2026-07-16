import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MuiProvider from '../components/providers/MuiProvider';
import "./globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FitTitans',
  description: 'Management Dashboard for FitTitans',
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
