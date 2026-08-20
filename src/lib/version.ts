import pkg from "../../package.json";

/**
 * Release stage. Bump this together with the version in package.json and the
 * entry in CHANGELOG.md — see docs/VERSIONING.md for what each stage means.
 *
 *   scaffold  structure exists, content is placeholder
 *   alpha     content is being written, site is not deployed
 *   beta      deployed and reachable, content still incomplete
 *   stable    launched — 1.0.0 and above
 */
export const STAGE = "alpha" as const;

export type Stage = "scaffold" | "alpha" | "beta" | "stable";

export const VERSION: string = pkg.version;

/** e.g. "v0.2.0 · alpha" — shown in the site footer. */
export const RELEASE_LABEL = `v${VERSION} · ${STAGE}`;
