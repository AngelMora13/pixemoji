<template>
  <div class="relative" data-purpose="text-formatting-toolbar">
    <!-- Backdrop para cerrar menú de pesos al hacer clic fuera -->
    <div v-if="isWeightMenuOpen" class="fixed inset-0 z-20" @click="isWeightMenuOpen = false"></div>

    <div class="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl border border-app-border relative z-24">
      <!-- Opciones compactas exclusivas de Móvil: Tipografía y Color -->
      <div v-if="currentFont" class="md:hidden flex items-center gap-1">
        <FontFamilyPicker
          :current-font="currentFont"
          compact
          @select-font="$emit('selectFont', $event)"
        />
        <ColorPalettePicker
          v-if="currentColor"
          :current-color="currentColor"
          compact
          popover-align="left"
          title="Color de texto"
          @live-change="$emit('colorLiveChange', $event)"
          @commit-change="$emit('colorCommitChange', $event)"
        />
        <div class="w-[1px] h-4 bg-stone-300 mx-0.5"></div>
      </div>

      <!-- Botón Bold Unificado con selector integrado de grosores descriptivos (100 a 900) -->
      <div class="relative inline-flex items-center">
        <!-- B principal: alterna 400 <-> 700 -->
        <button
          type="button"
          @click="$emit('toggleBold')"
          :class="[
            'px-2.5 py-1 text-xs font-black transition-all cursor-pointer rounded-l-lg',
            Number(currentWeight) >= 700 ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong' : 'text-text-muted hover:text-text-main'
          ]"
          title="Negrita rápida (Alterna Regular 400 y Negrita 700)"
        >
          B
        </button>
        <!-- Flecha para desplegar todos los pesos descriptivos -->
        <button
          type="button"
          @click="isWeightMenuOpen = !isWeightMenuOpen"
          :class="[
            'px-1.5 py-1 text-[10px] text-text-subtle hover:text-text-main border-l border-stone-200 cursor-pointer rounded-r-lg hover:bg-stone-200 transition-colors',
            isWeightMenuOpen ? 'bg-white text-primary-600' : ''
          ]"
          title="Seleccionar grosor específico (100 a 900)"
        >
          ▾
        </button>

        <!-- Menú flotante de pesos descriptivos -->
        <div
          v-if="isWeightMenuOpen"
          class="absolute top-full left-0 mt-1 z-30 w-56 bg-white border border-app-border rounded-2xl shadow-xl p-1.5 space-y-0.5 animate-fade-in"
        >
          <div class="px-2 py-1 text-[10px] font-bold uppercase text-text-subtle">
            Grosor Tipográfico
          </div>
          <button
            v-for="w in WEIGHT_OPTIONS"
            :key="w.value"
            type="button"
            @click="handleSelectWeight(w.value)"
            :class="[
              'w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors',
              currentWeight === w.value ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-stone-50 text-text-main'
            ]"
          >
            <span :style="{ fontWeight: w.value }">{{ w.label }}</span>
            <span v-if="currentWeight === w.value" class="text-xs">✓</span>
          </button>
        </div>
      </div>

      <!-- Alternar Cursiva (Italic) -->
      <button
        type="button"
        @click="$emit('toggleItalic')"
        :class="[
          'px-2.5 py-1 rounded-lg text-xs font-serif italic transition-all cursor-pointer',
          isItalic ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong' : 'text-text-muted hover:text-text-main'
        ]"
        title="Cursiva (Italic)"
      >
        I
      </button>

      <div class="w-[1px] h-4 bg-stone-300"></div>

      <!-- Lista Desordenada -->
      <button
        type="button"
        @click="$emit('toggleBulletList')"
        :class="[
          'flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
          isBulletActive ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong' : 'text-text-muted hover:text-text-main'
        ]"
        title="Lista con viñetas"
      >
        <span>•</span>
        <span class="text-[10px]">Lista</span>
      </button>

      <!-- Lista Ordenada -->
      <button
        type="button"
        @click="$emit('toggleOrderedList')"
        :class="[
          'flex-1 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
          isOrderedActive ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong' : 'text-text-muted hover:text-text-main'
        ]"
        title="Lista numerada"
      >
        <span class="text-[10px]">1.</span>
        <span class="text-[10px]">Orden</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { WEIGHT_OPTIONS } from '../../utils/tiptapHelpers';
import FontFamilyPicker from './FontFamilyPicker.vue';
import ColorPalettePicker from '../common/ColorPalettePicker.vue';

withDefaults(
  defineProps<{
    currentWeight: string;
    isItalic: boolean;
    isBulletActive: boolean;
    isOrderedActive: boolean;
    currentFont?: string;
    currentColor?: string;
  }>(),
  {
    currentFont: '',
    currentColor: ''
  }
);

const emit = defineEmits<{
  (e: 'toggleBold'): void;
  (e: 'selectWeight', weight: string): void;
  (e: 'toggleItalic'): void;
  (e: 'toggleBulletList'): void;
  (e: 'toggleOrderedList'): void;
  (e: 'selectFont', font: string): void;
  (e: 'colorLiveChange', color: string): void;
  (e: 'colorCommitChange', color: string): void;
}>();

const isWeightMenuOpen = ref(false);

const handleSelectWeight = (weight: string) => {
  emit('selectWeight', weight);
  isWeightMenuOpen.value = false;
};
</script>
