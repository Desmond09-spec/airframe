package manifest

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/pkg/httpclient"
)

// Fetcher downloads and parses the package manifest.
type Fetcher interface {
	Fetch(ctx context.Context, url string) (Manifest, error)
}

type fetcher struct {
	client *httpclient.Client
	log    logging.Logger
}

// NewFetcher creates a Fetcher.
func NewFetcher(client *httpclient.Client, log logging.Logger) Fetcher {
	return &fetcher{client: client, log: log}
}

// Fetch downloads the manifest from url and parses it.
// Supports both https:// and file:// URLs for local testing.
func (f *fetcher) Fetch(ctx context.Context, url string) (Manifest, error) {
	f.log.Info("manifest", "fetching manifest", logging.F("url", url))

	var data []byte
	var err error

	if strings.HasPrefix(url, "file://") {
		// Local file — read directly.
		path := strings.TrimPrefix(url, "file://")
		// On Windows, file:///C:/... becomes /C:/... after trim, fix the leading slash.
		if len(path) > 2 && path[0] == '/' && path[2] == ':' {
			path = path[1:]
		}
		data, err = os.ReadFile(path)
		if err != nil {
			return Manifest{}, fmt.Errorf("manifest: read file %s: %w", path, err)
		}
	} else {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return Manifest{}, fmt.Errorf("manifest: build request: %w", err)
		}
		resp, err := f.client.Do(req)
		if err != nil {
			return Manifest{}, fmt.Errorf("manifest: fetch: %w", err)
		}
		defer resp.Body.Close()
		data, err = io.ReadAll(resp.Body)
		if err != nil {
			return Manifest{}, fmt.Errorf("manifest: read body: %w", err)
		}
	}

	var m Manifest
	if err := json.Unmarshal(data, &m); err != nil {
		return Manifest{}, fmt.Errorf("manifest: parse JSON: %w", err)
	}

	if m.SchemaVersion == "" {
		return Manifest{}, fmt.Errorf("manifest: missing schemaVersion field")
	}

	f.log.Info("manifest", "manifest loaded",
		logging.F("channel", m.Channel),
		logging.F("packages", len(m.Packages)),
	)
	return m, nil
}
