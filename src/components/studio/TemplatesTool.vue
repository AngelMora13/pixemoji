<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-bold uppercase tracking-wider text-text-main">
        Plantillas Rápidas (1-Clic)
      </label>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 border border-primary-200">
        Presets Listos
      </span>
    </div>

    <p class="text-[11px] text-text-muted">
      Selecciona una estructura prediseñada para comenzar a crear memes, duelos o stickers sin empezar desde cero:
    </p>

    <!-- Grid de Plantillas -->
    <div class="grid grid-cols-1 gap-2.5">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        @click="$emit('selectTemplate', tpl.id)"
        class="group p-3 rounded-2xl border border-app-border bg-white hover:bg-primary-50 hover:border-primary-500 transition-all cursor-pointer shadow-2xs hover:shadow-md flex items-start gap-3 text-left"
      >
        <div class="w-11 h-11 rounded-xl bg-primary-100 group-hover:bg-primary-200 flex items-center justify-center text-2xl shrink-0 transition-colors border border-primary-200">
          {{ tpl.icon }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="text-xs font-bold text-text-main group-hover:text-primary-600 transition-colors">
              {{ tpl.name }}
            </span>
            <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 border border-primary-200">
              {{ tpl.badge }}
            </span>
          </div>
          <p class="text-[10px] text-text-muted leading-relaxed line-clamp-2">
            {{ tpl.description }}
          </p>
        </div>

        <span class="text-text-subtle group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all text-xs font-bold self-center">
          &rarr;
        </span>
      </div>
    </div>

    <div class="p-2.5 bg-primary-50 border border-primary-200 rounded-xl text-[10px] text-primary-900 flex items-start gap-2">
      <span class="text-sm shrink-0">💡</span>
      <p><strong>Tip:</strong> Aplicar una plantilla configurará el formato y los elementos recomendados al instante. Podrás editar, cambiar o mover todo libremente.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StudioTemplate } from '../../composables/useKonvaTemplates';

defineProps<{
  templates: StudioTemplate[];
}>();

defineEmits<{
  (e: 'selectTemplate', templateId: string): void;
}>();
</script>
