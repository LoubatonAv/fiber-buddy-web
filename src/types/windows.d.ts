export {};

declare global {
  interface Window {
    fiberOwl?: {
      deliver: (kind?: "test" | "streak" | "missed" | "goal") => void;
    };
  }
}
