// Storage helpers will be implemented in the persistence phase.
// Keeping typed placeholders here so the rest of the app can import from one place.
export const storageNotReady = (): never => {
  throw new Error("Storage helpers are not implemented yet.");
};
