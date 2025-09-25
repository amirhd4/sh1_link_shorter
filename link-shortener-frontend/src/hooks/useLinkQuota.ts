import { useQuery } from '@tanstack/react-query';
import { linkService } from '../services/linkService';
import { useUserStore } from '../store/userStore';

export function useLinkQuota(p0: any) {
  const { user, setQuota } = useUserStore();

  return useQuery({
  queryKey: ['linkQuota', user?.id],
  queryFn: async () => {
    console.log('useLinkQuota executing', user);
    const links = await linkService.getMyLinks();
    const limit = user?.plan?.link_limit_per_month ?? 0;
    const remaining = limit - links.length;
    const quota = { remaining: Math.max(0, remaining), limit };
    console.log('calculated quota:', quota);
    setQuota(quota);   // 👈 اینجا ست میشه
    return quota;
  },
  enabled: !!user,
});

}
