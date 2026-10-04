<template>
  <div v-if="isOpen" class="p-2.5 bg-primary-50/80 border border-primary-200 rounded-2xl flex flex-col items-center w-full">
    <div class="w-full flex justify-between items-center mb-2 px-1">
      <span class="text-[11px] text-text-subtle font-medium">
        Buscador completo de Unicode:
      </span>
      <button
        type="button"
        @click="$emit('close')"
        class="text-[11px] font-bold text-primary-600 hover:underline cursor-pointer"
      >
        Cerrar
      </button>
    </div>
    <div ref="containerRef" class="w-full flex justify-center overflow-hidden">
      <emoji-picker
        ref="pickerEl"
        class="light w-full max-w-full"
        @emoji-click="onEmojiClick"
      ></emoji-picker>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', unicode: string, name: string): void;
  (e: 'close'): void;
}>();

const pickerEl = ref<any>(null);

const onEmojiClick = (event: any) => {
  const char = event.detail?.unicode || event.detail?.emoji?.unicode;
  const name = event.detail?.emoji?.annotation || 'emoji';
  if (char) {
    emit('select', char, name);
  }
};

const attachListener = () => {
  const picker = pickerEl.value || document.querySelector('emoji-picker');
  if (picker && !picker.__hasClickListener) {
    picker.addEventListener('emoji-click', onEmojiClick);
    picker.__hasClickListener = true;
  }
};

onMounted(() => {
  attachListener();
});

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      setTimeout(attachListener, 50);
    }
  }
);
</script>

<style scoped>
emoji-picker {
  width: 100%;
  max-width: 100%;
  height: 320px;
}
</style>
