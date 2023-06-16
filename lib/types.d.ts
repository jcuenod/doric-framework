import type { Component } from "vue"

export type WidgetComponentMap = {
    [widgetKey: string]: {
        defaultLabel: string,
        widget: Component
    }
}

export type SubscriptionState = "all" | "none" | "some"

export type WidgetId = string

export type Input = {
    value?: string
    shared?: boolean
    subscriptions?: WidgetId[]
    subscriptionState?: SubscriptionState
}
export type Inputs = {
    [key: string]: Input
}

export type ValidatedInput = {
    value: string
    shared: boolean
    subscriptions: WidgetId[]
    subscriptionState: SubscriptionState
}

export type ValidatedInputs = {
    [key: string]: ValidatedInput
}

export type Widget = {
    type: string
    id?: WidgetId
    label?: string
    inputs?: Inputs
}

export type WidgetWithInputs = {
    type: string
    inputs: Inputs
}

export type ValidatedWidget = {
    id: WidgetId
    type: string
    label: string
    inputs: ValidatedInputs
}

export type Workspace = Widget[][]

export type ValidatedWorkspace = ValidatedWidget[][]

export type SharedParameters = {
    widgetId: string
    key: string
    value: string
}

export type WidgetInputState = {
    widgetId: string
    key: string
    value: any
}

export type DefaultLabels = {
    [key: string]: string
}

export type UseDoricInputOptions = {
    shared?: boolean
} | undefined

export type UseDoricInputFunction = (inputKey: string, options?: UseDoricInputOptions) => {
    value: string
}

export type UseDoricOutputFunction = (inputKey: string) => (value: any) => void