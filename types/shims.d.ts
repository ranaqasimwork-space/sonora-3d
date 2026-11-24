declare module "next" {
  export type Metadata = {
    title?: string
    description?: string
    [key: string]: unknown
  }
}

declare module "next/font/google" {
  export function Inter(options?: { subsets?: string[] }): Font
  export interface Font {
    className: string
    style: React.CSSProperties
    variable?: string
  }
}

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export type ResolvingMetadata = unknown
  export type ResolvingViewport = unknown
}

declare module "next/types.js" {
  export type ResolvingMetadata = unknown
  export type ResolvingViewport = unknown
  export type NextConfig = unknown
}
