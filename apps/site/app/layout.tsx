import type { Metadata } from 'next';
import './globals.css';
import { APP_NAME } from '../lib/brand';

export const metadata: Metadata = {
  title: `${APP_NAME}: run every gym location from one dashboard`,
  description: `${APP_NAME} brings members, payments, staff, classes, equipment and sales for all your gyms into one place, with each gym's data kept separate.`,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
