import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  AudioLines,
  ExternalLink,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();
const PROFILE = {
  username: 'wsp_hey_areuok_yes',
  avatar: '/images/discord-avatar-source-crop.png',
};

type Track = { name: string; src: string };

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.72);
  const [playing, setPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioMessage, setAudioMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const ownedUrls = useRef<string[]>([]);
  const track = tracks[activeTrack];

  useEffect(() => {
    if (!track || !audioRef.current) return;
    const audio = audioRef.current;
    audio.src = track.src;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);
  }, [track]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      audioRef.current.volume = volume;
    }
  }, [muted, volume]);

  useEffect(() => () => {
    ownedUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    if (!aboutOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAboutOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [aboutOpen]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !track) {
      setAudioMessage('Add a local audio file to start listening.');
      fileRef.current?.click();
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
        setAudioMessage('');
      } catch {
        setAudioMessage('This audio file could not be played. Try another file.');
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const newTracks = Array.from(files)
      .filter((file) => file.type.startsWith('audio/'))
      .map((file) => ({ name: file.name.replace(/\.[^/.]+$/, ''), src: URL.createObjectURL(file) }));
    if (!newTracks.length) {
      setAudioMessage('That file is not audio. Choose an MP3, WAV, M4A, or OGG file.');
      return;
    }
    const nextTracks = [...tracks, ...newTracks];
    ownedUrls.current.push(...newTracks.map((item) => item.src));
    setTracks(nextTracks);
    setActiveTrack(tracks.length);
    setAudioMessage('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const changeTrack = (index: number) => {
    if (index < 0 || index >= tracks.length) return;
    setActiveTrack(index);
    window.setTimeout(() => {
      const audio = audioRef.current;
      if (audio) void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }, 0);
  };

  const skip = (step: number) => {
    if (!tracks.length) {
      fileRef.current?.click();
      setAudioMessage('Add a local audio file to start listening.');
      return;
    }
    changeTrack((activeTrack + step + tracks.length) % tracks.length);
  };

  return (
    <main className="profile-stage" aria-label="Orange Profile">
      <div className="profile-card" aria-label={`Discord profile: ${PROFILE.username}`}>
        <img className="profile-avatar" src={PROFILE.avatar} alt={`${PROFILE.username}'s avatar`} />
        <span className="profile-name">{PROFILE.username}</span>
      </div>

      <section className="player-card" aria-label="Local music player">
        <audio
          ref={audioRef}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          onEnded={() => {
            setPlaying(false);
            if (tracks.length > 1) skip(1);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <div className="player-row">
          <div className="track-info">
            <img className="mini-art" src={PROFILE.avatar} alt="" />
            <div className="track-label">
              <span className="track-title">{track?.name || 'Choose a track'}</span>
              <span className="track-subtitle">{track ? 'LOCAL AUDIO' : 'ADD A TRACK TO BEGIN'}</span>
            </div>
          </div>
          <button className="player-button" aria-label="Previous track" onClick={() => skip(-1)}>
            <SkipBack size={13} />
          </button>
          <button className="player-button play-button" aria-label={playing ? 'Pause music' : 'Play music'} onClick={() => void togglePlayback()}>
            {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </button>
          <div className="volume-wrap">
            <button className="player-button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted((value) => !value)}>
              {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
            <input
              aria-label="Volume"
              className="volume-range"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.currentTarget.value))}
            />
            <button className="player-button" aria-label="Next track" onClick={() => skip(1)}>
              <SkipForward size={13} />
            </button>
          </div>
        </div>
        <div
          className="progress-line"
          role="slider"
          aria-label="Track position"
          aria-valuemin={0}
          aria-valuemax={duration || 0}
          aria-valuenow={currentTime}
          aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          tabIndex={track ? 0 : -1}
          onClick={(event) => {
            if (!audioRef.current || !duration) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            audioRef.current.currentTime = ((event.clientX - bounds.left) / bounds.width) * duration;
          }}
          onKeyDown={(event) => {
            if (!audioRef.current) return;
            if (event.key === 'ArrowRight') audioRef.current.currentTime = Math.min(duration, currentTime + 5);
            if (event.key === 'ArrowLeft') audioRef.current.currentTime = Math.max(0, currentTime - 5);
          }}
        >
          <div className="progress-fill" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
        </div>
        <div className="player-extras">
          <span className="track-subtitle">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div>
            <button className="text-control" onClick={() => setPlaylistOpen((value) => !value)} aria-expanded={playlistOpen}>
              <ListMusic size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {playlistOpen ? 'HIDE LIST' : `PLAYLIST ${tracks.length}`}
            </button>
            <button className="text-control" onClick={() => fileRef.current?.click()} style={{ marginLeft: 12 }}>
              ADD FILE
            </button>
          </div>
        </div>
        {playlistOpen && (
          <div className="playlist">
            {tracks.length ? tracks.map((item, index) => (
              <button key={`${item.src}-${index}`} className={`track-option ${index === activeTrack ? 'active' : ''}`} onClick={() => changeTrack(index)}>
                <span>{index === activeTrack ? 'NOW PLAYING · ' : ''}{item.name}</span>
                <small>TRACK {String(index + 1).padStart(2, '0')}</small>
              </button>
            )) : (
              <button className="track-option" onClick={() => fileRef.current?.click()}>
                <span>Your playlist starts with a local file.</span><small>ADD AUDIO</small>
              </button>
            )}
          </div>
        )}
        {audioMessage && <p className="player-hint" role="status">{audioMessage}</p>}
        <input
          ref={fileRef}
          className="file-input"
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg"
          multiple
          aria-label="Choose local audio files"
          onChange={(event) => addFiles(event.currentTarget.files)}
        />
      </section>

      <nav className="actions" aria-label="Profile links">
        <button className="action-button" onClick={() => setAboutOpen(true)}>
          <UserRound size={12} strokeWidth={1.8} /> About Me
        </button>
        <a className="action-button" href="https://cocox.wtf" target="_blank" rel="noreferrer">
          <ExternalLink size={12} strokeWidth={1.8} /> Main Website
        </a>
      </nav>

      {aboutOpen && (
        <div className="about-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAboutOpen(false);
        }}>
          <section className="about-panel" role="dialog" aria-modal="true" aria-labelledby="about-title">
            <button ref={closeRef} className="close-about" aria-label="Close About Me" onClick={() => setAboutOpen(false)}>
              <X size={16} />
            </button>
            <div className="about-kicker">A little about me</div>
            <h1 id="about-title">Hey, I’m {PROFILE.username}.</h1>
            <p>I’ve been coding for about two years. I know how to code Roblox and Unity scripts, and how to make games.</p>
            <p>I like making devices and coding programs and apps. I also make exploits for Roblox.</p>
            <div className="about-foot">ALWAYS BUILDING SOMETHING NEW</div>
          </section>
        </div>
      )}
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
