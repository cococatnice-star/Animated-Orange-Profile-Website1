import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  ListMusic,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  WandSparkles,
  Wand2,
  CircleDot,
  Sparkles,
  MoveUpRight,
  Waves,
} from 'lucide-react';

const queryClient = new QueryClient();

// Replace these values with your own profile details and copy.
const PROFILE = {
  username: 'yourname',
  displayName: 'Your Name',
  discordStatus: 'around, probably making something',
  location: 'somewhere with good light',
  pronouns: 'they / them',
};

type Track = { name: string; src: string; duration?: string };

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function Home() {
  const [motionOn, setMotionOn] = useState(true);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioMessage, setAudioMessage] = useState('Choose an audio file to bring this player to life.');
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ownedUrls = useRef<string[]>([]);
  const track = tracks[activeTrack];

  useEffect(() => {
    document.documentElement.classList.toggle('no-motion', !motionOn);
    return () => document.documentElement.classList.remove('no-motion');
  }, [motionOn]);

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
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
  }, [muted]);

  useEffect(() => () => {
    ownedUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !track) {
      setAudioMessage('Add your own MP3, WAV, or M4A to start listening.');
      fileRef.current?.click();
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
        setAudioMessage('');
      } catch {
        setAudioMessage('This file could not be played. Try another audio file.');
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
      setAudioMessage('That file does not look like audio. Choose an MP3, WAV, or M4A.');
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
      return;
    }
    changeTrack((activeTrack + step + tracks.length) % tracks.length);
  };

  return (
    <main className={`site-shell ${motionOn ? '' : 'no-motion'}`}>
      <header className="topbar">
        <a className="brand-mark" href="#top" aria-label="Back to the top">
          <span className="brand-symbol">y.</span>
          <span>PERSONAL INTERNET HOME</span>
        </a>
        <div className="top-meta">
          <span className="availability"><i className="status-dot" />{PROFILE.discordStatus}</span>
          <span>EST. IN THE MOMENT</span>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow reveal">A little corner of the internet</div>
          <h1 className="reveal reveal-delay">Hey, I’m<br /><span>{PROFILE.displayName}.</span></h1>
          <p className="hero-lede reveal reveal-late">
            A person with too many tabs open, a soft spot for good details, and a habit of turning passing ideas into things.
          </p>
          <div className="hero-actions reveal reveal-late">
            <a className="pill-button pill-primary" href="#about">About me <ArrowDownRight size={15} /></a>
            <a className="pill-button pill-quiet" href="#what-i-do">What I do <ArrowRight size={14} /></a>
          </div>
        </div>
        <div className="hero-art" aria-label="A warm illustrated portrait placeholder">
          <div className="sun-disc" />
          <div className="orbit" />
          <div className="orbit orbit-two" />
          <div className="portrait-card">
            <div className="portrait-illustration">
              <div className="hair-shape" />
              <div className="face-shape" />
              <div className="face-eye" />
              <div className="face-smile" />
            </div>
          </div>
          <div className="intro-card">DISCORD PROFILE<strong>@{PROFILE.username}</strong></div>
          <div className="art-stamp">ONLINE / OFFLINE / IN BETWEEN</div>
        </div>
        <div className="hero-note">A SMALL PLACE TO LAND</div>
        <div className="scroll-cue"><span /> KEEP GOING</div>
      </section>

      <section className="section about-section" id="about">
        <div className="about-grid">
          <div>
            <div className="section-index">01 — ABOUT ME</div>
            <h2 className="section-heading">A person,<br />not a pitch.</h2>
            <div className="values-quote">
              <p>“I like making things that feel like somebody was here.”</p>
            </div>
          </div>
          <div className="about-copy">
            <span className="small-label">THE SHORT VERSION</span>
            <p>I’m {PROFILE.displayName} — curious by default, a little sentimental about the internet, and happiest when a half-formed thought starts to take shape.</p>
            <p>This page is my little home base: part introduction, part notebook margin, part reminder that a digital space can feel personal. Replace this paragraph with the details you want people to know first.</p>
            <div className="fact-list">
              <div className="fact-row"><span>USUALLY FOUND</span><strong>{PROFILE.location}</strong></div>
              <div className="fact-row"><span>PRONOUNS</span><strong>{PROFILE.pronouns}</strong></div>
              <div className="fact-row"><span>DISCORD</span><strong>@{PROFILE.username}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section work-section" id="what-i-do">
        <div className="work-intro">
          <div>
            <div className="section-index">02 — WHAT I DO</div>
            <h2 className="section-heading">A few ways<br />I spend my days.</h2>
          </div>
          <p>Not a résumé, just a snapshot of the things I keep coming back to. Make these yours.</p>
        </div>
        <div className="work-grid">
          <article className="work-card"><span className="number">01 / MAKE</span><span className="work-mark"><Sparkles size={29} strokeWidth={1} /></span><h3>Making little things for the web</h3><p>Pages, experiments, and useful details that make a screen feel a bit more human.</p></article>
          <article className="work-card"><span className="number">02 / NOTICE</span><span className="work-mark"><CircleDot size={34} strokeWidth={1} /></span><h3>Collecting references</h3><p>Type found on a street, the color of late afternoon, a sentence worth keeping.</p></article>
          <article className="work-card"><span className="number">03 / SHARE</span><span className="work-mark"><MoveUpRight size={34} strokeWidth={1} /></span><h3>Being around the community</h3><p>Good conversations, shared playlists, and cheering for people making their thing.</p></article>
          <article className="work-card"><span className="number">04 / LEARN</span><span className="work-mark"><Waves size={34} strokeWidth={1} /></span><h3>Following the side quest</h3><p>Learning something just because it caught my eye. The detour is often the point.</p></article>
        </div>
      </section>

      <section className="section now-section">
        <div className="now-layout">
          <div>
            <div className="section-index">03 — RIGHT NOW</div>
            <h2 className="section-heading">Current<br />open tabs.</h2>
          </div>
          <div className="now-copy">
            <span className="small-label">A NOTE FROM THIS WEEK</span>
            <p>What I’m paying attention to shifts all the time. Here’s the very current, very editable list of things taking up a little space in my head.</p>
            <div className="now-list">
              <div className="now-item"><i className="now-bullet" /><div><span>MAKING</span><strong>A small site with a big feeling</strong></div></div>
              <div className="now-item"><i className="now-bullet" /><div><span>LISTENING</span><strong>Something low-fi, on repeat</strong></div></div>
              <div className="now-item"><i className="now-bullet" /><div><span>LEARNING</span><strong>How to leave a little more whitespace</strong></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section content-section" id="content">
        <div className="content-intro">
          <div>
            <div className="section-index">04 — THINGS I PUT OUT THERE</div>
            <h2 className="section-heading">Made, found,<br />or worth a look.</h2>
          </div>
          <p>A little shelf for projects, posts, or links you want people to find. Swap these examples for your own.</p>
        </div>
        <div className="content-list">
          <a className="content-row" href="#what-i-do"><span className="content-date">01 / 2025</span><span className="content-title">A tiny corner of the web</span><span className="content-type">PERSONAL PROJECT</span><ArrowRight className="content-arrow" size={19} /></a>
          <a className="content-row" href="#about"><span className="content-date">02 / NOTES</span><span className="content-title">Things I want to remember</span><span className="content-type">FIELD NOTES</span><ArrowRight className="content-arrow" size={19} /></a>
          <a className="content-row" href="#music"><span className="content-date">03 / AUDIO</span><span className="content-title">A playlist for making stuff</span><span className="content-type">CURRENT ROTATION</span><ArrowRight className="content-arrow" size={19} /></a>
          <a className="content-row" href="#top"><span className="content-date">04 / LINKS</span><span className="content-title">Somewhere else I spend time</span><span className="content-type">ELSEWHERE</span><ArrowRight className="content-arrow" size={19} /></a>
        </div>
      </section>

      <section className="music-section" id="music">
        <div className="music-layout">
          <div className="music-copy">
            <div className="section-index">05 — A LITTLE SOUNDTRACK</div>
            <h2 className="section-heading">For the<br />in-between.</h2>
            <p>A tiny local player for whatever’s in your rotation. Add your own audio files; nothing gets uploaded or sent anywhere.</p>
            <span className="small-label">YOUR MUSIC STAYS YOURS</span>
          </div>
          <div className="player-card">
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
            <div className="player-top"><span><AudioLines size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} />LOCAL PLAYER</span><span>NO STREAMING</span></div>
            <div className="vinyl-wrap">
              <div className={`vinyl ${playing && motionOn ? 'is-playing' : 'is-paused'}`} />
              <div className="music-disc-hole" />
            </div>
            <div className="track-meta">
              <strong>{track?.name || 'Your next favorite'}</strong>
              <span>{track ? 'FROM YOUR DEVICE' : 'ADD A TRACK TO BEGIN'}</span>
            </div>
            <div
              className="progress-line"
              role="slider"
              aria-label="Track position"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
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
            ><div className="progress-fill" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} /></div>
            <div className="time-row"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
            <div className="player-controls">
              <button className="control-button" aria-label="Previous track" onClick={() => skip(-1)}><SkipBack size={17} /></button>
              <button className="control-button control-main" aria-label={playing ? 'Pause music' : 'Play music'} onClick={() => void togglePlayback()}>{playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button>
              <button className="control-button" aria-label="Next track" onClick={() => skip(1)}><SkipForward size={17} /></button>
            </div>
            <div className="player-bottom">
              <button className="text-control" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Unmute' : 'Mute'}>{muted ? <VolumeX size={14} /> : <Volume2 size={14} />}{muted ? 'SOUND OFF' : 'SOUND ON'}</button>
              <button className="text-control" onClick={() => setPlaylistOpen((value) => !value)} aria-expanded={playlistOpen}><ListMusic size={14} />{playlistOpen ? 'HIDE LIST' : `PLAYLIST (${tracks.length})`}</button>
              <button className="text-control" onClick={() => fileRef.current?.click()} aria-label="Add audio files"><span>＋</span> ADD</button>
            </div>
            {playlistOpen && (
              <div className="playlist">
                {tracks.length ? tracks.map((item, index) => (
                  <button key={`${item.src}-${index}`} className={`track-option ${index === activeTrack ? 'active' : ''}`} onClick={() => changeTrack(index)}>
                    <span>{index === activeTrack ? 'NOW PLAYING · ' : ''}{item.name}</span><small>TRACK {String(index + 1).padStart(2, '0')}</small>
                  </button>
                )) : (
                  <button className="track-option" onClick={() => fileRef.current?.click()}><span>Your playlist starts with a file.</span><small>ADD AUDIO</small></button>
                )}
              </div>
            )}
            <p className="player-hint" aria-live="polite">{audioMessage}</p>
            <input ref={fileRef} className="file-input" type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" multiple onChange={(event) => addFiles(event.currentTarget.files)} />
          </div>
        </div>
      </section>

      <footer className="footer">
        <a href="#top">BACK TO THE TOP ↑</a>
        <span>MADE SLOWLY, ON PURPOSE.</span>
        <span>© {new Date().getFullYear()} {PROFILE.displayName}</span>
      </footer>

      <button className="animation-toggle" onClick={() => setMotionOn((value) => !value)} aria-pressed={!motionOn}>
        {motionOn ? <WandSparkles size={13} /> : <Wand2 size={13} />}
        MOTION {motionOn ? 'ON' : 'OFF'}
      </button>
    </main>
  );
}

function BlackPage() {
  return <main className="empty-page" aria-label="Blank black page" />;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={BlackPage} />
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
