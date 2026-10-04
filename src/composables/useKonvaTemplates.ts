import type { useKonvaStage, GradientPreset } from './useKonvaStage';
import type { useKonvaLayers } from './useKonvaLayers';
import type { useKonvaEffects } from './useKonvaEffects';

export interface StudioTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  badge: string;
}

export const availableTemplates: StudioTemplate[] = [
  {
    id: 'meme',
    name: 'Meme Clásico',
    icon: '🤣',
    description: 'Texto superior de impacto, emoji de reacción central y remate.',
    badge: 'Popular'
  },
  {
    id: 'versus',
    name: 'Versus (VS)',
    icon: '⚔️',
    description: 'Duelo épico entre 2 emojis con uno reflejado e insignia VS central.',
    badge: 'Trending'
  },
  {
    id: 'sticker-glow',
    name: 'Sticker Showcase',
    icon: '✨',
    description: 'Fondo oscuro con emoji troquelado en blanco y resplandor neón.',
    badge: 'Pro'
  },
  {
    id: 'wallpaper-pattern',
    name: 'Wallpaper Stories',
    icon: '📱',
    description: 'Formato vertical 9:16 con patrón repetido y sticker destacado.',
    badge: 'Viral'
  }
];

export function useKonvaTemplates(
  stageContext: ReturnType<typeof useKonvaStage>,
  layersContext: ReturnType<typeof useKonvaLayers>,
  effectsContext: ReturnType<typeof useKonvaEffects>,
  onPresetChangeReq?: (width: number, height: number, presetId: string) => void
) {
  const { setBgColor, setBgGradient, gradientPresets, changeDimensions } = stageContext;
  const { clearAll, addEmoji, addText, fillEmojiPattern } = layersContext;
  const { applyStickerEffect, applyGlowEffect, flipHorizontal } = effectsContext;

  const applyTemplate = (templateId: string) => {
    switch (templateId) {
      case 'meme': {
        if (onPresetChangeReq) onPresetChangeReq(512, 512, 'square-post');
        else changeDimensions(512, 512);

        setBgColor('#ffffff');
        clearAll();

        addText({
          text: 'CUANDO POR FIN...',
          fontFamily: 'Impact',
          fontSize: 40,
          textColor: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 3
        }, { x: 256, y: 70 });

        addEmoji('🤯', { x: 256, y: 256, fontSize: 130 });

        addText({
          text: '...FUNCIONA A LA PRIMERA',
          fontFamily: 'Impact',
          fontSize: 34,
          textColor: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 3
        }, { x: 256, y: 440 });
        break;
      }

      case 'versus': {
        if (onPresetChangeReq) onPresetChangeReq(512, 512, 'square-post');
        else changeDimensions(512, 512);

        const flameGrad = gradientPresets.find((g: GradientPreset) => g.id === 'fire') || gradientPresets[0];
        setBgGradient(flameGrad);
        clearAll();

        // Left emoji
        addEmoji('🦁', { x: 130, y: 256, fontSize: 110 });

        // Center VS text
        addText({
          text: 'VS',
          fontFamily: 'Impact',
          fontSize: 60,
          textColor: '#facc15',
          strokeColor: '#dc2626',
          strokeWidth: 4
        }, { x: 256, y: 256 });

        // Right emoji (mirrored)
        const rightEmoji = addEmoji('🤖', { x: 382, y: 256, fontSize: 110 });
        if (rightEmoji) {
          flipHorizontal();
        }
        break;
      }

      case 'sticker-glow': {
        if (onPresetChangeReq) onPresetChangeReq(512, 512, 'square-post');
        else changeDimensions(512, 512);

        const darkGrad = gradientPresets.find((g: GradientPreset) => g.id === 'dark') || gradientPresets[8];
        setBgGradient(darkGrad);
        clearAll();

        const rocket = addEmoji('🚀', { x: 256, y: 230, fontSize: 155 });
        if (rocket) {
          applyStickerEffect({
            strokeColor: '#ffffff',
            strokeWidth: 14,
            shadowBlur: 16,
            shadowColor: '#00e5ff'
          });
          applyGlowEffect('#00f0ff', 24, 0.95);
        }

        addText({
          text: 'TOP TIER',
          fontFamily: 'Impact',
          fontSize: 38,
          textColor: '#38bdf8',
          strokeColor: '#0c4a6e',
          strokeWidth: 2
        }, { x: 256, y: 430 });
        break;
      }

      case 'wallpaper-pattern': {
        if (onPresetChangeReq) onPresetChangeReq(512, 910, 'story-reels');
        else changeDimensions(512, 910);

        const peachGrad = gradientPresets.find((g: GradientPreset) => g.id === 'peach') || gradientPresets[1];
        setBgGradient(peachGrad);
        clearAll();

        fillEmojiPattern('✨');

        const crown = addEmoji('👑', { x: 256, y: 455, fontSize: 140 });
        if (crown) {
          applyStickerEffect({
            strokeColor: '#ffffff',
            strokeWidth: 12,
            shadowBlur: 14
          });
        }
        break;
      }
    }
  };

  return {
    availableTemplates,
    applyTemplate
  };
}
