"use client"

import { Box3, Color, Euler, Group, Material, Mesh, Object3D, PerspectiveCamera, PointLight, SpotLight, Vector3 } from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState, Component, ReactNode } from "react"
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
  verticalPhase: number
  explode: number
  spatialWave: number
  camZoom: number
  camFocusUSBC: number
  usbcLight: number
}

interface ExplodePartSpec {
  offset: [number, number, number]
  window: [number, number]
}

// Actual mesh node names from /models/hero.glb with axial CAD explosion offsets (meters)
const EXPLODE_PARTS: Record<string, ExplodePartSpec> = {
  "Earcup outer cap, left": { offset: [0.082, 0, 0], window: [0.0, 0.78] },
  "Earcup outer cap, right": { offset: [-0.082, 0, 0], window: [0.0, 0.78] },
  "Earcup shell, left": { offset: [0.044, 0, 0], window: [0.08, 0.88] },
  "Earcup shell, right": { offset: [-0.044, 0, 0], window: [0.08, 0.88] },
  "Control buttons and LED": { offset: [-0.052, -0.005, -0.015], window: [0.14, 0.94] },
  "USB-C receptacle": { offset: [-0.047, -0.014, -0.006], window: [0.16, 0.96] },
  "Driver scrim, left": { offset: [0.016, 0, 0], window: [0.15, 0.92] },
  "Driver scrim, right": { offset: [-0.016, 0, 0], window: [0.15, 0.92] },
  "Ear cushion, left": { offset: [-0.014, 0, 0], window: [0.1, 0.86] },
  "Ear cushion, right": { offset: [0.014, 0, 0], window: [0.1, 0.86] },
  "Yoke, left": { offset: [0.024, -0.008, 0], window: [0.12, 0.9] },
  "Yoke, right": { offset: [-0.024, -0.008, 0], window: [0.12, 0.9] },
  "Headband sliders": { offset: [0, 0.006, 0], window: [0.18, 0.95] },
  "Headband cushion": { offset: [0, 0.015, 0], window: [0.2, 0.98] },
  "Headband": { offset: [0, 0.056, 0], window: [0.12, 1.0] },
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
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
  usbcLocal: Vector3 | null
}

