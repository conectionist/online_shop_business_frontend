import React from 'react';
import { Layers } from 'lucide-react';
import { CategoryStat } from '@/types/statistics';
import { formatPercent, formatRON, pluralRo } from './format';
import Panel from './Panel';
import RankedBars from './RankedBars';

interface CategoryRevenueCardProps {
  categories: CategoryStat[];
  isLoading: boolean;
  isRefreshing: boolean;
  isError?: boolean;
}

const CategoryRevenueCard: React.FC<CategoryRevenueCardProps> = ({ categories, isLoading, isRefreshing, isError }) => {
  const total = categories.reduce((sum, c) => sum + c.revenue, 0);
  return (
    <Panel
      title="Vânzări pe categorii"
      subtitle={
        categories.length > 0
          ? `${pluralRo(categories.length, 'categorie activă', 'categorii active')} în perioada selectată`
          : undefined
      }
      icon={Layers}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      isError={isError}
      isEmpty={categories.length === 0}
      placeholderHeight={280}
    >
      <RankedBars
        ariaLabel="Încasări pe categorii"
        items={categories.map((c) => ({
          key: c.category_id,
          label: c.name,
          value: c.revenue,
          valueLabel: total ? `${formatRON(c.revenue)} · ${formatPercent(c.revenue / total)}` : formatRON(c.revenue),
        }))}
      />
    </Panel>
  );
};

export default CategoryRevenueCard;
