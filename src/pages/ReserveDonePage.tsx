import { Link, useLocation } from 'react-router-dom';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';
import { fmtDay, fmtTime } from '@/domain/time';

export default function ReserveDonePage() {
  const { state } = useLocation() as { state?: { start?: string; machineNumber?: number } };
  const when = state?.start ? `${fmtDay(state.start)} ${fmtTime(state.start)}` : '--:--';

  return (
    <Page
      footer={
        <>
          <Link to="/" replace className="btn btn-primary">
            확인
          </Link>
          <Link to="/reservations" replace className="btn btn-tertiary">
            예약 내역 보기
          </Link>
        </>
      }
    >
      <div className="stack fade-up" style={{ alignItems: 'center', textAlign: 'center', paddingTop: 'var(--space-7)' }}>
        <div className="pop">
          <Character which="left" size={130} />
        </div>
        <h1 style={{ fontSize: 'var(--fs-page)', fontWeight: 700 }}>예약이 완료되었어요</h1>
        <p className="caption">
          {when}부터 {state?.machineNumber ?? '-'}번 세탁기를 예약했어요.
          <br />
          시작 전에 알림으로 알려드릴게요.
        </p>
      </div>
    </Page>
  );
}
