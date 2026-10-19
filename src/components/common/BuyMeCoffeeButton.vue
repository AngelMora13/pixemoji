<template>
  <div class="inline-flex items-center">
    <button
      type="button"
      @click="isModalOpen = true"
      :class="[
        'inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none shadow-xs active:scale-95 group',
        isSupporter
          ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-primary-500/15 hover:from-amber-500/25 hover:to-primary-500/25 text-amber-900 border border-amber-300/80 shadow-amber-500/10'
          : 'bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400'
      ]"
      :aria-label="buttonLabel"
      :title="buttonLabel"
    >
      <span
        class="text-sm sm:text-base leading-none transition-transform group-hover:scale-110 group-hover:rotate-6"
      >
        {{ isSupporter ? '💖' : '☕' }}
      </span>

      <!-- Texto visible únicamente en pantallas lg o si forceText está activo -->
      <span
        :class="[
          'tracking-tight font-extrabold',
          forceText ? 'inline' : 'hidden lg:inline'
        ]"
      >
        {{ buttonLabel }}
      </span>

      <!-- Pequeño badge de Supporter si ya donó -->
      <span
        v-if="isSupporter"
        :class="[
          'items-center text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-500 text-white tracking-wider',
          forceText ? 'inline-flex' : 'hidden lg:inline-flex'
        ]"
      >
        VIP
      </span>
    </button>

    <!-- Modal instanciado y gestionado directamente por este botón -->
    <DonationModal :is-open="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSupporter } from '../../composables/useDonationModal';
import { DONATION_CONFIG } from '../../utils/donationConfig';
import DonationModal from './DonationModal.vue';

const props = withDefaults(
  defineProps<{
    forceText?: boolean;
  }>(),
  {
    forceText: false
  }
);

const { isSupporter } = useSupporter();
const isModalOpen = ref(false);

const buttonLabel = computed(() => {
  return isSupporter.value
    ? DONATION_CONFIG.texts.headerButtonSupporter
    : DONATION_CONFIG.texts.headerButtonNew;
});
</script>
