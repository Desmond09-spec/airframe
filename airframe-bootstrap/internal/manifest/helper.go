package manifest

import (
	"context"
	"runtime"

	"airframe-bootstrap/internal/logging"
	"airframe-bootstrap/pkg/httpclient"
)

// FetchResolved is a convenience function that fetches the manifest from url,
// resolves the packages appropriate for the current platform/arch, and returns
// them along with the total byte count.
//
// This is called on startup to populate the Welcome screen before the user
// clicks Install. The full orchestrator re-fetches the manifest internally.
func FetchResolved(ctx context.Context, url string, log logging.Logger) ([]PackageEntry, int64, error) {
	client := httpclient.New(httpclient.DefaultConfig())
	f := NewFetcher(client, log)

	m, err := f.Fetch(ctx, url)
	if err != nil {
		return nil, 0, err
	}

	r := NewResolver(log)
	platform := normalise(runtime.GOOS)
	arch := normalise(runtime.GOARCH)

	pkgs, err := r.Resolve(m, platform, arch)
	if err != nil {
		return nil, 0, err
	}

	var total int64
	for _, p := range pkgs {
		total += p.SizeBytes
	}

	return pkgs, total, nil
}

// normalise maps Go's OS/arch names to the values used in the manifest.
func normalise(s string) string {
	switch s {
	case "darwin":
		return "macos"
	case "amd64":
		return "amd64"
	case "arm64":
		return "arm64"
	default:
		return s
	}
}
