const audioPlayerContainer = document.createElement('div');
audioPlayerContainer.id = 'audio-player-container';
document.body.appendChild(audioPlayerContainer);

audioPlayerContainer.innerHTML = `
  <div id="audio-player-controls">
    <button id="ap-prev" title="Previous Track" aria-label="Previous Track">
      <img src="icons/prev.png" width="24" height="24" alt="Prev">
    </button>
    <button id="ap-playpause" title="Play/Pause" aria-label="Play or Pause">
      <img id="play-icon" src="icons/play.png" width="24" height="24" alt="Play">
      <img id="pause-icon" src="icons/pause.png" width="24" height="24" style="display:none" alt="Pause">
    </button>
    <button id="ap-next" title="Next Track" aria-label="Next Track">
      <img src="icons/next.png" width="24" height="24" alt="Next">
    </button>
    <button id="ap-loop" title="Loop Mode" aria-label="Loop Mode">
      <img id="loop-off" src="icons/loop-off.png" width="24" height="24" alt="Loop Off">
      <img id="loop-current" src="icons/loop-one.png" width="24" height="24" style="display:none" alt="Loop One">
      <img id="loop-all" src="icons/loop-all.png" width="24" height="24" style="display:none" alt="Loop All">
    </button>
    <label id="autoplay-label">
      <input type="checkbox" id="autoplay-toggle" checked>
      Autoplay
    </label>
  </div>
  <div id="audio-player-trackname"></div>
  <input type="range" id="audio-player-seekbar" min="0" step="0.01" value="0" />
  <div id="audio-player-timer">00:00 / 00:00</div>
`;

const audio = new Audio();
let loopMode = 0; // 0=off,1=current,2=all

const playButton     = document.getElementById('ap-playpause');
const playIcon       = document.getElementById('play-icon');
const pauseIcon      = document.getElementById('pause-icon');
const prevButton     = document.getElementById('ap-prev');
const nextButton     = document.getElementById('ap-next');
const loopButton     = document.getElementById('ap-loop');
const loopOffIcon    = document.getElementById('loop-off');
const loopOneIcon    = document.getElementById('loop-current');
const loopAllIcon    = document.getElementById('loop-all');
const autoplayToggle = document.getElementById('autoplay-toggle');
const trackName      = document.getElementById('audio-player-trackname');
const seekBar        = document.getElementById('audio-player-seekbar');
const timer          = document.getElementById('audio-player-timer');

function formatTime(s) {
  if (isNaN(s) || !isFinite(s)) return '00:00';
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const sec = Math.floor(s%60).toString().padStart(2,'0');
  return `${m}:${sec}`;
}

function updateTimer() {
  timer.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  if (!isNaN(audio.duration)) {
    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
  }
}

function updateLoopIcons() {
  loopOffIcon.style.display    = loopMode === 0 ? 'inline' : 'none';
  loopOneIcon.style.display    = loopMode === 1 ? 'inline' : 'none';
  loopAllIcon.style.display    = loopMode === 2 ? 'inline' : 'none';
}

playButton.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playIcon.style.display  = 'none';
    pauseIcon.style.display = 'inline';
  } else {
    audio.pause();
    playIcon.style.display  = 'inline';
    pauseIcon.style.display = 'none';
  }
});

loopButton.addEventListener('click', () => {
  loopMode = (loopMode + 1) % 3;
  updateLoopIcons();
});
updateLoopIcons();

prevButton.addEventListener('click', () => window.audioQueue.prev());
nextButton.addEventListener('click', () => window.audioQueue.next());

audio.addEventListener('timeupdate', updateTimer);
seekBar.addEventListener('input', () => {
  audio.currentTime = seekBar.value;
});

audio.addEventListener('ended', () => {
  if (loopMode === 1) {
    audio.currentTime = 0;
    audio.play();
  } else if (loopMode === 2) {
    const q   = window.audioQueue.getQueue();
    const idx = window.audioQueue.getCurrentIndex();
    const next = q.length ? (idx + 1) % q.length : 0;
    window.audioQueue.setCurrent(next);
  } else if (autoplayToggle.checked) {
    window.audioQueue.next();
  }
});

window.onQueueChange = (q, idx) => {
  if (!q.length || idx < 0) {
    audio.pause();
    playIcon.style.display  = 'inline';
    pauseIcon.style.display = 'none';
    audioPlayerContainer.style.display = 'none';
    return;
  }
  const item = q[idx];
  if (audio.src !== item.url) {
    audio.src = item.url;
    trackName.textContent = item.name;
    audio.play();
    playIcon.style.display  = 'none';
    pauseIcon.style.display = 'inline';
  }
  audioPlayerContainer.style.display = 'flex';
  updateTimer();
};

window.addToAudioQueue = (name, url) => window.audioQueue.add({ name, url });
