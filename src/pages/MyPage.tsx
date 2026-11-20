import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { useDorm } from '@/app/DormContext';
import { pushService } from '@/services/notifications';
import { dormitories } from '@/mocks/data';

export default function MyPage() {
  const { dormId } = useDorm();
  const dormName = dormitories.find((d) => d.dormitory_id === dormId)?.name;

  const items: { label: string; to: string; value?: string }[] = [
    { label: '거주 생활관', to: '/select-dorm', value: dormName },
    { label: '예약 내역', to: '#' },
    { label: '내 세탁', to: '/my-laundry' },
    { label: '도움말', to: '#' },
    { label: '서비스 소개 다시 보기', to: '/onboarding' },
    { label: '앱 정보', to: '#' },
  ];

  return (
    <Page title="마이">
      <div className="stack">
        <ul className="card" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {items.map((it, i) => (
            <li key={it.label} style={{ borderTop: i ? '1px solid var(--color-border)' : 0 }}>
              <Link to={it.to} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minHeight: 52, padding: '0 var(--space-4)' }}>
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.value && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{it.value}</span>}
                <ChevronRight size={18} color="var(--color-text-sub)" />
              </Link>
            </li>
          ))}
        </ul>
        <button className="btn btn-secondary" onClick={() => pushService.requestPermission()}>
          알림 허용하기
        </button>
      </div>
    </Page>
  );
}
