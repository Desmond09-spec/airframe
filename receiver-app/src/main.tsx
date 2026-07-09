import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Initialize Neutralino and auto-manage the signaling server
if (typeof Neutralino !== 'undefined') {
  Neutralino.init();

  let signalingPid: number | null = null;

  // When the Neutralino runtime is ready, spawn the bundled signaling server
  Neutralino.events.on('ready', async () => {
    try {
      // NL_PATH is the directory of the running .exe
      const serverPath = `${NL_PATH}/airframe-signaling.exe`;
      const proc = await Neutralino.os.spawnProcess(serverPath);
      signalingPid = proc.id;
      console.log(`[Airframe] Signaling server spawned (pid: ${signalingPid})`);
    } catch (err) {
      console.error('[Airframe] Failed to spawn signaling server:', err);
    }
  });

  // When the window is closed, kill the server so it doesn't linger
  Neutralino.events.on('windowClose', async () => {
    if (signalingPid !== null) {
      try {
        await Neutralino.os.updateSpawnedProcess(signalingPid, 'terminate');
        console.log('[Airframe] Signaling server terminated.');
      } catch (err) {
        console.warn('[Airframe] Could not terminate signaling server:', err);
      }
    }
    Neutralino.app.exit();
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
