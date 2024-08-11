import { useState, useLayoutEffect, RefObject } from "react";

export const useTruncatedElement = (ref: RefObject<HTMLElement>) => {
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const { offsetWidth, scrollWidth } = ref.current || {};

    if (offsetWidth && scrollWidth && offsetWidth < scrollWidth) {
      setIsTruncated(true);
    } else {
      setIsTruncated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  return isTruncated;
};
