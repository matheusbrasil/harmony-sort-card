// Ensure Reanimated's Fabric-only globals exist on web to avoid _removeFromPropsRegistry errors.
declare const globalThis: typeof global & {
  _removeFromPropsRegistry?: (viewTags: number[]) => void;
};

if (typeof globalThis._removeFromPropsRegistry !== "function") {
  globalThis._removeFromPropsRegistry = () => {};
}
