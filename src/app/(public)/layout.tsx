import type { Metadata } from 'next';
import { PublicNavbar } from '@/components/marketing/PublicNavbar';
import { PublicFooter } from '@/components/marketing/PublicFooter';

export const metadata: Metadata = {
  title: 'Negocios Universales | Tasaciones trazables para la banca dominicana',
  description: 'Pipeline asistido por IA: evidencia, comparables, informe y checklist de auditoría. Diseñado para instituciones financieras en República Dominicana.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen text-white" style={{ background: 'var(--nu-navy)' }}>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
