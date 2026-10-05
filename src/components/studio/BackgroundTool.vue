<template>
  <div class="space-y-4">
    <div>
      <label class="block text-xs font-bold uppercase tracking-wider text-text-main mb-2">
        Fondo del Lienzo
      </label>

      <!-- Mode Selector: Transparente / Color / Degradado -->
      <div class="grid grid-cols-3 gap-1.5 p-1 bg-primary-100/70 rounded-2xl border border-primary-200 mb-3">
        <button
          type="button"
          @click="$emit('setTransparent')"
          :class="[
            'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
            isTransparent
              ? 'bg-white text-primary-600 shadow-xs ring-1 ring-app-border-strong'
              : 'text-text-muted hover:text-text-main'
          ]"
        >
          <span>🏁</span>
          <span class="truncate">Transp.</span>
        </button>

        <button
          type="button"
          @click="$emit('setColor', bgColor || '#ffffff')"
          :class="[
            'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
            bgMode === 'solid'
              ? 'bg-white text-primary-600 shadow-xs ring-1 ring-app-border-strong'
              : 'text-text-muted hover:text-text-main'
          ]"
        >
          <span>🎨</span>
          <span class="truncate">Sólido</span>
        </button>

        <button
          type="button"
          @click="onSelectFirstGradient"
          :class="[
            'py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
            bgMode === 'gradient'
              ? 'bg-white text-primary-600 shadow-xs ring-1 ring-app-border-strong'
              : 'text-text-muted hover:text-text-main'
          ]"
        >
          <span>🌅</span>
          <span class="truncate">Degradado</span>
        </button>
      </div>

      <!-- MODO 1: COLOR SÓLIDO -->
      <div v-if="bgMode === 'solid'" class="space-y-3 p-3 bg-white border border-app-border rounded-2xl shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text-main">Color del lienzo:</span>
          <ColorPalettePicker
            :current-color="bgColor || '#ffffff'"
            compact
            popover-align="left"
            title="Seleccionar color de fondo"
            @live-change="$emit('setColor', $event)"
            @commit-change="$emit('setColor', $event)"
          />
        </div>
      </div>

      <!-- MODO 2: DEGRADADOS DE MODA -->
      <div v-if="bgMode === 'gradient'" class="space-y-2.5 p-3 bg-white border border-app-border rounded-2xl shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text-main">Degradados de Tendencia:</span>
          <span class="text-[10px] text-text-subtle">{{ gradientPresets.length }} estilos</span>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="preset in gradientPresets"
            :key="preset.id"
            type="button"
            @click="$emit('setGradient', preset)"
            :class="[
              'h-12 rounded-xl p-1.5 flex flex-col justify-end text-left border transition-all cursor-pointer hover:scale-105 shadow-2xs',
              activeGradient?.id === preset.id
                ? 'ring-2 ring-primary-500 border-white'
                : 'border-white/50'
            ]"
            :style="{ background: preset.cssPreview }"
          >
            <span class="text-[9px] font-extrabold text-white drop-shadow-md truncate leading-tight">
              {{ preset.name }}
            </span>
          </button>
        </div>

        <!-- SECCIÓN AVANZADA: CREAR DEGRADADO PERSONALIZADO -->
        <div class="pt-2.5 mt-2 border-t border-app-border space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-text-main">✨ Crear Degradado Propio:</span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Color 1 -->
            <div class="flex-1 space-y-0.5">
              <span class="text-[9px] text-text-subtle font-bold block">Color Inicio</span>
              <div class="flex items-center gap-1.5">
                <ColorPalettePicker
                  :current-color="customColor1"
                  compact
                  popover-align="left"
                  title="Color de inicio"
                  @live-change="customColor1 = $event"
                  @commit-change="customColor1 = $event"
                />
                <span class="font-mono text-[10px] text-text-main">{{ customColor1 }}</span>
              </div>
            </div>

            <!-- Color 2 -->
            <div class="flex-1 space-y-0.5">
              <span class="text-[9px] text-text-subtle font-bold block">Color Fin</span>
              <div class="flex items-center gap-1.5">
                <ColorPalettePicker
                  :current-color="customColor2"
                  compact
                  popover-align="left"
                  title="Color de fin"
                  @live-change="customColor2 = $event"
                  @commit-change="customColor2 = $event"
                />
                <span class="font-mono text-[10px] text-text-main">{{ customColor2 }}</span>
              </div>
            </div>

            <!-- Botón Aplicar -->
            <button
              type="button"
              @click="onApplyCustomGradient"
              class="px-3 py-2 rounded-xl text-white font-extrabold text-xs shadow-xs hover:scale-105 transition-all cursor-pointer shrink-0 self-end"
              :style="{ background: `linear-gradient(135deg, ${customColor1}, ${customColor2})` }"
              title="Aplicar degradado personalizado al lienzo"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <!-- HERRAMIENTA: PATRÓN DE EMOJIS (WALLPAPER) -->
      <div class="mt-4 p-3 bg-white border border-app-border rounded-2xl space-y-2.5 shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-text-main flex items-center gap-1">
            <span>✨</span>
            <span>Patrón de Emojis de Fondo</span>
          </span>
          <button
            type="button"
            @click="$emit('clearPattern')"
            class="text-[10px] font-semibold text-red-600 hover:underline cursor-pointer"
          >
            Limpiar patrón
          </button>
        </div>

        <p class="text-[10px] text-text-subtle">
          Rellena todo el fondo en cuadrícula con tu emoji favorito en marca de agua suave:
        </p>

        <!-- Emojis rápidos para patrón -->
        <div class="flex flex-wrap gap-1">
          <button
            v-for="e in patternEmojiPresets"
            :key="e"
            type="button"
            @click="onApplyPattern(e)"
            class="w-7 h-7 rounded-lg bg-primary-50 hover:bg-primary-100 border border-app-border-strong flex items-center justify-center text-sm cursor-pointer transition-transform hover:scale-110"
          >
            {{ e }}
          </button>
        </div>

        <!-- Custom emoji pattern input -->
        <div class="flex gap-1.5 pt-1">
          <input
            v-model="customPatternEmoji"
            type="text"
            maxlength="2"
            placeholder="Emoji..."
            class="w-16 px-2 py-1 bg-white border border-app-border-strong rounded-xl text-center text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary-500 shadow-2xs"
          />
          <button
            type="button"
            @click="onApplyCustomPattern"
            class="flex-1 py-1 px-2.5 rounded-xl bg-primary-gradient text-white font-bold text-xs shadow-2xs hover:opacity-95 transition-all cursor-pointer"
          >
            Llenar con este Emoji
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { GradientPreset } from '../../composables/useKonvaStage';
import ColorPalettePicker from '../common/ColorPalettePicker.vue';

