import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Negocios Universales",
  description: "Plataforma AI de tasación inmobiliaria",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased" style={{ fontFamily: "system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
