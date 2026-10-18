const socket = io();

const connectionBadge = document.getElementById('connection-badge');
const playPauseBtn = document.getElementById('r-play-pause');
const seekBackBtn = document.getElementById('r-seek-back');
const seekForwardBtn = document.getElementById('r-seek-forward');
const seekSlider = document.getElementById('remote-seek-slider');
const currentTimeEl = document.getElementById('remote-current-time');
const durationEl = document.getElementById('remote-duration');
const videoTitleEl = document.getElementById('remote-video-title');
const volumeSlider = document.getElementById('remote-volume');
const muteBtn = document.getElementById('r-mute');
const speedSelector = document.getElementById('remote-speed');
const layoutButtons = document.querySelectorAll('.layout-btn');

const ambientToggle = document.getElementById('r-ambient-on');
const modeButtons = document.querySelectorAll('.mode-btn');
const intensitySlider = document.getElementById('r-intensity');
const intensityLabel = document.getElementById('r-intensity-label');

let currentState = {
    paused: true,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    speed: 1.0,
    layout: 'contain',
    ambientOn: true,
    ambientMode: 'soft',
    intensity: 75
};

socket.on('connect', () => {
    connectionBadge.textContent = 'Connected';
    connectionBadge.className = 'badge connected';
});

socket.on('disconnect', () => {
    connectionBadge.textContent = 'Disconnected';
    connectionBadge.className = 'badge disconnected';
});

playPauseBtn.addEventListener('click', () => {
    currentState.paused = !currentState.paused;
    playPauseBtn.textContent = currentState.paused ? '▶' : '⏸';
    sendState();
});

seekBackBtn.addEventListener('click', () => {
    currentState.currentTime = Math.max(0, currentState.currentTime - 10);
    sendState();
});

seekForwardBtn.addEventListener('click', () => {
    currentState.currentTime = Math.min(currentState.duration, currentState.currentTime + 10);
    sendState();
});

seekSlider.addEventListener('input', () => {
    if (currentState.duration > 0) {
        currentState.currentTime = (seekSlider.value / 100) * currentState.duration;
        sendState();
    }
});

volumeSlider.addEventListener('input', () => {
    currentState.volume = volumeSlider.value;
    currentState.muted = false;
    sendState();
});

muteBtn.addEventListener('click', () => {
    currentState.muted = !currentState.muted;
    muteBtn.textContent = currentState.muted ? '🔇' : '🔊';
    sendState();
});

speedSelector.addEventListener('change', () => {
    currentState.speed = parseFloat(speedSelector.value);
    sendState();
});

layoutButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        layoutButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentState.layout = btn.getAttribute('data-layout');
        sendState();
    });
});

ambientToggle.addEventListener('change', () => {
    currentState.ambientOn = ambientToggle.checked;
    sendState();
});

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentState.ambientMode = btn.getAttribute('data-mode');
        sendState();
    });
});

intensitySlider.addEventListener('input', () => {
    currentState.intensity = intensitySlider.value;
    intensityLabel.textContent = currentState.intensity;
    sendState();
});

function sendState() {
    socket.emit('player_command', currentState);
}

socket.on('receive_command', (data) => {
    Object.assign(currentState, data);
    
    playPauseBtn.textContent = currentState.paused ? '▶' : '⏸';
    videoTitleEl.textContent = currentState.title || 'No video playing on PC';
    volumeSlider.value = currentState.volume;
    muteBtn.textContent = currentState.muted ? '🔇' : '🔊';
    speedSelector.value = currentState.speed;
    ambientToggle.checked = currentState.ambientOn;
    intensitySlider.value = currentState.intensity;
    intensityLabel.textContent = currentState.intensity;

    if (currentState.layout) {
        layoutButtons.forEach(b => {
            if (b.getAttribute('data-layout') === currentState.layout) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }

    if (currentState.duration > 0) {
        const progress = (currentState.currentTime / currentState.duration) * 100;
        seekSlider.value = progress;
        currentTimeEl.textContent = formatTime(currentState.currentTime);
        durationEl.textContent = formatTime(currentState.duration);
    }
});

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}