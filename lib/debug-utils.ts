const DEBUG = process.env.NODE_ENV === "development"

export const debug = {
  log: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.warn(`[DEBUG] ${message}`, ...args)
    }
  },

  error: (message: string, error: unknown) => {
    if (DEBUG) {
      console.error(`[DEBUG] ${message}`, error)
    }
  },

  group: (name: string, fn: () => void) => {
    if (DEBUG) {
      console.group(`[DEBUG] ${name}`)
      fn()
      console.groupEnd()
    }
  },

  time: (name: string) => {
    if (DEBUG) {
      console.time(`[DEBUG] ${name}`)
    }
  },

  timeEnd: (name: string) => {
    if (DEBUG) {
      console.timeEnd(`[DEBUG] ${name}`)
    }
  },
}

