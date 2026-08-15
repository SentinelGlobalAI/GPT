export {};

declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
  }
}
