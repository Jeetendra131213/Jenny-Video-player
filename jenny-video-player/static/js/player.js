const socket = io();

// DOM Elements
const video = document.getElementById('video-player');
const emptyState = document.getElementById('empty-state');
const fileSelector = document.getElementById('file-selector');
const btnOpen = document.getElementById('btn-open');
const emptyOpenBtn = document.getElementById('empty-open-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const seekSlider = document.getElementById('seek-slider');
const seekProgressFill = document.getElementById('seek-progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');
const muteBtn = document.getElementById('mute-btn');
const speedSelector = document.getElementById('speed-selector');
const layoutSelector = document.getElementById('layout-selector');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const videoTitleEl = document.getElementById('current-video-title');
const ambientToggleBtn = document.getElementById('ambient-toggle-btn');
const ambientContainer = document.getElementById('ambient-container');
const ambientCanvas = document.getElementById('ambient-canvas');
const ctx = ambientCanvas.getContext('2d');

// Modals
const btnConnect = document.getElementById('btn-connect');
const emptyConnectBtn = document.getElementById('empty-connect-btn');
const connectModal = document.getElementById('connect-modal');
const closeConnectModal = document.getElementById('close-connect-modal');
const qrImage = document.getElementById('qr-image');
const pairingCodeText = document.getElementById('pairing-code-text');

const btnSettings = document.getElementById('btn-settings');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const settingAmbientOn = document.getElementById('setting-ambient-on');
const settingAmbientMode = document.getElementById('setting-ambient-mode');
const settingIntensity = document.getElementById('setting-intensity');
const intensityVal = document.getElementById('intensity-val');

const topNav = document.getElementById('top-nav');
const controlsBar = document.getElementById('controls-bar');

let idleTimer = null;
let ambientActive = true;
let ambientMode = 'soft';

// --- File Handling & Playback ---
function openFilePicker() {
    fileSelector.click();
}

btnOpen.addEventListener('click', openFilePicker);
emptyOpenBtn.addEventListener('click', openFilePicker);

fileSelector.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        video.src = fileURL;
        videoTitleEl.textContent = file.name;
        emptyState.style.display = 'none';
        video.play();
        playPauseBtn.textContent = '⏸';
        broadcastState();
    }
});

// --- Controls Logic ---
function togglePlay() {
    if (video.paused) {
        video.play();
        playPauseBtn.textContent = '⏸';
    } else {
        video.pause();
        playPauseBtn.textContent = '▶';
    }
    broadcastState();
}

playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

video.addEventListener('timeupdate', () => {
    if (!isNaN(video.duration)) {
        const progress = (video.currentTime / video.duration) * 100;
        seekSlider.value = progress;
        seekProgressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(video.currentTime);
        durationEl.textContent = formatTime(video.duration);
    }
});

seekSlider.addEventListener('input', () => {
    if (!isNaN(video.duration)) {
        const progress = seekSlider.value;
        video.currentTime = (progress / 100) * video.duration;
        seekProgressFill.style.width = progress + '%';
        broadcastState();
    }
});

volumeSlider.addEventListener('input', () => {
    video.volume = volumeSlider.value;
    video.muted = false;
    updateMuteIcon();
    broadcastState();
});

muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    updateMuteIcon();
    broadcastState();
});

function updateMuteIcon() {
    muteBtn.textContent = video.muted || video.volume === 0 ? '🔇' : '🔊';
}

speedSelector.addEventListener('change', () => {
    video.playbackRate = parseFloat(speedSelector.value);
    broadcastState();
});

