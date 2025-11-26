import { DailyDevotional } from './DailyDevotional';
import RequireAuth from '@/components/RequireAuth';

export default function DevotionalPage() {
  return (
    <RequireAuth>
      <DailyDevotional />
    </RequireAuth>
  );
}