export function PersistentProductCanvas({ animRef, onReady }: { animRef: { current: AnimState }; onReady?: (inv: () => void) => void }) {
  const [mounted, setMounted] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const refs = useRef<ModelRefs>({ group: null, base: null, usbcLocal: null })
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
      <div ref={canvasWrapRef} style={{ position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 1 }}>
      <Canvas
        shadows={false}
        dpr={dpr}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
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

  const partRecordsRef = useRef<Array<{ obj: Object3D; origPos: Vector3; spec: ExplodePartSpec }>>([])
  const spatialGroupRef = useRef<Group>(null)
  const ring1Ref = useRef<Mesh>(null)
  const ring2Ref = useRef<Mesh>(null)
  const ring3Ref = useRef<Mesh>(null)
  const waveLeftARef = useRef<Mesh>(null)
  const waveLeftBRef = useRef<Mesh>(null)
  const waveRightARef = useRef<Mesh>(null)
  const waveRightBRef = useRef<Mesh>(null)

  const usbcSpotRef = useRef<SpotLight>(null)
  const usbcPointRef = useRef<PointLight>(null)
  const usbcTarget = useMemo(() => new Object3D(), [])

  const scratch = useMemo(
    () => ({
      rayDir: new Vector3(),
      forward: new Vector3(),
      worldPos: new Vector3(),
      localCenter: new Vector3(),
      focusLocal: new Vector3(),
      rotatedFocus: new Vector3(),
      usbcWorld: new Vector3(),
      euler: new Euler(),
      zeroVec: new Vector3(),
    }),
    []
  )

  useEffect(() => {
    const records: Array<{ obj: Object3D; origPos: Vector3; spec: ExplodePartSpec }> = []
    let usbcObj: Object3D | null = null

    scene.traverse((child: Object3D) => {
      const spec = EXPLODE_PARTS[child.name]
      if (spec) {
        records.push({ obj: child, origPos: child.position.clone(), spec })
      }
      if (child.name === "USB-C receptacle") {
        usbcObj = child
      }
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

    partRecordsRef.current = records

    // Compute assembled base bounds and actual USB-C receptacle center from the unexploded GLB scene
    scene.updateMatrixWorld(true)
    const box = new Box3().setFromObject(scene)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = 45 * (Math.PI / 180)
    const dist = Math.abs(maxDim / (2 * Math.tan(fov / 2))) * 1.55
    refs.current.base = {
      cx: center.x,
      cy: center.y,
      cz: center.z,
      dist,
      maxDim,
    }

    if (usbcObj) {
      const usbcBox = new Box3().setFromObject(usbcObj)
      refs.current.usbcLocal = usbcBox.getCenter(new Vector3())
    } else {
      refs.current.usbcLocal = new Vector3(-0.0812, 0.0068, -0.0159)
    }

    return () => {
      for (const rec of records) {
        rec.obj.position.copy(rec.origPos)
      }
    }
  }, [scene, refs])

  useEffect(() => {
    if (usbcSpotRef.current) {
      usbcSpotRef.current.target = usbcTarget
    }
  }, [usbcTarget])

  useEffect(() => {
    refs.current.group = groupRef.current
    onReady(invalidate)
  }, [onReady, invalidate, refs])

  useEffect(() => {
    if (rootScene) {
      rootScene.background = null
    }
    if (gl) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.1 : 1.25))
      gl.setClearColor(0x000000, 0)
    }
  }, [rootScene, gl, isMobile])

  useFrame(() => {
    const g = groupRef.current
    const b = refs.current.base
    if (!g || !b) return

    const a = animRef.current
    const p = Math.min(1, Math.max(0, a.progress))
    const explodeVal = Math.min(1, Math.max(0, a.explode || 0))
    const spatialVal = Math.min(1, Math.max(0, a.spatialWave || 0))
    const zoomVal = Math.min(1, Math.max(0, a.camZoom || 0))
    const focusVal = Math.min(1, Math.max(0, a.camFocusUSBC || 0))
    const lightVal = Math.min(1, Math.max(0, a.usbcLight || 0))

    // --- T1 Exploded View: translate actual GLB child meshes cleanly along CAD axes ---
    const records = partRecordsRef.current
    for (let i = 0; i < records.length; i++) {
      const { obj, origPos, spec } = records[i]
      if (explodeVal <= 0.0001) {
        obj.position.copy(origPos)
      } else {
        const factor = smoothstep(spec.window[0], spec.window[1], explodeVal)
        obj.position.set(
          origPos.x + spec.offset[0] * factor,
          origPos.y + spec.offset[1] * factor,
          origPos.z + spec.offset[2] * factor
        )
      }
    }

    const isNarrow = isMobile || window.innerWidth < 768

    // --- Camera framing: base fixed horizontal offset + smooth T3 close-up & T1 explode clearance ---
    const camOffX = 0.42 * b.maxDim
    const baseCamDist = b.dist * 1.4
    const explodePull = (isNarrow ? 0.34 : 0.08) * explodeVal
    const camDist = baseCamDist * (1 + explodePull - 0.64 * zoomVal)
    const camYoff = 0.05 * b.maxDim

    camera.position.set(b.cx - camOffX, b.cy + camYoff, b.cz + camDist)
    camera.lookAt(b.cx - camOffX, b.cy + camYoff, b.cz)
    camera.fov = 45 - 11 * zoomVal
    camera.updateProjectionMatrix()

    // --- Projected screen position: fixed X, vertical Y from scroll -------
    // FX stays fixed at 0.68 for desktop (right side of screen, text on left).
    // On narrow screens, move to 0.5 (center) so text can overlay bottom.
    const fx = isNarrow ? 0.5 : 0.68
    // Vertical position: Hero drops (fy 0.50->0.60), Story holds at 0.60,
    // Technology continues downward (fy 0.60->0.72 via verticalPhase 0->1),
    // smoothly centering during T3 macro close-up before returning to 0.72.
    const heroPhase = Math.min(1, p)
    const techPhase = Math.max(0, a.verticalPhase)
    const fyBase = 0.5 + 0.1 * heroPhase + 0.12 * techPhase
    const fyCloseup = isNarrow ? 0.4 : 0.54
    const fy = fyBase * (1 - focusVal) + fyCloseup * focusVal

    const ndcX = fx * 2 - 1
    const ndcY = 1 - fy * 2

    scratch.rayDir
      .set(ndcX, ndcY, 0)
      .unproject(camera)
      .sub(camera.position)
      .normalize()

    camera.getWorldDirection(scratch.forward)
    const depth = camDist / Math.max(scratch.rayDir.dot(scratch.forward), 0.01)
    scratch.worldPos.copy(camera.position).addScaledVector(scratch.rayDir, depth)

    // Compensate for rotation about the focal point (model center or USB-C receptacle)
    scratch.localCenter.set(b.cx, b.cy, b.cz)
    const usbcLocal = refs.current.usbcLocal || scratch.localCenter
    scratch.focusLocal.copy(scratch.localCenter).lerp(usbcLocal, focusVal)

    scratch.euler.set(a.rotX, a.rotY, a.rotZ)
    scratch.rotatedFocus.copy(scratch.focusLocal).applyEuler(scratch.euler).multiplyScalar(a.scale)

    g.position.copy(scratch.worldPos).sub(scratch.rotatedFocus)
    g.rotation.set(a.rotX, a.rotY, a.rotZ)
    g.scale.setScalar(a.scale)

    // --- T2 Spatial Audio Visual Effect: synchronized with scroll ---
    const sg = spatialGroupRef.current
    if (sg) {
      const env = smoothstep(0, 0.16, spatialVal) * (1 - smoothstep(0.84, 1, spatialVal))
      if (env > 0.002) {
        sg.visible = true
        sg.position.set(b.cx, b.cy, b.cz)

        if (ring1Ref.current) {
          const s1 = 0.86 + 0.3 * spatialVal
          ring1Ref.current.scale.setScalar(s1)
          ring1Ref.current.rotation.set(Math.PI / 2, 0, spatialVal * Math.PI * 0.9)
          const m1 = ring1Ref.current.material as Material & { opacity: number }
          m1.opacity = 0.28 * env
        }
        if (ring2Ref.current) {
          const s2 = 0.88 + 0.28 * spatialVal
          ring2Ref.current.scale.setScalar(s2)
          ring2Ref.current.rotation.set(0.58 + spatialVal * 0.45, 0.42 + spatialVal * 1.1, 0.3)
          const m2 = ring2Ref.current.material as Material & { opacity: number }
          m2.opacity = 0.22 * env
        }
        if (ring3Ref.current) {
          const s3 = 0.9 + 0.24 * spatialVal
          ring3Ref.current.scale.setScalar(s3)
          ring3Ref.current.rotation.set(-0.48 - spatialVal * 0.35, -0.35 - spatialVal * 0.85, -0.22)
          const m3 = ring3Ref.current.material as Material & { opacity: number }
          m3.opacity = 0.18 * env
        }

        const earY = 0.045 - b.cy
        const phaseA = (spatialVal * 2.2) % 1
        const phaseB = (spatialVal * 2.2 + 0.5) % 1

        const updateWavePair = (mesh: Mesh | null, signX: number, phase: number) => {
          if (!mesh) return
          mesh.position.set(signX * (0.095 + phase * 0.09), earY, 0)
          mesh.scale.setScalar(0.55 + phase * 0.95)
          const mat = mesh.material as Material & { opacity: number }
          mat.opacity = Math.sin(Math.PI * phase) * env * 0.34
        }

        updateWavePair(waveLeftARef.current, 1, phaseA)
        updateWavePair(waveLeftBRef.current, 1, phaseB)
        updateWavePair(waveRightARef.current, -1, phaseA)
        updateWavePair(waveRightBRef.current, -1, phaseB)
      } else {
        sg.visible = false
      }
    }

    // --- T3 USB-C Cinematic Lighting ---
    if (usbcSpotRef.current && usbcPointRef.current) {
      if (lightVal > 0.002) {
        scratch.usbcWorld
          .copy(usbcLocal)
          .applyEuler(scratch.euler)
          .multiplyScalar(a.scale)
          .add(g.position)

        usbcTarget.position.copy(scratch.usbcWorld)
        usbcTarget.updateMatrixWorld()

        usbcSpotRef.current.visible = true
        usbcSpotRef.current.intensity = 2.8 * lightVal
        usbcSpotRef.current.position.set(
          scratch.usbcWorld.x + 0.07,
          scratch.usbcWorld.y - 0.05,
          scratch.usbcWorld.z + 0.22
        )

        usbcPointRef.current.visible = true
        usbcPointRef.current.intensity = 0.55 * lightVal
        usbcPointRef.current.position.set(
          scratch.usbcWorld.x - 0.03,
          scratch.usbcWorld.y - 0.02,
          scratch.usbcWorld.z + 0.07
        )
      } else {
        usbcSpotRef.current.visible = false
        usbcSpotRef.current.intensity = 0
        usbcPointRef.current.visible = false
        usbcPointRef.current.intensity = 0
      }
    }
  })

  const ringColor = useMemo(() => new Color("#e2e4ec"), [])

  return (
    <>
      <primitive object={usbcTarget} />
      <spotLight
        ref={usbcSpotRef}
        visible={false}
        intensity={0}
        angle={0.36}
        penumbra={0.85}
        decay={2}
        distance={0.9}
        color="#f2f5ff"
      />
      <pointLight
        ref={usbcPointRef}
        visible={false}
        intensity={0}
        decay={2}
        distance={0.35}
        color="#d8e3ff"
      />

      <group ref={groupRef} dispose={null}>
        <primitive object={scene} />

        <group ref={spatialGroupRef} visible={false}>
          <mesh ref={ring1Ref}>
            <torusGeometry args={[0.145, 0.00055, 10, 96]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh ref={ring2Ref}>
            <torusGeometry args={[0.165, 0.00048, 10, 96]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh ref={ring3Ref}>
            <torusGeometry args={[0.188, 0.00042, 10, 96]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>

          <mesh ref={waveLeftARef} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.044, 0.00055, 10, 64]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh ref={waveLeftBRef} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.044, 0.00055, 10, 64]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh ref={waveRightARef} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.044, 0.00055, 10, 64]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh ref={waveRightBRef} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.044, 0.00055, 10, 64]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </>
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