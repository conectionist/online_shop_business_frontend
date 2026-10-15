import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import { ProductStatsResponse } from '@/types/statistics';
import { pluralRo } from './format';
import Panel, { ShowAllButton } from './Panel';

const PREVIEW = 8;

interface SellOutProductsCardProps {
  data?: ProductStatsResponse;
  isLoading: boolean;
  isRefreshing: boolean;
  isError?: boolean;
}

// How often each product sold out in the period's lists: demand outran what was made.
// The bar is the share of lists where it sold out.
const SellOutProductsCard: React.FC<SellOutProductsCardProps> = ({ data, isLoading, isRefreshing, isError }) => {
  const [expanded, setExpanded] = useState(false);
  const sellOuts = data?.sell_outs ?? [];
  const shown = expanded ? sellOuts : sellOuts.slice(0, PREVIEW);

  return (
    <Panel
      title="Produse epuizate"
      badge={isLoading || isError ? undefined : sellOuts.length}
      subtitle="Marcate indisponibile după ce s-au comandat: cererea a depășit cantitatea pregătită."
      icon={Flame}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={sellOuts.length === 0}
      emptyMessage="Niciun produs nu s-a epuizat în perioada selectată."
      placeholderHeight={160}
    >
      <ul className="divide-y divide-gray-100" aria-label="Produse epuizate">
        {shown.map((p) => (
          <li key={p.product_id} className="py-2 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-gray-900">{p.name}</span>
                {p.category_name && <span className="text-xs text-gray-600">{p.category_name}</span>}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-gray-700">
                Epuizat în {p.sold_out} din {pluralRo(p.offered, 'listă', 'liste')}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
              <div className="h-full rounded-full bg-rose-500" style={{ width: `${(p.sold_out / p.offered) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {sellOuts.length > PREVIEW && (
        <ShowAllButton expanded={expanded} total={sellOuts.length} onToggle={() => setExpanded((v) => !v)} />
      )}
    </Panel>
  );
};

export default SellOutProductsCard;
