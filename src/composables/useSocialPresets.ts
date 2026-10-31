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
  targetWidth?: number;
  targetHeight?: number;
  targetScale?: number;
  export2xLabel: string;
  description: string;
}

export const baseFormatPresets: FormatPreset[] = [
  {
    id: 'sticker-compact',
    name: 'Sticker / Icono',
    category: 'square',
    ratioLabel: '1:1',
    platform: 'WhatsApp / Telegram / Stickers',
    icon: '✨',
    baseWidth: 512,
    baseHeight: 512,
    export2xLabel: '1024 × 1024 px',
    description: 'Tamaño estándar para stickers de WhatsApp y mensajería'
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
  }
];

export const CUSTOM_STORAGE_KEY = 'pixemoji_custom_canvas_size';
export const DEFAULT_CUSTOM_SIZE = { width: 1024, height: 1024 };

export function loadStoredCustomSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_SIZE;
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.width === 'number' && typeof parsed.height === 'number') {
        return {
          width: Math.max(50, Math.round(parsed.width)),
          height: Math.max(50, Math.round(parsed.height))
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

/**
 * Calcula el escalado manteniendo el aspect ratio con base 512px.
 * Si el usuario introduce 2048x2048 -> base 512x512 con escala deseada 4x.
 * Si introduce 2048x1024 -> base 512x256 con escala deseada 4x.
 * Soporta cualquier resolución alta (8x, 16x o más) con hasta 2 decimales.
 */
export function calculateCustomDimensions(targetW: number, targetH: number) {
  const validW = Math.max(50, Math.round(targetW));
  const validH = Math.max(50, Math.round(targetH));
  const maxDim = Math.max(validW, validH);

  let scale = 1;
  let baseW = validW;
  let baseH = validH;

  if (maxDim > 512) {
    scale = Math.round((maxDim / 512) * 100) / 100;
    baseW = Math.round(validW / scale);
    baseH = Math.round(validH / scale);
  }

  return {
    targetWidth: validW,
    targetHeight: validH,
    baseWidth: baseW,
    baseHeight: baseH,
    targetScale: scale
  };
}

export function buildCustomPreset(targetW: number, targetH: number): FormatPreset {
  const calc = calculateCustomDimensions(targetW, targetH);
  return {
    id: 'custom',
    name: 'Personalizado',
    category: 'custom',
    ratioLabel: `${calc.targetWidth} × ${calc.targetHeight} px`,
    platform: `Lienzo ${calc.baseWidth}×${calc.baseHeight} (${calc.targetScale}x)`,
    icon: '📐',
    baseWidth: calc.baseWidth,
    baseHeight: calc.baseHeight,
    targetWidth: calc.targetWidth,
    targetHeight: calc.targetHeight,
    targetScale: calc.targetScale,
    export2xLabel: `${calc.targetWidth} × ${calc.targetHeight} px (${calc.targetScale}x)`,
    description: `Lienzo base normalizado a ${calc.baseWidth}×${calc.baseHeight} px para exportar a ${calc.targetWidth}×${calc.targetHeight} px (${calc.targetScale}x)`
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

  const defaultPreset = formatPresets.value.find((p) => p.id === 'sticker-compact') || formatPresets.value[0];
  const currentPreset = ref<FormatPreset>(defaultPreset);

  const selectPreset = (preset: FormatPreset) => {
    currentPreset.value = preset;
  };

  const setCustomDimensions = (width: number, height: number): FormatPreset => {
    const validW = Math.max(50, Math.round(width));
    const validH = Math.max(50, Math.round(height));

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


