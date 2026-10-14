import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { ProductStatsResponse } from '@/types/statistics';
import { formatNumber, formatRON } from './format';
import Panel, { Segmented } from './Panel';
import { PODIUM_CLASSES, THEME } from './theme';

type SortBy = 'quantity' | 'revenue';

interface TopProductsCardProps {
  data?: ProductStatsResponse;
  isLoading: boolean;
  isRefreshing: boolean;
  isError?: boolean;
}

const TopProductsCard: React.FC<TopProductsCardProps> = ({ data, isLoading, isRefreshing, isError }) => {
  const [sortBy, setSortBy] = useState<SortBy>('quantity');
  const rows = (sortBy === 'quantity' ? data?.top_by_quantity : data?.top_by_revenue) ?? [];
  const max = Math.max(...rows.map((r) => r[sortBy]), 1);

  return (
    <Panel
      title="Top produse"
      subtitle="Cantitățile sunt în bucăți (pachete) comandate."
      icon={Trophy}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={rows.length === 0}
      placeholderHeight={320}
      actions={
        <Segmented
          ariaLabel="Ordonează după"
          options={[
            { value: 'quantity', label: 'După cantitate' },
            { value: 'revenue', label: 'După încasări' },
          ]}
          value={sortBy}
          onChange={setSortBy}
        />
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-gray-600">
              <th className="w-10 px-1 py-2 font-medium">#</th>
              <th className="px-1 py-2 font-medium">Produs</th>
              <th className="px-1 py-2 text-right font-medium">Cantitate</th>
              <th className="px-1 py-2 text-right font-medium">Încasări</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((row, index) => (
              <tr key={row.product_id} className="border-b border-gray-100 last:border-0">
                <td className="px-1 py-2.5 align-top">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      PODIUM_CLASSES[index] ?? 'text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                </td>
                <td className="px-1 py-2.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-medium text-gray-900">{row.name}</span>
                    {row.category_name && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{row.category_name}</span>
                    )}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(row[sortBy] / max) * 100}%`, backgroundColor: THEME.crust }}
                    />
                  </div>
                </td>
                <td className="whitespace-nowrap px-1 py-2.5 text-right align-top text-gray-800">
                  {formatNumber(row.quantity)} buc
                </td>
                <td className="whitespace-nowrap px-1 py-2.5 text-right align-top text-gray-800">
                  {formatRON(row.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default TopProductsCard;
