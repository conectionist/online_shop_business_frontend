import React from 'react';
import { Truck } from 'lucide-react';
import { BreakdownSlice } from '@/types/statistics';
import { formatNumber, formatPercent, formatRON } from './format';
import Panel from './Panel';
import RankedBars from './RankedBars';

interface BreakdownCardProps {
  deliveryTypes: BreakdownSlice[];
  paymentMethods: BreakdownSlice[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError?: boolean;
}

const Breakdown: React.FC<{ title: string; slices: BreakdownSlice[] }> = ({ title, slices }) => {
  const total = slices.reduce((sum, s) => sum + s.orders, 0);
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-600">{title}</h3>
      {slices.length === 0 ? (
        <p className="text-sm text-gray-500">Fără date.</p>
      ) : (
        <RankedBars
          ariaLabel={title}
          items={slices.map((s) => ({
            key: s.id,
            label: s.name,
            value: s.orders,
            valueLabel: `${formatNumber(s.orders)} · ${total ? formatPercent(s.orders / total) : '0%'}`,
            detail: formatRON(s.revenue),
          }))}
        />
      )}
    </div>
  );
};

// Share of orders per delivery type and per payment method
const BreakdownCard: React.FC<BreakdownCardProps> = ({
  deliveryTypes,
  paymentMethods,
  isLoading,
  isRefreshing,
  isError,
}) => (
  <Panel
    title="Logistică & plată"
    subtitle="Comenzi, pondere și încasări"
    icon={Truck}
    isLoading={isLoading}
    isRefreshing={isRefreshing}
    isError={isError}
    isEmpty={deliveryTypes.length === 0 && paymentMethods.length === 0}
    placeholderHeight={200}
  >
    <div className="space-y-6">
      <Breakdown title="Tip livrare" slices={deliveryTypes} />
      <Breakdown title="Metodă de plată" slices={paymentMethods} />
    </div>
  </Panel>
);

export default BreakdownCard;
