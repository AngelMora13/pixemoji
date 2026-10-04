<template>
  <div class="w-full h-full flex flex-col overflow-hidden bg-app-bg text-text-main select-none">
    <!-- Studio Header Bar: Solo selector de formato y botón de descarga -->
    <StudioHeader
      :current-preset="currentPreset"
      :format-presets="formatPresets"
      @select-preset="handlePresetSelect"
      @open-export="isExportModalOpen = true"
    />

    <!-- ============================================================== -->
    <!-- MAIN WORKSPACE 3-COLUMN LAYOUT (Matching demo.html)             -->
    <!-- 1. Left Sidebar: Templates & Assets                            -->
    <!-- 2. Center: Fixed Non-Shifting Canvas Viewport                  -->
    <!-- 3. Right Sidebar: Dedicated Properties Inspector Panel         -->
    <!-- ============================================================== -->
    <div class="flex-1 flex overflow-hidden relative select-none w-full min-h-0" data-purpose="main-editor-container">
      <!-- ============================================== -->
      <!-- COLUMN 1: LEFT SIDEBAR (Templates & Assets)   -->
      <!-- ============================================== -->
      <!-- Desktop Left Sidebar -->
      <aside
        v-if="isLeftSidebarOpen"
        class="hidden lg:flex w-80 shrink-0 bg-white border-r border-app-border flex-col h-full overflow-hidden z-10 shadow-xs transition-all duration-300"
        data-purpose="left-templates-panel"
      >
        <!-- 2 Essential Navigation Tabs + Collapse Button -->
        <div class="p-3 border-b border-app-border bg-app-header/70 flex items-center justify-between gap-2 shrink-0">
          <nav class="grid grid-cols-2 gap-1 p-1 bg-primary-100/70 rounded-xl text-xs font-semibold flex-1 border border-primary-200">
            <button
              v-for="tab in tabList"
              :key="tab.id"
              type="button"
              @click="activeTab = tab.id"
              :class="[
                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong'
                  : 'text-text-muted hover:text-text-main'
              ]"
            >
              <span class="text-xs">{{ tab.icon }}</span>
              <span class="text-xs">{{ tab.label }}</span>
            </button>
          </nav>

          <!-- Collapse Left Sidebar Button -->
          <button
            type="button"
            @click="isLeftSidebarOpen = false"
            class="p-1.5 rounded-lg text-text-subtle hover:text-text-main hover:bg-stone-100 transition-colors cursor-pointer text-xs shrink-0"
            title="Ocultar barra de herramientas"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <!-- Left Sidebar Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- TAB 1: AÑADIR -->
          <div v-show="activeTab === 'add'" class="space-y-4">
            <AddTool
              @add-text="handleAddText"
              @select-emoji="handleAddEmoji"
              @add-image="handleAddImage"
            />
          </div>

          <!-- TAB 2: CAPAS (con opción interna de modificar fondo) -->
          <div v-show="activeTab === 'layers'" class="space-y-3">
            <!-- MODO A: LISTA DE CAPAS -->
            <div v-if="layersSubMode === 'layers'" class="space-y-3">
              <LayersPanel
                :layers="layers.layersListReversed.value"
                :selected-node="stage.selectedNode.value"
                @select="stage.selectNode"
                @toggle-lock="handleToggleLock"
                @duplicate="handleDuplicateNode"
                @move-up="layers.moveLayerUp"
                @move-down="layers.moveLayerDown"
                @reorder="handleReorderLayer"
                @remove="layers.removeLayer"
                @clear-all="handleClearAll"
              />

              <!-- Botón Fondo del lienzo colocado hasta abajo -->
              <div class="pt-2 border-t border-app-border">
                <button
                  type="button"
                  @click="layersSubMode = 'background'"
                  class="w-full p-2.5 rounded-2xl border border-app-border bg-stone-50 hover:bg-primary-50/80 hover:border-primary-300 transition-all flex items-center justify-between text-xs font-bold text-text-main cursor-pointer shadow-2xs group"
                  title="Configurar color, degradado o textura del fondo del lienzo"
                >
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-white border border-app-border flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
                      🎨
                    </div>
                    <div class="text-left">
                      <span class="block text-xs font-bold text-text-main">Fondo del Lienzo</span>
                      <span class="block text-[10px] text-text-muted font-medium">
                        {{ stage.isBgTransparent.value ? 'Transparente' : stage.bgMode.value === 'gradient' ? 'Degradado activo' : 'Color ' + stage.bgColor.value }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 text-[11px] text-primary-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    <span>Modificar</span>
                    <span>&rarr;</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- MODO B: MODIFICAR FONDO -->
            <div v-else class="space-y-3">
              <button
                type="button"
                @click="layersSubMode = 'layers'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50/70 hover:bg-primary-100 border border-primary-200 transition-all cursor-pointer"
                title="Regresar a la lista de capas"
              >
                <span>&larr;</span>
                <span>Volver a Capas</span>
              </button>

              <BackgroundTool
                :is-transparent="stage.isBgTransparent.value"
                :bg-mode="stage.bgMode.value"
                :bg-color="stage.bgColor.value"
                :active-gradient="stage.activeGradient.value"
                :gradient-presets="stage.gradientPresets"
                @set-transparent="stage.setBgTransparent"
                @set-color="stage.setBgColor"
                @set-gradient="stage.setBgGradient"
                @fill-pattern="handleFillPattern"
                @clear-pattern="layers.clearEmojiPattern"
              />
            </div>
          </div>
        </div>
      </aside>

      <!-- Expand Left Sidebar Tab Button when Collapsed (Desktop) -->
      <button
        v-else
        type="button"
        @click="isLeftSidebarOpen = true"
        class="hidden lg:flex absolute top-4 left-4 z-20 items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-app-border-strong shadow-md text-xs font-bold text-text-main hover:bg-primary-50 hover:text-primary-600 transition-all cursor-pointer"
        title="Mostrar herramientas"
      >
        <span>🛠️</span>
        <span>Herramientas</span>
        <svg class="w-3.5 h-3.5 text-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- ============================================== -->
      <!-- COLUMN 2: CENTER FIXED CANVAS VIEWPORT         -->
      <!-- ============================================== -->
      <section
        class="flex-1 bg-app-canvas flex flex-col relative overflow-hidden bg-grid-pattern min-w-0 h-full"
        data-purpose="canvas-viewport"
      >
        <!-- Floating Info Badge: Canvas Resolution & Ratio -->
        <div class="absolute top-4 left-4 lg:left-6 z-10 flex items-center gap-2 pointer-events-none">
          <div class="px-3 py-1.5 bg-white/90 backdrop-blur rounded-xl border border-app-border shadow-xs text-xs font-semibold text-text-main flex items-center gap-2 select-none">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Lienzo: <strong>{{ stage.canvasWidth.value }} &times; {{ stage.canvasHeight.value }} px</strong> ({{ currentPreset.ratioLabel }})</span>
          </div>
        </div>

        <!-- Floating Undo / Redo History Controls (Top Right of Canvas Viewport, opposite of info badge) -->
        <div class="absolute top-4 right-4 lg:right-6 z-10 flex items-center gap-1.5 select-none">
          <div class="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-app-border-strong shadow-xs">
            <button
              type="button"
              @click="history.undo"
              :disabled="!history.canUndo.value"
              class="p-1.5 rounded-lg hover:bg-stone-100 text-text-muted hover:text-text-main disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Deshacer (Ctrl + Z)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4M3 10l4-4m-4 4l4 4"></path>
              </svg>
            </button>
            <button
              type="button"
              @click="history.redo"
              :disabled="!history.canRedo.value"
              class="p-1.5 rounded-lg hover:bg-stone-100 text-text-muted hover:text-text-main disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              title="Rehacer (Ctrl + Y)"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 10H11a5 5 0 00-5 5v2m0 0l4-4m-4 4l-4-4m21-6l-4-4m4 4l-4 4"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Contextual Quick-Action Floating Pill Bar (Appears when element is touched, NO CLS!) -->
        <CanvasToolbar @open-inspector="openInspectorPanel" />

        <!-- Main Working Stage (Fixed Centered Konva Canvas) -->
        <div class="flex-1 w-full h-full flex items-center justify-center overflow-auto p-4 sm:p-8">
          <div
            :style="{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease'
            }"
          >
            <KonvaStage
              container-id="konva-meme-stage"
              :width="stage.canvasWidth.value"
              :height="stage.canvasHeight.value"
              :is-transparent="stage.isBgTransparent.value"
              :bg-color="stage.bgColor.value"
            />
          </div>
        </div>

        <!-- Floating Bottom Zoom, Fit & Plantillas Pill Bar -->
        <div
          class="absolute bottom-16 lg:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full border border-app-border-strong shadow-lg text-xs font-medium text-text-main select-none"
        >
          <button
            type="button"
            @click="zoomOut"
            class="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center font-bold text-base text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Alejar zoom"
          >
            -
          </button>
          <span class="px-2 font-mono font-semibold text-[11px] text-primary-600">
            {{ Math.round(zoomLevel * 100) }}%
          </span>
          <button
            type="button"
            @click="zoomIn"
            class="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center font-bold text-base text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Acercar zoom"
          >
            +
          </button>
          <div class="h-4 w-px bg-stone-200 mx-1"></div>
          <button
            type="button"
            @click="resetZoom"
            class="px-2 py-0.5 rounded-md hover:bg-stone-100 text-[11px] font-semibold text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Restablecer tamaño original (100%)"
          >
            Ajustar
          </button>

          <div class="h-4 w-px bg-stone-200 mx-1"></div>

          <!-- Botón Plantillas con Popover Flotante -->
          <div class="relative" ref="templatesPopoverRef">
            <button
              type="button"
              @click="isTemplatesPopoverOpen = !isTemplatesPopoverOpen"
              :class="[
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer select-none',
                isTemplatesPopoverOpen
                  ? 'bg-primary-600 text-white shadow-2xs'
                  : 'text-text-muted hover:text-text-main hover:bg-stone-100'
              ]"
              title="Explorar plantillas de memes y stickers"
            >
              <span>📋</span>
              <span>Plantillas</span>
              <svg
                class="w-3 h-3 transition-transform duration-200"
                :class="{ 'rotate-180': isTemplatesPopoverOpen }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Mini Popover Flotante hacia arriba con las opciones de plantillas -->
            <div
              v-if="isTemplatesPopoverOpen"
              class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] max-h-[72vh] overflow-y-auto p-4 bg-white/98 backdrop-blur-xl rounded-3xl border border-app-border-strong shadow-2xl z-40 animate-fade-in"
            >
              <div class="flex items-center justify-between pb-2 mb-3 border-b border-app-border">
                <div class="flex items-center gap-2">
                  <span class="text-base">📋</span>
                  <span class="text-xs font-black uppercase tracking-wider text-text-main">
                    Plantillas Rápidas
                  </span>
                </div>
                <button
                  type="button"
                  @click="isTemplatesPopoverOpen = false"
                  class="w-6 h-6 rounded-full hover:bg-stone-100 text-text-muted hover:text-text-main flex items-center justify-center text-xs font-bold cursor-pointer"
                  title="Cerrar ventana de plantillas"
                >
                  ✕
                </button>
              </div>

              <!-- Selector de Plantillas (al hacer clic no se cierra, se cierra al dar clic fuera) -->
              <TemplatesTool
                :templates="templates.availableTemplates"
                @select-template="handleTemplateSelect"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Expand Right Sidebar Tab Button when Collapsed (Desktop) -->
      <button
        v-if="!isRightSidebarOpen"
        type="button"
        @click="isRightSidebarOpen = true"
        class="hidden lg:flex absolute top-4 right-4 z-20 items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-app-border-strong shadow-md text-xs font-bold text-text-main hover:bg-primary-50 hover:text-primary-600 transition-all cursor-pointer"
        title="Mostrar inspector de propiedades"
      >
        <svg class="w-3.5 h-3.5 text-text-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Inspector</span>
        <span>⚙️</span>
      </button>

      <!-- ============================================== -->
      <!-- COLUMN 3: DEDICATED PROPERTIES INSPECTOR PANEL -->
      <!-- ============================================== -->
      <!-- Desktop Right Inspector Panel -->
      <aside
        v-if="isRightSidebarOpen"
        class="hidden lg:flex w-80 xl:w-96 shrink-0 bg-white border-l border-app-border flex-col h-full overflow-hidden shadow-lg z-20 transition-all duration-300"
        data-purpose="right-inspector-panel"
      >
        <InspectorPanel
          @close-panel="isRightSidebarOpen = false"
          @quick-add="handleQuickAdd"
        />
      </aside>
    </div>

    <!-- ============================================================== -->
    <!-- MOBILE FLOATING ACTION BUBBLES (FABS) & POPOVERS (REQUIREMENT) -->
    <!-- ============================================================== -->
    <!-- Floating Bubbles at Bottom of Mobile Viewport -->
    <div class="lg:hidden fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none flex items-center justify-between">
      <!-- Left Bubble: Abre el popover de las herramientas (Plantillas, Añadir, Fondo, Capas) -->
      <button
        type="button"
        @click="isMobileLeftOpen = true"
        class="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-app-border-strong text-text-main shadow-xl hover:bg-primary-50 font-bold text-xs active:scale-95 transition-all cursor-pointer"
        title="Abrir herramientas y plantillas"
      >
        <span class="text-base leading-none">🛠️</span>
        <span>Herramientas</span>
        <span class="w-2 h-2 rounded-full bg-primary-500"></span>
      </button>

      <!-- Right Bubble: Abre el popover del inspector de propiedades del elemento seleccionado -->
      <button
        type="button"
        @click="isMobileRightOpen = true"
        :class="[
          'pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl font-bold text-xs active:scale-95 transition-all cursor-pointer',
          stage.selectedNode.value
            ? 'bg-primary-gradient text-white ring-4 ring-primary-300/40 animate-pulse'
            : 'bg-white/95 backdrop-blur-md border border-app-border-strong text-text-main hover:bg-primary-50'
        ]"
        title="Abrir inspector de propiedades"
      >
        <span class="text-base leading-none">
          {{ stage.selectedNode.value ? '✏️' : '⚙️' }}
        </span>
        <span>{{ stage.selectedNode.value ? 'Inspector' : 'Ajustes' }}</span>
      </button>
    </div>

    <!-- MOBILE POPOVER 1: LEFT SIDEBAR DRAWER (Herramientas, Plantillas, Fondo, Capas) -->
    <div
      v-if="isMobileLeftOpen"
      class="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
    >
      <!-- Backdrop with click-to-close -->
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        @click="isMobileLeftOpen = false"
      ></div>

      <!-- Popover Drawer Bottom Sheet -->
      <div
        class="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-t border-app-border animate-slide-up"
      >
        <!-- Popover Header -->
        <div class="p-3 border-b border-app-border bg-app-header/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-base">🛠️</span>
            <span class="text-sm font-extrabold text-text-main">Herramientas & Capas</span>
          </div>

          <button
            type="button"
            @click="isMobileLeftOpen = false"
            class="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-xs font-bold text-text-muted hover:text-text-main cursor-pointer"
            title="Cerrar ventana"
          >
            ✕
          </button>
        </div>

        <!-- 2 Tabs in Mobile Popover -->
        <div class="px-4 py-2 bg-app-header/40 border-b border-app-border shrink-0">
          <nav class="grid grid-cols-2 gap-1 p-1 bg-primary-100/70 rounded-xl text-xs font-semibold border border-primary-200">
            <button
              v-for="tab in tabList"
              :key="tab.id"
              type="button"
              @click="activeTab = tab.id"
              :class="[
                'flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-2xs ring-1 ring-app-border-strong'
                  : 'text-text-muted hover:text-text-main'
              ]"
            >
              <span class="text-xs">{{ tab.icon }}</span>
              <span class="text-xs">{{ tab.label }}</span>
            </button>
          </nav>
        </div>

        <!-- Scrollable Tab Content in Mobile Popover -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- TAB 1: AÑADIR -->
          <div v-show="activeTab === 'add'" class="space-y-4">
            <AddTool
              @add-text="handleAddTextAndCloseMobile"
              @select-emoji="handleAddEmojiAndCloseMobile"
              @add-image="handleAddImageAndCloseMobile"
            />
          </div>

          <!-- TAB 2: CAPAS (con opción para modificar fondo) -->
          <div v-show="activeTab === 'layers'" class="space-y-3">
            <div v-if="layersSubMode === 'layers'" class="space-y-3">
              <LayersPanel
                :layers="layers.layersListReversed.value"
                :selected-node="stage.selectedNode.value"
                @select="handleLayerSelectMobile"
                @toggle-lock="handleToggleLock"
                @duplicate="handleDuplicateNode"
                @move-up="layers.moveLayerUp"
                @move-down="layers.moveLayerDown"
                @reorder="handleReorderLayer"
                @remove="layers.removeLayer"
                @clear-all="handleClearAll"
              />

              <!-- Botón Fondo del lienzo colocado hasta abajo -->
              <div class="pt-2 border-t border-app-border">
                <button
                  type="button"
                  @click="layersSubMode = 'background'"
                  class="w-full p-2.5 rounded-2xl border border-app-border bg-stone-50 hover:bg-primary-50/80 hover:border-primary-300 transition-all flex items-center justify-between text-xs font-bold text-text-main cursor-pointer shadow-2xs group"
                >
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-white border border-app-border flex items-center justify-center text-sm shadow-2xs">
                      🎨
                    </div>
                    <div class="text-left">
                      <span class="block text-xs font-bold text-text-main">Fondo del Lienzo</span>
                      <span class="block text-[10px] text-text-muted font-medium">
                        {{ stage.isBgTransparent.value ? 'Transparente' : stage.bgMode.value === 'gradient' ? 'Degradado activo' : 'Color ' + stage.bgColor.value }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 text-[11px] text-primary-600 font-bold">
                    <span>Modificar</span>
                    <span>&rarr;</span>
                  </div>
                </button>
              </div>
            </div>

            <div v-else class="space-y-3">
              <button
                type="button"
                @click="layersSubMode = 'layers'"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50/70 hover:bg-primary-100 border border-primary-200 transition-all cursor-pointer"
              >
                <span>&larr;</span>
                <span>Volver a Capas</span>
              </button>

              <BackgroundTool
                :is-transparent="stage.isBgTransparent.value"
                :bg-mode="stage.bgMode.value"
                :bg-color="stage.bgColor.value"
                :active-gradient="stage.activeGradient.value"
                :gradient-presets="stage.gradientPresets"
                @set-transparent="stage.setBgTransparent"
                @set-color="stage.setBgColor"
                @set-gradient="stage.setBgGradient"
                @fill-pattern="handleFillPattern"
                @clear-pattern="layers.clearEmojiPattern"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE POPOVER 2: RIGHT INSPECTOR DRAWER (Inspector de Propiedades) -->
    <div
      v-if="isMobileRightOpen"
      class="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
    >
      <!-- Backdrop with click-to-close -->
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        @click="isMobileRightOpen = false"
      ></div>

      <!-- Popover Drawer Bottom Sheet -->
      <div
        class="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden border-t border-app-border animate-slide-up"
      >
        <InspectorPanel
          @close-panel="isMobileRightOpen = false"
          @quick-add="handleQuickAddFromMobile"
        />
      </div>
    </div>

    <!-- ============================================== -->
    <!-- GLOBAL MODALS                                  -->
    <!-- ============================================== -->
    <EmojiPickerModal
      :is-open="showPicker"
      @select="onPickerSelect"
      @close="showPicker = false"
    />

    <ExportModal
      :is-open="isExportModalOpen"
      :export-scale="exporter.exportScale.value"
      :canvas-width="stage.canvasWidth.value"
      :canvas-height="stage.canvasHeight.value"
      :copied="exporter.copied.value"
      @close="isExportModalOpen = false"
      @update:export-scale="exporter.exportScale.value = $event"
      @download="handleDownload"
      @copy="exporter.copyToClipboard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { emojiFallback } from './icons';
import { useSocialPresets, type FormatPreset } from '../composables/useSocialPresets';
import { useKonvaStage } from '../composables/useKonvaStage';
import { useKonvaLayers, type TextNodeOptions } from '../composables/useKonvaLayers';
import { useKonvaEffects } from '../composables/useKonvaEffects';
import { useKonvaTemplates } from '../composables/useKonvaTemplates';
import { useCanvasExport } from '../composables/useCanvasExport';
import { useHistoryUndo } from '../composables/useHistoryUndo';
import { createStudioContext, provideCanvasStudio } from '../composables/useCanvasStudioContext';

// Subcomponents per Clean Architecture
import StudioHeader from './studio/StudioHeader.vue';
import KonvaStage from './canvas/KonvaStage.vue';
import CanvasToolbar from './canvas/CanvasToolbar.vue';
import InspectorPanel from './studio/InspectorPanel.vue';
import AddTool from './studio/AddTool.vue';
import BackgroundTool from './studio/BackgroundTool.vue';
import TemplatesTool from './studio/TemplatesTool.vue';
import LayersPanel from './studio/LayersPanel.vue';
import EmojiPickerModal from './common/EmojiPickerModal.vue';
import ExportModal from './common/ExportModal.vue';
import { PLACEHOLDER_IMAGE_URL } from '../utils/index.ts';


// State & Composables
const { currentPreset, formatPresets, selectPreset } = useSocialPresets();
const stage = useKonvaStage();
const layers = useKonvaLayers(stage);
const effects = useKonvaEffects(stage, layers);
const exporter = useCanvasExport(stage);

const history = useHistoryUndo(stage, layers);

// Centralized Studio Context & Dependency Injection Provider
const studio = createStudioContext(stage, layers, history);
provideCanvasStudio(studio);

const templates = useKonvaTemplates(
  stage,
  layers,
  effects,
  (width, height, presetId) => {
    const found = formatPresets.find((p) => p.id === presetId || (presetId === 'stories-reels' && p.id === 'story-reels'));
    if (found) selectPreset(found);
    stage.changeDimensions(width, height);
  }
);

// Sidebar Collapsible States (Requirement: Los sidebars pueden cerrarse para evitar que estorben)
const isLeftSidebarOpen = ref(true);
const isRightSidebarOpen = ref(true);

// Mobile Popover States (Requirement: En mobile son burbujas que abren el popover de las acciones)
const isMobileLeftOpen = ref(false);
const isMobileRightOpen = ref(false);

// Zoom Level state for floating zoom pill
const zoomLevel = ref(1.0);
const zoomIn = () => {
  zoomLevel.value = Math.min(2.5, Math.round((zoomLevel.value + 0.1) * 10) / 10);
};
const zoomOut = () => {
  zoomLevel.value = Math.max(0.4, Math.round((zoomLevel.value - 0.1) * 10) / 10);
};
const resetZoom = () => {
  zoomLevel.value = 1.0;
};

// Tabs in Left Sidebar: solo Añadir y Capas
const activeTab = ref<'add' | 'layers'>('layers');
const layersSubMode = ref<'layers' | 'background'>('layers');
const showPicker = ref(false);
const isExportModalOpen = ref(false);

const tabList = [
  { id: 'add', label: 'Añadir', icon: '➕' },
  { id: 'layers', label: 'Capas', icon: '📚' }
] as const;

// Plantillas Popover Flotante en el Canvas Pill
const isTemplatesPopoverOpen = ref(false);
const templatesPopoverRef = ref<HTMLElement | null>(null);

// Regla: al cambiar de pestaña o cerrar el sidebar, volver por defecto a 'capas'
watch(activeTab, () => {
  layersSubMode.value = 'layers';
});

watch(isLeftSidebarOpen, (isOpen) => {
  if (!isOpen) {
    layersSubMode.value = 'layers';
  }
});

watch(isMobileLeftOpen, (isOpen) => {
  if (!isOpen) {
    layersSubMode.value = 'layers';
  }
});

// Cerrar popover de plantillas al hacer click fuera
const handleDocumentClick = (e: MouseEvent) => {
  if (
    isTemplatesPopoverOpen.value &&
    templatesPopoverRef.value &&
    !templatesPopoverRef.value.contains(e.target as Node)
  ) {
    isTemplatesPopoverOpen.value = false;
  }
};

const quickEmojiList = Object.entries(emojiFallback).map(([name, char]) => ({
  name,
  char
}));

// Automatically open right inspector if an element is clicked and sidebar was collapsed
watch(
  () => stage.selectedNode.value,
  (node) => {
    if (node) {
      if (!isRightSidebarOpen.value && typeof window !== 'undefined' && window.innerWidth >= 1024) {
        isRightSidebarOpen.value = true;
      }
    }
  }
);

const openInspectorPanel = () => {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    isMobileRightOpen.value = true;
  } else {
    isRightSidebarOpen.value = true;
  }
};

