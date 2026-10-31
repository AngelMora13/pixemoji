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

    <!-- Copy to Clipboard Button / WhatsApp Sticker Button -->
    <button
      type="button"
      @click="$emit('copy')"
      :class="[
        'w-full py-2.5 px-4 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]',
        copied
          ? 'bg-emerald-700 border-emerald-800 text-white shadow-emerald-700/20'
          : 'bg-whatsapp-brand hover:bg-whatsapp-brand-hover border-whatsapp-brand-border text-white shadow-whatsapp-brand/25'
      ]"
    >
      <svg v-if="copied" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M5 13l4 4L19 7" />
      </svg>
      <svg v-else class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
      <!-- WhatsApp label for mobile, generic copy label for desktop -->
      <span class="sm:hidden">{{ copied ? copiedText : 'Copiar sticker para WhatsApp' }}</span>
      <span class="hidden sm:inline">{{ copied ? copiedText : copyText }}</span>
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
