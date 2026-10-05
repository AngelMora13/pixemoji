<template>
  <div class="space-y-1" data-purpose="slider-control">
    <div class="flex justify-between items-center text-[10px] font-bold uppercase text-text-main">
      <span>{{ label }}</span>
      <span class="font-mono font-bold text-primary-600">
        {{ formattedValue }}{{ unit }}
        <span v-if="hint" class="text-[9px] text-text-subtle font-normal ml-0.5">{{ hint }}</span>
      </span>
    </div>
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      @input="onInput"
      class="w-full accent-primary-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    multiplier?: number;
    hint?: string;
    disabled?: boolean;
    decimals?: number;
  }>(),
  {
    min: 0,
    max: 100,
    step: 1,
    unit: '',
    multiplier: 1,
    hint: '',
    disabled: false,
    decimals: 0
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}>();

const formattedValue = computed(() => {
  const scaled = props.modelValue * props.multiplier;
  return props.decimals > 0
    ? scaled.toFixed(props.decimals)
    : Math.round(scaled).toString();
});

const onInput = (e: Event) => {
  const val = Number((e.target as HTMLInputElement).value);
  if (!isNaN(val)) {
    emit('update:modelValue', val);
    emit('change', val);
  }
};
</script>