layoutSelector.addEventListener('change', () => {
    video.style.objectFit = layoutSelector.value;
    broadcastState();
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- Ambient Light Rendering Loop (Optimized Fix) ---
function drawAmbientGlow() {
    if (!video.paused && !video.ended && ambientActive && video.readyState >= 2) {
        if (ambientCanvas.width !== 128 || ambientCanvas.height !== 128) {
            ambientCanvas.width = 128;
            ambientCanvas.height = 128;
        }
        try {
            ctx.drawImage(video, 0, 0, 128, 128);
        } catch (e) {
            // Safe fallback
        }
    }
    requestAnimationFrame(drawAmbientGlow);
}
requestAnimationFrame(drawAmbientGlow);

settingAmbientOn.addEventListener('change', () => {
    ambientActive = settingAmbientOn.checked;
    ambientContainer.style.display = ambientActive ? 'block' : 'none';
    ambientToggleBtn.classList.toggle('active-glow', ambientActive);
});

ambientToggleBtn.addEventListener('click', () => {
    settingAmbientOn.checked = !settingAmbientOn.checked;
    settingAmbientOn.dispatchEvent(new Event('change'));
});

settingAmbientMode.addEventListener('change', () => {
    ambientMode = settingAmbientMode.value;
    ambientCanvas.style.filter = ambientMode === 'vivid' ? 'blur(50px) saturate(240%)' : 'blur(70px) saturate(150%)';
});

settingIntensity.addEventListener('input', () => {
    const val = settingIntensity.value;
    intensityVal.textContent = val;
    ambientContainer.style.opacity = val / 100;
});

// --- QR Connect Modal ---
btnConnect.addEventListener('click', openConnectModal);
emptyConnectBtn.addEventListener('click', openConnectModal);

function openConnectModal() {
    connectModal.classList.remove('hidden');
    fetch('/api/generate-qr')
        .then(res => res.json())
        .then(data => {
            qrImage.src = data.qr_image;
            pairingCodeText.textContent = data.pairing_code;
        });
}

closeConnectModal.addEventListener('click', () => connectModal.classList.add('hidden'));
btnSettings.addEventListener('click', () => settingsModal.classList.remove('hidden'));
closeSettingsModal.addEventListener('click', () => settingsModal.classList.add('hidden'));

// --- Auto-hiding Controls (5 Seconds) ---
function resetIdleTimer() {
    topNav.classList.remove('nav-hidden');
    controlsBar.classList.remove('controls-hidden');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        if (!video.paused) {
            topNav.classList.add('nav-hidden');
            controlsBar.classList.add('controls-hidden');
        }
    }, 5000); // 5 Seconds
}

window.addEventListener('mousemove', resetIdleTimer);
window.addEventListener('click', resetIdleTimer);

// --- Keyboard Shortcuts ---
window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
    
    switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
            e.preventDefault();
            togglePlay();
            break;
        case 'f':
            fullscreenBtn.click();
            break;
        case 'm':
            muteBtn.click();
            break;
        case 'arrowleft':
            video.currentTime = Math.max(0, video.currentTime - 5);
            break;
        case 'arrowright':
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
            break;
        case 'j':
            video.currentTime = Math.max(0, video.currentTime - 10);
            break;
        case 'l':
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            break;
        case 'arrowup':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.05);
            volumeSlider.value = video.volume;
            break;
        case 'arrowdown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.05);
            volumeSlider.value = video.volume;
            break;
    }
});

// --- WebSocket Sync ---
function broadcastState() {
    socket.emit('player_command', {
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused,
        volume: video.volume,
        muted: video.muted,
        speed: video.playbackRate,
        layout: layoutSelector.value,
        title: videoTitleEl.textContent,
        ambientOn: ambientActive,
        ambientMode: ambientMode,
        intensity: settingIntensity.value
    });
}

socket.on('receive_command', (data) => {
    if (data.currentTime !== undefined && Math.abs(video.currentTime - data.currentTime) > 1.5) {
        video.currentTime = data.currentTime;
    }
    if (data.paused !== undefined && video.paused !== data.paused) {
        if (data.paused) video.pause(); else video.play();
        playPauseBtn.textContent = video.paused ? '▶' : '⏸';
    }
    if (data.volume !== undefined) {
        video.volume = data.volume;
        volumeSlider.value = data.volume;
    }
    if (data.muted !== undefined) {
        video.muted = data.muted;
        updateMuteIcon();
    }
    if (data.speed !== undefined) {
        video.playbackRate = data.speed;
        speedSelector.value = data.speed;
    }
    if (data.layout !== undefined) {
        video.style.objectFit = data.layout;
        layoutSelector.value = data.layout;
    }
    if (data.ambientOn !== undefined) {
        settingAmbientOn.checked = data.ambientOn;
        ambientActive = data.ambientOn;
        ambientContainer.style.display = ambientActive ? 'block' : 'none';
    }
    if (data.intensity !== undefined) {
        settingIntensity.value = data.intensity;
        intensityVal.textContent = data.intensity;
        ambientContainer.style.opacity = data.intensity / 100;
    }
});