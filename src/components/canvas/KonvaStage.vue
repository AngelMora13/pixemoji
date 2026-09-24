<template>
  <div class="w-full max-w-full overflow-auto flex justify-center p-3 rounded-2xl border-2 border-dashed border-[#d9bfae] bg-stone-100/50 min-h-[300px] items-center">
    <div
      :class="[
        'rounded-xl overflow-hidden shadow-md transition-all shrink-0',
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
