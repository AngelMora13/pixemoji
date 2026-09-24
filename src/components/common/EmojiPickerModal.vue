<template>
  <div v-if="isOpen" class="p-2.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col items-center">
    <div class="w-full flex justify-between items-center mb-2 px-1">
      <span class="text-[11px] text-[#8a6e60] font-medium">
        Buscador completo de Unicode:
      </span>
      <button
        type="button"
        @click="$emit('close')"
        class="text-[11px] font-bold text-[#d97736] hover:underline cursor-pointer"
      >
        Cerrar
      </button>
    </div>
    <div ref="containerRef" class="w-full flex justify-center">
      <emoji-picker ref="pickerEl" class="light"></emoji-picker>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', unicode: string, name: string): void;
  (e: 'close'): void;
}>();

const pickerEl = ref<any>(null);

onMounted(() => {
  const picker = pickerEl.value || document.querySelector('emoji-picker');
  if (picker) {
    picker.addEventListener('emoji-click', (event: any) => {
      const char = event.detail?.unicode || event.detail?.emoji?.unicode;
      const name = event.detail?.emoji?.annotation || 'emoji';
      if (char) {
        emit('select', char, name);
      }
    });
  }
});
</script>
