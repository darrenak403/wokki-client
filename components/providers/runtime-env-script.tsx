import { buildRuntimeConfigScript, readServerRuntimeConfig } from "@/lib/env/runtime-script";

/** Injects runtime API URL from server env — works without __runtime-env.js static file. */
export function RuntimeEnvScript() {
  const script = buildRuntimeConfigScript(readServerRuntimeConfig());

  return (
    <script
      id="wokki-runtime-env"
      // Must run before client bundles read publicEnv.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
