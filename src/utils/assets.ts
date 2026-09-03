export function getAsset<T>(path?: string): T | null {
   if (!path) return null;
   return (
      Object.entries(import.meta.glob<{ default: T }>('/src/assets/**/*', { eager: true })).find(
         ([key]) => key.endsWith(path),
      )?.[1]?.default || null
   );
}
