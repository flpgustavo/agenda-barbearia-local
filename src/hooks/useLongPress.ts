import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
  shouldPreventDefault?: boolean;
  delay?: number;
}

const useLongPress = (
  onLongPress: (e: React.TouchEvent | React.MouseEvent) => void,
  onClick: () => void,
  { shouldPreventDefault = true, delay = 500 }: LongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const target = useRef<EventTarget | null>(null);

  const startY = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        target.current = event.target;
      }

      if ('touches' in event) {
          startY.current = event.touches[0].clientY;
          isScrolling.current = false;
      }

      timeout.current = setTimeout(() => {
        if (!isScrolling.current) {
            onLongPress(event);
            setLongPressTriggered(true);
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate(50); 
            }
        }
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      if (shouldTriggerClick && !longPressTriggered && !isScrolling.current) {
        onClick();
      }
      setLongPressTriggered(false);
      isScrolling.current = false;
      target.current = null;
    },
    [onClick, longPressTriggered]
  );

  const move = useCallback((event: React.TouchEvent) => {
      if (startY.current) {
          const currentY = event.touches[0].clientY;
          if (Math.abs(currentY - startY.current) > 10) {
              isScrolling.current = true;
              if (timeout.current) clearTimeout(timeout.current); 
          }
      }
  }, []);

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onTouchMove: (e: React.TouchEvent) => move(e), 
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
};

export default useLongPress;