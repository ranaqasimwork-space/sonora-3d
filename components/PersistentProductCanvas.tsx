"use client"

import { Box3, Color, Euler, Group, Material, Mesh, Object3D, PerspectiveCamera, Vector3 } from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useRef, useState, Component, ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export interface AnimState {
  progress: number
  rotX: number
  rotY: number
  rotZ: number
  scale: number
}

interface ModelRefs {
  group: Group | null
  base: {
    cx: number
    cy: number
    cz: number
    dist: number
    maxDim: number
  } | null
}

export function PersistentProductCanvas({ animRef, onReady }: { animRef: { current: AnimState }; onReady?: (inv: () => void) => void }) {
  const [mounted, setMounted] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const refs = useRef<ModelRefs>({ group: null, base: null })
  const invalidateRef = useRef<() => void>(() => {})
  const canvasWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    setWebglAvailable(!!gl)

    const mq = window.matchMedia("(max-width: 768px)")
    setIsMobile(mq.matches)
    mq.addEventListener?.("change", (e) => setIsMobile(e.matches))

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(motionMq.matches)
    motionMq.addEventListener?.("change", (e) => setPrefersReducedMotion(e.matches))

    return () => {
      mq.removeEventListener?.("change", () => {})
      motionMq.removeEventListener?.("change", () => {})
    }
  }, [])

  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background: "#0a0a0b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8e8e8",
          fontSize: 13,
          letterSpacing: 0.4,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "2px solid #232326",
            borderTopColor: "#e6e6e6",
            borderRadius: "50%",
            animation: "sonora-spin 0.8s linear infinite",
          }}
        ></div>
        <span style={{ marginTop: 16, textTransform: "uppercase", fontSize: 11, letterSpacing: 3, opacity: 0.7 }}>
          Loading
        </span>
        <style>{`@keyframes sonora-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!webglAvailable) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          background: "#0a0a0b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#e8e8e8",
          padding: 32,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>WebGL not available</h2>
        <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 400 }}>
          Your browser or device doesn&apos;t support WebGL. The 3D experience cannot be displayed.
        </p>
      </div>
    )
  }

  if (isMobile && prefersReducedMotion) {
    return (
      <MobileFallback />
    )
  }

  const dpr: [number, number] = isMobile ? [1, 1.1] : [1, 1.25]

  return (
    <ModelErrorBoundary fallback={ErrorMessage}>
      <div ref={canvasWrapRef} style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", opacity: 1 }}>
      <Canvas
        shadows={false}
        dpr={dpr}
        gl={{ antialias: !isMobile, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.35} />
        <hemisphereLight args={["#e0e0e0", "#2a2a2a"]} intensity={0.5} />
        <spotLight position={[3, 5, 4]} intensity={4} angle={0.4} penumbra={0.5} decay={2} />
        <spotLight position={[-3, 2, 2]} intensity={1.8} angle={0.5} penumbra={0.6} decay={2} />
        <spotLight position={[0, 4, -3]} intensity={2.5} angle={0.4} penumbra={0.5} decay={2} />
        <Suspense fallback={null}>
          <ProductModel
            animRef={animRef}
            refs={refs}
            onReady={(inv) => { invalidateRef.current = inv; onReady?.(inv); }}
            isMobile={isMobile}
          />
        </Suspense>
      </Canvas>
      </div>
    </ModelErrorBoundary>
  )
}

function MobileFallback() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        background: "#0a0a0b",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#e8e8e8",
        padding: 32,
        textAlign: "center",
      }}
    >
      <svg
        width="120"
        height="120"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        style={{ marginBottom: 24, opacity: 0.5 }}
        aria-hidden="true"
      >
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
        <path d="M12 6v6l4 2" />
      </svg>
      <h2 style={{ fontSize: 18, marginBottom: 12, fontWeight: 600 }}>SONORA Reference</h2>
      <p style={{ fontSize: 14, opacity: 0.8, maxWidth: 400 }}>
        Scroll to explore the product story below.
      </p>
    </div>
  )
}

interface ProductModelProps {
  animRef: { current: AnimState }
  refs: { current: ModelRefs }
  onReady: (invalidate: () => void) => void
  isMobile: boolean
}

function ProductModel({ animRef, refs, onReady, isMobile }: ProductModelProps) {
  const { scene } = useGLTF("/models/hero.glb")
  const rootScene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const groupRef = useRef<Group>(null)

  useEffect(() => {
    scene.traverse((child: Object3D) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.castShadow = false
        mesh.receiveShadow = false
        const material = mesh.material as Material | Material[]
        if (Array.isArray(material)) {
          material.forEach((m) => { m.precision = "mediump" })
        } else {
          material.precision = "mediump"
        }
      }
    })
  }, [scene])

  useEffect(() => {
    refs.current.group = groupRef.current
    onReady(invalidate)
  }, [onReady, invalidate])

  useEffect(() => {
    if (rootScene && rootScene.background == null) {
      rootScene.background = new Color("#0a0a0b")
    }
    if (gl) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.1 : 1.25))
    }
  }, [rootScene, gl, isMobile])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return

    if (!refs.current.base) {
      const box = new Box3().setFromObject(g)
      const center = box.getCenter(new Vector3())
      const size = box.getSize(new Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const fov = camera.fov * (Math.PI / 180)
      const dist = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.55
      refs.current.base = {
        cx: center.x,
        cy: center.y,
        cz: center.z,
        dist,
        maxDim,
      }
    }

    const b = refs.current.base!
    const a = animRef.current
    const p = Math.min(1, Math.max(0, a.progress))

    // --- Fixed camera (never animated horizontally) -----------------------
    // The camera sits at a constant horizontal offset so the model is framed
    // on the right side of the screen. posX is never touched, which removes
    // the horizontal swipe. World X does not equal screen X, so the model's
    // screen position is computed through the camera projection below.
    const camOffX = 0.42 * b.maxDim
    const camDist = b.dist * 1.4
    const camYoff = 0.05 * b.maxDim

    camera.position.set(b.cx - camOffX, b.cy + camYoff, b.cz + camDist)
    camera.lookAt(b.cx - camOffX, b.cy + camYoff, b.cz)
    camera.fov = 45
    camera.updateProjectionMatrix()

    // --- Projected screen position: fixed X, vertical Y from scroll -------
    const fx = 0.65 // fixed screen X (right side, headline stays on the left)
    const fy = 0.50 + 0.10 * p // 0.50 -> 0.60 : start mid-hero, settle at heading-text height
    const ndcX = fx * 2 - 1
    const ndcY = 1 - fy * 2

    const rayDir = new Vector3(ndcX, ndcY, 0)
      .unproject(camera)
      .sub(camera.position)
      .normalize()

    const forward = new Vector3()
    camera.getWorldDirection(forward)
    const depth = camDist / Math.max(rayDir.dot(forward), 0.01)
    const worldPos = camera.position.clone().addScaledVector(rayDir, depth)

    // Compensate for rotation about the model's local center so the projected
    // screen position stays exactly at (fx, fy) for the whole scroll range.
    const localCenter = new Vector3(b.cx, b.cy, b.cz)
    const euler = new Euler(a.rotX, a.rotY, a.rotZ)
    const rotatedCenter = localCenter.clone().applyEuler(euler)

    g.position.copy(worldPos).sub(rotatedCenter)
    g.rotation.set(a.rotX, a.rotY, a.rotZ)
    g.scale.setScalar(a.scale)
  })

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={scene} />
    </group>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: (props: { error: Error; reset: () => void }) => ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
  resetKey: number
}

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, resetKey: 0 }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, resetKey: 0 }
  }

  render() {
    if (this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        reset: () => this.setState({ error: null, resetKey: this.state.resetKey + 1 }),
      })
    }
    return this.props.children
  }
}

const ErrorMessage = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 10,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0a0b",
      color: "#ff6b6b",
      textAlign: "center",
      padding: 24,
    }}
  >
    <h2 style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>Failed to load model</h2>
    <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 16, maxWidth: 400 }}>{error.message}</p>
    <button
      onClick={reset}
      style={{
        background: "#ffffff",
        color: "#0a0a0b",
        border: "none",
        padding: "10px 20px",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Try again
    </button>
  </div>
)