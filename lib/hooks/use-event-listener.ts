"use client"

import * as React from "react"

/**
 * Custom hook for managing event listeners
 * @param eventName The event name
 * @param handler The event handler
 * @param element The target element
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = typeof window !== "undefined" ? window : null,
) {
  const savedHandler = React.useRef(handler)

  React.useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  React.useEffect(() => {
    if (!element) return

    const eventListener = (event: WindowEventMap[K]) => savedHandler.current(event)
    element.addEventListener(eventName, eventListener)

    return () => {
      element.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

