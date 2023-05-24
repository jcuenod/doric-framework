<script lang="ts" setup>
import type {
  WidgetId
} from '../types'
import {
  getWidget,
  getWidgetIds,
} from '../doric'

const props = defineProps({
  widgetId: {
    type: String,
    required: true,
  }
})
const emit = defineEmits([
  'setWidgetOfInterest',
])

const widget = getWidget(props.widgetId)
const widgetIds = getWidgetIds()

const isSubscribedTo = (key: string, widgetId: WidgetId) =>
  widget.inputs[key].subscriptions.includes(widgetId)

const toggleSubscription = (key: string, widgetId: WidgetId) => {
  const checked = !isSubscribedTo(key, widgetId)

  // Update the subscription's widgetSubscriptions
  const newKeySubscriptions = [...widget.inputs[key].subscriptions]
  if (checked) {
    newKeySubscriptions.push(widgetId)
  } else {
    const index = newKeySubscriptions.indexOf(widgetId)
    if (index > -1) {
      newKeySubscriptions.splice(index, 1)
    }
  }
  widget.inputs[key].subscriptions = [...newKeySubscriptions]
}
const subscribeToAll = (key: string) => {
  const newKeySubscriptions = [...widgetIds]
  widget.inputs[key].subscriptions = newKeySubscriptions
}

const toggleShared = (key: string) => {
  widget.inputs[key].shared = !widget.inputs[key].shared
}

const onMouseEnter = (widgetId: WidgetId) => {
  emit("setWidgetOfInterest", widgetId)
}
const onMouseLeave = () => {
  emit("setWidgetOfInterest", "")
}
</script>

<template>
  <div>
    <span class="title">
      Label:
    </span>
    <input v-model="widget.label" />
  </div>
  <div v-if="Object.keys(widget.inputs).length === 0">This widget does not declare any inputs.</div>
  <div v-else>
    <span class="title">
      Configure Inputs:
    </span>
    <div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Subscriptions</th>
              <th>Shared</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="key in Object.keys(widget.inputs)" :key="key">
              <td>{{ key }}</td>
              <td>
                <input v-model="widget.inputs[key].value" />
              </td>
              <td>
                <!-- use checkboxes instead of multi-select -->
                <span v-for="widgetId in widgetIds" :key="widgetId" @mouseenter="onMouseEnter(widgetId)"
                  @mouseleave="onMouseLeave">
                  <input type="checkbox" :id="`${widgetId}.${key}`" class="multi-select"
                    :checked="isSubscribedTo(key, widgetId)" @change="toggleSubscription(key, widgetId)" />
                  <label :for="`${widgetId}.${key}`">
                    {{ widgetId }}
                  </label>
                </span>
                <button class="wildcard-subscription" v-show="widget.inputs[key].subscriptions.length === 0"
                  title="Implicit subscription to all widgets" @click="subscribeToAll(key)">✱</button>
              </td>
              <td>
                <input type="checkbox" :id="widgetId" :checked="widget.inputs[key].shared" @change="toggleShared(key)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.title {
  font-weight: bold;
  margin-right: 1rem;
}

table {
  width: 100%;

  >thead {
    background-color: #eee;
  }

  select {
    width: 100%;
  }
}

input[type=checkbox].multi-select {
  display: none;

  &+label {
    font-size: x-small;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 2px;
    padding: 0 5px;
    display: inline-block;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #eee;
    }
  }

  &:checked+label {
    background-color: #c0e0ff;
  }
}

.wildcard-subscription {
  background: transparent;
  border: none;
  font-size: x-small;
  font-weight: bold;
  padding: 0 2px;
  cursor: pointer;

  &:hover {
    color: #eee;
  }
}
</style>
