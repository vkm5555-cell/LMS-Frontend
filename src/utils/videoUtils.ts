import type { RefObject } from 'react';

export const toSrc = (apiBaseUrl: string | undefined, u?: string) => {
  if (!u) return '';
  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  const base = (apiBaseUrl ?? '').replace(/\/$/, '');
  return base ? `${base}/${u.replace(/^\//, '')}` : u.replace(/^\//, '');
};

// Attempts to fetch a protected video URL with Authorization and set it on the video element.
// Returns true if successful.
export async function tryAuthFetchAndSet(
  src: string,
  videoRef: RefObject<HTMLVideoElement | null>,
  setAttemptedAuthFetch: (v: boolean) => void,
  setVideoError: (v: string | null) => void
): Promise<boolean> {
  if (!src) return false;
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    setAttemptedAuthFetch(true);
    setVideoError('Attempting authenticated fetch...');
    const resp = await fetch(src, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) {
      setVideoError(`Authenticated fetch failed: ${resp.status}`);
      return false;
    }
    const blob = await resp.blob();
    const blobUrl = URL.createObjectURL(blob);
    if (videoRef?.current) {
      videoRef.current.src = blobUrl;
      videoRef.current.load();
      setVideoError(null);
    }
    return true;
  } catch (e: any) {
    setVideoError(`Authenticated fetch error: ${e?.message ?? String(e)}`);
    return false;
  }
}
