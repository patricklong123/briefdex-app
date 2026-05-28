// Headless playback service for react-native-track-player.
//
// This runs as a registered service (see App.tsx) and wires the OS remote
// controls — lock screen, Control Center, Bluetooth/CarPlay — directly to the
// player. State and progress flow back into `audioService` via TrackPlayer's
// own PlaybackState / PlaybackProgressUpdated events, so the in-app UI stays in
// sync no matter where the command originated.
//
// Pure CommonJS on purpose: `registerPlaybackService` requires a factory whose
// `require()` yields the handler function, and mixing ESM `import` with
// `module.exports` in one file breaks under Babel's interop.
const TrackPlayer = require('react-native-track-player').default;
const { Event } = require('react-native-track-player');

module.exports = async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteJumpForward, (e) =>
    TrackPlayer.seekBy(e.interval),
  );
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, (e) =>
    TrackPlayer.seekBy(-e.interval),
  );
  TrackPlayer.addEventListener(Event.RemoteSeek, (e) => TrackPlayer.seekTo(e.position));
};
