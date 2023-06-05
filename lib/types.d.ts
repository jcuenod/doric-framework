export type WidgetComponentMap = {
    [widgetKey: string]: {
        defaultLabel: string,
        widget: Function,
    }
}

export type SubscriptionState = "all" | "none" | "some"

export type WidgetId = string

export type MinimalInput = {
    value?: string
    shared?: boolean
    subscriptions: WidgetId[]
    subscriptionState?: SubscriptionState
}
export type MinimalInputs = {
    [key: string]: MinimalInput
}

export type Inputs = {
    [key: string]: {
        value: string
        shared: boolean
        subscriptions: WidgetId[]
        subscriptionState: SubscriptionState
    }
}

export type MinimalWidget = {
    type: string
    id?: WidgetId
    label?: string
    inputs?: MinimalInputs
}

export type WidgetWithInputs = {
    type: string
    inputs: MinimalInputs
}

export type Widget = {
    id: WidgetId
    type: string
    label: string
    inputs: Inputs
}

export type Workspace = Widget[][]

export type MinimalWorkspace = MinimalWidget[][]

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
}