<script lang="ts" setup>
import {
  ref,
} from 'vue'
import {
  getWidget,
} from '../doric'

const props = defineProps({
  widgetId: {
    type: String,
    required: true,
  }
})
const emit = defineEmits([
  'setSubscriptionMode',
])

const widget = getWidget(props.widgetId)

const toggleShared = (key: string) => {
  widget.inputs[key].shared = !widget.inputs[key].shared
}

const subscriptionMode = ref("")
const toggleSubscriptionMode = (inputKey: string) => {
  if (subscriptionMode.value === inputKey) {
    // null value unsets
    emit("setSubscriptionMode")
    subscriptionMode.value = ""
  }
  else {
    emit("setSubscriptionMode", props.widgetId, inputKey)
    subscriptionMode.value = inputKey
  }
}
const turnOffSubscriptionMode = () => {
  emit("setSubscriptionMode")
  subscriptionMode.value = ""
}
</script>

<template>
  <div v-if="Object.keys(widget.inputs).length === 0">This widget does not declare any inputs.</div>
  <div v-else>
    <div>
      <div v-for="(key, index) in Object.keys(widget.inputs)" :key="key" class="relative flex flex-col p-2" :class="{'border-t-2': index > 0}">
        <span class="font-bold text-blue-800 text-sm">
          {{ key }}
        </span>

        <div class="table w-full">
          <div class="table-row">
            <div class="table-cell pb-1 pr-2">Value:</div>
            <div class="table-cell pb-1">
              <input type="text" v-model="widget.inputs[key].value" />
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell pb-1 pr-2">Subscriptions:</div>
            <div class="table-cell pb-1">
              <div class="flex flex-row">
                <div class="flex justify-center items-center">
                  <select v-model="widget.inputs[key].subscriptionState" @change="turnOffSubscriptionMode">
                    <!-- options for SubscriptionState -->
                    <option value="none">None</option>
                    <option value="all">All</option>
                    <option value="some">Some</option>
                  </select>
                </div>
                <div class="flex justify-center items-center pl-1">
                  <button v-show="widget.inputs[key].subscriptionState === 'some'" class="subscription-button"
                    :class="{ active: subscriptionMode === key }" @click="toggleSubscriptionMode(key)">
                    <!-- `viewfinder-circle` icon from https://heroicons.com/, MIT license -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                      stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell pb-1 pr-2">Share:</div>
            <div class="table-cell pb-1 truncate">
              <div class="flex flex-row justify-between shared-toggle">
                <input class="hidden" type="checkbox" :id="widgetId" :checked="widget.inputs[key].shared"
                  @change="toggleShared(key)" />
                <label :for="widgetId">
                  <div class="dot">
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-weight: bold;
  margin-right: 1rem;
}

button.subscription-button {
  // reset all styles
  all: initial;
}

button.subscription-button,
select {
  border: 1px solid black;
  @apply box-border h-8 px-2 bg-gray-50 cursor-pointer text-sm font-medium text-gray-900 rounded border border-gray-200 select-none;

  &:hover {
    @apply bg-gray-100 text-blue-700 border-gray-300;
  }

  &:active {
    @apply bg-gray-200 border-blue-400;
  }

  &:focus {
    @apply border-blue-400;
  }

  &.active {
    @apply bg-blue-100 text-blue-700 border-blue-300;

    &:hover {
      @apply bg-blue-200 border-blue-400;
    }
  }
}

input[type="text"] {
  @apply inline-block w-full border border-gray-300 text-gray-900 text-sm rounded block py-1 px-2
}

.shared-toggle input {
  &+label {
    @apply flex items-center p-1 cursor-pointer bg-gray-300 relative w-8 rounded-full;

    &:hover {
      @apply bg-gray-200;
    }

    .dot {
      @apply relative bg-white border border-gray-200 w-3 h-3 rounded-full transition;
    }
  }

  &:checked+label {
    @apply bg-blue-500 border-blue-300;

    &:hover {
      @apply bg-blue-400;
    }

    .dot {
      transform: translateX(100%);
    }
  }
}
</style>
