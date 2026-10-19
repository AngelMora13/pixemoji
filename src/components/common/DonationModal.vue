<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in"
      @click.self="handleClose"
    >
      <div
        class="w-full max-w-sm sm:max-w-md bg-white border border-app-border rounded-3xl p-5 sm:p-6 shadow-floating relative max-h-[92vh] overflow-y-auto space-y-4"
        @click.stop
      >
        <!-- Botón de Cerrar (X) -->
        <button
          type="button"
          @click="handleClose"
          class="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors z-10"
          aria-label="Cerrar ventana"
        >
          ✕
        </button>

        <!-- VISTA 1: Proceso de Donación -->
        <div v-if="!hasDonatedInSession" class="space-y-4">
          <!-- Cabecera Dinámica (Nuevo vs Supporter recurrente) -->
          <div class="text-center pt-1">
            <h3 class="text-lg sm:text-xl font-extrabold text-text-main tracking-tight">
              <span class="inline-block mb-1 animate-bounce-subtle">
                {{ isSupporter ? '💖' : '☕' }}
              </span>
              {{ isSupporter ? DONATION_CONFIG.texts.modalTitleSupporter : DONATION_CONFIG.texts.modalTitleNew }}
            </h3>
            <p class="text-xs text-text-muted mt-1 max-w-xs mx-auto">
              {{ isSupporter ? DONATION_CONFIG.texts.modalSubtitleSupporter : DONATION_CONFIG.texts.modalSubtitleNew }}
            </p>
          </div>

          <!-- Selector de Cantidad de Cafés -->
          <div class="space-y-1.5 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
            <div class="flex items-center justify-between text-[11px] font-bold text-amber-950 px-0.5">
              <span>ELIGE TU APORTE:</span>
              <span class="text-primary-700 font-mono font-extrabold">
                Total: {{ DONATION_CONFIG.pricing.currencySymbol }}{{ totalUsd }} USD
              </span>
            </div>

            <div class="grid grid-cols-4 gap-1.5">
              <button
                v-for="preset in DONATION_CONFIG.pricing.presets"
                :key="preset.count"
                type="button"
                @click="selectPreset(preset.count)"
                :class="[
                  'py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center relative border',
                  !isCustom && coffeeCount === preset.count
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-102'
                    : 'bg-white text-text-main border-amber-200 hover:bg-amber-100/50'
                ]"
              >
                <span class="block font-mono text-xs">{{ preset.label }}</span>
                <span class="text-[9px] block opacity-90 font-mono">
                  ${{ preset.count * DONATION_CONFIG.pricing.pricePerCoffeeUsd }}
                </span>
                <span
                  v-if="preset.popular"
                  class="absolute -top-1.5 -right-1 bg-rose-500 text-white rounded-full shadow-2xs leading-tight"
                  style="font-weight: 400; font-size: 8px; padding: 1px 8px;"
                >
                  Top
                </span>
              </button>

              <!-- Botón Custom -->
              <button
                type="button"
                @click="enableCustom"
                :class="[
                  'py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border',
                  isCustom
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs scale-102'
                    : 'bg-white text-text-main border-amber-200 hover:bg-amber-100/50'
                ]"
              >
                <span class="block text-xs">Custom</span>
                <span class="text-[9px] block opacity-90 font-mono">
                  ${{ isCustom ? customCount * DONATION_CONFIG.pricing.pricePerCoffeeUsd : 'Otro' }}
                </span>
              </button>
            </div>

            <!-- Input editable si eligió Custom -->
            <div
              v-if="isCustom"
              class="flex items-center justify-between pt-1.5 px-1 text-xs animate-fade-in"
            >
              <label class="text-[11px] font-semibold text-amber-900">Número de cafés:</label>
              <div class="flex items-center gap-1.5">
                <input
                  type="number"
                  v-model.number="customCount"
                  :min="DONATION_CONFIG.pricing.minCustomCoffees"
                  :max="DONATION_CONFIG.pricing.maxCustomCoffees"
                  class="w-16 px-2 py-0.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold text-center text-text-main focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <span class="text-xs font-bold text-amber-900">☕</span>
              </div>
            </div>
          </div>

          <!-- Caja de Binance Pay (QR e ID) -->
          <div class="bg-stone-50 border border-app-border rounded-2xl p-3.5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                  Binance Pay
                </span>
              </div>
              <span class="text-[10px] text-text-subtle font-medium">Cero comisiones</span>
            </div>

            <!-- Código QR con logo placeholder (sin etiqueta PAY) -->
            <div class="flex flex-col items-center">
              <p class="text-[11px] text-text-muted mt-2 text-center max-w-[240px]">
                Alias: <span class="font-bold">{{ DONATION_CONFIG.binance.alias }}</span>
              </p>
              <div class="p-2.5 bg-white border border-stone-200 rounded-2xl shadow-xs group">
                <img
                  :src="DONATION_CONFIG.binance.qrImage"
                  alt="QR Binance Pay PixEmoji"
                  class="w-36 h-36 object-contain rounded-xl transition-transform group-hover:scale-102"
                />
              </div>
              <p class="text-[11px] text-text-muted mt-2 text-center max-w-[240px]">
                {{ DONATION_CONFIG.texts.scanInstruction }}
              </p>
            </div>

            <!-- Binance ID con Botón Copiar -->
            <div class="flex items-center justify-between p-2 bg-white rounded-xl border border-app-border text-xs">
              <div class="min-w-0 flex items-center gap-1.5">
                <span class="text-[10px] font-bold text-text-subtle uppercase">ID:</span>
                <span class="font-mono font-bold text-text-main truncate text-xs">
                  {{ DONATION_CONFIG.binance.userId }}
                </span>
              </div>
              <button
                type="button"
                @click="copyBinanceId"
                class="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0"
              >
                {{ copied ? DONATION_CONFIG.texts.copiedIdFeedback : DONATION_CONFIG.texts.copyIdButton }}
              </button>
            </div>

            <!-- Botón directo a la App de Binance (Solo visible en Móvil) -->
            <a
              :href="DONATION_CONFIG.binance.appUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="md:hidden w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <span>🚀</span>
              <span>{{ DONATION_CONFIG.texts.openBinanceButton }}</span>
            </a>
          </div>

          <!-- Confirmación: "¿Ya realizaste tu envío?" -->
          <div class="pt-1 text-center border-t border-app-border/70">
            <p class="text-[11px] text-text-muted mb-1.5">
              {{ DONATION_CONFIG.texts.confirmPrompt }}
            </p>
            <button
              type="button"
              @click="confirmDonation"
              class="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-primary-500 to-amber-600 hover:opacity-95 text-white font-extrabold rounded-2xl text-xs shadow-brand active:scale-98 transition-all cursor-pointer"
            >
              {{ DONATION_CONFIG.texts.confirmButton }}
            </button>
          </div>
        </div>

        <!-- VISTA 2: Pantalla de Agradecimiento (Delight Moment) -->
        <div v-else class="text-center py-5 space-y-4 animate-fade-in">
          <div class="w-16 h-16 mx-auto rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-3xl shadow-soft animate-bounce-subtle">
            💖
          </div>
          <div class="space-y-1.5">
            <h3 class="text-xl font-black text-text-main tracking-tight">
              {{ DONATION_CONFIG.texts.thankYouTitle }}
            </h3>
            <p class="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
              {{ wasAlreadySupporter
                ? 'Gracias Crack, ídolo, maquina, artista, inigualable, number 1, toro, fiera, tigre, relámpago, tsunami, terremo, maremoto, shaky, mi ídolo, mi campeón, mi padrote, mi jefe, que tengnas un gran dia'
                : DONATION_CONFIG.texts.thankYouMessage }}
            </p>
          </div>

          <div class="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-amber-950 text-xs font-bold">
            ☕ Tu distintivo <span class="text-primary-600">Coffee Lover</span> ha sido activado en tu navegador.
          </div>

          <button
            type="button"
            @click="handleClose"
            class="w-full py-2.5 px-4 bg-stone-900 hover:bg-black text-white font-bold rounded-2xl text-xs transition-all cursor-pointer"
          >
            {{ DONATION_CONFIG.texts.thankYouCloseButton }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useSupporter } from '../../composables/useDonationModal';
