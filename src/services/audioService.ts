import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from 'react-native-track-player';
import { Episode, PlaybackRate } from '../types';
import { CHANNELS } from '../data/placeholders';
import { ChannelKey, nextChannelInSequence } from '../theme/tokens';
import { storage } from './storageService';
import { progressService } from './progressService';
import { preferencesService } from './preferencesService';
import { fetchLatestEpisode } from './episodeService';

const PROGRESS_SAVE_INTERVAL_SEC = 5;

// Channel display names for the lock-screen "artist" line. Derived from the
// channel placeholders (single source of truth) plus the Daily Wrap.
const CHANNEL_DISPLAY: Record<string, string> = {
  'daily-wrap': 'Daily Wrap',
  ...Object.fromEntries(CHANNELS.map((c) => [c.id, c.name])),
};

function channelDisplay(apiChannel: string): string {
  return CHANNEL_DISPLAY[apiChannel] ?? 'Briefdex';
}

// Briefdex logo shown as album art on the lock screen / Control Center for
// every episode. Requires a 1024x1024 PNG at assets/icon.png.
const ARTWORK = require('../../assets/icon.png');

type Listener = (state: {
  episode: Episode | null;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  rate: PlaybackRate;
}) => void;

type FinishListener = (episode: Episode) => void;

class AudioService {
  private episode: Episode | null = null;
  private isPlaying = false;
  private positionSec = 0;
  private durationSec = 0;
  private rate: PlaybackRate = 1.0;
  private listeners = new Set<Listener>();
  private finishListeners = new Set<FinishListener>();
  private initPromise: Promise<void> | null = null;
  private lastProgressSavePosSec = Number.NEGATIVE_INFINITY;
  private defaultRate: PlaybackRate = 1.0;
  private skipIntervalSec = 15;
  private autoplayNext = false;
  // True when the loaded episode has no real audio URL — we then simulate
  // progress with a timer so the UI demos without a backend (no lock-screen).
  private mockMode = false;
  private mockTimer: ReturnType<typeof setInterval> | null = null;
  // Debounced native seek: the scrubber/skip update positionSec immediately but
  // the actual TrackPlayer.seekTo is coalesced so rapid scrubbing fires once.
  private seekTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingSeekSec: number | null = null;
  // A resume position to apply once the freshly-loaded track is ready. Seeking
  // straight after add() (before the item loads) can crash natively, so we wait.
  private pendingResumeSec: number | null = null;
  private readonly SEEK_DEBOUNCE_MS = 300;

  constructor() {
    preferencesService.subscribe((p) => {
      this.defaultRate = p.playbackSpeed as PlaybackRate;
      this.skipIntervalSec = p.skipInterval;
      this.autoplayNext = p.autoplayNextChannel;
      // Keep the lock-screen skip buttons in step with the user's preference.
      if (this.initPromise) {
        TrackPlayer.updateOptions({
          forwardJumpInterval: this.skipIntervalSec,
          backwardJumpInterval: this.skipIntervalSec,
        }).catch(() => {});
      }
    });
  }

  configure(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.setup();
    return this.initPromise;
  }