const handlePresetSelect = (preset: FormatPreset) => {
  selectPreset(preset);
  stage.changeDimensions(preset.baseWidth, preset.baseHeight);
};

// Al seleccionar plantilla, se aplica y se guarda en historial pero NO se cierra el popover
const handleTemplateSelect = (templateId: string) => {
  templates.applyTemplate(templateId);
  history.saveState(true);
};

const handleAddEmoji = (char: string) => {
  layers.addEmoji(char);
  history.saveState(true);
};

const handleAddEmojiAndCloseMobile = (char: string) => {
  handleAddEmoji(char);
  isMobileLeftOpen.value = false;
  isMobileRightOpen.value = true;
};

const onPickerSelect = (char: string) => {
  handleAddEmoji(char);
};

const handleAddText = (opts: TextNodeOptions) => {
  layers.addText(opts);
  history.saveState(true);
};

const handleAddTextAndCloseMobile = (opts: TextNodeOptions) => {
  handleAddText(opts);
  isMobileLeftOpen.value = false;
  isMobileRightOpen.value = true;
};

const handleAddImage = (url: string) => {
  layers.addImage(url);
  setTimeout(() => history.saveState(true), 120);
};

const handleAddImageAndCloseMobile = (url: string) => {
  handleAddImage(url);
  isMobileLeftOpen.value = false;
  isMobileRightOpen.value = true;
};