import { DONATION_CONFIG } from '../../utils/donationConfig';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const { isSupporter, markAsSupporter } = useSupporter();

const isCustom = ref(false);
const coffeeCount = ref(DONATION_CONFIG.pricing.defaultCount);
const customCount = ref(2);
const copied = ref(false);
const hasDonatedInSession = ref(false);
const wasAlreadySupporter = ref(false);

const totalUsd = computed(() => {
  const count = isCustom.value ? Math.max(1, customCount.value || 1) : coffeeCount.value;
  return count * DONATION_CONFIG.pricing.pricePerCoffeeUsd;
});

const selectPreset = (count: number) => {
  isCustom.value = false;
  coffeeCount.value = count;
};

const enableCustom = () => {
  isCustom.value = true;
};

const copyBinanceId = async () => {
  try {
    await navigator.clipboard.writeText(DONATION_CONFIG.binance.userId);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    alert(`Copia manual: ${DONATION_CONFIG.binance.userId}`);
  }
};

const confirmDonation = () => {
  wasAlreadySupporter.value = isSupporter.value;
  markAsSupporter();
  hasDonatedInSession.value = true;
};

const handleClose = () => {
  hasDonatedInSession.value = false;
  emit('close');
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    handleClose();
  }
};

watch(() => props.isOpen, (val) => {
  if (val) {
    hasDonatedInSession.value = false;
    copied.value = false;
  }
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown);
  }
});
</script>
