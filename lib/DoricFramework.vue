<script setup lang="ts">
import type {
  WidgetId,
  Workspace,
  WidgetComponentMap,
} from './types'
import { defineComponent, ref, watch, PropType } from 'vue'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import draggable from "vuedraggable"
import {
  getWorkspaceShape,
  setWorkspace,
  insertColumn as insertDoricColumn,
  removeColumn as removeDoricColumn,
  addWidget as addDoricWidget,
  removeWidget as removeDoricWidget,
  moveWidget as moveDoricWidget,
  sharedParameters,
  setDefaultLabels,
  getWidget,
} from './doric'

// defineProps for vue and typescript
const props = defineProps({
  locked: {
    type: Boolean,
    required: false,
    default: false,
  },
  widgets: {
    type: Object as PropType<WidgetComponentMap>,
    required: true,
    default: () => ({}),
  },
  workspace: {
    type: Object as PropType<Workspace>,
    required: true,
    default: () => ([[]]),
  },
})

setDefaultLabels(Object.fromEntries(Object.keys(props.widgets).map(key => [key, props.widgets[key].defaultLabel])))

const emit = defineEmits(['setSharedParameters', 'onWorkspaceReady'])

import DoricWidgetConfig from './components/WidgetConfig.vue'
import DoricMissingWidget from './components/MissingWidget.vue'
import ScopedComponent from './components/ScopedComponent.vue'

const loadingWorkspace = ref(false)
const configWidget = ref("")
const showWidgetsToAddColumn = ref(-1)
const subscriptionMode = ref({
  widgetId: "",
  input: "",
})

const turnOffConfigMode = () => {
  configWidget.value = ""
  subscriptionMode.value = {
    widgetId: "",
    input: "",
  }
  showWidgetsToAddColumn.value = -1
}

const pushWorkspace = (newWorkspace: unknown) => {
  if (!newWorkspace) {
    console.warn("newWorkspace is null")
    return false
  }
  loadingWorkspace.value = true
  turnOffConfigMode()
  setWorkspace(newWorkspace).then(() => {
    loadingWorkspace.value = false
  }).then(() => {
    emit("onWorkspaceReady")
  })
}
watch(() => props.workspace, pushWorkspace)
pushWorkspace(props.workspace)

watch(sharedParameters, (newSharedParameters, oldSharedParameters) => {
  emit("setSharedParameters", newSharedParameters, oldSharedParameters)
})

watch(() => props.widgets, (newWidgets) => {
  setDefaultLabels(Object.fromEntries(Object.keys(newWidgets).map(key => [key, newWidgets[key].defaultLabel])))
})

watch(() => props.locked, (newLocked) => {
  if (newLocked) {
    turnOffConfigMode()
  }
})

const configureWidget = (widgetId: WidgetId) => {
  const currentConfigWidget = configWidget.value
  turnOffConfigMode()
  if (currentConfigWidget === widgetId) {
    return
  }
  configWidget.value = widgetId
}

const removeWidget = (widgetId: WidgetId) => {
  turnOffConfigMode()
  removeDoricWidget(widgetId)
}

const setColumnToAddWidget = (column: number) => {
  turnOffConfigMode()
  if (showWidgetsToAddColumn.value === column) {
    return
  }
  showWidgetsToAddColumn.value = column
}

const addWidget = (widgetType: keyof typeof props.widgets, column: number) => {
  addDoricWidget({
    id: `${widgetType}-0`,
    type: `${widgetType}`,
  }, column)
  turnOffConfigMode()
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

const addColumn = (index: number) => {
  insertDoricColumn(index)
}

const removeColumn = (index: number) => {
  removeDoricColumn(index)
}

const createColumnForWidget = (first: boolean, event: any[]) => {
  const colIndex = first ? 0 : getWorkspaceShape().length
  insertDoricColumn(colIndex)
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
    locked: {
      type: Boolean,
      required: false,
      default: false,
    },
    widgets: {
      type: Object as PropType<WidgetComponentMap>,
      required: true,
      default: () => ({}),
    },
    workspace: {
      type: Object as PropType<Workspace>,
      required: true,
      default: () => ([]),
    },
  },
  emits: ['setSharedParameters', 'onWorkspaceReady'],
})

const setSubscriptionMode = (widgetId: WidgetId | null, input: string) => {
  if (!widgetId) {
    subscriptionMode.value = {
      widgetId: "",
      input: "",
    }
    return
  }
  subscriptionMode.value = {
    widgetId,
    input,
  }
}

const getBorderColor = (widgetId: WidgetId) => {
  return configWidget.value === widgetId
    ? "border-blue-600 hover:border-blue-700"
    : "border-gray-200 hover:border-gray-300"
}
const getHeaderColor = (widgetId: WidgetId) => {
  if (props.locked) {
    return "bg-gray-100"
  }
  return configWidget.value === widgetId
    ? "bg-blue-100 group-hover:bg-blue-200"
    : "bg-gray-50 group-hover:bg-gray-100"
}

