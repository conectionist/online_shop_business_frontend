import { CurrentListStats } from '@/types/statistics';

export type ListStatus = 'active' | 'expired' | 'draft';

type ListInfo = Pick<NonNullable<CurrentListStats['list']>, 'is_published' | 'expiration_date'>;

// Whether customers can order from the list. Same rule as the shop
// (services/lists.ts): a published list expires once its expiration date has passed,
// and never without one. It stays published after it expires.
export const listStatus = (list: ListInfo, now: Date): ListStatus => {
  if (!list.is_published) {
    return 'draft';
  }
  if (list.expiration_date && new Date(list.expiration_date).getTime() <= now.getTime()) {
    return 'expired';
  }
  return 'active';
};
