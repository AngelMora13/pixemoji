<template>
  <div class="w-full space-y-2.5" data-purpose="export-actions">
    <!-- Download Button -->
    <button
      type="button"
      @click="$emit('download')"
      class="w-full py-3 px-4 rounded-2xl bg-primary-gradient hover:opacity-95 text-white font-bold text-xs shadow-md shadow-primary-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>{{ downloadText }}</span>
    </button>

    <!-- Copy to Clipboard Button -->
    <button
      type="button"
      @click="$emit('copy')"
      :class="[
        'w-full py-2.5 px-4 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs',
        copied
          ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
          : 'bg-white border-app-border-strong text-text-main hover:bg-primary-50/80'
      ]"
    >
      <svg v-if="copied" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
      <span>{{ copied ? copiedText : copyText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    downloadText?: string;
    copyText?: string;
    copiedText?: string;
    copied?: boolean;
  }>(),
  {
    downloadText: 'Descargar Imagen PNG',
    copyText: 'Copiar imagen al portapapeles',
    copiedText: '¡Copiado al portapapeles con éxito!',
    copied: false
  }
);

defineEmits<{
  (e: 'download'): void;
  (e: 'copy'): void;
}>();
</script>
