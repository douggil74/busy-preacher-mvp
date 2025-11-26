import { DailyDevotional } from './DailyDevotional';
import RequireAuth from '@/components/RequireAuth';
import { Paywall } from '@/components/Paywall';

export default function DevotionalPage() {
  return (
    <RequireAuth>
      <Paywall>
        <DailyDevotional />
      </Paywall>
    </RequireAuth>
  );
}