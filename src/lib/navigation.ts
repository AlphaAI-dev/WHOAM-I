/** Scrolls to a section or chapter anchor, honouring reduced motion. */
export function scrollToId(id: string, reduced: boolean) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // Keep the URL shareable without adding history entries for every jump.
  history.replaceState(null, '', `#${id}`);
}
