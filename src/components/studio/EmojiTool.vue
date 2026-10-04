<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold uppercase tracking-wider text-text-main">
        Añadir Emojis al Lienzo
      </span>
      <button
        type="button"
        @click="$emit('togglePicker')"
        class="text-[11px] font-semibold text-primary-600 hover:underline flex items-center gap-1 cursor-pointer"
      >
        <span>{{ isPickerOpen ? 'Ocultar Buscador' : '🔍 Selector Completo' }}</span>
      </button>
    </div>

    <!-- Quick Emoji Presets -->
    <div>
      <p class="text-[11px] text-text-subtle mb-2 font-medium">
        Haz clic en cualquier emoji para añadirlo al lienzo:
      </p>
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="item in quickEmojis"
          :key="item.name"
          type="button"
          @click="$emit('selectEmoji', item.char)"
          class="p-2 rounded-xl bg-white border border-app-border hover:bg-primary-100/70 hover:border-primary-500 transition-all flex flex-col items-center justify-center cursor-pointer select-none group shadow-2xs"
          :title="item.name"
        >
          <span class="text-2xl transition-transform group-hover:scale-125">{{ item.char }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quickEmojis: { name: string; char: string }[];
  isPickerOpen: boolean;
}>();

defineEmits<{
  (e: 'selectEmoji', char: string): void;
  (e: 'togglePicker'): void;
}>();
</script>
