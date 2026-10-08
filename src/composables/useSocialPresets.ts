import { ref } from 'vue';

export interface FormatPreset {
  id: string;
  name: string;
  category: 'social' | 'square' | 'story' | 'banner' | 'custom';
  ratioLabel: string;
  platform: string;
  icon: string;
  baseWidth: number;
  baseHeight: number;
  export2xLabel: string;
  description: string;
}

export const baseFormatPresets: FormatPreset[] = [
  {
    id: 'square-post',
    name: 'Cuadrado Feed / Avatar',
    category: 'square',
    ratioLabel: '1:1',
    platform: 'Instagram / FB / Avatar',
    icon: '🟦',
    baseWidth: 512,
    baseHeight: 512,
    export2xLabel: '1024 × 1024 px',
    description: 'Universal para feed de Instagram, Facebook y fotos de perfil'
  },
  {
    id: 'portrait-post',
    name: 'Retrato Feed Móvil',
    category: 'social',
    ratioLabel: '4:5',
    platform: 'Instagram / FB Feed',
    icon: '📸',
    baseWidth: 410,
    baseHeight: 512,
    export2xLabel: '820 × 1024 px',
    description: 'Cubre más pantalla vertical en móvil para mayor alcance'
  },
  {
    id: 'story-reels',
    name: 'Wallpaper / Stories / Reels',
    category: 'story',
    ratioLabel: '9:16',
    platform: 'Wallpaper / Stories / TikTok',
    icon: '📱',
    baseWidth: 512,
    baseHeight: 910,
    export2xLabel: '1024 × 1820 px',
    description: 'Pantalla completa vertical 9:16 para fondos de pantalla (Wallpaper) e historias'
  },
  {
    id: 'landscape-banner',
    name: 'Panorámico / Banner',
    category: 'banner',
    ratioLabel: '16:9',
    platform: 'X (Twitter) / YouTube',
    icon: '🖼️',
    baseWidth: 512,
    baseHeight: 288,
    export2xLabel: '1024 × 576 px',
    description: 'Ideal para tweets, miniaturas y posts horizontales'
  },
  {
    id: 'link-preview',
    name: 'Enlace / Link Preview',
    category: 'banner',
    ratioLabel: '1.91:1',
    platform: 'Facebook / LinkedIn',
    icon: '🔗',
    baseWidth: 512,
    baseHeight: 268,
    export2xLabel: '1024 × 536 px',
    description: 'Optimizado para links compartidos y banners de LinkedIn'
  },
  {
    id: 'sticker-compact',
    name: 'Sticker / Icono',
    category: 'square',
    ratioLabel: '1:1',
    platform: 'Telegram / WhatsApp / Slack',
    icon: '✨',
    baseWidth: 256,
    baseHeight: 256,
    export2xLabel: '512 × 512 px',
    description: 'Tamaño estándar para stickers de mensajería'
  }
];

export const CUSTOM_STORAGE_KEY = 'pixemoji_custom_canvas_size';
export const DEFAULT_CUSTOM_SIZE = { width: 800, height: 600 };

export function loadStoredCustomSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_SIZE;
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
        return {
          width: Math.max(50, Math.min(4096, Math.round(parsed.width))),
          height: Math.max(50, Math.min(4096, Math.round(parsed.height)))
        };
      }
    }
  } catch (err) {
    console.warn('Error loading custom canvas size from localStorage:', err);
  }
  return DEFAULT_CUSTOM_SIZE;
}

export function saveStoredCustomSize(width: number, height: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify({ width, height }));
  } catch (err) {
    console.warn('Error saving custom canvas size to localStorage:', err);
  }
}

export function buildCustomPreset(width: number, height: number): FormatPreset {
  return {
    id: 'custom',
    name: 'Personalizado',
    category: 'custom',
    ratioLabel: `${width} × ${height} px`,
    platform: 'Medidas Libres',
    icon: '📐',
    baseWidth: width,
    baseHeight: height,
    export2xLabel: `${width * 2} × ${height * 2} px`,
    description: 'Dimensiones personalizadas configuradas por el usuario'
  };
}

export function useSocialPresets() {
  const initialCustom = loadStoredCustomSize();
  const customDimensions = ref(initialCustom);
  const customPreset = ref<FormatPreset>(buildCustomPreset(initialCustom.width, initialCustom.height));

  const formatPresets = ref<FormatPreset[]>([
    ...baseFormatPresets,
    customPreset.value
  ]);

  const currentPreset = ref<FormatPreset>(formatPresets.value[0]);

  const selectPreset = (preset: FormatPreset) => {
    currentPreset.value = preset;
  };

  const setCustomDimensions = (width: number, height: number): FormatPreset => {
    const validW = Math.max(50, Math.min(4096, Math.round(width)));
    const validH = Math.max(50, Math.min(4096, Math.round(height)));

    customDimensions.value = { width: validW, height: validH };
    saveStoredCustomSize(validW, validH);

    const updated = buildCustomPreset(validW, validH);
    customPreset.value = updated;

    const idx = formatPresets.value.findIndex((p) => p.id === 'custom');
    if (idx !== -1) {
      formatPresets.value[idx] = updated;
    } else {
      formatPresets.value.push(updated);
    }

    currentPreset.value = updated;
    return updated;
  };

  return {
    currentPreset,
    formatPresets,
    customDimensions,
    selectPreset,
    setCustomDimensions
  };
}

