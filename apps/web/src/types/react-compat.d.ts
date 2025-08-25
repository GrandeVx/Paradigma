// React 19 compatibility fixes
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'react' {
  // Fix ForwardRefExoticComponent compatibility with React 19
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Global type override for better React 19 compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};