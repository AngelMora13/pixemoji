<template>
  <div class="flex-1 w-full h-full flex items-center justify-center p-3 sm:p-6 overflow-auto bg-grid-pattern select-none">
    <!-- Dashed Artboard Safe Area Boundary from demo.html -->
    <div class="p-3 sm:p-4 border-2 border-dashed border-app-border-strong/80 rounded-3xl bg-transparent transition-all shadow-xs">
      <div
        :class="[
          'rounded-2xl shadow-2xl relative overflow-hidden flex flex-col items-center justify-center select-none border border-app-border/80 transition-all bg-white',
          isTransparent ? 'checkerboard-pattern' : ''
        ]"
        :style="{
          width: width + 'px',
          height: height + 'px',
          backgroundColor: isTransparent ? 'transparent' : bgColor
        }"
      >
        <div :id="containerId" :style="{ width: width + 'px', height: height + 'px' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  containerId: string;
  width: number;
  height: number;
  isTransparent: boolean;
  bgColor: string;
}>();
</script>
