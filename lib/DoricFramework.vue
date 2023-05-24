<script setup lang="ts">
import type {
  Workspace,
  WidgetInputState,
  UseDoricInputOptions,
  WidgetId,
} from './types'
import { defineComponent, nextTick, ref, watch } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import draggable from "vuedraggable"
import {
  getUseDoricInput,
  getUseDoricOutput,
  getWorkspaceShape,
  setWorkspace,
  insertColumn,
  removeColumn,
  addWidget as addDoricWidget,
  removeWidget as removeDoricWidget,
  moveWidget as moveDoricWidget,
  injectWorkspaceState,
  sharedParameters,
  setDefaultLabels,
} from './doric'

// defineProps for vue and typescript
const props = defineProps({
  widgets: {
    type: Object,
    required: true,
    default: () => ({}),
  },
  workspace: {
    type: Object,
    required: true,
    default: () => ([[]]),
  },
  initialState: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

setDefaultLabels(Object.fromEntries(Object.keys(props.widgets).map(key => [key, props.widgets[key].defaultLabel])))

const emit = defineEmits(['setSharedParameters'])

import DoricWidgetConfig from './components/WidgetConfig.vue'
import DoricMissingWidget from './components/MissingWidget.vue'

const loadingWorkspace = ref(false)
const configWidget = ref("")
const showWidgetsToAddColumn = ref(-1)

const pushWorkspace = (newWorkspace: Workspace) => {
  if (!newWorkspace) {
    return
  }
  loadingWorkspace.value = true
  configWidget.value = ""
  showWidgetsToAddColumn.value = -1
  setWorkspace(newWorkspace).then(() => {
    loadingWorkspace.value = false
  })
}
watch(() => props.workspace as Workspace, pushWorkspace)
pushWorkspace(props.workspace as Workspace)

const pushState = (newInitialState: WidgetInputState[]) => {
  if (!newInitialState) {
    return
  }
  const waitForWorkspace = () => {
    if (loadingWorkspace.value) {
      nextTick(waitForWorkspace)
      return
    }
    injectWorkspaceState(newInitialState)
  }
  nextTick(waitForWorkspace)
}
watch(() => props.initialState as WidgetInputState[], pushState)
pushState(props.initialState as WidgetInputState[])

watch(sharedParameters, (newSharedParameters, oldSharedParameters) => {
  emit("setSharedParameters", newSharedParameters, oldSharedParameters)
})

const configureWidget = (widgetId: WidgetId) => {
  if (configWidget.value === widgetId) {
    configWidget.value = ""
    return
  }
  showWidgetsToAddColumn.value = -1
  configWidget.value = widgetId
}

const removeWidget = (widgetId: WidgetId) => {
  configWidget.value = ""
  removeDoricWidget(widgetId)
}

const setColumnToAddWidget = (column: number) => {
  if (showWidgetsToAddColumn.value === column) {
    showWidgetsToAddColumn.value = -1
    return
  }
  configWidget.value = ""
  showWidgetsToAddColumn.value = column
}

const addWidget = (widgetType: keyof typeof props.widgets, column: number) => {
  addDoricWidget({
    id: widgetType.replace("-widget", "-0"),
    type: widgetType,
  }, column)
  showWidgetsToAddColumn.value = -1
}


const handleRearrange = (colIndex: number, event: any[]) => {
  Object.entries(event).forEach(([method, details]) => {
    if (details?.element?.id && Number.isInteger(details?.newIndex)) {
      const widgetId = details.element.id
      const newIndex = details.newIndex
      if (method === "moved" || method === "added") {
        moveDoricWidget(widgetId, colIndex, newIndex)
      }
    }
    // Technically there is also the `method === "removed"`
    // We are not handling it, because we know that when a 
    // widget is "added" by draggable, it is also "removed" 
    // from the previous column
  })
}

const createColumnForWidget = (first: boolean, event: any[]) => {
  const colIndex = first ? 0 : getWorkspaceShape().length
  insertColumn(colIndex)
  Object.entries(event).forEach(([method, details]) => {
    const widgetId = details.element.id
    if (method === "added") {
      moveDoricWidget(widgetId, colIndex, 0)
    }
  })
}

defineComponent({
  name: 'DoricFramework',
  props: {
    widgets: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    workspace: {
      type: Object,
      required: true,
      default: () => ([[]]),
    },
    initialState: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },
  emits: ['setSharedParameters'],
})
</script>

<template>
  <div class="doric-widget-framework">
    <draggable class="list-group" :list="[]" group="widgets" @change="createColumnForWidget(true, $event)" itemKey="id">
      <template #item="_">
        <!-- This is just a placeholder to receive widgets and create columns on the fly -->
      </template>
    </draggable>
    <splitpanes>
      <pane min-size="20" v-for="(column, index) in getWorkspaceShape()" :key="index"
        :size="100 / getWorkspaceShape().length">

        <draggable class="list-group" :list="column" group="widgets" @change="handleRearrange(index, $event)" itemKey="id"
          handle=".drag-handle">
          <template #item="{ element }">
            <div class="doric-widget-framework__widget border-2 border-gray-200 rounded m-1"
              :class="{ 'config-mode': configWidget === element.id }">
              <header class="drag-handle bg-gray-100 p-1">
                <span class="text-gray-900 text-sm font-bold ml-2">
                  {{ !configWidget ? element.label : element.id }}
                </span>
                <span class="config-button" :class="{ invisible: configWidget && configWidget !== element.id }">
                  <button v-if="element?.type in widgets && 'widget' in widgets[element.type]"
                    @click="() => configureWidget(element.id)"
                    class="p-1 rounded text-gray-600 hover:bg-gray-300 hover:text-black active:bg-gray-400 active:scale-90">
                    <!-- `cog-6-tooth` icon from https://heroicons.com/, MIT license -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button @click="() => removeWidget(element.id)"
                    class="p-1 rounded text-gray-600 hover:bg-gray-300 hover:text-black active:bg-gray-400 active:scale-90">
                    <!-- `x-mark` icon from https://heroicons.com/, MIT license -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </header>
              <div v-if="configWidget === element.id">
                <DoricWidgetConfig :widgetId="element.id" />
              </div>
              <div :class="{ 'hidden': configWidget === element.id }">
                <component v-if="element?.type in widgets && 'widget' in widgets[element.type]"
                  :is="widgets[element.type].widget"
                  :useDoricOutput="(param: string) => getUseDoricOutput(element.id, param)"
                  :useDoricInput="(param: string, options: UseDoricInputOptions) => getUseDoricInput(element.id, param, options)" />
                <DoricMissingWidget :type="element?.type" v-else />
              </div>
            </div>
          </template>
        </draggable>

        <div class="column-buttons">
          <div class="center">
            <button v-if="column.length === 0" @click="() => removeColumn(index)">
              Remove Column
            </button>
          </div>
          <div>
            <div class="center">
              <button v-if="showWidgetsToAddColumn === -1" @click="() => setColumnToAddWidget(index)">
                +
              </button>
              <button v-else-if="showWidgetsToAddColumn === index" @click="() => setColumnToAddWidget(-1)">
                x
              </button>
            </div>
            <div class="add-widget-list" :class="{ invisible: showWidgetsToAddColumn !== index }">
              <button v-for="(widgetType) in Object.keys(widgets)" :key="widgetType"
                @click="() => addWidget(widgetType, index)">
                {{ widgets[widgetType].defaultLabel }}
              </button>
            </div>
          </div>
        </div>
      </pane>
    </splitpanes>
    <draggable class="list-group" :list="[]" group="widgets" @change="createColumnForWidget(false, $event)" itemKey="id">
      <template #item="_">
        <!-- This is just a placeholder to receive widgets and create columns on the fly -->
      </template>
    </draggable>
    <div class="column-insert"><button @click="insertColumn(getWorkspaceShape().length)">+</button></div>
  </div>
</template>

<style lang="scss" scoped>
.doric-widget-framework {
  display: flex;
  flex-direction: row;
  flex: 1;
  margin: 0 0.1rem;
  overflow: hidden;
  height: 100%;

  .doric-widget-framework__widget {

    &.config-mode {
      border-color: orange;
    }

    &.sortable-chosen {
      border: 1px dashed #000;
    }

    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      user-select: none;

      &.drag-handle {
        cursor: grab;
      }
    }

    >div {
      padding: 0.5rem;
    }

    .hidden {
      display: none;
    }
  }

  .column-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;

    .center {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .add-widget-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #eee;
      padding: 0.5rem;
      margin: 0.2rem;
      border: 1px solid #000;
      border-radius: 3px;

      button {
        margin: 0.2rem;
      }
    }
  }
}
</style>

<style lang="scss" global>
.splitpanes {
  height: auto;

  .splitpanes__pane {
    overflow: auto;
  }
}

.splitpanes--vertical>.splitpanes__splitter {
  box-sizing: border-box;
  width: 12px;
  margin: 0 1px;
  border-left: 4px solid #fff;
  border-right: 4px solid #fff;
  background-color: #f8f8f8;
  user-select: none;

  &:hover {
    background-color: #ccc;
  }
}
</style>