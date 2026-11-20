import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';
import { StatusBadge } from '@/components/StatusBadge';
import { DEFAULT_PEAK, POLICY } from '@/config/policy';
import type { MachineStatus } from '@/domain/types';

/** 상태 안내 — 화면에 실제로 쓰는 배지 그대로 */
const LEGEND: { status: MachineStatus; desc: string }[] = [
  { status: 'AVAILABLE', desc: '비어 있어서 지금 바로 쓸 수 있어요' },
  { status: 'IN_USE', desc: '세탁·건조가 진행 중이에요' },
  { status: 'WAITING_PICKUP', desc: '끝났지만 아직 세탁물을 꺼내지 않았어요' },
  { status: 'RESERVED', desc: `피크 시간(${DEFAULT_PEAK.start}~${DEFAULT_PEAK.end})에 누군가 예약한 세탁기예요` },
  { status: 'MAINTENANCE', desc: '고장 신고가 접수돼 점검하고 있어요. 점검이 끝나면 다시 쓸 수 있어요' },
];

const noShowPeriod = POLICY.noShow.restrictDays === 30 ? '한 달' : `${POLICY.noShow.restrictDays}일`;

/** 자주 묻는 질문 — 숫자는 설정 값에서 가져와 문서와 실제 동작이 어긋나지 않게 */
const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: '세탁기 상태는 어떻게 알 수 있나요?',
    a: '세탁기에 붙어 있는 감지 장치가 세탁기가 돌아가는지, 멈췄는지를 자동으로 알려줘요. 세탁을 시작하거나 끝낼 때 앱에서 따로 누를 건 없어요.',
  },
  {
    q: '피크 시간 예약은 뭔가요?',
    a: `사람이 몰리는 ${DEFAULT_PEAK.start}~${DEFAULT_PEAK.end}에는 예약한 사람이 먼저 쓸 수 있어요. 그 외 시간에는 예약 없이 자유롭게 쓰면 돼요. 예약은 예약 탭에서 시간과 세탁기를 고르면 끝이에요.`,
  },
  {
    q: '예약 시간에 늦으면 어떻게 되나요?',
    a: `예약 시간이 시작되고 ${POLICY.graceTimeMinutes}분 안에 세탁을 시작하지 않으면 노쇼로 예약이 자동 해제되고, 다른 사람이 쓸 수 있게 돼요. 못 갈 것 같으면 미리 취소해주세요.`,
  },
  {
    q: '노쇼가 쌓이면 어떻게 되나요?',
    a: `노쇼가 ${POLICY.noShow.limit}회 쌓이면 ${noShowPeriod} 동안 예약할 수 없어요. 제한이 끝나면 횟수는 다시 0회부터 시작해요. 시작 전에 취소한 예약은 노쇼로 세지 않아요. 내 노쇼 횟수는 예약 탭과 예약 내역에서 볼 수 있어요.`,
  },
  {
    q: '예약은 어떻게 취소하나요?',
    a: '마이 > 예약 내역에서 시작 전까지 취소할 수 있어요. 예약은 한 사람당 한 번에 1건만 할 수 있어요.',
  },
  {
    q: '건조기도 예약할 수 있나요?',
    a: '건조기는 예약 없이 비어 있으면 바로 쓰면 돼요. 세탁실 탭에서 건조기 현황도 함께 볼 수 있어요.',
  },
  {
    q: '세탁기·건조기가 고장 났어요',
    a: '세탁실 탭에서 그 기기를 누르고 아래쪽 "고장 신고하기"를 눌러주세요. 어떤 문제인지 고르고, 필요하면 사진도 최대 3장까지 첨부할 수 있어요. 신고가 접수되면 그 기기는 바로 "점검 중"으로 표시돼서 다른 사람도 알 수 있어요.',
  },
  {
    q: '세탁이 끝나면 어떻게 알 수 있나요?',
    a: '세탁이 끝나면 알림을 보내드려요. 세탁물을 꺼내고 문을 닫으면 자동으로 확인돼서, 다음 사람이 바로 쓸 수 있게 돼요.',
  },
  {
    q: '세탁기에 이전 사람 세탁물이 남아 있어요',
    a: '세탁실 탭에서 그 세탁기를 누르고 "이전 사용자에게 알리기"를 눌러주세요. 이전 사용자에게 수거 요청 알림이 가요. 실제로 세탁물이 남아 있을 때만 보내주세요.',
  },
  {
    q: '수거 요청 알림을 받았어요',
    a: '다음 사람이 세탁기를 쓰려고 기다리고 있다는 뜻이에요. 최대한 빨리 세탁물을 꺼내주세요.',
  },
  {
    q: '결제도 여기서 하나요?',
    a: '아니요. 결제는 지금처럼 기존 세탁 결제 앱에서 해주세요. SU Laundry는 세탁실 현황 확인, 예약, 알림을 도와주는 서비스예요.',
  },
  {
    q: '생활관을 바꾸고 싶어요',
    a: '마이 > 거주 생활관에서 바꿀 수 있어요. 홈 위쪽의 생활관 이름을 눌러도 돼요.',
  },
  {
    q: '알림이 오지 않아요',
    a: '마이 > 알림 허용하기를 눌러 알림을 켜주세요. 휴대폰 설정에서 알림이 꺼져 있지 않은지도 확인해주세요.',
  },
];

export default function HelpPage() {
  return (
    <Page back title="도움말">
      <div className="stack">
        {/* 말풍선형 안내 — 캐릭터는 작게, 정보보다 크지 않게 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Character which="right" size={72} />
          <p className="speech">
            궁금한 게 있나요?
            <br />
            자주 묻는 질문을 모아봤어요
          </p>
        </div>

        <section>
          <h2 className="section-title">기기 상태 안내</h2>
          <ul className="card" style={{ listStyle: 'none', margin: 0, padding: 'var(--space-2) var(--space-4)' }}>
            {LEGEND.map(({ status, desc }, i) => (
              <li
                key={status}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderTop: i ? '1px solid var(--color-border)' : 0 }}
              >
                <span style={{ flex: 'none', width: 92 }}>
                  <StatusBadge status={status} />
                </span>
                <span className="caption" style={{ color: 'var(--color-text-main)' }}>
                  {desc}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="section-title">자주 묻는 질문</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {FAQ.map(({ q, a }) => (
              <details key={q} className="faq card">
                <summary>
                  <span style={{ flex: 1 }}>{q}</span>
                  <ChevronDown size={18} className="faq__chevron" aria-hidden />
                </summary>
                <p className="faq__answer">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
