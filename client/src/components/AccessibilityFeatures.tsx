import { useState, useEffect, createContext, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Type, 
  MousePointer,
  Contrast,
  Palette,
  Languages,
  VolumeX,
  ZoomIn,
  ZoomOut
} from "lucide-react";

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  fontSize: number;
  reducedMotion: boolean;
  screenReader: boolean;
  colorBlind: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  language: string;
  voiceAssistant: boolean;
  simplifiedMode: boolean;
  keyboardNavigation: boolean;
}

const AccessibilityContext = createContext<{
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
} | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    fontSize: 16,
    reducedMotion: false,
    screenReader: false,
    colorBlind: 'none',
    language: 'en',
    voiceAssistant: false,
    simplifiedMode: false,
    keyboardNavigation: false,
  });

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color blind filters
    if (settings.colorBlind !== 'none') {
      root.classList.add(`color-blind-${settings.colorBlind}`);
    } else {
      root.classList.remove('color-blind-protanopia', 'color-blind-deuteranopia', 'color-blind-tritanopia');
    }

    // Simplified mode
    if (settings.simplifiedMode) {
      root.classList.add('simplified-mode');
    } else {
      root.classList.remove('simplified-mode');
    }

    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

export function AccessibilityPanel() {
  const { settings, updateSetting } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50"
        aria-label="Open accessibility settings"
      >
        <Accessibility className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Accessibility Settings
              </CardTitle>
              <p className="text-sm text-gray-600">
                Customize your experience for better accessibility
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Visual Settings */}
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visual Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">High Contrast Mode</label>
                      <p className="text-sm text-gray-600">Increase color contrast for better visibility</p>
                    </div>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Large Text</label>
                      <p className="text-sm text-gray-600">Increase text size throughout the app</p>
                    </div>
                    <Switch
                      checked={settings.largeText}
                      onCheckedChange={(checked) => updateSetting('largeText', checked)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Type className="h-4 w-4" />
                      <label className="font-medium">Font Size: {settings.fontSize}px</label>
                    </div>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) => updateSetting('fontSize', value[0])}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="font-medium mb-2 block">Color Blind Support</label>
                    <Select
                      value={settings.colorBlind}
                      onValueChange={(value) => updateSetting('colorBlind', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Filter</SelectItem>
                        <SelectItem value="protanopia">Protanopia (Red-Green)</SelectItem>
                        <SelectItem value="deuteranopia">Deuteranopia (Red-Green)</SelectItem>
                        <SelectItem value="tritanopia">Tritanopia (Blue-Yellow)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Motion Settings */}
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <MousePointer className="h-5 w-5" />
                  Motion & Interaction
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Reduced Motion</label>
                      <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                    </div>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Enhanced Keyboard Navigation</label>
                      <p className="text-sm text-gray-600">Improve keyboard-only navigation</p>
                    </div>
                    <Switch
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Audio Settings */}
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio & Voice
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Screen Reader Support</label>
                      <p className="text-sm text-gray-600">Enhanced compatibility with screen readers</p>
                    </div>
                    <Switch
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Voice Assistant</label>
                      <p className="text-sm text-gray-600">Enable voice commands and feedback</p>
                    </div>
                    <Switch
                      checked={settings.voiceAssistant}
                      onCheckedChange={(checked) => updateSetting('voiceAssistant', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Language Settings */}
              <div>
                <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Language & Localization
                </h3>
                <div>
                  <label className="font-medium mb-2 block">Interface Language</label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Simplified Mode */}
              <div>
                <h3 className="font-medium text-lg mb-4">Interface Complexity</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Simplified Mode</label>
                    <p className="text-sm text-gray-600">Hide advanced features and use simpler layouts</p>
                  </div>
                  <Switch
                    checked={settings.simplifiedMode}
                    onCheckedChange={(checked) => updateSetting('simplifiedMode', checked)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    const defaultSettings: AccessibilitySettings = {
                      highContrast: false,
                      largeText: false,
                      fontSize: 16,
                      reducedMotion: false,
                      screenReader: false,
                      colorBlind: 'none',
                      language: 'en',
                      voiceAssistant: false,
                      simplifiedMode: false,
                      keyboardNavigation: false,
                    };
                    Object.entries(defaultSettings).forEach(([key, value]) => {
                      updateSetting(key as keyof AccessibilitySettings, value);
                    });
                  }}
                >
                  Reset to Default
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Quick access toolbar component
export function AccessibilityToolbar() {
  const { settings, updateSetting } = useAccessibility();

  return (
    <div className="fixed top-4 right-4 z-40 bg-white shadow-lg rounded-lg p-2 flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
        aria-label="Increase font size"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
        aria-label="Decrease font size"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => updateSetting('highContrast', !settings.highContrast)}
        aria-label="Toggle high contrast"
      >
        <Contrast className="h-4 w-4" />
      </Button>
    </div>
  );
}