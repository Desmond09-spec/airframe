import { useEffect, useReducer } from 'react';
import { EventsOn } from '../../wailsjs/runtime/runtime';
import type {
  PhaseID, PhaseStatus, PhaseEvent, ManifestLoadedEvent,
  ProgressEvent, ErrorEvent, DoneEvent, PackageInfo,
} from '../types/events';
import {
  EVENT_PHASE, EVENT_PROGRESS, EVENT_MANIFEST, EVENT_ERROR, EVENT_DONE,
} from '../types/events';

export type ViewState = 'welcome' | 'installing' | 'done' | 'error';

export interface PhaseState {
  id: PhaseID;
  status: PhaseStatus;
  message: string;
}

export interface PackageProgress {
  id: string;
  bytesDone: number;
  bytesTotal: number;
  speedBps: number;
}

export interface BootstrapState {
  view: ViewState;
  phases: PhaseState[];
  activePhase: PhaseID | null;
  packages: PackageInfo[];
  totalBytes: number;
  progress: Record<string, PackageProgress>;
  error: ErrorEvent | null;
  doneAt: string | null;
}

const PHASE_LABELS: PhaseID[] = [
  'preflight', 'manifest', 'download', 'verify', 'extract', 'install', 'launch',
];

const initialState: BootstrapState = {
  view: 'welcome',
  phases: PHASE_LABELS.map(id => ({ id, status: 'pending', message: '' })),
  activePhase: null,
  packages: [],
  totalBytes: 0,
  progress: {},
  error: null,
  doneAt: null,
};

type Action =
  | { type: 'PHASE'; payload: PhaseEvent }
  | { type: 'MANIFEST'; payload: ManifestLoadedEvent }
  | { type: 'PROGRESS'; payload: ProgressEvent }
  | { type: 'ERROR'; payload: ErrorEvent }
  | { type: 'DONE'; payload: DoneEvent };

function reducer(state: BootstrapState, action: Action): BootstrapState {
  switch (action.type) {
    case 'PHASE': {
      const { phase, status, message } = action.payload;
      const updatedPhases = state.phases.map(p =>
        p.id === phase ? { ...p, status, message: message ?? '' } : p
      );
      const view: ViewState =
        status === 'active' || status === 'complete'
          ? 'installing'
          : state.view;
      return {
        ...state,
        phases: updatedPhases,
        activePhase: status === 'active' ? phase : state.activePhase,
        view,
      };
    }
    case 'MANIFEST': {
      return {
        ...state,
        packages: action.payload.packages,
        totalBytes: action.payload.totalBytes,
      };
    }
    case 'PROGRESS': {
      const { packageId, bytesDone, bytesTotal, speedBps } = action.payload;
      return {
        ...state,
        progress: {
          ...state.progress,
          [packageId]: { id: packageId, bytesDone, bytesTotal, speedBps },
        },
      };
    }
    case 'ERROR': {
      return {
        ...state,
        view: 'error',
        error: action.payload,
      };
    }
    case 'DONE': {
      return {
        ...state,
        view: 'done',
        doneAt: action.payload.launchedAt,
      };
    }
    default:
      return state;
  }
}

/**
 * useBootstrapState subscribes to all Wails IPC events from the Go orchestrator
 * and accumulates them into a single reactive state object.
 */
export function useBootstrapState(): BootstrapState {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const cleanups: (() => void)[] = [];

    cleanups.push(
      EventsOn(EVENT_PHASE, (data: PhaseEvent) =>
        dispatch({ type: 'PHASE', payload: data })),
      EventsOn(EVENT_MANIFEST, (data: ManifestLoadedEvent) =>
        dispatch({ type: 'MANIFEST', payload: data })),
      EventsOn(EVENT_PROGRESS, (data: ProgressEvent) =>
        dispatch({ type: 'PROGRESS', payload: data })),
      EventsOn(EVENT_ERROR, (data: ErrorEvent) =>
        dispatch({ type: 'ERROR', payload: data })),
      EventsOn(EVENT_DONE, (data: DoneEvent) =>
        dispatch({ type: 'DONE', payload: data })),
    );

    return () => cleanups.forEach(fn => fn());
  }, []);

  return state;
}
