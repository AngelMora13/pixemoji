<template>
  <div
    v-if="isOpen"
    class="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
    data-purpose="bottom-sheet-modal"
  >
    <!-- Backdrop con click para cerrar -->
    <div
      class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Contenedor Bottom Sheet con animación -->
    <div
      class="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-t border-app-border animate-slide-up"
    >
      <!-- Cabecera opcional -->
      <div
        v-if="title"
        class="p-3 border-b border-app-border bg-app-header/80 flex items-center justify-between shrink-0"
      >
        <div class="flex items-center gap-2">
          <span v-if="icon" class="text-base select-none">{{ icon }}</span>
          <span class="text-sm font-extrabold text-text-main">{{ title }}</span>
        </div>

        <button
          type="button"
          @click="$emit('close')"
          class="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-main cursor-pointer transition-colors"
          title="Cerrar ventana"
        >
          ✕
        </button>
      </div>

      <!-- Contenido principal -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen: boolean;
    title?: string;
    icon?: string;
  }>(),
  {
    isOpen: false,
    title: '',
    icon: ''
  }
);

defineEmits<{
  (e: 'close'): void;
}>();
</script>
