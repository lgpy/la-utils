
export function getOrThrow<T>(arr: Array<T>, searchPredicate: (item: T) => boolean, errorMessage: string): T {
  const item = arr.find(searchPredicate);
  if (!item) throw new Error(errorMessage);
  return item;
}

export function getIndexOrThrow<T>(arr: Array<T>, searchPredicate: (item: T) => boolean, errorMessage: string): number {
  const index = arr.findIndex(searchPredicate);
  if (index === -1) throw new Error(errorMessage);
  return index;
}