  private async setup() {
    try {
      await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
    } catch {
      // setupPlayer throws if the native player is already initialised — safe to ignore.
    }
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      progressUpdateEventInterval: 1,
      forwardJumpInterval: this.skipIntervalSec,
      backwardJumpInterval: this.skipIntervalSec,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpForward,
        Capability.JumpBackward,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.JumpForward,
        Capability.JumpBackward,
      ],
    });
    this.registerEvents();
  }

  private registerEvents() {
    TrackPlayer.addEventListener(Event.PlaybackState, (e) => {
      if (this.mockMode) return;
      this.isPlaying = e.state === State.Playing;
      // Once the freshly-loaded item is ready, apply any deferred resume seek.
      if (
        this.pendingResumeSec != null &&
        (e.state === State.Ready || e.state === State.Playing)
      ) {
        const target = this.pendingResumeSec;
        this.pendingResumeSec = null;
        void this.performNativeSeek(target);
      }
      this.emit();
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (e) => {
      if (this.mockMode) return;
      this.positionSec = e.position;
      if (e.duration > 0) this.durationSec = e.duration;
      if (this.episode) {
        storage.setPlaybackPosition(this.episode.id, this.positionSec);
        this.maybeSaveProgress();
      }
      this.emit();
    });

    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
      if (this.mockMode || !this.episode) return;
      const finished = this.episode;
      this.positionSec = this.durationSec;
      this.isPlaying = false;
      progressService.markComplete(finished.channel, finished.dateKey);
      this.emit();
      this.emitFinish(finished);
      void this.maybeAutoAdvance(finished);
    });
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    l(this.snapshot());
    return () => this.listeners.delete(l);
  }

  onFinish(l: FinishListener): () => void {
    this.finishListeners.add(l);
    return () => this.finishListeners.delete(l);
  }

  private emitFinish(episode: Episode) {
    this.finishListeners.forEach((l) => l(episode));
  }

  /**
   * When an episode finishes and "Auto-play next channel" is on, fetch and play
   * the next channel in CHANNEL_SEQUENCE. Stops at the last channel
   * (Macro & RBNZ) — never loops back to the start.
   */
  private async maybeAutoAdvance(finished: Episode) {
    if (!this.autoplayNext) return;
    const next = nextChannelInSequence(finished.channel as ChannelKey);
    if (!next) return; // last in the sequence — stop playback, do not loop.
    try {
      const ep = await fetchLatestEpisode(next);
      await this.load(ep);
      await this.play();
    } catch (e) {
      // Couldn't fetch/stage the next episode — stop gracefully but surface why.
      console.warn(`[audioService] auto-advance to "${next}" failed:`, e);
    }
  }

  private emit() {
    const s = this.snapshot();
    this.listeners.forEach((l) => l(s));
  }

  private snapshot() {
    return {
      episode: this.episode,
      isPlaying: this.isPlaying,
      positionSec: this.positionSec,
      durationSec: this.durationSec || (this.episode?.duration ?? 0),
      rate: this.rate,
    };
  }

  /** The episode currently loaded into the player, if any. */
  get currentEpisode(): Episode | null {
    return this.episode;
  }

  async load(episode: Episode) {
    await this.configure();
    // Idempotent by episode id — re-loading the same episode (e.g. when a screen
    // remounts during navigation) must never reset position or interrupt playback.
    if (this.episode?.id === episode.id) return;

    this.stopMockTimer();
    this.cancelPendingSeek();
    this.episode = episode;
    this.positionSec = await storage.getPlaybackPosition(episode.id);
    this.durationSec = episode.duration;
    this.rate = this.defaultRate;
    this.lastProgressSavePosSec = Number.NEGATIVE_INFINITY;
    this.isPlaying = false;
    // Resume from the saved position, but only once the track is ready (applied
    // in the PlaybackState handler) — seeking right after add() can crash.
    this.pendingResumeSec = this.positionSec > 1 ? this.positionSec : null;
    this.emit();

    if (!episode.audioUrl) {
      // No real audio — mock mode. Clear any queued track so the lock screen
      // doesn't show stale Now Playing info from a previous episode.
      this.mockMode = true;
      this.pendingResumeSec = null;
      await TrackPlayer.reset().catch(() => {});
      return;
    }

    this.mockMode = false;
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: episode.id,
        url: episode.audioUrl,
        title: episode.title,
        artist: channelDisplay(episode.channel),
        album: 'Briefdex',
        artwork: ARTWORK,
        duration: episode.duration,
      });
      await TrackPlayer.setRate(this.rate);
    } catch {
      // Couldn't stage the track — fall back to mock playback so the UI still works.
      this.mockMode = true;
      this.pendingResumeSec = null;
    }
  }

  async play() {
    if (this.mockMode) {
      this.startMockTimer();
      return;
    }
    await TrackPlayer.play();
  }

  async pause() {
    if (this.mockMode) {
      this.isPlaying = false;
      this.stopMockTimer();
      this.emit();
      return;
    }
    await TrackPlayer.pause();
  }

  async toggle() {
    if (this.isPlaying) await this.pause();
    else await this.play();
  }

  async seekTo(positionSec: number) {
    // Never let a non-finite value reach the UI or the native player — NaN/∞
    // (e.g. a ratio computed against a zero/unknown duration) crashes seekTo.
    let clamped = Math.max(0, Math.min(this.durationSec || 0, positionSec));
    if (!Number.isFinite(clamped)) clamped = 0;
    this.positionSec = clamped;
    this.emit();
    if (this.episode) storage.setPlaybackPosition(this.episode.id, clamped);
    if (this.mockMode) return;

    // Debounce the native seek so rapid scrubbing / repeated skips coalesce into
    // a single TrackPlayer.seekTo on the final position.
    this.pendingSeekSec = clamped;
    if (this.seekTimer) clearTimeout(this.seekTimer);
    this.seekTimer = setTimeout(() => {
      this.seekTimer = null;
      const target = this.pendingSeekSec;
      this.pendingSeekSec = null;
      if (target != null) void this.performNativeSeek(target);
    }, this.SEEK_DEBOUNCE_MS);
  }

  /** Perform the native seek, guarded so it can never crash the app. */
  private async performNativeSeek(positionSec: number) {
    if (!Number.isFinite(positionSec) || positionSec < 0) return;
    try {
      const active = await TrackPlayer.getActiveTrack();
      if (!active) return; // nothing staged — nothing to seek
      const { duration } = await TrackPlayer.getProgress();
      if (!duration || duration <= 0) return; // item not ready — seeking now can crash
      await TrackPlayer.seekTo(Math.min(positionSec, duration));
    } catch {
      // Transient native error / track not ready — ignore rather than crash.
    }
  }

  private cancelPendingSeek() {
    if (this.seekTimer) {
      clearTimeout(this.seekTimer);
      this.seekTimer = null;
    }
    this.pendingSeekSec = null;
  }

  async skipForward(seconds?: number) {
    await this.seekTo(this.positionSec + (seconds ?? this.skipIntervalSec));
  }

  async skipBack(seconds?: number) {
    await this.seekTo(this.positionSec - (seconds ?? this.skipIntervalSec));
  }

  async setRate(rate: PlaybackRate) {
    this.rate = rate;
    if (!this.mockMode) await TrackPlayer.setRate(rate);
    this.emit();
  }

  cycleRate() {
    const cycle: PlaybackRate[] = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = cycle.indexOf(this.rate);
    const next = cycle[(idx + 1) % cycle.length];
    return this.setRate(next);
  }

  async unload() {
    this.stopMockTimer();
    this.cancelPendingSeek();
    this.pendingResumeSec = null;
    if (!this.mockMode) await TrackPlayer.reset().catch(() => {});
    this.isPlaying = false;
    this.episode = null;
    this.positionSec = 0;
    this.durationSec = 0;
    this.mockMode = false;
    this.emit();
  }

  private maybeSaveProgress() {
    if (!this.episode) return;
    if (Math.abs(this.positionSec - this.lastProgressSavePosSec) < PROGRESS_SAVE_INTERVAL_SEC) {
      return;
    }
    this.lastProgressSavePosSec = this.positionSec;
    progressService.saveProgress(
      this.episode.channel,
      this.episode.dateKey,
      this.positionSec,
      this.durationSec || this.episode.duration,
    );
  }

  private startMockTimer() {
    this.isPlaying = true;
    this.emit();
    if (this.mockTimer) clearInterval(this.mockTimer);
    this.mockTimer = setInterval(() => {
      if (!this.isPlaying) return;
      this.positionSec += this.rate;
      let finished = false;
      if (this.positionSec >= this.durationSec) {
        this.positionSec = this.durationSec;
        this.isPlaying = false;
        finished = true;
        this.stopMockTimer();
      }
      if (this.episode) {
        storage.setPlaybackPosition(this.episode.id, this.positionSec);
        if (finished) {
          const finishedEpisode = this.episode;
          progressService.markComplete(finishedEpisode.channel, finishedEpisode.dateKey);
          this.emit();
          this.emitFinish(finishedEpisode);
          void this.maybeAutoAdvance(finishedEpisode);
          return;
        }
        this.maybeSaveProgress();
      }
      this.emit();
    }, 1000);
  }

  private stopMockTimer() {
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = null;
    }
  }
}

export const audioService = new AudioService();
