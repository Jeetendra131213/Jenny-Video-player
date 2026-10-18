import os
import io
import base64
import socket
import qrcode
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'jenny-secret-key-change-me'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active pairing tokens and connection state
active_pairing_token = None
connected_devices = set()

def get_local_ip():
    """Helper to find your local network IP address (e.g., 192.168.x.x)"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@app.route('/')
def index():
    """Renders the main PC Video Player interface"""
    return render_template('player.html')

@app.route('/remote')
def remote():
    """Renders the Mobile Remote Control interface"""
    token = request.args.get('token')
    return render_template('remote.html', token=token)

@app.route('/api/generate-qr')
def generate_qr():
    """Generates a secure pairing QR code pointing to your local network IP"""
    global active_pairing_token
    import uuid
    active_pairing_token = str(uuid.uuid4())[:8]  # Short secure token
    
    local_ip = get_local_ip()
    port = 5000
    remote_url = f"http://{local_ip}:{port}/remote?token={active_pairing_token}"
    
    # Generate QR code image in memory
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(remote_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    
    return jsonify({
        "qr_image": f"data:image/png;base64,{qr_base64}",
        "pairing_code": active_pairing_token,
        "remote_url": remote_url
    })

# --- WebSocket Real-Time Event Handlers ---

@socketio.on('connect')
def handle_connect():
    print(f"Device connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Device disconnected: {request.sid}")

@socketio.on('player_command')
def handle_player_command(data):
    """Relays commands from phone remote to PC player (and vice versa)"""
    # Broadcast to all connected clients except sender
    emit('receive_command', data, broadcast=True, include_self=False)

if __name__ == '__main__':
    local_ip = get_local_ip()
    print("\n" + "="*50)
    print("🎬 JENNY VIDEO PLAYER LOCAL SERVER STARTED")
    print(f"➡️  PC Player URL:    http://127.0.0.1:5000")
    print(f"📱 Mobile Remote IP: http://{local_ip}:5000")
    print("="*50 + "\n")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)