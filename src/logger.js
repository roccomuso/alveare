import { Signale } from 'signale'

// Used for CLI/startup/fatal messages that happen outside the Ink dashboard
// (before it mounts, or on an error path that tears it down) — Ink owns
// stdout once the dashboard is rendered, so these can't be interleaved with it.
export const logger = new Signale({ scope: 'alveare' })
