import { useEffect, useState } from 'react';

const RECENTLY_PLAYED_URL = 'https://radio.reginerd.tv/recently-played';

interface Track {
  artist: string;
  title: string;
  album: string | null;
  art_url: string | null;
  played_at: string | null;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso + 'Z').getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(RECENTLY_PLAYED_URL)
      .then((r) => {
        if (!r.ok) throw new Error('not ok');
        return r.json();
      })
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={s.muted}>Loading…</p>;
  if (error || tracks.length === 0) return <p style={s.muted}>No recent plays available.</p>;

  return (
    <div style={s.list}>
      {tracks.slice(0, 10).map((t, i) => (
        <div key={i} style={s.row}>
          <div style={s.artWrap}>
            {t.art_url ? (
              <img src={t.art_url} alt={t.album ?? ''} style={s.art} />
            ) : (
              <div style={s.artFallback} />
            )}
          </div>
          <div style={s.info}>
            <span style={s.title}>{t.title}</span>
            <span style={s.artist}>{t.artist}</span>
          </div>
          <span style={s.time}>{timeAgo(t.played_at)}</span>
        </div>
      ))}
    </div>
  );
}

const s = {
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.6rem 0.75rem',
    background: '#161616',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '8px',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  artWrap: { flexShrink: 0 },
  art: {
    width: 40,
    height: 40,
    objectFit: 'cover' as const,
    borderRadius: 4,
    display: 'block',
  },
  artFallback: {
    width: 40,
    height: 40,
    borderRadius: 4,
    background: 'rgba(255,255,255,0.06)',
  },
  info: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#e8e8e8',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  artist: {
    fontSize: '0.75rem',
    color: '#a78bfa',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  time: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)',
    flexShrink: 0,
    marginLeft: 'auto',
  },
  muted: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.35)',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
};
