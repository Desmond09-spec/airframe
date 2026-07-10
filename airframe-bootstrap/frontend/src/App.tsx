import { useEffect, useRef, useState } from 'react';
import { useBootstrapState } from './hooks/useBootstrapState';
import { WelcomeView } from './views/WelcomeView';
import { InstallView } from './views/InstallView';
import { DoneView } from './views/DoneView';
import './index.css';

export default function App() {
  const state = useBootstrapState();
  const [userStarted, setUserStarted] = useState(false);
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-close 3 seconds after done state.
  useEffect(() => {
    if (state.view === 'done' && !state.error) {
      autoCloseRef.current = setTimeout(() => {
        window.close?.();
      }, 3000);
    }
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, [state.view, state.error]);

  // When the orchestrator starts emitting active-phase events, automatically
  // show the install view (covers the case where we auto-advance).
  useEffect(() => {
    if (state.view === 'installing' && !userStarted) {
      setUserStarted(true);
    }
  }, [state.view, userStarted]);

  const showWelcome = !userStarted && state.view === 'welcome';
  const showInstall = userStarted && (state.view === 'installing' || (state.view === 'welcome' && userStarted));
  const showDone    = state.view === 'done' || state.view === 'error';

  return (
    <div className="app-shell">
      {showDone ? (
        <DoneView error={state.error} doneAt={state.doneAt} />
      ) : showInstall ? (
        <InstallView state={state} />
      ) : (
        <WelcomeView
          packages={state.packages}
          totalBytes={state.totalBytes}
          onInstall={() => setUserStarted(true)}
        />
      )}
    </div>
  );
}
