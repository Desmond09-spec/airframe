package manifest

import (
	"fmt"
	"runtime"
	"sort"
	"strings"

	"airframe-bootstrap/internal/logging"
)

// Resolver selects the correct packages from a manifest for the current environment.
type Resolver interface {
	Resolve(m Manifest, platform, arch string) ([]PackageEntry, error)
}

type resolver struct {
	log logging.Logger
}

// NewResolver creates a Resolver.
func NewResolver(log logging.Logger) Resolver {
	return &resolver{log: log}
}

// Resolve filters the manifest to entries matching the given platform and arch,
// then picks the highest semver per package ID.
func (r *resolver) Resolve(m Manifest, platform, arch string) ([]PackageEntry, error) {
	// Normalise platform to match manifest conventions.
	if platform == "" {
		platform = runtime.GOOS
	}
	if arch == "" {
		arch = runtime.GOARCH
	}

	// Collect candidates per package ID.
	type candidate struct {
		entry   PackageEntry
		semver  [3]int
	}
	best := make(map[string]candidate)

	for _, pkg := range m.Packages {
		if !strings.EqualFold(pkg.Platform, platform) {
			continue
		}
		if !strings.EqualFold(pkg.Arch, arch) {
			continue
		}
		sv := parseSemver(pkg.Version)
		if existing, ok := best[pkg.ID]; !ok || semverGreater(sv, existing.semver) {
			best[pkg.ID] = candidate{entry: pkg, semver: sv}
		}
	}

	if len(best) == 0 {
		return nil, fmt.Errorf("resolver: no packages found for platform=%s arch=%s", platform, arch)
	}

	// Build a deterministic result slice sorted by ID.
	result := make([]PackageEntry, 0, len(best))
	for _, c := range best {
		result = append(result, c.entry)
	}
	sort.Slice(result, func(i, j int) bool {
		return result[i].ID < result[j].ID
	})

	r.log.Info("manifest", "resolved packages",
		logging.F("platform", platform),
		logging.F("arch", arch),
		logging.F("count", len(result)),
	)
	for _, pkg := range result {
		r.log.Info("manifest", "  package",
			logging.F("id", pkg.ID),
			logging.F("version", pkg.Version),
			logging.F("size_bytes", pkg.SizeBytes),
		)
	}
	return result, nil
}

// parseSemver parses a "major.minor.patch" string into [3]int.
// Non-parseable components default to 0.
func parseSemver(v string) [3]int {
	v = strings.TrimPrefix(v, "v")
	parts := strings.SplitN(v, ".", 3)
	var result [3]int
	for i, p := range parts {
		if i >= 3 {
			break
		}
		n := 0
		fmt.Sscanf(p, "%d", &n)
		result[i] = n
	}
	return result
}

func semverGreater(a, b [3]int) bool {
	for i := 0; i < 3; i++ {
		if a[i] > b[i] {
			return true
		}
		if a[i] < b[i] {
			return false
		}
	}
	return false
}
