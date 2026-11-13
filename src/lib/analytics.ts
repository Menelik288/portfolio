// PLACEHOLDER analytics hook. Swap the body for Plausible / GA4 / PostHog etc.
export function track(event: string, props: Record<string, unknown> = {}) {
  if (import.meta.env.DEV) console.debug('[analytics]', event, props)
  // e.g. window.plausible?.(event, { props })
}
