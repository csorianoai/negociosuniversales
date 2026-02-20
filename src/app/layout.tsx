import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-serif-display/400.css';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Negocios Universales',
  description: 'Plataforma AI de tasación inmobiliaria',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="font-sans">
      <body className="antialiased" style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
