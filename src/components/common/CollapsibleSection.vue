<template>
  <div class="p-3.5 rounded-2xl bg-app-header/60 border border-app-border space-y-3" data-purpose="collapsible-section">
    <!-- Header con Título, Icono y Switch On/Off -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <slot name="icon">
          <span v-if="icon" class="text-base select-none">{{ icon }}</span>
          <span v-else-if="dotColor" class="w-3.5 h-3.5 rounded-full shadow-xs" :style="{ backgroundColor: dotColor }"></span>
        </slot>
        <span class="text-xs font-bold text-text-main">{{ title }}</span>
      </div>

      <label class="inline-flex items-center gap-1.5 cursor-pointer select-none">
        <input
          type="checkbox"
          :checked="modelValue"
          @change="onToggle"
          class="rounded border-stone-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5 accent-primary-600 cursor-pointer"
        />
        <span :class="['text-xs font-bold', modelValue ? 'text-primary-600' : 'text-text-muted']">
          {{ modelValue ? activeLabel : inactiveLabel }}
        </span>
      </label>
    </div>

    <!-- Contenido cuando está Activo -->
    <div v-if="modelValue" class="pt-0.5 space-y-2.5">
      <slot />
    </div>

    <!-- Mensaje cuando está Desactivado -->
    <p v-else-if="emptyText" class="text-xs text-text-subtle italic">
      {{ emptyText }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    modelValue: boolean;
    icon?: string;
    dotColor?: string;
    activeLabel?: string;
    inactiveLabel?: string;
    emptyText?: string;
  }>(),
  {
    activeLabel: 'Activo',
    inactiveLabel: 'Desactivado',
    emptyText: ''
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'change', value: boolean): void;
}>();

const onToggle = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
  emit('change', target.checked);
};
</script>
