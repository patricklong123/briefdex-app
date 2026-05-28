import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
} from 'react-native-track-player';
import { Episode, PlaybackRate } from '../types';
import { CHANNELS } from '../data/placeholders';
import { storage } from './storageService';
import { progressService } from './progressService';
import { preferencesService } from './preferencesService';

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
  // True when the loaded episode has no real audio URL — we then simulate
  // progress with a timer so the UI demos without a backend (no lock-screen).
  private mockMode = false;
  private mockTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    preferencesService.subscribe((p) => {
      this.defaultRate = p.playbackSpeed as PlaybackRate;
      this.skipIntervalSec = p.skipInterval;
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
    this.episode = episode;
    this.positionSec = await storage.getPlaybackPosition(episode.id);
    this.durationSec = episode.duration;
    this.rate = this.defaultRate;
    this.lastProgressSavePosSec = Number.NEGATIVE_INFINITY;
    this.isPlaying = false;
    this.emit();

    if (!episode.audioUrl) {
      // No real audio — mock mode. Clear any queued track so the lock screen
      // doesn't show stale Now Playing info from a previous episode.
      this.mockMode = true;
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
      if (this.positionSec > 0) await TrackPlayer.seekTo(this.positionSec);
      await TrackPlayer.setRate(this.rate);
    } catch {
      // Couldn't stage the track — fall back to mock playback so the UI still works.
      this.mockMode = true;
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
    const clamped = Math.max(0, Math.min(this.durationSec || 0, positionSec));
    this.positionSec = clamped;
    this.emit();
    if (this.episode) storage.setPlaybackPosition(this.episode.id, clamped);
    if (this.mockMode) return;
    try {
      // Only seek once a track is actually staged & ready. Calling seekTo with
      // no active track (e.g. mid-load, or right after a tap before the queue
      // is populated) rejects natively and was crashing the app.
      const active = await TrackPlayer.getActiveTrack();
      if (!active) return;
      await TrackPlayer.seekTo(clamped);
    } catch {
      // Transient native error / track not ready — ignore rather than crash.
    }
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
