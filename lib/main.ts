import type {
    Workspace,
    SharedParameters,
    WidgetInputState,
} from './types'
import DoricFramework from './DoricFramework.vue'
import { exportWorkspace, pushWorkspaceState } from "./doric"
import { useDoricInput, useDoricOutput } from "./useDoricInputOutput"
import "./index.css"

export default DoricFramework
export {
    exportWorkspace,
    pushWorkspaceState,
    useDoricInput,
    useDoricOutput,
    // types:
    Workspace,
    SharedParameters,
    WidgetInputState,
}