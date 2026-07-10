package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

// Version is set at build time via -ldflags "-X main.Version=x.y.z".
var Version = "dev"

// ManifestURL is the package manifest endpoint.
// Override at build time: -ldflags "-X main.ManifestURL=https://releases.airframe.app/manifest/stable.json"
var ManifestURL = ""

func main() {
	app := newApp()

	err := wails.Run(&options.App{
		Title:            "Airframe Setup",
		Width:            520,
		Height:           640,
		MinWidth:         520,
		MinHeight:        640,
		MaxWidth:         520,
		MaxHeight:        640,
		DisableResize:    true,
		Frameless:        false,
		BackgroundColour: &options.RGBA{R: 245, G: 245, B: 243, A: 255},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup:  app.startup,
		OnDomReady: app.domReady,
		OnShutdown: app.shutdown,
		Bind:       []interface{}{app},
		Windows: &windows.Options{
			WebviewIsTransparent:              false,
			WindowIsTranslucent:               false,
			DisableWindowIcon:                 false,
			DisablePinchZoom:                  true,
			Theme:                             windows.SystemDefault,
		},
		SingleInstanceLock: &options.SingleInstanceLock{
			UniqueId: "airframe-bootstrap-v1",
			OnSecondInstanceLaunch: func(data options.SecondInstanceData) {},
		},
	})

	if err != nil {
		panic(err)
	}
}
