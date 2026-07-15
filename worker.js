export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Serve the Settings page
    if (url.pathname === '/settings.html') {
      return new Response(SETTINGS_HTML, { headers: { 'Content-Type': 'text/html' } });
    }

    // Serve the Main Emulator page
    return new Response(MAIN_HTML, { headers: { 'Content-Type': 'text/html' } });
  }
};

const MAIN_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>v86 Emulator</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #000;
      overflow: hidden;
    }
    #screen_container {
      width: 100vw;
      height: 100vh;
    }
    /* Iframe overlay for settings */
    #settings_frame {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      border: none;
      z-index: 9999;
      background-color: white;
    }
  </style>
  <!-- Assuming the 4 core v86 files are in the /v86/ directory -->
  <script src="/v86/libv86.js"></script>
</head>
<body>
  <div id="screen_container">
    <div style="white-space: pre; font: 14px monospace; line-height: 14px; color: #fff;"></div>
  </div>

  <iframe id="settings_frame" src="/settings.html"></iframe>

  <script>
    let ctrlPressedAlone = false;

    // Initialize v86
    try {
      // Read settings from localStorage or use defaults
      const ram = parseInt(localStorage.getItem('v86_ram') || '150');
      const vram = parseInt(localStorage.getItem('v86_vram') || '16');

      var emulator = new V86Starter({
        wasm_path: "/v86/v86.wasm",
        memory_size: ram * 1024 * 1024,
        vga_memory_size: vram * 1024 * 1024,
        screen_container: document.getElementById("screen_container"),
        bios: { url: "/v86/seabios.bin" },
        vga_bios: { url: "/v86/vgabios.bin" },
        // You will need to add a cdrom or hda image here to actually boot an OS
        // cdrom: { url: "/os.iso" }
      });
    } catch (e) {
      console.error("v86 failed to load. Ensure the 4 core files are in the /v86/ directory.", e);
    }

    // Listen for Ctrl or Command key release
    document.addEventListener('keydown', (e) => {
      if ((e.key === 'Control' || e.key === 'Meta') && !e.shiftKey && !e.altKey) {
        ctrlPressedAlone = true;
      } else {
        ctrlPressedAlone = false; // Another key was pressed, abort
      }
    });

    document.addEventListener('keyup', (e) => {
      if ((e.key === 'Control' || e.key === 'Meta') && ctrlPressedAlone) {
        toggleSettings();
      }
      ctrlPressedAlone = false;
    });

    // Listen for messages from the settings iframe
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'closeSettings') {
        toggleSettings();
      }
    });

    function toggleSettings() {
      const frame = document.getElementById('settings_frame');
      if (frame.style.display === 'block') {
        frame.style.display = 'none';
      } else {
        // Reload the iframe to fetch new settings if they were saved
        frame.contentWindow.location.reload();
        frame.style.display = 'block';
      }
    }
  </script>
</body>
</html>
`;

// ==========================================
// 2. SETTINGS PAGE (White & Boxy)
// ==========================================
const SETTINGS_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings</title>
  <style>
    * {
      box-sizing: border-box;
      font-family: 'Courier New', Courier, monospace;
    }
    body {
      background-color: #ffffff;
      color: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      border: 4px solid #000;
      padding: 30px;
      width: 100%;
      max-width: 600px;
    }
    h1 {
      margin: 0 0 20px 0;
      font-size: 24px;
      text-transform: uppercase;
      border-bottom: 4px solid #000;
      padding-bottom: 10px;
    }
    .setting-group {
      margin-bottom: 30px;
    }
    h2 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    button {
      background: #fff;
      border: 2px solid #000;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      text-transform: uppercase;
      transition: none;
    }
    button:hover {
      background: #eee;
    }
    button.active {
      background: #000;
      color: #fff;
    }
    .save-btn {
      width: 100%;
      background: #000;
      color: #fff;
      padding: 15px;
      font-size: 16px;
      margin-top: 10px;
    }
    .save-btn:hover {
      background: #333;
    }
    .warning {
      font-size: 10px;
      color: #555;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Emulator Settings</h1>

    <div class="setting-group">
      <h2>System RAM</h2>
      <div class="btn-group" id="ram-group">
        <button data-ram="50">Small (50MB)</button>
        <button data-ram="100">Light (100MB)</button>
        <button data-ram="150" class="active">Medium (150MB)</button>
        <button data-ram="300">Large (300MB)</button>
        <button data-ram="500">Extra Large (500MB)</button>
        <button data-ram="1024">Jumbo (1GB)</button>
      </div>
      <div class="warning">* Jumbo is not recommended and may crash your browser tab.</div>
    </div>

    <div class="setting-group">
      <h2>Video RAM (VRAM)</h2>
      <div class="btn-group" id="vram-group">
        <button data-vram="8">Small (8MB)</button>
        <button data-vram="16" class="active">Medium (16MB)</button>
        <button data-vram="32">Large (32MB)</button>
      </div>
    </div>

    <button class="save-btn" id="saveBtn">SAVE & CLOSE</button>
  </div>

  <script>
    let currentRam = parseInt(localStorage.getItem('v86_ram') || '150');
    let currentVram = parseInt(localStorage.getItem('v86_vram') || '16');

    // Initialize active buttons based on saved settings
    function updateActiveButtons() {
      document.querySelectorAll('#ram-group button').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.ram) === currentRam);
      });
      document.querySelectorAll('#vram-group button').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.vram) === currentVram);
      });
    }

    document.querySelectorAll('#ram-group button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentRam = parseInt(btn.dataset.ram);
        updateActiveButtons();
      });
    });

    document.querySelectorAll('#vram-group button').forEach(btn => {
      btn.addEventListener('click', () => {
        currentVram = parseInt(btn.dataset.vram);
        updateActiveButtons();
      });
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
      localStorage.setItem('v86_ram', currentRam);
      localStorage.setItem('v86_vram', currentVram);
      
      // Tell parent window to close the iframe
      window.parent.postMessage({ type: 'closeSettings' }, '*');
    });

    updateActiveButtons();
  </script>
</body>
</html>
`;
