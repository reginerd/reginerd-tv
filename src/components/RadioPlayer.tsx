import { useEffect, useRef, useState } from 'react';

const NOW_PLAYING_URL = 'https://radio.reginerd.tv/now-playing';
const STREAM_URL = 'https://stream.reginerd.tv/stream.aac';
const POLL_INTERVAL = 10_000;

interface NowPlaying {
  title?: string;
  artist?: string;
  album?: string;
  thumb?: string;
}

type Mode = 'compact' | 'full';

export default function RadioPlayer({ mode = 'compact' }: { mode?: Mode }) {
  const [np, setNp] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [offline, setOffline] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchNp() {
      try {
        const res = await fetch(NOW_PLAYING_URL);
        if (!res.ok) throw new Error('not ok');
        const data = await res.json();
        if (cancelled) return;
        setOffline(false);
        setNp({
          title: data.title ?? data.track ?? null,
          artist: data.artist ?? null,
          album: data.album ?? null,
          thumb: data.thumb ?? data.album_art ?? null,
        });
      } catch {
        if (!cancelled) setOffline(true);
      }
    }

    fetchNp();
    const id = setInterval(fetchNp, POLL_INTERVAL);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  function togglePlay() {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      // Force fresh connection each play so stream doesn't stale-buffer
      audioRef.current.src = STREAM_URL;
      audioRef.current.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }

  const isCompact = mode === 'compact';

  return (
    <div className={`radio-player radio-player--${mode}`} style={styles.wrap(isCompact)}>
      {np?.thumb && (
        <img
          src={np.thumb}
          alt={np.album ?? 'album art'}
          style={styles.art(isCompact)}
        />
      )}
      <div style={styles.info}>
        {offline ? (
          <span style={styles.muted}>Offline</span>
        ) : np ? (
          <>
            <span style={styles.title}>{np.title ?? '—'}</span>
            <span style={styles.artist}>{np.artist ?? ''}</span>
          </>
        ) : (
          <span style={styles.muted}>Loading…</span>
        )}
      </div>
      {!offline && (
        <button onClick={togglePlay} style={styles.btn} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '⏸' : '▶'}
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: (compact: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: compact ? '0.5rem' : '1rem',
    padding: compact ? '0.6rem 0.9rem' : '1rem 1.25rem',
    background: '#161616',
    color: '#e8e8e8',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: compact ? '8px' : '12px',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    fontSize: compact ? '0.8rem' : '1rem',
    maxWidth: compact ? '320px' : '480px',
    width: '100%',
    boxSizing: 'border-box',
  }),
  art: (compact: boolean): React.CSSProperties => ({
    width: compact ? 36 : 64,
    height: compact ? 36 : 64,
    objectFit: 'cover',
    borderRadius: 4,
    flexShrink: 0,
  }),
  info: { display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden', flex: 1 } as React.CSSProperties,
  title: { fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
  artist: { opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as React.CSSProperties,
  muted: { opacity: 0.5 } as React.CSSProperties,
  btn: {
    background: 'none',
    border: 'none',
    color: '#a78bfa',
    fontSize: '1.1rem',
    cursor: 'pointer',
    padding: '0 0.25rem',
    flexShrink: 0,
    lineHeight: 1,
  } as React.CSSProperties,
};
