<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-bold uppercase tracking-wider text-[#523e32]">
        Presets de Redes Sociales
      </span>
      <span class="text-[10px] text-[#8a6e60] font-medium">
        Base 512px &bull; HD 1024px
      </span>
    </div>
    <p class="text-[11px] text-[#8a6e60] mb-2">
      Selecciona el formato deseado para adaptar el lienzo con la proporción oficial:
    </p>

    <!-- Presets list -->
    <div class="space-y-2">
      <button
        v-for="preset in presets"
        :key="preset.id"
        type="button"
        @click="$emit('select', preset)"
        :class="[
          'w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 cursor-pointer',
          currentPreset.id === preset.id
            ? 'bg-amber-100/90 border-[#d97736] shadow-xs ring-2 ring-[#d97736]/30'
            : 'bg-white/80 border-[#ebd8ca] hover:bg-amber-50/60'
        ]"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="text-2xl shrink-0">{{ preset.icon }}</span>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-[#2b1e1a] truncate">{{ preset.name }}</span>
              <span class="px-1.5 py-0.2 rounded bg-amber-200/80 text-[10px] font-mono font-extrabold text-amber-900 shrink-0">
                {{ preset.ratioLabel }}
              </span>
            </div>
            <p class="text-[10px] text-[#735a4d] truncate">{{ preset.platform }}</p>
          </div>
        </div>

        <div class="text-right shrink-0">
          <span class="text-[11px] font-mono font-bold text-[#d97736] block">
            {{ preset.baseWidth }}&times;{{ preset.baseHeight }}
          </span>
          <span class="text-[9px] text-[#8a6e60] block font-mono">
            HD: {{ preset.export2xLabel }}
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormatPreset } from '../../composables/useSocialPresets';

defineProps<{
  presets: FormatPreset[];
  currentPreset: FormatPreset;
}>();

defineEmits<{
  (e: 'select', preset: FormatPreset): void;
}>();
</script>
