import {
  type Component,
  createSignal,
  onMount,
  onCleanup,
  splitProps,
  mergeProps,
} from "solid-js";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";

export interface BottomSheetProps extends IComponentBaseProps {
  isOpen: boolean;
  onClose: () => void;
  children?: any;
  closeOnOverlayClick?: boolean;
  closeOnSwipeDown?: boolean;
}

const BottomSheet: Component<BottomSheetProps> = (props) => {
  const merged = mergeProps(
    {
      closeOnOverlayClick: true,
      closeOnSwipeDown: true,
    },
    props,
  );

  const [local, others] = splitProps(merged, [
    "isOpen",
    "onClose",
    "children",
    "dataTheme",
    "class",
    "className",
    "style",
    "closeOnOverlayClick",
    "closeOnSwipeDown",
  ]);

  const [isDragging, setIsDragging] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [currentY, setCurrentY] = createSignal(0);

  let sheetRef: HTMLDivElement | undefined;
  let overlayRef: HTMLDivElement | undefined;

  const handleTouchStart = (e: TouchEvent) => {
    if (!local.closeOnSwipeDown) return;
    const touchY = e.touches[0].clientY;
    const sheetTop = sheetRef?.getBoundingClientRect().top || 0;
    if (touchY - sheetTop < 50) {
      setIsDragging(true);
      setStartY(touchY);
      setCurrentY(touchY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    const deltaY = e.touches[0].clientY - startY();
    const newY = Math.max(0, deltaY);
    setCurrentY(e.touches[0].clientY);
    if (sheetRef) {
      sheetRef.style.transform = `translateY(${newY}px)`;
    }
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isDragging()) return;
    setIsDragging(false);
    const deltaY = currentY() - startY();
    if (deltaY > 100) {
      local.onClose();
    } else {
      if (sheetRef) sheetRef.style.transform = "translateY(0)";
    }
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (local.closeOnOverlayClick && e.target === overlayRef) {
      local.onClose();
    }
  };

  onMount(() => {
    if (sheetRef && local.closeOnSwipeDown) {
      sheetRef.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      sheetRef.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      sheetRef.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
  });

  onCleanup(() => {
    if (sheetRef) {
      sheetRef.removeEventListener("touchstart", handleTouchStart);
      sheetRef.removeEventListener("touchmove", handleTouchMove);
      sheetRef.removeEventListener("touchend", handleTouchEnd);
    }
  });

  return (
    <>
      <div
        ref={overlayRef}
        class={clsx(
          "fixed inset-0 bg-base-100 bg-opacity-60 z-40 transition-opacity duration-200",
          local.isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={handleOverlayClick}
      />

      <div
        ref={sheetRef}
        class={clsx(
          "bg-base-300 text-base-content fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-lg z-50 transition-transform duration-300 ease-out",
          local.isOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{
          transform: isDragging()
            ? `translateY(${Math.max(0, currentY() - startY())}px)`
            : undefined,
          ...local.style,
        }}
        {...others}
      >
        <div class="p-4">
          <div class="w-12 h-1 bg-base-content/30 rounded-full mx-auto mb-4" />
          {local.children}
        </div>
      </div>
    </>
  );
};

export default BottomSheet;
