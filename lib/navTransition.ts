// ── From-nav slide flag ───────────────────────────────────────────────
// Set right before router.push(); consumed once inside template.tsx's
// useState initialiser so the page knows to enter from below.
let _fromNav = false;

export function flagFromNav(): void  { _fromNav = true; }

