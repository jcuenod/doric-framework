import { inject } from 'vue'
import type {
    UseDoricInputOptions,
    UseDoricInputFunction,
    UseDoricOutputFunction,
} from './types'

const useDoricInput = function(param: string, options?: UseDoricInputOptions) {
    const useDoricInput = inject<UseDoricInputFunction>("useDoricInput", () => {
        console.error("useDoricInput is not ready. This is probably a bug in Doric.")
        return { value: "" }
    })
    return useDoricInput(param, options)
}

const useDoricOutput = function (inputKey: string) {
    const useDoricOutput = inject<UseDoricOutputFunction>("useDoricOutput", () => {
        console.error("useDoricOutput is not ready. This is probably a bug in Doric.")
        return () => {
            console.error("useDoricOutput is not ready. This is probably a bug in Doric.")
        }
    })
    return useDoricOutput(inputKey)
}

export {
    useDoricInput,
    useDoricOutput,
}