const props = defineProps<{
  isTransparent: boolean;
  bgMode: 'transparent' | 'solid' | 'gradient';
  bgColor: string;
  activeGradient: GradientPreset | null;
  gradientPresets: GradientPreset[];
}>();

const emit = defineEmits<{
  (e: 'setTransparent'): void;
  (e: 'setColor', color: string): void;
  (e: 'setGradient', preset: GradientPreset): void;
  (e: 'fillPattern', char: string): void;
  (e: 'clearPattern'): void;
}>();

const customPatternEmoji = ref('✨');
const patternEmojiPresets = ['🧁', '✨', '🍕', '🚀', '🐱', '🔥', '💀', '💖'];

const customColor1 = ref('#833ab4');
const customColor2 = ref('#fd1d1d');

const onSelectFirstGradient = () => {
  if (props.gradientPresets.length > 0) {
    emit('setGradient', props.activeGradient || props.gradientPresets[0]);
  }
};

const onApplyCustomGradient = () => {
  const css = `linear-gradient(135deg, ${customColor1.value}, ${customColor2.value})`;
  emit('setGradient', {
    id: 'custom-grad',
    name: 'Personalizado',
    colors: [customColor1.value, customColor2.value],
    cssPreview: css
  });
};

const onApplyPattern = (emojiChar: string) => {
  emit('fillPattern', emojiChar);
};

const onApplyCustomPattern = () => {
  if (customPatternEmoji.value.trim()) {
    emit('fillPattern', customPatternEmoji.value.trim());
  }
};
</script>
