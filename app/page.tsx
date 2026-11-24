"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import HeroScene from "@/components/HeroScene"
import StorySection from "@/components/StorySection"
import { PersistentProductCanvas, AnimState } from "@/components/PersistentProductCanvas"
import SiteNav from "@/components/SiteNav"

gsap.registerPlugin(ScrollTrigger)

const techCards = [
  {
    index: "T1",
    title: "Adaptive Noise Cancellation",
    text: "Eight microphones map your environment 48,000 times a second, cancelling up to 42 dB of ambient noise in real time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="3" />
        <path d="M5 12a7 7 0 0 1 14 0M8 12a4 4 0 0 1 8 0M2 12a10 10 0 0 1 20 0" />
      </svg>
    ),
  },
  {
    index: "T2",
    title: "Spatial Audio",
    text: "Dynamic head tracking anchors sound in space. A 360° stage that stays fixed to your screen, not your ears.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18" />
      </svg>
    ),
  },
  {
    index: "T3",
    title: "Hi-Res Lossless",
    text: "A USB-C connection streams 24-bit / 96 kHz audio with zero compression — studio masters, exactly as recorded.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 12h2l2-7 3 14 3-10 2 5 2-3h4" />
      </svg>
    ),
  },
]

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

      <section className="tech" id="technology">
        <div className="container">
          <div className="tech__head">
            <div>
              <span className="eyebrow">Technology</span>
              <h2 className="section-title gradient-text">
                Engineered in the details you don't see.
              </h2>
            </div>
            <p>
              A stack of proprietary systems working in concert —
              so all you perceive is the music, exactly as intended.
            </p>
          </div>

          <div className="tech__cards">
            {techCards.map((card) => (
              <div className="tech-card" key={card.index}>
                <span className="tech-card__index">{card.index}</span>
                <div className="tech-card__icon">{card.icon}</div>
                <div>
                  <h3 className="tech-card__title">{card.title}</h3>
                  <p className="tech-card__text">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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