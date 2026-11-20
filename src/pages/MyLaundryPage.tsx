import { Page } from '@/app/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { Character } from '@/components/Character';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';

export default function MyLaundryPage() {
  const { data: m, loading } = useAsync(async () => {
    const user = await api.getCurrentUser();
    return user.machine_id ? api.getMachine(user.machine_id) : undefined;
  });

  return (
    <Page back title="내 세탁">
      {loading ? (
        <p className="caption">불러오는 중…</p>
      ) : !m ? (
        <div style={{ display: 'grid', placeItems: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-7)' }}>
          <Character size={110} />
          <p className="caption">지금 이용 중인 세탁기가 없어요</p>
        </div>
      ) : (
        <section className="card card-xl">
          <h2 className="section-title">{m.machine_number}번 세탁기</h2>
          <StatusBadge status={m.current_status} />
          <p className="caption" style={{ marginTop: 'var(--space-3)' }}>
            시작 {m.started_at ? new Date(m.started_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '-'}
          </p>
          {/* TODO: 진행 이력 타임라인, 수거 요청 수신 여부 */}
        </section>
      )}
    </Page>
  );
}
