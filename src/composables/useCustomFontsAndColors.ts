import { ref } from 'vue';

export interface SavedFont {
  name: string;
  url: string;
}

const FONTS_STORAGE_KEY = 'pixemoji_saved_fonts';
const COLORS_STORAGE_KEY = 'pixemoji_saved_colors';
const MAX_SAVED_ITEMS = 10;

export const DEFAULT_PRESET_FONTS = [
  { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern)' },
  { name: 'Anton', label: 'Anton (Bold Display)' },
  { name: 'Impact', label: 'Impact (Meme)' },
  { name: 'Outfit', label: 'Outfit (Clean Pro)' },
  { name: 'Montserrat', label: 'Montserrat (Versátil)' },
  { name: 'Caveat', label: 'Caveat (Cómic)' },
  { name: 'Arial', label: 'Arial (Clásico)' }
];

export const DEFAULT_BASE_PALETTE = [
  '#1e293b',
  '#ffffff',
  '#64748b',
  '#ef4444',
  '#f97316',
  '#facc15',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899'
];

export function extractGoogleFontUrl(input: string): { url: string; family: string; name: string } | null {
  if (!input || !input.trim()) return null;
  const raw = input.trim();

  // 1. Direct URL, <link>, or @import
  const urlRegex = /(https:\/\/fonts\.googleapis\.com\/css(?:2)?\?[^"'\)\s>]+)/i;
  const match = raw.match(urlRegex);
  if (match) {
    let url = match[1].trim().replace(/&amp;/g, '&');
    const familyMatch = url.match(/[?&]family=([^:&]+)/i);
    if (familyMatch) {
      const family = decodeURIComponent(familyMatch[1].replace(/\+/g, ' ')).trim();
      return { url, family, name: family };
    }
  }

  // 2. Plain font family name fallback (e.g. "Lobster", "Playfair Display", "Caveat")
  if (/^[a-zA-Z0-9\s\-]+$/.test(raw) && raw.length > 1 && !raw.includes('/')) {
    const family = raw.trim();
    const encoded = encodeURIComponent(family.replace(/\s+/g, '+'));
    const url = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`;
    return { url, family, name: family };
  }

  return null;
}

export function injectGoogleFontLink(url: string, id?: string) {
  if (typeof document === 'undefined') return;
  const linkId = id || `gf-${btoa(url).slice(0, 16)}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

export function useCustomFontsAndColors() {
  const savedFonts = ref<SavedFont[]>([]);
  const savedColors = ref<string[]>([]);

  const initFromStorage = () => {
    if (typeof window === 'undefined') return;

    // Load fonts safely, sanitizing any corrupted previous entries
    try {
      const rawFonts = localStorage.getItem(FONTS_STORAGE_KEY);
      if (rawFonts) {
        const parsed: any[] = JSON.parse(rawFonts);
        const valid: SavedFont[] = parsed
          .filter(f => f && f.url)
          .map(f => {
            let fontName = f.name || f.family;
            if (!fontName) {
              const ext = extractGoogleFontUrl(f.url);
              fontName = ext?.name || 'Fuente Custom';
            }
            return {
              name: String(fontName).trim(),
              url: f.url
            };
          })
          .filter(f => f.name.length > 0);
        savedFonts.value = valid;
        valid.forEach(f => injectGoogleFontLink(f.url));
        localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(valid));
      }
    } catch {
      savedFonts.value = [];
    }

    // Load colors
    try {
      const rawColors = localStorage.getItem(COLORS_STORAGE_KEY);
      if (rawColors) {
        savedColors.value = JSON.parse(rawColors);
      }
    } catch {
      savedColors.value = [];
    }
  };

  const addCustomFont = (font: SavedFont) => {
    if (!font || !font.name || !font.url) return;
    injectGoogleFontLink(font.url);
    const targetName = String(font.name).toLowerCase();
    const filtered = savedFonts.value.filter(
      f => f && f.name && String(f.name).toLowerCase() !== targetName
    );
    const updated = [font, ...filtered].slice(0, MAX_SAVED_ITEMS);
    savedFonts.value = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const deleteCustomFont = (fontName: string) => {
    if (!fontName) return;
    const targetName = String(fontName).toLowerCase();
    const updated = savedFonts.value.filter(
      f => f && f.name && String(f.name).toLowerCase() !== targetName
    );
    savedFonts.value = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const addCustomColor = (color: string) => {
    const clean = color.trim().toLowerCase();
    const filtered = savedColors.value.filter(c => c.toLowerCase() !== clean);
    const updated = [color, ...filtered].slice(0, MAX_SAVED_ITEMS);
    savedColors.value = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  const replaceCustomColor = (oldColor: string, newColor: string) => {
    if (!newColor) return;
    const cleanNew = newColor.trim().toLowerCase();
    const cleanOld = (oldColor || '').trim().toLowerCase();
    const withoutBoth = savedColors.value.filter(
      c => c.toLowerCase() !== cleanOld && c.toLowerCase() !== cleanNew
    );
    const updated = [newColor, ...withoutBoth].slice(0, MAX_SAVED_ITEMS);
    savedColors.value = updated;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(COLORS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  initFromStorage();

  return {
    savedFonts,
    savedColors,
    addCustomFont,
    deleteCustomFont,
    addCustomColor,
    replaceCustomColor
  };
}
