<template>
  <div v-if="selectedInfo" class="w-full bg-white/95 backdrop-blur-md border border-amber-300/80 rounded-2xl p-3 shadow-md shadow-amber-950/5 space-y-3 transition-all animate-fade-in">
    <!-- Header de Selección Contextual -->
    <div class="flex items-center justify-between text-xs pb-2 border-b border-amber-100">
      <div class="flex items-center gap-2 min-w-0">
        <span class="px-2 py-0.5 rounded-md bg-amber-100 font-extrabold text-[10px] text-amber-900 uppercase">
          {{ selectedInfo.type }}
        </span>
        <span class="font-bold text-[#2b1e1a] truncate max-w-[220px] text-xs">
          {{ selectedInfo.label }}
        </span>
        <span v-if="selectedInfo.isLocked" class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
          🔒 Fijada
        </span>
      </div>

      <!-- Acciones de elemento -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          @click="showAdvanced = !showAdvanced"
          :class="[
            'px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1',
            showAdvanced ? 'bg-[#d97736] text-white shadow-xs' : 'bg-amber-100/80 hover:bg-amber-200 text-amber-900'
          ]"
          title="Mostrar u ocultar controles avanzados"
        >
          <span>⚙️</span>
          <span>{{ showAdvanced ? 'Cerrar' : 'Avanzados' }}</span>
        </button>

        <button
          type="button"
          @click="$emit('toggleLock')"
          :class="[
            'w-7 h-7 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors',
            selectedInfo.isLocked ? 'bg-amber-500 text-white' : 'bg-stone-100 hover:bg-amber-100 text-stone-700'
          ]"
          :title="selectedInfo.isLocked ? 'Desbloquear capa' : 'Fijar capa'"
        >
          {{ selectedInfo.isLocked ? '🔒' : '🔓' }}
        </button>

        <button
          type="button"
          @click="$emit('delete')"
          class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs flex items-center justify-center cursor-pointer"
          title="Eliminar elemento (Supr)"
        >
          🗑️
        </button>
      </div>
    </div>

    <!-- CASO A: SI ES TEXTO -->
    <div v-if="selectedInfo.type === 'Texto'" class="space-y-2.5">
      <!-- Fila 1: Edición de texto y tipografía -->
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="liveText"
          @input="onTextChange"
          type="text"
          placeholder="Escribe tu texto..."
          class="flex-1 min-w-[150px] h-8 px-2.5 bg-amber-50/50 border border-[#debfa8] rounded-xl text-xs font-semibold text-[#2b1e1a] focus:outline-none focus:ring-1 focus:ring-[#d97736]"
        />

        <select
          v-model="liveFont"
          @change="onFontChange"
          class="h-8 px-2 bg-white border border-[#debfa8] rounded-xl text-xs font-semibold text-[#523e32] focus:outline-none focus:ring-1 focus:ring-[#d97736] cursor-pointer"
        >
          <option value="Impact">Impact (Meme)</option>
          <option value="Anton">Anton (Bold)</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Outfit">Outfit</option>
          <option value="Caveat">Caveat (Cómic)</option>
          <option value="Arial">Arial</option>
        </select>
      </div>

      <!-- Fila 2: Presets Rápidos 1-Clic para Texto -->
      <div class="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span class="text-[10px] font-bold text-[#8a6e60] uppercase tracking-wider mr-1">Estilos 1-Clic:</span>
        <button
          type="button"
          @click="$emit('applyTextPreset', 'meme')"
          class="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-extrabold hover:bg-neutral-800 transition-all cursor-pointer shadow-2xs"
        >
          💥 Meme Clásico
        </button>
        <button
          type="button"
          @click="$emit('applyTextPreset', 'sticker')"
          class="px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold hover:bg-amber-200 transition-all cursor-pointer shadow-2xs"
        >
          ✨ Sticker
        </button>
        <button
          type="button"
          @click="$emit('applyTextPreset', 'neon')"
          class="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-400 text-cyan-800 text-[11px] font-bold hover:bg-cyan-100 transition-all cursor-pointer shadow-2xs"
        >
          💡 Neón
        </button>
        <button
          type="button"
          @click="$emit('applyTextPreset', 'soft-shadow')"
          class="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-stone-700 text-[11px] font-semibold hover:bg-stone-200 transition-all cursor-pointer shadow-2xs"
        >
          🌑 Sombra
        </button>
        <button
          type="button"
          @click="$emit('applyTextPreset', 'clean')"
          class="px-2 py-1 rounded-lg bg-white border border-[#debfa8] text-stone-600 text-[11px] font-semibold hover:bg-amber-50 transition-all cursor-pointer"
        >
          🧼 Plano
        </button>
      </div>

      <!-- Sección Avanzada Modular: Relleno | Borde | Sombra en 1 fila desktop -->
      <div v-show="showAdvanced" class="pt-2 animate-fade-in">
        <TextAdvancedControls
          :fill="selectedInfo.fill"
          :stroke="selectedInfo.stroke"
          :stroke-width="selectedInfo.strokeWidth"
          :shadow-color="selectedInfo.shadowColor"
          :shadow-blur="selectedInfo.shadowBlur"
          :shadow-offset-x="selectedInfo.shadowOffsetX"
          :shadow-offset-y="selectedInfo.shadowOffsetY"
          :shadow-opacity="selectedInfo.shadowOpacity"
          @update-fill="$emit('updateText', { textColor: $event })"
          @update-stroke="$emit('updateStroke', $event)"
          @update-shadow="$emit('updateShadow', $event)"
        />
      </div>
    </div>

    <!-- CASO B: SI ES IMAGEN O EMOJI -->
    <div v-else class="space-y-2.5">
      <!-- Fila 1: Presets 1-Clic -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-[10px] font-bold text-[#8a6e60] uppercase tracking-wider mr-1">Efectos 1-Clic:</span>
        <button
          type="button"
          @click="$emit('applyImagePreset', 'sticker')"
          class="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold hover:from-amber-600 hover:to-orange-600 transition-all cursor-pointer shadow-2xs"
        >
          ✨ Borde Sticker
        </button>
        <button
          type="button"
          @click="$emit('applyImagePreset', 'neon', '#00f0ff')"
          class="px-2.5 py-1 rounded-lg bg-cyan-100 border border-cyan-400 text-cyan-900 text-[11px] font-bold hover:bg-cyan-200 transition-all cursor-pointer shadow-2xs"
        >
          💎 Neón Cyan
        </button>
        <button
          type="button"
          @click="$emit('applyImagePreset', 'neon', '#ff007f')"
          class="px-2.5 py-1 rounded-lg bg-pink-100 border border-pink-400 text-pink-900 text-[11px] font-bold hover:bg-pink-200 transition-all cursor-pointer shadow-2xs"
        >
          💖 Neón Rosa
        </button>
        <button
          type="button"
          @click="$emit('applyImagePreset', 'soft-shadow')"
          class="px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-stone-700 text-[11px] font-semibold hover:bg-stone-200 transition-all cursor-pointer shadow-2xs"
        >
          🌑 Sombra
        </button>
        <button
          type="button"
          @click="$emit('applyImagePreset', 'clean')"
          class="px-2 py-1 rounded-lg bg-white border border-[#debfa8] text-stone-600 text-[11px] font-semibold hover:bg-amber-50 transition-all cursor-pointer"
        >
          🧼 Normal
        </button>
      </div>

      <!-- Fila 2: Orientación -->
      <div class="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-100/80">
        <span class="text-[10px] font-bold text-[#8a6e60] uppercase tracking-wider mr-1">Orientación:</span>
        <button
          type="button"
          @click="$emit('flipH')"
          class="px-2.5 py-1 rounded-lg bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 text-[11px] font-semibold cursor-pointer"
        >
          ↔️ Reflejar
        </button>
        <button
          type="button"
          @click="$emit('flipV')"
          class="px-2.5 py-1 rounded-lg bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 text-[11px] font-semibold cursor-pointer"
        >
          ↕️ Invertir
        </button>
        <button
          type="button"
          @click="$emit('center')"
          class="px-2.5 py-1 rounded-lg bg-white border border-[#debfa8] text-[#523e32] hover:bg-amber-50 text-[11px] font-semibold cursor-pointer"
        >
          🎯 Centrar
        </button>
      </div>

      <!-- Sección Avanzada para Emoji / Imagen (Shadow Pad 2D) -->
      <div v-show="showAdvanced" class="pt-2 animate-fade-in">
        <ShadowPad
          :offset-x="selectedInfo.shadowOffsetX"
          :offset-y="selectedInfo.shadowOffsetY"
          :blur="selectedInfo.shadowBlur"
          :color="selectedInfo.shadowColor"
          :opacity="selectedInfo.shadowOpacity"
          @update="$emit('updateShadow', $event)"
        />
      </div>
    </div>
  </div>

  <!-- ESTADO EN REPOSO: SIN SELECCIÓN -->
  <div v-else class="w-full py-2 px-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs text-[#735a4d]">
    <div class="flex items-center gap-2">
      <span class="text-base">👆</span>
      <span class="text-[11px] font-medium">
        Haz clic en cualquier elemento del lienzo para editarlo o usa los tiradores para rotar y escalar.
      </span>
    </div>
    <button
      type="button"
      @click="$emit('openBgTab')"
      class="text-[10px] font-bold text-[#d97736] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
    >
      <span>🎨 Ajustar Fondo</span>
      <span>→</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TextAdvancedControls from '../studio/TextAdvancedControls.vue';
import ShadowPad from '../studio/ShadowPad.vue';

const props = defineProps<{
  selectedInfo: {
    label: string;
    type: string;
    isLocked?: boolean;
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowOpacity?: number;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'updateText', options: { text?: string; fontFamily?: string; textColor?: string; strokeColor?: string; strokeWidth?: number }): void;
  (e: 'applyTextPreset', preset: 'meme' | 'sticker' | 'neon' | 'soft-shadow' | 'clean'): void;
  (e: 'applyImagePreset', preset: 'sticker' | 'neon' | 'soft-shadow' | 'clean', customColor?: string): void;
  (e: 'updateShadow', opts: { enabled?: boolean; offsetX?: number; offsetY?: number; blur?: number; color?: string; opacity?: number }): void;
  (e: 'updateStroke', opts: { hasStroke: boolean; color?: string; width?: number }): void;
  (e: 'flipH'): void;
  (e: 'flipV'): void;
  (e: 'center'): void;
  (e: 'toggleLock'): void;
  (e: 'delete'): void;
  (e: 'openBgTab'): void;
}>();

const showAdvanced = ref(false);
const liveText = ref('');
const liveFont = ref('Impact');

watch(
  () => props.selectedInfo,
  (info) => {
    if (info && info.type === 'Texto') {
      liveText.value = info.text || '';
      liveFont.value = info.fontFamily || 'Impact';
    }
  },
  { immediate: true }
);

const onTextChange = () => {
  emit('updateText', { text: liveText.value });
};

const onFontChange = () => {
  emit('updateText', { fontFamily: liveFont.value });
};
</script>
