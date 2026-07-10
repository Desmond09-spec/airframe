; Airframe Dashboard Installer Script
; Inno Setup Configuration with Full Airframe Branding

#define MyAppName "Airframe Dashboard"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Desmond09-spec"
#define MyAppExeName "airframe-dashboard.exe"
#define MyAppAssocName "Airframe Dashboard"
#define MyAppAssocExt ".airframe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\Airframe Dashboard
DefaultGroupName=Airframe
AllowNoIcons=yes
OutputDir=installer-output
OutputBaseFilename=AirframeDashboard-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
UninstallDisplayIcon={app}\{#MyAppExeName}

; Airframe Branding - Colors and Theme
BackColor=#0A0A09
BackColor2=#080808
; WizardImageFile=installer-assets\wizard-image.bmp  ; Uncomment after creating image
; WizardSmallImageFile=installer-assets\wizard-small.bmp  ; Uncomment after creating image
; SetupIconFile=installer-assets\airframe-icon.ico  ; Uncomment after creating image

; Airframe Branding - Fonts
; Note: Custom fonts require bundling and registration
; Uncomment after creating installer-assets folder with fonts
; [Files]
; Source: "installer-assets\Figtree-Regular.ttf"; DestDir: "{fonts}"; Flags: onlyifdoesntexist uninsneveruninstall
; Source: "installer-assets\Figtree-Medium.ttf"; DestDir: "{fonts}"; Flags: onlyifdoesntexist uninsneveruninstall
; Source: "installer-assets\DMMono-Regular.ttf"; DestDir: "{fonts}"; Flags: onlyifdoesntexist uninsneveruninstall

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked

[Files]
Source: "build\bin\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch Airframe Dashboard"; Flags: nowait postinstall skipifsilent

[Code]
// Custom UI styling for Airframe branding
var
  WelcomeLogoImage: TBitmapImage;
  ProgressLogoImage: TBitmapImage;

procedure InitializeWizard();
begin
  // Set wizard colors to match Airframe theme
  WizardForm.Color := $0A0A09;  // #0A0A09
  WizardForm.Font.Color := $F5F5F3;  // #F5F5F3
  
  // Customize button colors (limited in standard Inno Setup)
  // For full button customization, would need custom skinning library
  
  // Set welcome page text styling
  WizardForm.WelcomeLabel1.Font.Color := $F5F5F3;
  WizardForm.WelcomeLabel2.Font.Color := $F5F5F3;
  
  // Set progress page colors
  WizardForm.StatusLabel.Font.Color := $F5F5F3;
  // Note: ProgressGauge color customization is limited in standard Inno Setup
  
  // Add Airframe logo to welcome page (top right)
  // Uncomment after creating installer-assets\airframe-logo.bmp
  // WelcomeLogoImage := TBitmapImage.Create(WizardForm.WelcomePage);
  // WelcomeLogoImage.Bitmap.LoadFromFile(ExpandConstant('{tmp}\airframe-logo.bmp'));
  // WelcomeLogoImage.Left := WizardForm.WelcomePage.ClientWidth - 150;
  // WelcomeLogoImage.Top := 20;
  // WelcomeLogoImage.Width := 120;
  // WelcomeLogoImage.Height := 40;
  // WelcomeLogoImage.Parent := WizardForm.WelcomePage;
  
  // Add Airframe logo to progress page (top right)
  // ProgressLogoImage := TBitmapImage.Create(WizardForm.FinishedPage);
  // ProgressLogoImage.Bitmap.LoadFromFile(ExpandConstant('{tmp}\airframe-logo.bmp'));
  // ProgressLogoImage.Left := WizardForm.FinishedPage.ClientWidth - 150;
  // ProgressLogoImage.Top := 20;
  // ProgressLogoImage.Width := 120;
  // ProgressLogoImage.Height := 40;
  // ProgressLogoImage.Parent := WizardForm.FinishedPage;
end;
