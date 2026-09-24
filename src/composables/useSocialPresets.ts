import { ref } from 'vue';

export interface FormatPreset {
  id: string;
  name: string;
  category: 'social' | 'square' | 'story' | 'banner';
  ratioLabel: string;
  platform: string;
  icon: string;
  baseWidth: number;
  baseHeight: number;
  export2xLabel: string;
  description: string;
}

export const formatPresets: FormatPreset[] = [
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
    name: 'Stories / Reels / TikTok',
    category: 'story',
    ratioLabel: '9:16',
    platform: 'Instagram / TikTok / Shorts',
    icon: '📱',
    baseWidth: 288,
    baseHeight: 512,
    export2xLabel: '576 × 1024 px',
    description: 'Pantalla completa vertical para historias y videos cortos'
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

export function useSocialPresets() {
  const currentPreset = ref<FormatPreset>(formatPresets[0]);

  const selectPreset = (preset: FormatPreset) => {
    currentPreset.value = preset;
  };

  return {
    currentPreset,
    formatPresets,
    selectPreset
  };
}
