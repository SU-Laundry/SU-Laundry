import { POLICY } from '@/config/policy';

/**
 * 첨부 사진을 긴 변 POLICY.faultReport.photoMaxEdge px 이하 JPEG(data URL)로 줄인다.
 * 폰 원본(수 MB)을 그대로 들고 있지 않게 하고, 서버 연동 후에도 업로드 용량을 줄이기 위함.
 * EXIF(위치 등)는 캔버스로 다시 그리면서 함께 빠진다 → 개인정보 최소화.
 */
export function compressImage(file: File): Promise<string> {
  const { photoMaxEdge, photoQuality } = POLICY.faultReport;
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, photoMaxEdge / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('NO_CANVAS'));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', photoQuality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('DECODE_FAILED'));
    };
    img.src = url;
  });
}