const handleLayerSelectMobile = (node: any) => {
  stage.selectNode(node);
  isMobileLeftOpen.value = false;
  isMobileRightOpen.value = true;
};

const handleQuickAdd = (type: 'text' | 'emoji' | 'image') => {
  if (type === 'text') {
    handleAddText({
      text: 'Escribe tu texto...',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 44,
      textColor: '#1e293b',
      strokeWidth: 0,
      strokeColor: undefined,
      fontStyle: 'normal'
    });
  } else if (type === 'emoji') {
    handleAddEmoji('🧁');
  } else if (type === 'image') {
    handleAddImage(PLACEHOLDER_IMAGE_URL);
  }
};

const handleQuickAddFromMobile = (type: 'text' | 'emoji' | 'image') => {
  handleQuickAdd(type);
  isMobileRightOpen.value = true;
};

const handleReorderLayer = (payload: { fromIndex: number; toIndex: number }) => {
  studio.change('reorder', payload);
};

const handleToggleLock = (node?: any) => {
  studio.change('toggleLock', node || stage.selectedNode.value);
};

const handleDuplicateNode = (node: any) => {
  stage.selectNode(node);
  studio.change('duplicate');
};

const handleDeleteSelected = () => {
  studio.change('delete');
};

const handleFillPattern = (emojiChar: string) => {
  layers.fillEmojiPattern(emojiChar);
  history.saveState();
};

