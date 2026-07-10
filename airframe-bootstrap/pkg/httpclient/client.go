package httpclient

import (
	"fmt"
	"math"
	"net/http"
	"strconv"
	"time"
)

// Config holds configuration for the HTTP client.
type Config struct {
	Timeout  time.Duration
	RetryMax int
}

// DefaultConfig returns sensible defaults.
func DefaultConfig() Config {
	return Config{
		Timeout:  30 * time.Second,
		RetryMax: 3,
	}
}

// Client is an http.Client with retry and backoff behaviour.
type Client struct {
	inner    *http.Client
	retryMax int
}

// New creates a new Client with the given config.
func New(cfg Config) *Client {
	return &Client{
		inner: &http.Client{
			Timeout: cfg.Timeout,
		},
		retryMax: cfg.RetryMax,
	}
}

// Do executes an HTTP request with retry logic.
func (c *Client) Do(req *http.Request) (*http.Response, error) {
	var lastErr error
	for attempt := 0; attempt <= c.retryMax; attempt++ {
		if attempt > 0 {
			backoff := time.Duration(math.Pow(2, float64(attempt-1))) * time.Second
			time.Sleep(backoff)
			// Clone the request body if needed for retry — for GET/HEAD this is a no-op.
		}

		resp, err := c.inner.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("httpclient: request failed (attempt %d): %w", attempt+1, err)
			continue
		}

		switch {
		case resp.StatusCode == http.StatusTooManyRequests:
			// Respect Retry-After if present.
			if ra := resp.Header.Get("Retry-After"); ra != "" {
				if secs, err := strconv.Atoi(ra); err == nil {
					time.Sleep(time.Duration(secs) * time.Second)
				}
			}
			resp.Body.Close()
			lastErr = fmt.Errorf("httpclient: rate limited (attempt %d)", attempt+1)
			continue

		case resp.StatusCode >= 500:
			resp.Body.Close()
			lastErr = fmt.Errorf("httpclient: server error %d (attempt %d)", resp.StatusCode, attempt+1)
			continue

		case resp.StatusCode == http.StatusNotFound:
			// Fatal: don't retry 404.
			resp.Body.Close()
			return nil, fmt.Errorf("httpclient: resource not found (404): %s", req.URL)

		default:
			return resp, nil
		}
	}
	return nil, fmt.Errorf("httpclient: all %d attempts failed: %w", c.retryMax+1, lastErr)
}

// Get is a convenience method for GET requests.
func (c *Client) Get(url string) (*http.Response, error) {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("httpclient: build request: %w", err)
	}
	return c.Do(req)
}
