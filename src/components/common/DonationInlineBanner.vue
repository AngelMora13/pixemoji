<template>
  <div
    class="w-full p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center space-y-2 transition-all hover:bg-amber-50/90"
  >
    <p class="text-xs text-amber-950 font-medium">
      {{ isSupporter ? '💖 ¡Gracias por tu apoyo continuo! ¿Otro café para recargar energías?' : DONATION_CONFIG.texts.inlinePrompt }}
    </p>

    <div class="flex items-center justify-center gap-2">
      <button
        type="button"
        @click="handleClick"
        class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
      >
        <span>☕</span>
        <span>{{ isSupporter ? 'Invitar otro café' : DONATION_CONFIG.texts.inlineButton }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupporter, useDonationModal } from '../../composables/useDonationModal';
import { DONATION_CONFIG } from '../../utils/donationConfig';

const { isSupporter } = useSupporter();
const donationContext = useDonationModal();

const handleClick = () => {
  if (donationContext) {
    donationContext.openModal();
  }
};
</script>
