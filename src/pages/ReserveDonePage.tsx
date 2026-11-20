import { Link, useLocation } from 'react-router-dom';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';

export default function ReserveDonePage() {
  const { state } = useLocation() as { state?: { slot?: string; machineId?: string } };
  const number = state?.machineId?.split('-').pop();

  return (
    <Page>
      <div className="stack fade-up" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'var(--space-7)' }}>
        <Character which="left" size={130} />
        <h1 style={{ fontSize: 'var(--fs-page)', fontWeight: 700 }}>예약이 완료되었어요</h1>
        <p className="caption">
          {state?.slot ?? '--:--'}부터 {number ?? '-'}번 세탁기를 예약했어요.
          <br />
          시작 전에 알림으로 알려드릴게요.
        </p>
        <Link to="/" className="btn btn-primary">
          확인
        </Link>
      </div>
    </Page>
  );
}
