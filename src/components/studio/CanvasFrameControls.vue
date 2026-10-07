<template>
  <div class="space-y-4 p-3.5 bg-white border border-app-border rounded-2xl shadow-2xs">
    <!-- SECCIÓN 1: BORDES REDONDEADOS DEL CANVAS (Siempre disponible) -->
    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label class="text-[11px] font-bold text-text-main flex items-center gap-1.5">
          <span class="text-xs">🔄</span>
          <span>Bordes Redondeados</span>
          <span v-if="frame.borderRadius.value === 16" class="text-[9px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold">
            Predeterminado
          </span>
        </label>
        <span class="font-mono text-xs font-bold text-text-muted">{{ frame.borderRadius.value }}px</span>
      </div>

      <input
        type="range"
        min="0"
        max="60"
        step="2"
        :value="frame.borderRadius.value"
        @input="updateField('setBorderRadius', ($event.target as HTMLInputElement).valueAsNumber)"
        class="w-full accent-primary-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
      />

      <!-- Presets de Border Radius -->
      <div class="grid grid-cols-4 gap-1 pt-0.5">
        <button
          v-for="r in radiusPresets"
          :key="r.value"
          type="button"
          @click="updateField('setBorderRadius', r.value)"
          :class="[
            'py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center',
            frame.borderRadius.value === r.value
              ? 'bg-primary-50 border-primary-400 text-primary-700 shadow-2xs'
              : 'border-app-border text-text-subtle hover:bg-stone-50 hover:text-text-main'
          ]"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- SECCIÓN 2: MARCO Y LÍNEA DE RECORTE (STICKER) -->
    <div class="pt-3 border-t border-app-border space-y-3">
      <!-- Toggle Principal de Recorte -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-base">✂️</span>
          <div>
            <span class="block text-xs font-bold text-text-main">Margen de Recorte (Sticker)</span>
            <span class="block text-[10px] text-text-subtle">Marco blanco y línea de corte</span>
          </div>
        </div>

        <button
          type="button"
          @click="updateField('setActive', !frame.active.value)"
          :class="[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
            frame.active.value ? 'bg-primary-500' : 'bg-stone-300'
          ]"
          title="Activar o desactivar margen de recorte"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              frame.active.value ? 'translate-x-4' : 'translate-x-0'
            ]"
          />
        </button>
      </div>

      <!-- Opciones cuando el marco de recorte está activo -->
      <div v-if="frame.active.value" class="space-y-3 pt-2 bg-stone-50/70 p-2.5 rounded-xl border border-app-border/80">
        <!-- Grosor del Marco Blanco (Margen mínimo 0) -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-text-main">
              Grosor del Margen:
            </span>
            <span class="font-mono text-xs font-bold text-primary-600 bg-white px-2 py-0.5 rounded-md border border-app-border shadow-2xs">
              {{ frame.margin.value }}px
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="40"
            step="1"
            :value="frame.margin.value"
            @input="updateField('setMargin', ($event.target as HTMLInputElement).valueAsNumber)"
            class="w-full accent-primary-500 cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
          />

          <!-- Presets Rápidos de Margen (mínimo 0px) -->
          <div class="grid grid-cols-4 gap-1 pt-0.5">
            <button
              v-for="m in marginPresets"
              :key="m.value"
              type="button"
              @click="updateField('setMargin', m.value)"
              :class="[
                'py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center',
                frame.margin.value === m.value
                  ? 'bg-primary-50 border-primary-400 text-primary-700 shadow-2xs'
                  : 'bg-white border-app-border text-text-subtle hover:bg-stone-50 hover:text-text-main'
              ]"
            >
              {{ m.label }}
            </button>
          </div>
        </div>

        <!-- Línea Exterior de Corte -->
        <div class="space-y-2 pt-2 border-t border-app-border/70">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-text-main">
              Línea Exterior de Corte:
            </span>
            <div class="flex rounded-lg p-0.5 bg-stone-200/80 text-[10px]">
              <button
                type="button"
                @click="updateField('setBorderStyle', 'dashed')"
                :class="[
                  'px-2 py-1 rounded-md font-bold transition-all cursor-pointer',
                  frame.borderStyle.value === 'dashed'
                    ? 'bg-white text-primary-600 shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                ]"
              >
                ╌╌ Dashed
              </button>
              <button
                type="button"
                @click="updateField('setBorderStyle', 'solid')"
                :class="[
                  'px-2 py-1 rounded-md font-bold transition-all cursor-pointer',
                  frame.borderStyle.value === 'solid'
                    ? 'bg-white text-primary-600 shadow-2xs'
                    : 'text-text-muted hover:text-text-main'
                ]"
              >
                ── Sólido
              </button>
            </div>
          </div>

          <!-- Grosor y Color -->
          <div class="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-app-border/80">
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold text-text-main">Grosor:</span>
              <div class="flex gap-1">
                <button
                  v-for="w in [1, 2, 3, 5]"
                  :key="w"
                  type="button"
                  @click="updateField('setBorderWidth', w)"
                  :class="[
                    'w-6 h-6 rounded-md text-[10px] font-bold border transition-all cursor-pointer flex items-center justify-center',
                    frame.borderWidth.value === w
                      ? 'bg-primary-50 border-primary-500 text-primary-600 shadow-2xs'
                      : 'border-app-border text-text-muted hover:bg-stone-50'
                  ]"
                >
                  {{ w }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-bold text-text-main">Color:</span>
              <ColorPalettePicker
                :current-color="frame.borderColor.value"
                compact
                popover-align="left"
                title="Color de línea exterior"
                @live-change="updateField('setBorderColor', $event)"
                @commit-change="updateField('setBorderColor', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { useCanvasFrame } from '../../composables/useCanvasFrame';
import ColorPalettePicker from '../common/ColorPalettePicker.vue';

const props = defineProps<{
  frame: ReturnType<typeof useCanvasFrame>;
}>();

const emit = defineEmits<{
  (e: 'sync'): void;
}>();

const radiusPresets = [
  { label: '0px', value: 0 },
  { label: '16px', value: 16 },
  { label: '32px', value: 32 },
  { label: '48px', value: 48 }
];

const marginPresets = [
  { label: '0px', value: 0 },
  { label: '6px', value: 6 },
  { label: '10px', value: 10 },
  { label: '16px', value: 16 }
];

const updateField = (methodName: string, val: any) => {
  (props.frame as any)[methodName]?.(val);
  emit('sync');
};
</script>
