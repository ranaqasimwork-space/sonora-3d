"use client"

import { useCallback, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { AnimState } from "./PersistentProductCanvas"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface TechChapter {
  index: string
  title: string
  text: string
  detail: string
  feature: string
  closeUp?: {
    label: string
    description: string
  }
}

const techChapters: TechChapter[] = [
  {
    index: "T1",
    title: "Adaptive Noise Cancellation",
    text: "Eight microphones map your environment 48,000 times a second, cancelling up to 42 dB of ambient noise in real time.",
    detail: "Dual ANC processors analyze incoming sound waves and generate precise inverse signals. The result: silence that adapts to jet engines, coffee shops, and city streets without coloring your music.",
    feature: "8 MEMS mics · Dual ANC processors · 48 kHz sampling · 42 dB reduction",
    closeUp: {
      label: "Microphone Array",
      description: "Six external and two internal MEMS microphones create a 360° acoustic map, feeding dual DSP cores that compute anti-noise in under 2 ms.",
    },
  },
  {
    index: "T2",
    title: "Spatial Audio",
    text: "Dynamic head tracking anchors sound in space. A 360° stage that stays fixed to your screen, not your ears.",
    detail: "A 9-axis IMU (accelerometer, gyroscope, magnetometer) tracks head position at 1 kHz. The HRTF renderer updates binaural cues in real time, locking the soundstage to your device.",
    feature: "9-axis IMU · 1 kHz tracking · HRTF rendering · 360° soundstage",
    closeUp: {
      label: "IMU Module",
      description: "A custom sensor fusion chip combines accelerometer, gyroscope, and magnetometer data at 1 kHz, delivering sub-degree head-pose accuracy for rock-solid spatial anchoring.",
    },
  },
  {
    index: "T3",
    title: "Hi-Res Lossless",
    text: "A USB-C connection streams 24-bit / 96 kHz audio with zero compression — studio masters, exactly as recorded.",
    detail: "The integrated ESS Sabre DAC and THX AAA-78 amplifier deliver 120 dB dynamic range and -115 dB THD+N. USB-C audio class 2.0 enables bit-perfect playback from any source — no dongle, no compromise.",
    feature: "ESS Sabre DAC · THX AAA-78 amp · USB-C Audio 2.0 · 24-bit/96 kHz",
    closeUp: {
      label: "USB-C Port",
      description: "A reinforced USB-C 3.2 Gen 1 port carries lossless 24-bit/96 kHz audio, 100 W power delivery, and firmware updates — all through a single cable.",
    },
  },
]

export default function TechnologySection({ animRef }: { animRef: { current: AnimState } }) {
  const sectionRef = useRef<HTMLElement>(null)
  const invalidateRef = useRef<() => void>(() => {})
  const chapterRefs = useRef<(HTMLElement | null)[]>([])
  const detailRefs = useRef<(HTMLElement | null)[]>([])
  const closeUpRefs = useRef<(HTMLElement | null)[]>([])
  const featureRefs = useRef<(HTMLElement | null)[]>([])
  const iconRefs = useRef<(HTMLElement | null)[]>([])

  const handleReady = useCallback((inv: () => void) => {
    invalidateRef.current = inv
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const chapters = Array.from(
        section.querySelectorAll<HTMLElement>(".tech__chapter")
      )
      const details = Array.from(
        section.querySelectorAll<HTMLElement>(".tech__detail")
      )
      const closeUps = Array.from(
        section.querySelectorAll<HTMLElement>(".tech__closeup")
      )
      const features = Array.from(
        section.querySelectorAll<HTMLElement>(".tech__feature")
      )
      const icons = Array.from(
        section.querySelectorAll<HTMLElement>(".tech__icon-wrap")
      )
      const progressFill = section.querySelector<HTMLElement>(".tech__progress-fill")

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const scrub = reduce ? true : 0.5

      gsap.set(chapters, { autoAlpha: 0, y: 40 })
      gsap.set(details, { autoAlpha: 0, y: 30 })
      gsap.set(closeUps, { autoAlpha: 0, y: 30, scale: 0.95 })
      gsap.set(features, { autoAlpha: 0, y: 20 })
      gsap.set(icons, { autoAlpha: 0, scale: 0.8 })

      const a = animRef.current

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=440%",
          pin: true,
          scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => invalidateRef.current(),
      })

      // --- Model Animation: Continuous Technology Choreography ---
      // Starts seamlessly from StorySection end state: rotY = -5.683, rotX = 0, rotZ = 0, verticalPhase = 0
      // Vertical position continues downward smoothly across the entire Technology section (0 -> 1)
      tl.fromTo(
        a,
        { verticalPhase: 0 },
        { verticalPhase: 1, duration: 1, ease: "none", immediateRender: false },
        0
      )

      // T1 (0.00 -> 0.34): Adaptive Noise Cancellation — Exploded View & Reassembly
      tl.fromTo(
        a,
        { rotY: -5.683 },
        { rotY: -6.9, duration: 0.16, ease: "power2.inOut", immediateRender: false },
        0
      )
      tl.to(a, { rotY: -7.15, duration: 0.09, ease: "none" }, 0.16)
      tl.to(a, { rotY: -7.65, duration: 0.11, ease: "power1.inOut" }, 0.25)

      tl.fromTo(
        a,
        { rotX: 0 },
        { rotX: 0.14, duration: 0.16, ease: "power2.inOut", immediateRender: false },
        0
      )
      tl.to(a, { rotX: 0.04, duration: 0.11, ease: "power2.inOut" }, 0.25)

      tl.fromTo(
        a,
        { rotZ: 0 },
        { rotZ: -0.06, duration: 0.16, ease: "power2.inOut", immediateRender: false },
        0
      )
      tl.to(a, { rotZ: 0.02, duration: 0.11, ease: "power2.inOut" }, 0.25)

      // Explode all actual GLB parts cleanly, hold for inspection, then reassemble smoothly before T2
      tl.fromTo(
        a,
        { explode: 0 },
        { explode: 1, duration: 0.11, ease: "power2.inOut", immediateRender: false },
        0.03
      )
      tl.to(a, { explode: 0, duration: 0.09, ease: "power2.inOut" }, 0.24)

      // T2 (0.34 -> 0.67): Spatial Audio — Cinematic 3D Rotation & Synchronized Spatial Waves
      tl.to(a, { rotY: -8.55, duration: 0.2, ease: "power1.inOut" }, 0.36)
      tl.to(a, { rotX: -0.24, duration: 0.16, ease: "power2.inOut" }, 0.36)
      tl.to(a, { rotZ: 0.14, duration: 0.18, ease: "power2.inOut" }, 0.36)

      tl.fromTo(
        a,
        { spatialWave: 0 },
        { spatialWave: 1, duration: 0.29, ease: "none", immediateRender: false },
        0.35
      )

      // T3 (0.67 -> 1.00): Hi-Res Lossless / USB-C — Port Reveal, Camera Close-Up, Lighting & Natural Exit
      // Right earcup USB-C receptacle normal in model space is (0, -0.874, -0.486);
      // rotating to rotY ~ -9.32 (-3*pi + 0.105) and rotX ~ -1.06 (-60.7 deg) aims the port directly at the camera.
      tl.to(a, { rotY: -9.32, duration: 0.22, ease: "power2.inOut" }, 0.56)
      tl.to(a, { rotX: -1.06, duration: 0.26, ease: "power2.inOut" }, 0.52)
      tl.to(a, { rotZ: -0.04, duration: 0.24, ease: "power2.inOut" }, 0.54)

      tl.to(a, { rotY: -9.38, duration: 0.11, ease: "none" }, 0.78)

      // Smooth camera close-up & subtle cinematic lighting on the USB-C port
      tl.fromTo(
        a,
        { camFocusUSBC: 0 },
        { camFocusUSBC: 1, duration: 0.11, ease: "power2.inOut", immediateRender: false },
        0.7
      )
      tl.fromTo(
        a,
        { camZoom: 0 },
        { camZoom: 1, duration: 0.11, ease: "power2.inOut", immediateRender: false },
        0.71
      )
      tl.fromTo(
        a,
        { usbcLight: 0 },
        { usbcLight: 1, duration: 0.1, ease: "power2.out", immediateRender: false },
        0.73
      )

      // Continue rotation naturally & return cleanly to assembled normal pose before section ends
      tl.to(a, { rotY: -10.55, duration: 0.11, ease: "power2.inOut" }, 0.89)
      tl.to(a, { rotX: 0, duration: 0.1, ease: "power2.inOut" }, 0.89)
      tl.to(a, { rotZ: 0, duration: 0.1, ease: "power2.inOut" }, 0.89)
      tl.to(a, { camFocusUSBC: 0, duration: 0.1, ease: "power2.inOut" }, 0.89)
      tl.to(a, { camZoom: 0, duration: 0.1, ease: "power2.inOut" }, 0.89)
      tl.to(a, { usbcLight: 0, duration: 0.09, ease: "power2.in" }, 0.89)

      // --- Chapter 1 (T1) - 0.0 to 0.33 ---
      const showChapter = (el: HTMLElement, at: number, dur = 0.08) =>
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: dur, ease: "power2.out" },
          at
        )
      const hideChapter = (el: HTMLElement, at: number, dur = 0.06) =>
        tl.to(
          el,
          { autoAlpha: 0, y: -30, duration: dur, ease: "power2.in" },
          at
        )

      const showDetail = (el: HTMLElement, at: number) =>
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" },
          at
        )
      const hideDetail = (el: HTMLElement, at: number) =>
        tl.to(
          el,
          { autoAlpha: 0, y: -20, duration: 0.05, ease: "power2.in" },
          at
        )

      const showCloseUp = (el: HTMLElement, at: number) =>
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 30, scale: 0.95 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.1, ease: "power3.out" },
          at
        )
      const hideCloseUp = (el: HTMLElement, at: number) =>
        tl.to(
          el,
          { autoAlpha: 0, y: -20, scale: 0.95, duration: 0.08, ease: "power2.in" },
          at
        )

      const showFeature = (el: HTMLElement, at: number) =>
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.06, ease: "power2.out" },
          at
        )
      const hideFeature = (el: HTMLElement, at: number) =>
        tl.to(
          el,
          { autoAlpha: 0, y: -15, duration: 0.05, ease: "power2.in" },
          at
        )

      const showIcon = (el: HTMLElement, at: number) =>
        tl.fromTo(
          el,
          { autoAlpha: 0, scale: 0.8, rotation: -15 },
          { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.12, ease: "back.out(1.5)" },
          at
        )
      const hideIcon = (el: HTMLElement, at: number) =>
        tl.to(
          el,
          { autoAlpha: 0, scale: 0.8, rotation: 15, duration: 0.08, ease: "power2.in" },
          at
        )

      // T1: 0.00 -> 0.34
      if (chapters[0]) showChapter(chapters[0], 0.02)
      if (details[0]) showDetail(details[0], 0.07)
      if (features[0]) showFeature(features[0], 0.12)
      if (icons[0]) showIcon(icons[0], 0.04)
      if (closeUps[0]) showCloseUp(closeUps[0], 0.17)

      if (chapters[0]) hideChapter(chapters[0], 0.29)
      if (details[0]) hideDetail(details[0], 0.29)
      if (features[0]) hideFeature(features[0], 0.29)
      if (icons[0]) hideIcon(icons[0], 0.29)
      if (closeUps[0]) hideCloseUp(closeUps[0], 0.29)

      // T2: 0.34 -> 0.67
      if (chapters[1]) showChapter(chapters[1], 0.36)
      if (details[1]) showDetail(details[1], 0.41)
      if (features[1]) showFeature(features[1], 0.46)
      if (icons[1]) showIcon(icons[1], 0.38)
      if (closeUps[1]) showCloseUp(closeUps[1], 0.51)

      if (chapters[1]) hideChapter(chapters[1], 0.62)
      if (details[1]) hideDetail(details[1], 0.62)
      if (features[1]) hideFeature(features[1], 0.62)
      if (icons[1]) hideIcon(icons[1], 0.62)
      if (closeUps[1]) hideCloseUp(closeUps[1], 0.62)

      // T3: 0.67 -> 1.00
      if (chapters[2]) showChapter(chapters[2], 0.68)
      if (details[2]) showDetail(details[2], 0.73)
      if (features[2]) showFeature(features[2], 0.77)
      if (icons[2]) showIcon(icons[2], 0.7)
      if (closeUps[2]) showCloseUp(closeUps[2], 0.81)

      // Final brand lockup
      const brandEl = section.querySelector<HTMLElement>(".tech__brand")
      if (brandEl) {
        tl.to(brandEl, {
          autoAlpha: 1,
          y: 0,
          duration: 0.06,
          ease: "power2.out",
        }, 0.94)
      }

      // Progress indicator
      if (progressFill) {
        tl.fromTo(
          progressFill,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, ease: "none" },
          0
        )
      }

      invalidateRef.current()
    },
    { scope: sectionRef }
  )

  return (
    <section className="tech" id="technology" ref={sectionRef}>
      <div className="tech__canvas" aria-hidden="true" />
      <div className="tech__vignette" />

      <div className="tech__chapters">
        {techChapters.map((chapter, i) => (
          <div className="tech__chapter" key={chapter.index}>
            <div className="tech__chapter-inner">
              <div className="tech__icon-wrap" ref={(el) => { iconRefs.current[i] = el }}>
                <span className="tech__index">{chapter.index}</span>
                <div className="tech__icon-svg" aria-hidden="true">
                  {i === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0M2 12a10 10 0 0 1 20 0" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="12" cy="12" r="9" />
                      <ellipse cx="12" cy="12" rx="4" ry="9" />
                      <path d="M3 12h18" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M3 12h2l2-7 3 14 3-10 2 5 2-3h4" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="tech__content">
                <h3 className="tech__title">{chapter.title}</h3>
                <p className="tech__text">{chapter.text}</p>

                <div className="tech__detail" ref={(el) => { detailRefs.current[i] = el }}>
                  {chapter.detail}
                </div>

                <div className="tech__feature" ref={(el) => { featureRefs.current[i] = el }}>
                  <span className="tech__feature-label">Key Specs</span>
                  <span className="tech__feature-text">{chapter.feature}</span>
                </div>

                {chapter.closeUp && (
                  <div className="tech__closeup" ref={(el) => { closeUpRefs.current[i] = el }}>
                    <div className="tech__closeup-badge">
                      <span className="tech__closeup-dot" aria-hidden="true" />
                      Close-up
                    </div>
                    <h4 className="tech__closeup-title">{chapter.closeUp.label}</h4>
                    <p className="tech__closeup-text">{chapter.closeUp.description}</p>
                  </div>
                )}
              </div>

              <div className="tech__model-space" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <div className="tech__brand" aria-hidden="true">
        <span className="tech__brand-logo">SONORA</span>
        <span className="tech__brand-sub">Reference</span>
      </div>

      <div className="tech__progress" aria-hidden="true">
        <span className="tech__progress-fill" />
      </div>
    </section>
  )
}