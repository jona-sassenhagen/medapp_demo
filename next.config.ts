import type { NextConfig } from "next";

// The app is deployed as a GitHub Pages project site under a subpath:
//   https://jona-sassenhagen.github.io/medapp_demo
// NEXT_PUBLIC_BASE_PATH must match that subpath in the Pages build
// (set in .github/workflows/deploy.yml). Locally it stays unset and
// the app runs at the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
};

export default nextConfig;