const handleClearAll = () => {
  if (confirm('¿Estás seguro de que deseas vaciar todas las capas del lienzo?')) {
    studio.change('clearAll');
  }
};

const handleDownload = () => {
  const cleanName = currentPreset.value.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  exporter.downloadPng(`pixemoji-${cleanName}`);
};

const handleKeyDown = (e: KeyboardEvent) => {
  const activeEl = document.activeElement as HTMLElement | null;
  const inputType = activeEl && activeEl.tagName === 'INPUT' ? (activeEl as HTMLInputElement).type?.toLowerCase() : '';
  const isNonTextInput = ['checkbox', 'radio', 'range', 'color', 'button', 'submit'].includes(inputType);
  const isTyping = activeEl && !isNonTextInput && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.isContentEditable ||
    Boolean(activeEl.closest?.('[contenteditable="true"]')) ||
    Boolean(activeEl.closest?.('.tiptap')) ||
    Boolean(activeEl.closest?.('.ProseMirror'))
  );

  if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
    if (stage.selectedNode.value) {
      e.preventDefault();
      handleDeleteSelected();
    }
  }

  if ((e.ctrlKey || e.metaKey) && !isTyping) {
    if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      if (e.shiftKey) history.redo();
      else history.undo();
    } else if (e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      history.redo();
    }
  }
};

onMounted(async () => {
  await stage.initStage({
    containerId: 'konva-meme-stage',
    initialWidth: currentPreset.value.baseWidth,
    initialHeight: currentPreset.value.baseHeight
  });

  if (stage.stageInstance.value) {
    stage.stageInstance.value.on('dragend transformend', () => {
      history.saveState();
    });
  }

  // Initial demo template or emoji
  layers.addEmoji('🧁');
  history.saveState(true);

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('click', handleDocumentClick);
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('click', handleDocumentClick);
  }
  stage.destroyStage();
});
</script>
