import { SpendPlan } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb";
import { loadWasmModule } from "./wasm-loader";
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { WasmPlanner, } from '@penumbra-zone/wasm-bundler';

export const penumbra_wasm = async (): Promise<any> => {
    console.log("Penumbra Wasm: Single-Thread!")
    
    // Load WASM module from Penumbra WASM crate 
    const penumbra_wasm_module = await loadWasmModule();
  };