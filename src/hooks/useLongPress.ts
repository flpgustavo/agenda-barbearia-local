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

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldPreventDefault && event.target) {
        target.current = event.target;
      }
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(50); 
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
      if (shouldTriggerClick && !longPressTriggered) {
        onClick();
      }
      setLongPressTriggered(false);
      target.current = null; // Reset para null
    },
    [onClick, longPressTriggered]
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e),
    onTouchStart: (e: React.TouchEvent) => start(e),
    onMouseUp: (e: React.MouseEvent) => clear(e),
    onMouseLeave: (e: React.MouseEvent) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent) => clear(e),
  };
};

export default useLongPress;