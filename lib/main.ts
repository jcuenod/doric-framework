import type {
    Workspace,
    SharedParameters,
    WidgetInputState,
} from './types'
import DoricFramework from './DoricFramework.vue'
import { exportWorkspace } from "./doric"
import { useDoricInput, useDoricOutput } from "./useDoricInputOutput"
import "./index.css"

export {
    DoricFramework,
    exportWorkspace,
    useDoricInput,
    useDoricOutput,
    // types:
    Workspace,
    SharedParameters,
    WidgetInputState,
}