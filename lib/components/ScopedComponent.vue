<script setup lang="ts">
import type {
    UseDoricInputOptions,
    UseDoricInputFunction,
    UseDoricOutputFunction,
} from '../types'
import { Component, provide } from 'vue'
import {
    getUseDoricInput,
    getUseDoricOutput,
} from '../doric'

const props = defineProps<{
    widget: Component
    widgetId: string
}>()

provide<UseDoricOutputFunction>('useDoricOutput', (inputKey: string) => getUseDoricOutput(props.widgetId, inputKey))
provide<UseDoricInputFunction>('useDoricInput', (inputKey: string, options: UseDoricInputOptions) => getUseDoricInput(props.widgetId, inputKey, options))
</script>

<template>
    <component :is="widget" />
</template>