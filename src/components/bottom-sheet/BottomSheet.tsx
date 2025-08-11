import Flex from "../flex/Flex";
import { Component, createSignal, onCleanup, onMount } from "solid-js";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
}

export const BottomSheet: Component<BottomSheetProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  const [startY, setStartY] = createSignal(0);
  const [currentY, setCurrentY] = createSignal(0);
  const [isClosing, setIsClosing] = createSignal(false);

  let sheetRef: HTMLDivElement | undefined;
  let overlayRef: HTMLDivElement | undefined;

  const handleTouchStart = (e: TouchEvent) => {
    const touchY = e.touches[0].clientY;
    const sheetTop = sheetRef?.getBoundingClientRect().top || 0;

    if (touchY - sheetTop < 50) {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
      e.preventDefault();
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
      handleClose();
    } else {
      if (sheetRef) {
        sheetRef.style.transform = "translateY(0)";
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      props.onClose();
      setIsClosing(false);
      if (sheetRef) {
        sheetRef.style.transform = "translateY(0)";
      }
    }, 200);
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === overlayRef) {
      handleClose();
    }
  };

  onMount(() => {
    if (sheetRef) {
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
        class={`fixed inset-0 bg-base-100 bg-opacity-10 z-40 transition-opacity duration-200 ${
          props.isOpen ? "opacity-67" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleOverlayClick}
      />

      <div
        ref={sheetRef}
        class={`bg-base-300 fixed bottom-0 left-0 right-0 rounded-t-3xl transition-transform duration-200 ease-out z-50 ${
          props.isOpen && !isClosing() ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          "max-height": "80vh",
          transform: isDragging()
            ? `translateY(${Math.max(0, currentY() - startY())}px)`
            : undefined,
        }}
      >
        <Flex
          justify="center"
          class="pt-3 pb-2 cursor-grab active:cursor-grabbing"
        >
          <div class="w-12 h-1 bg-gray-300 rounded-full" />
        </Flex>

        <div class="">{props.children}</div>
      </div>
    </>
  );
};
