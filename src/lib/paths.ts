// Deployment base path (the GitHub Pages subpath, e.g. "/medapp_demo").
// Inlined into client bundles by Next at build time; keep in sync with
// NEXT_PUBLIC_BASE_PATH in next.config.ts / .github/workflows/deploy.yml.
export const PAGES_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a public-folder asset path with the deployment base path. */
export function publicPath(p: string): string {
  return `${PAGES_BASE_PATH}${p}`;
}