"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import HeroScene from "@/components/HeroScene"
import StorySection from "@/components/StorySection"
import TechnologySection from "@/components/TechnologySection"
import { PersistentProductCanvas, AnimState } from "@/components/PersistentProductCanvas"
import SiteNav from "@/components/SiteNav"

gsap.registerPlugin(ScrollTrigger)

const specs = [
  { key: "Driver", val: "40 mm beryllium-coated dynamic" },
  { key: "Frequency Response", val: "4 Hz – 44 kHz" },
  { key: "Impedance", val: "32 Ω" },
  { key: "Noise Cancellation", val: "Adaptive, up to −42 dB" },
  { key: "Codecs", val: "AAC · LDAC · aptX Lossless" },
  { key: "Connectivity", val: "Bluetooth 5.4 · USB-C" },
  { key: "Battery Life", val: "40 h (ANC on) · 60 h (off)" },
  { key: "Charging", val: "10 min = 8 h playback" },
  { key: "Weight", val: "285 g" },
  { key: "Materials", val: "Aluminum · memory foam · protein leather" },
  { key: "Warranty", val: "5 years" },
]

export default function Home() {
  const animRef = useRef<AnimState>({
    progress: 0,
    rotX: 0,
    rotY: -0.6,
    rotZ: 0,
    scale: 1,
    verticalPhase: 0,
    explode: 0,
    spatialWave: 0,
    camZoom: 0,
    camFocusUSBC: 0,
    usbcLight: 0,
  })

  const heroRef = useRef<HTMLElement>(null)
  const canvasInvalidateRef = useRef<() => void>(() => {})

  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const a = animRef.current
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const scrub = reduce ? true : 0.6

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: () => canvasInvalidateRef.current(),
      },
    })

    // Hero: model starts on the right side, moves straight down while
    // rotating. Horizontal screen position is held constant (posX is never
    // animated, camera is fixed by the canvas).
    tl.to(a, {
      progress: 1,
      rotY: -2.4,
      duration: 1,
    }, 0)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "preload"
    link.as = "model"
    link.href = "/models/hero.glb"
    link.type = "model/gltf-binary"
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return (
    <>
      <SiteNav />

      <PersistentProductCanvas animRef={animRef} onReady={(inv) => { canvasInvalidateRef.current = inv; }} />

      <section className="hero" id="discover" ref={heroRef}>
        <div className="hero__scene" />
        <HeroScene />
      </section>

      <StorySection animRef={animRef} />

      <TechnologySection animRef={animRef} />

      <section className="specs" id="specs">
        <div className="container">
          <div className="specs__head">
            <span className="eyebrow">Specifications</span>
            <h2 className="section-title gradient-text">Every figure, measured.</h2>
          </div>

          <div className="specs__layout">
            <div className="specs__label">
              Technical
              <br />
              Overview
              <p>
                Independently verified in an anechoic chamber.
                Measurements reflect production units at 1 kHz unless noted.
              </p>
            </div>

            <div className="specs__table">
              {specs.map((s) => (
                <div className="spec-row" key={s.key}>
                  <span className="spec-row__key">{s.key}</span>
                  <span className="spec-row__val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cta" id="shop">
        <div className="container">
          <h2 className="cta__title gradient-text">Hear what matters</h2>
          <p className="cta__sub">
            SONORA Reference. Available in Graphite and Silver.
            Free two-day shipping and a 30-day listening trial.
          </p>
          <div className="cta__actions">
            <button className="btn btn--primary">Buy Now — $549</button>
            <button className="btn btn--ghost">Book a Listening</button>
          </div>
          <p className="cta__price">
            or <strong>$46 / mo</strong> for 12 months
          </p>
        </div>
      </section>

      <footer className="footer" id="about">
        <div className="container footer__inner">
          <span className="footer__logo">SONORA</span>
          <div className="footer__meta">
            <a href="#discover">Discover</a>
            <a href="#technology">Technology</a>
            <a href="#about">About</a>
            <a href="#shop">Shop</a>
            <span>© {new Date().getFullYear()} SONORA Audio</span>
          </div>
        </div>
      </footer>
    </>
  )
}