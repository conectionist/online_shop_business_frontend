import React, { useState } from 'react';
import { PackageX } from 'lucide-react';
import { ProductStatsResponse } from '@/types/statistics';
import { pluralRo } from './format';
import Panel, { ShowAllButton } from './Panel';

const PREVIEW = 8;

interface UnsoldProductsCardProps {
  data?: ProductStatsResponse;
  isLoading: boolean;
  isRefreshing: boolean;
}

// Products offered in the period's lists that nobody ordered
const UnsoldProductsCard: React.FC<UnsoldProductsCardProps> = ({ data, isLoading, isRefreshing }) => {
  const [expanded, setExpanded] = useState(false);
  const unsold = data?.unsold_products ?? [];
  const shown = expanded ? unsold : unsold.slice(0, PREVIEW);

  return (
    <Panel
      title="Produse fără comenzi"
      badge={isLoading ? undefined : unsold.length}
      subtitle="Oferite în listele din perioada selectată, dar necomandate niciodată."
      icon={PackageX}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isEmpty={unsold.length === 0}
      emptyMessage="Toate produsele oferite s-au vândut cel puțin o dată."
      placeholderHeight={160}
    >
      <ul className="divide-y divide-gray-100">
        {shown.map((p) => (
          <li key={p.product_id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium text-gray-900">{p.name}</span>
              {p.category_name && <span className="text-xs text-gray-600">{p.category_name}</span>}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-gray-600">
              Oferit în {pluralRo(p.times_offered, 'listă', 'liste')}
            </span>
          </li>
        ))}
      </ul>
      {unsold.length > PREVIEW && (
        <ShowAllButton expanded={expanded} total={unsold.length} onToggle={() => setExpanded((v) => !v)} />
      )}
    </Panel>
  );
};

export default UnsoldProductsCard;