const subscriptionClasses = {
  subscribed: 'subscribed',
  unsubscribed: 'not-subscribed',
}
const isSubscribedTo = (subscriberId: WidgetId, inputKey: string, targetId: WidgetId) => {
  const subscriber = getWidget(subscriberId)
  if (!subscriber) {
    console.error(`Widget not found: ${subscriberId}`)
    throw new Error(`Widget not found: ${subscriberId}`)
  }
  return subscriber.inputs[inputKey].subscriptions.includes(targetId)
}
const getSubscriptionClass = (subscriberId: WidgetId, inputKey: string, targetId: WidgetId) => {
  return subscriptionClasses[isSubscribedTo(subscriberId, inputKey, targetId)
    ? 'subscribed'
    : 'unsubscribed']
}
const toggleSubscription = (widgetId: WidgetId) => {
  if (!subscriptionMode.value.widgetId || !subscriptionMode.value.input) {
    console.error("Should be impossible: toggleSubscription called without subscriptionMode")
    return
  }
  const subscriber = getWidget(subscriptionMode.value.widgetId)
  const key = subscriptionMode.value.input

  // Update the subscription's widgetSubscriptions
  const newKeySubscriptions = [...subscriber.inputs[key].subscriptions]
  if (!newKeySubscriptions.includes(widgetId)) {
    newKeySubscriptions.push(widgetId)
  } else {
    const index = newKeySubscriptions.indexOf(widgetId)
    if (index > -1) {
      newKeySubscriptions.splice(index, 1)
    }
  }
  subscriber.inputs[key].subscriptions = [...newKeySubscriptions]
}
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
            <div class="relative mx-1 my-2">
              <button v-if="subscriptionMode.input && configWidget !== element.id"
                @click="() => toggleSubscription(element.id)" class="subscription-helper"
                :class="getSubscriptionClass(subscriptionMode.widgetId, subscriptionMode.input, element.id)">
                <div>
                  {{ isSubscribedTo(subscriptionMode.widgetId, subscriptionMode.input, element.id)
                    ? 'Subscribed'
                    : 'Click to Subscribe' }}
                </div>
              </button>
              <div class="doric-widget-framework__widget border-2 rounded group" :class="getBorderColor(element.id)">
                <header class="p-1" :class="getHeaderColor(element.id) + (locked ? '' : ' drag-handle')">
                  <div class="flex-1 flex flex-row items-center">
                    <span class="text-gray-900 text-sm font-bold mx-2 my-1">
                      {{ configWidget !== element.id ? element.label : "Label:" }}
                    </span>
                    <input v-if="configWidget === element.id" type="text" v-model="getWidget(element.id).label"
                      class="w-full mr-2" />
                  </div>
                  <div v-if="!locked" :class="{ invisible: configWidget && configWidget !== element.id }"
                    class="flex flex-row items-center">
                    <button v-if="element?.type in widgets && 'widget' in widgets[element.type]"
                      @click="() => configureWidget(element.id)" class="config-button"
                      :class="configWidget === element.id ? 'active-config' : ''">
                      <!-- `cog-6-tooth` icon from https://heroicons.com/, MIT license -->
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button @click="() => removeWidget(element.id)" class="config-button"
                      :class="configWidget === element.id ? 'active-config' : ''">
                      <!-- `x-mark` icon from https://heroicons.com/, MIT license -->
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </header>
                <div v-if="configWidget === element.id" class="p-1">
                  <DoricWidgetConfig :widgetId="element.id" @setSubscriptionMode="setSubscriptionMode" />
                </div>
                <!-- We use "hidden", because we want the component to stay in the DOM
                whether or not it's visible -->
                <div :class="{ 'hidden': configWidget === element.id }" class="p-1">
                  <div class="widget" v-if="element?.type in widgets && 'widget' in widgets[element.type]">
                    <ScopedComponent :widget="widgets[element.type].widget" :widgetId="element.id" />
                  </div>
                  <DoricMissingWidget :type="element?.type" v-else />
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <div v-if="!locked" class="column-buttons">
          <div class="center">
            <button class="remove-column-button" v-if="column.length === 0" @click="() => removeColumn(index)">
              Remove Column
            </button>
          </div>
          <div>
            <div class="center">
              <button :class="'add-widget-button ' + (index === showWidgetsToAddColumn ? 'toggled' : '')"
                @click="() => setColumnToAddWidget(index === showWidgetsToAddColumn ? -1 : index)" title="Add Widget">
                <!-- `plus` icon from https://heroicons.com/, MIT license -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                  stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
            <div class="add-widget-list" :class="{ collapsed: showWidgetsToAddColumn !== index }">
              <button v-for="(widgetType) in Object.keys(widgets)" :key="widgetType"
                @click="() => addWidget(widgetType, index)">
                {{ widgets[widgetType].defaultLabel }}
              </button>
            </div>
          </div>
        </div>
      </pane>
    </splitpanes>
    <draggable v-if="!locked" class="list-group" :list="[]" group="widgets" @change="createColumnForWidget(false, $event)"
      itemKey="id">
      <template #item="_">
        <!-- This is just a placeholder to receive widgets and create columns on the fly -->
      </template>
    </draggable>
    <div v-if="!locked" class="column-insert">
      <button @click="addColumn(getWorkspaceShape().length)">
        <!-- `plus mini` icon from https://heroicons.com/, MIT license -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path
            d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.doric-widget-framework {
  display: flex;
  flex-direction: row;
  flex: 1;
  margin-left: 0.25rem; // i.e. ml-1 (normalizes spacing of panes)
  overflow: hidden;
  height: 100%;
  text-align: left;

  .doric-widget-framework__widget {
    position: relative;

    &.config-mode {
      border-color: rgb(37, 99, 235);
    }

    &.sortable-chosen {
      /* border-blue-400 */
      border: 2px solid rgb(96, 165, 250);
    }

    header {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      user-select: none;

      button.config-button {
        all: initial;
        cursor: pointer;

        @apply p-1 rounded text-gray-600;

        &:hover {
          @apply text-black bg-gray-300;
        }

        &:active {
          @apply bg-gray-400 scale-90;
        }

        &.active-config {
          @apply text-blue-800;

          &:hover {
            @apply bg-blue-400 text-blue-900;
          }

          &:active {
            @apply bg-blue-600;
          }
        }
      }

      input[type="text"] {
        @apply p-0.5 text-sm border-none bg-blue-100 text-gray-900 text-sm rounded block py-1 px-2 outline-none;

        &:hover {
          @apply bg-blue-50;
        }

        &:focus {
          @apply bg-white;
        }
      }

      &.drag-handle {
        cursor: grab;
      }
    }

    .hidden {
      display: none;
    }
  }

  button.subscription-helper {
    @apply absolute block left-0 top-0 w-full h-full m-0 flex flex-col items-center justify-center font-bold text-xl cursor-pointer z-10 rounded border-4;

    &.subscribed {
      // @apply bg-blue-200 border-blue-400 text-white
      background-color: rgb(96, 165, 250, 0.8);
      border-color: rgb(37, 99, 235);
      color: white;

      &:hover {
        // @apply bg-blue-300 border-blue-500;
        background-color: rgb(37, 99, 235, 0.8);
        border-color: rgb(37, 99, 235);
      }

      &:active {
        // @apply bg-blue-500 border-blue-600;
        background-color: rgb(10, 132, 255, 0.8);
        border-color: rgb(10, 132, 255);
      }
    }

    &.not-subscribed {
      /* bg-gray-200 border-gray-300 text-gray-800 */
      background-color: rgb(229, 231, 235, 0.8);
      border-color: rgb(209, 213, 219);
      color: rgb(75, 85, 99);

      &:hover {
        /* bg-gray-300 border-gray-400 */
        background-color: rgb(209, 213, 219, 0.8);
        border-color: rgb(156, 163, 175);
      }

      &:active {
        /* bg-gray-500 border-gray-600 */
        background-color: rgb(107, 114, 128, 0.8);
        border-color: rgb(75, 85, 99);
      }
    }
  }

  .column-buttons {
    @apply flex flex-col items-center mt-2 mx-2;

    .center {
      @apply flex flex-col items-center w-full;

      .remove-column-button {
        @apply w-full mb-3 p-2 bg-gray-100 text-gray-600 rounded-sm text-sm font-bold border-none;
        transition: none;

        &:hover {
          @apply bg-red-100 text-red-800;
        }

        &:active {
          @apply scale-95;
        }
      }

      .add-widget-button {
        @apply flex justify-center items-center p-1 rounded-full bg-gray-50 border-2 border-gray-200 text-gray-600 z-10;
        transition: transform 60ms ease;
        transform-origin: center;

        &.toggled {
          @apply text-red-800;
          transform: rotate(45deg);

          &:hover {
            @apply bg-gray-200 text-red-800 border-gray-300;
          }
        }

        &:hover {
          @apply bg-blue-200 text-blue-800 border-blue-300;
        }

        &:active {
          @apply scale-90;
        }
      }
    }

    .add-widget-list {
      @apply flex flex-col items-center m-1 mb-4 p-2 rounded bg-gray-50 border-2 border-gray-200;
      margin-top: -0.9rem;
      padding-top: 1rem;
      overflow: hidden;
      transition-property: transform, height;
      transition-delay: 0s, 120ms;
      transition-duration: 120ms, 0s;
      transition-timing-function: ease, linear;
      transform-origin: 50% 0%;

      &.collapsed {
        transform: scale(0);
        height: 0;
      }

      button {
        @apply m-1 py-2 px-8 text-sm font-bold border-none bg-gray-200 text-gray-700 rounded;

        &:hover {
          @apply bg-blue-100 text-blue-800;
        }
      }
    }
  }
}

.column-insert {
  @apply ml-1;

  > button {
   @apply h-full w-6 p-0 m-0 flex items-center justify-center bg-gray-200 text-gray-600 border-none rounded-none;
 
   &:hover {
     @apply bg-blue-200 text-blue-800;
   }
   &:active {
     @apply bg-blue-300;
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

.ghost {
  opacity: 0.7;
}
</style>