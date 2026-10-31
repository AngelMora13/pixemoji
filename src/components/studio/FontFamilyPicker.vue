<template>
  <div class="relative" :class="compact ? 'inline-block shrink-0' : 'w-full'" data-purpose="font-family-picker">
    <!-- Botón compacto para barra de formato inline (móvil) -->
    <button
      v-if="compact"
      type="button"
      @click="isOpen = !isOpen"
      class="w-7 h-7 rounded-lg border border-app-border-strong bg-white hover:bg-stone-50 text-text-main flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer active:scale-95 transition-all"
      :title="`Tipografía actual: ${currentFont}`"
    >
      <span class="font-serif font-black text-xs leading-none">Aa</span>
    </button>

    <!-- Botón estándar con texto completo -->
    <button
      v-else
      type="button"
      @click="isOpen = !isOpen"
      class="w-full h-8.5 px-2.5 bg-white border border-app-border-strong rounded-xl text-xs font-bold text-text-main flex items-center justify-between shadow-2xs hover:bg-stone-50 cursor-pointer transition-colors"
      title="Seleccionar o añadir tipografía"
    >
      <span class="truncate">{{ currentFont }}</span>
      <span class="text-[10px] text-text-subtle ml-1">▾</span>
    </button>

    <!-- Backdrop transparente para cerrar al hacer clic fuera -->
    <div v-if="isOpen" class="fixed inset-0 z-20" @click="isOpen = false"></div>

    <!-- Popover de Fuentes -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 mt-1 z-30 w-72 bg-white border border-app-border rounded-2xl shadow-xl p-3 space-y-3 animate-fade-in"
    >
      <!-- Sección A: Cargar fuente de Google Fonts por URL / link / import -->
      <div class="space-y-1.5">
        <span class="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Añadir de Google Fonts
        </span>
        <div class="flex gap-1.5">
          <input
            v-model="googleFontInput"
            type="text"
            placeholder="Pega URL, <link>, @import o nombre..."
            class="flex-1 h-7.5 px-2 bg-stone-50 border border-app-border-strong rounded-lg text-[11px] text-text-main focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            @keydown.enter="handleImportGoogleFont"
          />
          <button
            type="button"
            @click="handleImportGoogleFont"
            class="px-2.5 h-7.5 bg-primary-gradient text-white font-bold text-[11px] rounded-lg shadow-2xs hover:opacity-95 cursor-pointer shrink-0"
          >
            Añadir
          </button>
        </div>
        <p v-if="fontErrorMessage" class="text-[10px] text-red-500 font-medium">
          {{ fontErrorMessage }}
        </p>
      </div>

      <hr class="border-app-border" />

      <!-- Sección B: Fuentes Guardadas en LocalStorage -->
      <div v-if="savedFonts.length > 0" class="space-y-1 max-h-36 overflow-y-auto pr-1">
        <span class="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Tus Fuentes Guardadas ({{ savedFonts.length }})
        </span>
        <div
          v-for="font in savedFonts"
          :key="font.name"
          class="flex items-center justify-between p-1.5 rounded-lg hover:bg-stone-50 group"
        >
          <button
            type="button"
            @click="selectFont(font.name)"
            class="text-xs font-semibold text-text-main truncate text-left flex-1 cursor-pointer"
            :style="{ fontFamily: font.name }"
          >
            {{ font.name }}
          </button>
          <button
            type="button"
            @click.stop="deleteCustomFont(font.name)"
            class="text-[11px] text-text-subtle hover:text-red-500 p-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
            title="Eliminar de guardados"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Sección C: Fuentes Populares -->
      <div class="space-y-1 max-h-40 overflow-y-auto pr-1">
        <span class="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
          Fuentes Populares
        </span>
        <button
          v-for="font in DEFAULT_PRESET_FONTS"
          :key="font.name"
          type="button"
          @click="selectFont(font.name)"
          :class="[
            'w-full text-left px-2 py-1 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors',
            currentFont === font.name ? 'bg-primary-50 text-primary-600 font-bold' : 'hover:bg-stone-50 text-text-main'
          ]"
          :style="{ fontFamily: font.name }"
        >
          <span>{{ font.label }}</span>
          <span v-if="currentFont === font.name" class="text-xs">✓</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  useCustomFontsAndColors,
  DEFAULT_PRESET_FONTS,
  extractGoogleFontUrl
} from '../../composables/useCustomFontsAndColors';

withDefaults(
  defineProps<{
    currentFont: string;
    compact?: boolean;
  }>(),
  {
    compact: false
  }
);

const emit = defineEmits<{
  (e: 'selectFont', fontName: string): void;
}>();

const { savedFonts, addCustomFont, deleteCustomFont } = useCustomFontsAndColors();

const isOpen = ref(false);
const googleFontInput = ref('');
const fontErrorMessage = ref('');

const selectFont = (name: string) => {
  emit('selectFont', name);
  isOpen.value = false;
};

const handleImportGoogleFont = () => {
  if (!googleFontInput.value.trim()) return;
  const parsed = extractGoogleFontUrl(googleFontInput.value);
  if (parsed) {
    addCustomFont({ name: parsed.name, url: parsed.url });
    selectFont(parsed.name);
    googleFontInput.value = '';
    fontErrorMessage.value = '';
  } else {
    fontErrorMessage.value = 'No se encontró enlace ni nombre válido de Google Fonts.';
  }
};
</script>
