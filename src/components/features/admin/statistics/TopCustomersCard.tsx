import React, { useState } from 'react';
import { Crown } from 'lucide-react';
import { CustomerStatsResponse } from '@/types/statistics';
import { formatDateShortRomanian } from '@/utils/dateFormatters';
import { formatNumber, formatRON, pluralRo } from './format';
import Panel, { Segmented } from './Panel';
import { displayPhone } from './phone';
import { PODIUM_CLASSES } from './theme';

type SortBy = 'orders' | 'revenue';

interface TopCustomersCardProps {
  data?: CustomerStatsResponse;
  isLoading: boolean;
  isRefreshing: boolean;
}

// The sorted column reads strongest
const valueClass = (active: boolean) =>
  `whitespace-nowrap px-1 py-2.5 text-right align-top ${active ? 'font-semibold text-gray-900' : 'text-gray-700'}`;

const TopCustomersCard: React.FC<TopCustomersCardProps> = ({ data, isLoading, isRefreshing }) => {
  const [sortBy, setSortBy] = useState<SortBy>('orders');
  // Two rankings from the API: the top by order count need not be in the top by value
  const rows = (sortBy === 'orders' ? data?.top_customers_by_orders : data?.top_customers) ?? [];

  return (
    <Panel
      title="Top clienți"
      subtitle="În perioada selectată"
      icon={Crown}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isEmpty={rows.length === 0}
      placeholderHeight={280}
      actions={
        <Segmented
          ariaLabel="Ordonează clienții după"
          options={[
            { value: 'orders', label: 'După comenzi' },
            { value: 'revenue', label: 'După valoare' },
          ]}
          value={sortBy}
          onChange={setSortBy}
        />
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full text-sm" aria-label="Top clienți">
          <thead>
            <tr className="border-b text-left text-xs text-gray-600">
              <th className="w-10 px-1 py-2 font-medium">#</th>
              <th className="px-1 py-2 font-medium">Client</th>
              <th className="px-1 py-2 text-right font-medium">Comenzi</th>
              <th className="px-1 py-2 text-right font-medium">Valoare</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((row, index) => (
              <tr key={`${row.name}-${row.phone_number ?? ''}`} className="border-b border-gray-100 last:border-0">
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
                  <p className="font-medium text-gray-900">{row.name}</p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {row.phone_number && `${displayPhone(row.phone_number)} · `}ultima comandă{' '}
                    {formatDateShortRomanian(row.last_order_date)}
                  </p>
                </td>
                <td className={valueClass(sortBy === 'orders')}>
                  {formatNumber(row.orders)}
                  {row.lists !== row.orders && (
                    <span className="block text-xs font-normal text-gray-500">
                      în {pluralRo(row.lists, 'listă', 'liste')}
                    </span>
                  )}
                </td>
                <td className={valueClass(sortBy === 'revenue')}>{formatRON(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default TopCustomersCard;
