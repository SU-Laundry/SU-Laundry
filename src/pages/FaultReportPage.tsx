import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, CheckCircle2, X } from 'lucide-react';
import { Page } from '@/app/AppShell';
import { Character } from '@/components/Character';
import { api } from '@/services/api';
import { useAsync } from '@/services/useAsync';
import { compressImage } from '@/services/image';
import { machineName } from '@/domain/status';
import { POLICY } from '@/config/policy';
import type { FaultCategory, MachineType } from '@/domain/types';

/** 고장 유형 — 건조기는 '탈수' 대신 '건조가 안 돼요' */
const CATEGORIES = (type: MachineType): { id: FaultCategory; label: string }[] => [
  { id: 'NOT_WORKING', label: '작동이 안 돼요' },
  { id: 'LEAK', label: type === 'DRYER' ? '타는 냄새·과열' : '물이 새요' },
  { id: 'NOISE', label: '소음·진동이 심해요' },
  { id: 'DOOR', label: '문이 안 열려요/안 닫혀요' },
  { id: 'NOT_DRYING', label: type === 'DRYER' ? '건조가 안 돼요' : '탈수가 안 돼요' },
  { id: 'OTHER', label: '기타' },
];

/** 기기별 고장 신고 — 유형 선택 + 설명 + 사진 첨부(선택). 접수되면 기기가 '점검 중'으로 바뀐다 */
export default function FaultReportPage() {
  const { machineId = '' } = useParams();
  const navigate = useNavigate();
  const { data: m, loading } = useAsync(() => api.getMachine(machineId), [machineId]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<FaultCategory>();
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const { maxPhotos, maxDescription } = POLICY.faultReport;

  if (loading) return <Page back title="고장 신고"><p className="caption">불러오는 중…</p></Page>;
  if (!m) return <Page back title="고장 신고"><p className="caption">기기를 찾을 수 없어요</p></Page>;
  const name = machineName(m);

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setAdding(true);
    setError(undefined);
    const room = maxPhotos - photos.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, room);
    const out: string[] = [];
    for (const f of picked) {
      try {
        out.push(await compressImage(f));
      } catch {
        setError('사진을 불러오지 못했어요. 다른 사진으로 시도해주세요.');
      }
    }
    if (files.length > room) setError(`사진은 최대 ${maxPhotos}장까지 첨부할 수 있어요.`);
    setPhotos((p) => [...p, ...out].slice(0, maxPhotos));
    setAdding(false);
    if (fileRef.current) fileRef.current.value = ''; // 같은 사진을 다시 고를 수 있게
  };

  const needsText = category === 'OTHER' && !description.trim();
  const submit = async () => {
    if (!category || needsText) return;
    setBusy(true);
    setError(undefined);
    try {
      await api.createFaultReport(m.machine_id, { category, description, photos });
      setDone(true);
    } catch {
      setError('신고를 보내지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Page
        back
        title="고장 신고"
        footer={
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            확인
          </button>
        }
      >
        <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 'var(--space-3)', paddingTop: 'var(--space-7)' }}>
          <div className="pop">
            <Character which="left" size={112} />
          </div>
          <CheckCircle2 size={32} color="var(--status-available)" aria-hidden />
          <h2 style={{ fontSize: 'var(--fs-page)', fontWeight: 700 }}>신고가 접수됐어요</h2>
          <p className="caption" style={{ lineHeight: 1.6 }}>
            {name}는 점검이 끝날 때까지
            <br />
            '점검 중'으로 표시돼요. 알려줘서 고마워요!
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page
      back
      title={`${name} 고장 신고`}
      footer={
        <button className="btn btn-primary" disabled={!category || needsText || busy || adding} onClick={submit}>
          {busy ? '신고하는 중…' : '신고하기'}
        </button>
      }
    >
      <div className="stack">
        <section>
          <h2 className="section-title">어떤 문제가 있나요?</h2>
          <div role="radiogroup" aria-label="고장 유형" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {CATEGORIES(m.machine_type).map((c) => {
              const active = c.id === category;
              return (
                <button
                  key={c.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCategory(c.id)}
                  style={{
                    minHeight: 48,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: active ? 'var(--color-sky)' : 'var(--color-surface)',
                    color: active ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
                    fontSize: 'var(--fs-caption)',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    wordBreak: 'keep-all',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <label htmlFor="fault-desc" className="section-title" style={{ display: 'block' }}>
            자세한 내용 <span className="caption">{category === 'OTHER' ? '(필수)' : '(선택)'}</span>
          </label>
          <textarea
            id="fault-desc"
            className="input"
            value={description}
            maxLength={maxDescription}
            rows={4}
            placeholder="예) 시작 버튼을 눌러도 반응이 없어요"
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="caption" style={{ textAlign: 'right', marginTop: 4 }}>
            {description.length}/{maxDescription}
          </p>
        </section>

        <section>
          <h2 className="section-title">
            사진 첨부 <span className="caption">(선택, 최대 {maxPhotos}장)</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {photos.map((src, i) => (
              <div key={i} className="photo-thumb">
                <img src={src} alt={`첨부한 사진 ${i + 1}`} />
                <button aria-label={`사진 ${i + 1} 삭제`} onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}>
                  <X size={16} aria-hidden />
                </button>
              </div>
            ))}
            {photos.length < maxPhotos && (
              <button className="photo-add" onClick={() => fileRef.current?.click()} disabled={adding}>
                <Camera size={22} aria-hidden />
                <span>{adding ? '불러오는 중…' : `${photos.length}/${maxPhotos}`}</span>
              </button>
            )}
          </div>
          {/* capture를 지정하지 않음 → 폰에서 카메라 촬영·앨범 선택 둘 다 가능 */}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
          <p className="caption" style={{ marginTop: 'var(--space-2)' }}>
            고장 부위가 잘 보이게 찍어주세요. 다른 사람의 얼굴이나 세탁물은 나오지 않게 해주세요.
          </p>
        </section>

        <p className="caption" style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--status-maintenance-bg)', borderRadius: 'var(--radius-sm)' }}>
          신고가 접수되면 {name}는 바로 '점검 중'으로 표시되고, 점검이 끝나면 다시 사용할 수 있어요.
        </p>

        {error && (
          <p className="caption" role="alert" style={{ color: 'var(--status-error)' }}>
            {error}
          </p>
        )}
      </div>
    </Page>
  );
}
