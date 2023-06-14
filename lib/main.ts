import type {
    Workspace,
    SharedParameters,
    WidgetInputState,
} from './types'
import DoricFramework from './DoricFramework.vue'
import { exportWorkspace } from "./doric"
import "./index.css"

export {
    DoricFramework,
    exportWorkspace,
    // types:
    Workspace,
    SharedParameters,
    WidgetInputState,
}