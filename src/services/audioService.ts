import { Audio, AVPlaybackStatus, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Episode, PlaybackRate } from '../types';
import { storage } from './storageService';
import { progressService } from './progressService';
import { preferencesService } from './preferencesService';

const PROGRESS_SAVE_INTERVAL_SEC = 5;

type Listener = (state: {
  episode: Episode | null;
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  rate: PlaybackRate;
}) => void;

type FinishListener = (episode: Episode) => void;

class AudioService {
  private sound: Audio.Sound | null = null;
  private episode: Episode | null = null;
  private isPlaying = false;
  private positionSec = 0;
  private durationSec = 0;
  private rate: PlaybackRate = 1.0;
  private listeners = new Set<Listener>();
  private finishListeners = new Set<FinishListener>();
  private configured = false;
  private lastProgressSavePosSec = Number.NEGATIVE_INFINITY;
  private defaultRate: PlaybackRate = 1.0;
  private skipIntervalSec = 15;

  constructor() {
    preferencesService.subscribe((p) => {
      this.defaultRate = p.playbackSpeed as PlaybackRate;
      this.skipIntervalSec = p.skipInterval;
    });
  }

  async configure() {
    if (this.configured) return;
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    });
    this.configured = true;
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

  async load(episode: Episode) {
    await this.configure();
    if (this.episode?.id === episode.id && this.sound) return;
    if (this.sound) {
      await this.sound.unloadAsync().catch(() => {});
      this.sound = null;
    }
    this.episode = episode;
    this.positionSec = await storage.getPlaybackPosition(episode.id);
    this.durationSec = episode.duration;
    this.rate = this.defaultRate;
    this.lastProgressSavePosSec = Number.NEGATIVE_INFINITY;
    this.emit();

    if (!episode.audioUrl) {
      // No real audio URL — operate in mock mode. Playback simulates progress.
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: episode.audioUrl },
        { shouldPlay: false, positionMillis: this.positionSec * 1000, rate: this.rate },
        this.onStatus,
      );
      this.sound = sound;
    } catch (e) {
      // Fall back to mock mode silently
    }
  }

  private onStatus = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    this.isPlaying = status.isPlaying;
    this.positionSec = status.positionMillis / 1000;
    this.durationSec = (status.durationMillis ?? this.episode?.duration ?? 0) / 1000;
    if (this.episode) {
      storage.setPlaybackPosition(this.episode.id, this.positionSec);
      if (status.didJustFinish) {
        const finished = this.episode;
        progressService.markComplete(finished.channel, finished.dateKey);
        this.emit();
        this.emitFinish(finished);
        return;
      }
      this.maybeSaveProgress();
    }
    this.emit();
  };

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

  private mockTimer: ReturnType<typeof setInterval> | null = null;

  async play() {
    if (this.sound) {
      await this.sound.playAsync();
    } else {
      // Mock playback
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
          if (this.mockTimer) clearInterval(this.mockTimer);
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
  }

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
    } else {
      this.isPlaying = false;
      if (this.mockTimer) clearInterval(this.mockTimer);
      this.emit();
    }
  }

  async toggle() {
    if (this.isPlaying) await this.pause();
    else await this.play();
  }

  async seekTo(positionSec: number) {
    const clamped = Math.max(0, Math.min(this.durationSec, positionSec));
    this.positionSec = clamped;
    this.emit();
    if (this.sound) await this.sound.setPositionAsync(clamped * 1000);
    if (this.episode) storage.setPlaybackPosition(this.episode.id, clamped);
  }

  async skipForward(seconds?: number) {
    await this.seekTo(this.positionSec + (seconds ?? this.skipIntervalSec));
  }

  async skipBack(seconds?: number) {
    await this.seekTo(this.positionSec - (seconds ?? this.skipIntervalSec));
  }

  async setRate(rate: PlaybackRate) {
    this.rate = rate;
    if (this.sound) await this.sound.setRateAsync(rate, true);
    this.emit();
  }

  cycleRate() {
    const cycle: PlaybackRate[] = [0.75, 1.0, 1.25, 1.5, 2.0];
    const idx = cycle.indexOf(this.rate);
    const next = cycle[(idx + 1) % cycle.length];
    return this.setRate(next);
  }

  async unload() {
    if (this.sound) {
      await this.sound.unloadAsync().catch(() => {});
      this.sound = null;
    }
    if (this.mockTimer) clearInterval(this.mockTimer);
    this.isPlaying = false;
    this.episode = null;
    this.positionSec = 0;
    this.durationSec = 0;
    this.emit();
  }
}

export const audioService = new AudioService();
