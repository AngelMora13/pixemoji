<template>
  <div class="glass-card rounded-3xl p-6 md:p-7 border border-app-border shadow-soft space-y-5">
    <!-- 1. Emoji Quick Selector (Buscador, Atajos FIFO, Pegar y Entrada Móvil) -->
    <div>
      <EmojiQuickSelector
        :model-value="selectedChar"
        title="1. Selecciona o Pega tu Emoji"
        icon="✨"
        storage-key="pixemoji_exporter_shortcuts"
        @select="$emit('update:selectedChar', $event)"
      />
    </div>

    <!-- 2. Resolución & 3. Tipo de Imagen -->
    <div class="pt-2 border-t border-app-border space-y-4">
      <!-- Resolución de Descarga -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-bold uppercase tracking-wider text-text-main">
            2. Resolución de Descarga
          </label>
          <span class="text-[11px] text-text-subtle font-mono font-semibold">
            {{ targetResolution }} &times; {{ targetResolution }} px
          </span>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="item in resolutionOptions"
            :key="item.val"
            type="button"
            @click="$emit('update:targetResolution', item.val)"
            :class="[
              'py-2 px-1.5 rounded-xl border transition-all cursor-pointer text-center select-none flex flex-col items-center justify-center gap-0.5',
              targetResolution === item.val
                ? 'bg-primary-600 text-white border-primary-600 shadow-brand'
                : 'bg-white text-text-main border-app-border-strong hover:bg-primary-50/70'
            ]"
          >
            <span class="text-xs font-bold font-mono">{{ item.label }}</span>
            <span :class="['text-[9px] font-semibold', targetResolution === item.val ? 'text-primary-100' : 'text-text-subtle']">
              {{ item.tag }}
            </span>
          </button>
        </div>
      </div>

      <!-- 3. Tipo de Imagen -->
      <ImageFormatSelector
        :model-value="imageFormat"
        label="3. Tipo de Imagen"
        @update:model-value="$emit('update:imageFormat', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmojiQuickSelector from './EmojiQuickSelector.vue';
import ImageFormatSelector from './ImageFormatSelector.vue';
import type { ExportImageFormat } from '../../types/export';

withDefaults(
  defineProps<{
    selectedChar: string;
    targetResolution: number;
    imageFormat?: ExportImageFormat;
  }>(),
  {
    imageFormat: 'png'
  }
);

defineEmits<{
  (e: 'update:selectedChar', char: string): void;
  (e: 'update:targetResolution', val: number): void;
  (e: 'update:imageFormat', val: ExportImageFormat): void;
}>();

const resolutionOptions = [
  { label: '128px', val: 128, tag: 'Icono' },
  { label: '256px', val: 256, tag: 'Estándar' },
  { label: '512px', val: 512, tag: 'HD' },
  { label: '1024px', val: 1024, tag: 'Ultra' }
];
</script>
