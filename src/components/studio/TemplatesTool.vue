<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-bold uppercase tracking-wider text-[#523e32]">
        Plantillas Rápidas (1-Clic)
      </label>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
        Presets Listos
      </span>
    </div>

    <p class="text-[11px] text-[#8a6e60]">
      Selecciona una estructura prediseñada para comenzar a crear memes, duelos o stickers sin empezar desde cero:
    </p>

    <!-- Grid de Plantillas -->
    <div class="grid grid-cols-1 gap-2.5">
      <div
        v-for="tpl in templates"
        :key="tpl.id"
        @click="$emit('selectTemplate', tpl.id)"
        class="group p-3 rounded-2xl border border-[#ebd8ca] bg-white/80 hover:bg-amber-50/90 hover:border-[#d97736] transition-all cursor-pointer shadow-2xs hover:shadow-md flex items-start gap-3 text-left"
      >
        <div class="w-11 h-11 rounded-xl bg-amber-100/80 group-hover:bg-amber-200/80 flex items-center justify-center text-2xl shrink-0 transition-colors">
          {{ tpl.icon }}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="text-xs font-bold text-[#2b1e1a] group-hover:text-[#d97736] transition-colors">
              {{ tpl.name }}
            </span>
            <span class="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              {{ tpl.badge }}
            </span>
          </div>
          <p class="text-[10px] text-[#735a4d] leading-relaxed line-clamp-2">
            {{ tpl.description }}
          </p>
        </div>

        <span class="text-[#debfa8] group-hover:text-[#d97736] group-hover:translate-x-0.5 transition-all text-xs font-bold self-center">
          →
        </span>
      </div>
    </div>

    <div class="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[10px] text-[#735a4d]">
      💡 <em>Tip:</em> Aplicar una plantilla configurará el formato y los elementos recomendados al instante. Podrás editar, cambiar o mover todo libremente.
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
