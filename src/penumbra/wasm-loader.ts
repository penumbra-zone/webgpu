export async function loadWasmModule() {
  const penumbra_wasm_module = await import('./pkg/penumbra_wasm');
  return penumbra_wasm_module;
}