/** CSS selectors used to locate figure elements in the DOM. */
const SELECTOR = {
  wrapper: ".figure-img-wrapper",
  img: ".figure-img",
  skeleton: ".figure-skeleton",
} as const;

/** CSS classes toggled by the reveal transition. */
const CLASS = {
  hidden: "hidden",
  opacityHidden: "opacity-0",
  opacityVisible: "opacity-100",
} as const;

export function initFigures(): void {
  document.querySelectorAll<HTMLDivElement>(SELECTOR.wrapper).forEach((wrapper) => {
    const img = wrapper.querySelector<HTMLImageElement>(SELECTOR.img);
    const skeleton = wrapper.querySelector<HTMLDivElement>(SELECTOR.skeleton);
    if (!img || !skeleton) return;

    const reveal = (): void => {
      skeleton.classList.add(CLASS.hidden);
      img.classList.remove(CLASS.opacityHidden);
      img.classList.add(CLASS.opacityVisible);
    };

    if (img.complete && img.naturalWidth > 0) {
      reveal();
    } else {
      img.addEventListener("load", reveal, { once: true });
      img.addEventListener("error", reveal, { once: true });
    }
  });
}
