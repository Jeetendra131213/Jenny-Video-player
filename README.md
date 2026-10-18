==================================================
🎬 JENNY VIDEO PLAYER - COMPLETE SETUP & USAGE GUIDE
==================================================

1. PROJECT FOLDER & FILE STRUCTURE
Make sure your project folder contains these exact files:
jenny-video-player/
├── requirements.txt
├── app.py
├── templates/
│   ├── player.html
│   └── remote.html
└── static/
    ├── css/
    │   └── player.css
    └── js/
        ├── player.js
        └── remote.js

---

2. INSTALLATION & SETUP GUIDE

Step 1: Install Python Requirements
- Open your project folder in VS Code.
- Open the built-in terminal (Terminal -> New Terminal).
- Run the following command:
  pip install -r requirements.txt

Step 2: Start the Local Server
- In the same terminal, run:
  python app.py
- You will see your PC Player URL (http://127.0.0.1:5000) and Mobile Remote IP.

---

3. HOW TO USE THE PC PLAYER

- Open your browser and go to: http://127.0.0.1:5000
- Open a Video: Click the "Open Video" button at the top right or on the center welcome card to select a local video file (like an .mp4 file).
- Player Controls:
  * Play / Pause: Click the play/pause button or press Space / K.
  * Timeline Bar: Click or drag anywhere on the red progress bar to seek.
  * Volume & Mute: Adjust the volume slider or click the speaker icon (M).
  * Video Layout / Size: Use the dropdown menu at the bottom (Fit/Contain, Zoom/Cover, Stretch/Fill).
  * Ambient Light: Click the glowing sparkle button (✨) to toggle the cinema ambient glow background.
  * Fullscreen: Click the fullscreen icon (⛶) or press F.
  * Auto-Hide UI: The top navigation and bottom controls automatically hide after 5 seconds of inactivity and reappear instantly when you move your mouse.

---

4. HOW TO CONNECT YOUR MOBILE PHONE (WIRELESS REMOTE)

- Ensure your phone and PC are connected to the same Wi-Fi network.
- On the PC player, click the red "Connect Phone" button in the top navigation bar to display a QR code and pairing code.
- Open your smartphone camera app and scan the QR code (or type the local network URL shown in your terminal into your phone browser).
- The Jenny Remote interface will open on your phone, showing a green "Connected" badge.
- Mobile Remote Features:
  * Big central Play/Pause button.
  * Seek backward (-10s) and forward (+10s) buttons.
  * Live video title, progress bar, time duration, volume slider, and playback speed selector.
  * Video Size / Layout selector (Fit, Zoom, Stretch).
  * Ambient Light power toggle, mode selector (Soft vs Vivid), and intensity slider. Any change on your phone updates the PC player instantly!

---

5. KEYBOARD SHORTCUTS REFERENCE

* Space or K: Play / Pause
* F: Enter / Exit Fullscreen
* M: Mute / Unmute
* ← / →: Seek backward / forward 5 seconds
* J / L: Seek backward / forward 10 seconds
* ↑ / ↓: Volume Up / Down
==================================================
