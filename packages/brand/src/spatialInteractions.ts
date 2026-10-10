/** 两版共用轻量交互：只在用户操作时更新视角，不启动动画循环。 */
export function setSpatialRotation(input: HTMLInputElement) {
  const root = input.closest<HTMLElement>('[data-spatial-navigator]');
  if (!root) return;
  const angle = Math.max(-25, Math.min(25, Number(input.value) || 0));
  root.style.setProperty('--spatial-turn', `${angle}deg`);
  input.setAttribute('aria-valuetext', `${angle} 度`);
}

export function enhanceSpatialNavigation(root: ParentNode = document) {
  const inputs = [...root.querySelectorAll<HTMLInputElement>('[data-spatial-rotation]')];
  const update = (event: Event) => setSpatialRotation(event.currentTarget as HTMLInputElement);
  inputs.forEach(input => input.addEventListener('input', update));
  return () => inputs.forEach(input => input.removeEventListener('input', update));
}
