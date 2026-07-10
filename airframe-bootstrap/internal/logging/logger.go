package logging

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"sync"
	"time"
)

// Level represents log severity.
type Level int

const (
	LevelDebug Level = iota
	LevelInfo
	LevelWarn
	LevelError
	LevelFatal
)

func (l Level) String() string {
	switch l {
	case LevelDebug:
		return "debug"
	case LevelInfo:
		return "info"
	case LevelWarn:
		return "warn"
	case LevelError:
		return "error"
	case LevelFatal:
		return "fatal"
	default:
		return "unknown"
	}
}

// Field is a structured log field.
type Field struct {
	Key   string
	Value interface{}
}

// F is a convenience constructor for Field.
func F(key string, value interface{}) Field {
	return Field{Key: key, Value: value}
}

// Logger is the structured logger interface used throughout Bootstrap.
type Logger interface {
	Debug(component, msg string, fields ...Field)
	Info(component, msg string, fields ...Field)
	Warn(component, msg string, fields ...Field)
	Error(component, msg string, fields ...Field)
	Fatal(component, msg string, fields ...Field)
}

// Config holds logger configuration.
type Config struct {
	MinLevel Level
	FilePath string // empty = stdout only
}

type logger struct {
	mu       sync.Mutex
	minLevel Level
	writers  []io.Writer
}

// New creates a new Logger. If cfg.FilePath is non-empty, logs are written to
// both stdout and that file.
func New(cfg Config) Logger {
	writers := []io.Writer{os.Stdout}
	if cfg.FilePath != "" {
		if err := os.MkdirAll(getDirOf(cfg.FilePath), 0755); err == nil {
			f, err := os.OpenFile(cfg.FilePath, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
			if err == nil {
				writers = append(writers, f)
			}
		}
	}
	return &logger{
		minLevel: cfg.MinLevel,
		writers:  writers,
	}
}

func (l *logger) log(level Level, component, msg string, fields []Field) {
	if level < l.minLevel {
		return
	}

	entry := map[string]interface{}{
		"ts":        time.Now().UTC().Format(time.RFC3339),
		"level":     level.String(),
		"component": component,
		"msg":       msg,
	}
	for _, f := range fields {
		entry[f.Key] = f.Value
	}

	b, err := json.Marshal(entry)
	if err != nil {
		return
	}
	b = append(b, '\n')

	l.mu.Lock()
	defer l.mu.Unlock()
	for _, w := range l.writers {
		w.Write(b) //nolint:errcheck
	}
}

func (l *logger) Debug(component, msg string, fields ...Field) {
	l.log(LevelDebug, component, msg, fields)
}

func (l *logger) Info(component, msg string, fields ...Field) {
	l.log(LevelInfo, component, msg, fields)
}

func (l *logger) Warn(component, msg string, fields ...Field) {
	l.log(LevelWarn, component, msg, fields)
}

func (l *logger) Error(component, msg string, fields ...Field) {
	l.log(LevelError, component, msg, fields)
}

func (l *logger) Fatal(component, msg string, fields ...Field) {
	l.log(LevelFatal, component, msg, fields)
	fmt.Fprintln(os.Stderr, "fatal:", msg)
	os.Exit(1)
}

// Noop returns a logger that discards all output (useful in tests).
func Noop() Logger {
	return &noopLogger{}
}

type noopLogger struct{}

func (n *noopLogger) Debug(_, _ string, _ ...Field) {}
func (n *noopLogger) Info(_, _ string, _ ...Field)  {}
func (n *noopLogger) Warn(_, _ string, _ ...Field)  {}
func (n *noopLogger) Error(_, _ string, _ ...Field) {}
func (n *noopLogger) Fatal(_, _ string, _ ...Field) { os.Exit(1) }

func getDirOf(path string) string {
	for i := len(path) - 1; i >= 0; i-- {
		if path[i] == '/' || path[i] == '\\' {
			return path[:i]
		}
	}
	return "."
}
