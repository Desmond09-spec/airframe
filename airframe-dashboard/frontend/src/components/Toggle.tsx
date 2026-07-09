interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative w-10 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${on ? 'bg-accent' : 'bg-muted'}`}
    >
      <span
        className={`absolute top-0.5 size-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${on ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}
