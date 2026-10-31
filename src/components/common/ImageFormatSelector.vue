<template>
  <div :class="containerClass">
    <div class="flex items-center justify-between mb-2">
      <label class="text-[11px] md:text-xs font-bold uppercase tracking-wider text-text-main">
        {{ label }}
      </label>
      <span class="text-[10px] md:text-[11px] font-mono font-semibold uppercase text-primary-600">
        .{{ extension }}
      </span>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="fmt in formatOptions"
        :key="fmt.val"
        type="button"
        @click="selectFormat(fmt.val)"
        :class="[
          'py-2 px-1.5 rounded-xl border transition-all cursor-pointer text-center select-none flex flex-col items-center justify-center gap-0.5',
          currentFormat === fmt.val
            ? 'bg-primary-600 text-white border-primary-600 shadow-brand'
            : 'bg-white text-text-main border-app-border-strong hover:bg-primary-50/70'
        ]"
      >
        <span class="text-xs font-bold font-mono">{{ fmt.label }}</span>
        <span
          :class="[
            'text-[9px] font-semibold leading-tight',
            currentFormat === fmt.val ? 'text-primary-100' : 'text-text-subtle'
          ]"
        >
          {{ fmt.tag }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  type ExportImageFormat,
  formatOptions,
  getFormatExtension
} from '../../types/export';

const props = withDefaults(
  defineProps<{
    modelValue?: ExportImageFormat;
    label?: string;
    containerClass?: string;
  }>(),
  {
    modelValue: 'png',
    label: 'Tipo de Imagen',
    containerClass: ''
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', format: ExportImageFormat): void;
}>();

const currentFormat = computed(() => props.modelValue || 'png');
const extension = computed(() => getFormatExtension(currentFormat.value));

const selectFormat = (fmt: ExportImageFormat) => {
  emit('update:modelValue', fmt);
};
</script>
