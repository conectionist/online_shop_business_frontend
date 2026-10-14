import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContainer';
import { statisticsService } from '@/services/statistics';
import { StatsOverview, StatsRange } from '@/types/statistics';
import { CsvRow, customerRows, downloadCsv, productRows, summaryRows } from './csv';
import { describePeriod, periodSlug } from './period';

// The API's maximum for top products and top customers
const EXPORT_LIMIT = 100;

type ExportKind = 'summary' | 'products' | 'customers';

const EXPORTS: { kind: ExportKind; label: string; description: string; file: string }[] = [
  { kind: 'summary', label: 'Sumar indicatori', description: 'Încasări, comenzi, clienți, evoluție pe liste', file: 'statistici_sumar' },
  { kind: 'products', label: 'Top produse', description: 'Cantități și încasări pe produs și categorie', file: 'top_produse' },
  { kind: 'customers', label: 'Activitate clienți', description: 'Top clienți: comenzi și valoare', file: 'activitate_clienti' },
];

interface ExportToolbarProps {
  range: StatsRange;
  overview?: StatsOverview;
}

// CSV downloads for the selected period, and printing
const ExportToolbar: React.FC<ExportToolbarProps> = ({ range, overview }) => {
  const { showToast } = useToast();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<ExportKind | null>(null);

  // Close the menu on a click outside it
  useEffect(() => {
    if (!open) {
      return;
    }
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        menuRef.current.open = false;
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const runExport = async (kind: ExportKind, file: string) => {
    if (!overview) {
      return;
    }
    setBusy(kind);
    try {
      const periodText = describePeriod(overview.period);
      // Products and customers are fetched in full here; the page only shows the top 10.
      // Called directly so the page's cached top-10 queries stay as they are.
      let rows: CsvRow[];
      if (kind === 'summary') {
        rows = summaryRows(overview, periodText);
      } else if (kind === 'products') {
        rows = productRows(await statisticsService.getProducts(range, EXPORT_LIMIT), periodText);
      } else {
        rows = customerRows(await statisticsService.getCustomers(range, EXPORT_LIMIT), periodText);
      }
      downloadCsv(`${file}_${periodSlug(overview.period)}.csv`, rows);
      if (menuRef.current) {
        menuRef.current.open = false;
      }
    } catch {
      showToast({
        type: 'error',
        title: 'Exportul a eșuat',
        message: 'Nu s-au putut încărca datele. Încercați din nou.',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row print:hidden">
      <details
        ref={menuRef}
        className="relative"
        onToggle={(event) => setOpen((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary
          className={`flex cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden ${
            overview ? '' : 'pointer-events-none opacity-50'
          }`}
          aria-disabled={!overview}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportă CSV
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </summary>
        <div className="absolute left-0 z-40 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
          {EXPORTS.map((item) => (
            <button
              key={item.kind}
              type="button"
              disabled={busy !== null}
              onClick={() => runExport(item.kind, item.file)}
              className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-amber-50 focus:outline-none focus-visible:bg-amber-50 disabled:cursor-wait disabled:opacity-60"
            >
              {busy === item.kind ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#b4561b]" aria-hidden="true" />
              ) : (
                <Download className="mt-0.5 h-4 w-4 shrink-0 text-[#b4561b]" aria-hidden="true" />
              )}
              <span>
                <span className="block text-sm font-medium text-gray-900">{item.label}</span>
                <span className="block text-xs text-gray-600">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      </details>
      <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
        Printează
      </Button>
    </div>
  );
};

export default ExportToolbar;
