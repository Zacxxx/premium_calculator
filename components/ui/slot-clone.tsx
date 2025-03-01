"use client"

import * as React from "react"

interface SlotCloneProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

/**
 * SlotClone est un composant utilitaire qui permet de cloner les propriétés d'un élément enfant
 * sur un élément parent, tout en préservant les propriétés du parent.
 */
const SlotClone = React.forwardRef<HTMLElement, SlotCloneProps>(
  ({ children, ...props }, ref) => {
    // Vérifier si children est défini et est un élément React valide
    if (!React.isValidElement(children)) {
      return <span ref={ref} {...props}>{children}</span>;
    }

    // Cloner l'élément enfant avec les propriétés du parent
    return React.cloneElement(children, {
      ...props,
      ref: ref,
    });
  }
)

SlotClone.displayName = "SlotClone"

export default SlotClone 