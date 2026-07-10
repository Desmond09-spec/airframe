package manifest

// Manifest is the top-level package manifest document.
type Manifest struct {
	SchemaVersion string        `json:"schemaVersion"`
	PublishedAt   string        `json:"publishedAt"`
	Channel       string        `json:"channel"`
	Packages      []PackageEntry `json:"packages"`
}

// PackageEntry describes one installable package.
type PackageEntry struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Version     string `json:"version"`
	Platform    string `json:"platform"`
	Arch        string `json:"arch"`
	URL         string `json:"url"`
	SHA256      string `json:"sha256"`
	SizeBytes   int64  `json:"sizeBytes"`
	Required    bool   `json:"required"`
	InstallPath string `json:"installPath"`
}
