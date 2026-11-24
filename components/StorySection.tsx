"use client"

import { useCallback, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { AnimState } from "./PersistentProductCanvas"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Chapter {
  num: string
  title: string
  text: string
}

const chapters: Chapter[] = [
  {
    num: "01",
    title: "Pure Detail",
    text: "Every note rendered with surgical precision. A custom beryllium-coated driver resolves the quietest textures and the highest transients without a trace of harshness.",
  },
  {
    num: "02",
    title: "All-Day Comfort",
    text: "A floating aluminum headband distributes weight evenly, while slow-recovery memory foam and protein leather seal without pressure. Wear them from first light to last track.",
  },
  {
    num: "03",
    title: "Engineered to Last",
    text: "A unibody frame milled from a single block of aluminum. Replaceable ear pads, a serviceable battery, and a five-year warranty — built to outlast trends.",
  },
]

export default function StorySection({ animRef }: { animRef: { current: AnimState } }) {
  const sectionRef = useRef<HTMLElement>(null)
  const invalidateRef = useRef<() => void>(() => {})

  const handleReady = useCallback((inv: () => void) => {
    invalidateRef.current = inv
  }, [])

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      const chapterEls = Array.from(
        section.querySelectorAll<HTMLElement>(".storypin__chapter")
      )
      const brandEl = section.querySelector<HTMLElement>(".storypin__brand")
      const lineEl = section.querySelector<HTMLElement>(".storypin__progress-fill")

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const scrub = reduce ? true : 0.6

      gsap.set(chapterEls, { autoAlpha: 0, y: 34 })
      if (brandEl) gsap.set(brandEl, { autoAlpha: 0, y: 26 })

      const a = animRef.current

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => invalidateRef.current(),
      })

      // --- Stage 2: Transition into StorySection (0.0 -> 0.45) -------------
      // Vertical position is already settled from the Hero drop (progress == 1)
      // and is held constant here. Only rotation continues; no horizontal
      // movement and no camera animation.
      tl.to(a, {
        rotY: -3.45,
        duration: 0.45,
      }, 0)

      // --- Stage 3: StorySection rotation sequence (0.45 -> 1.0) -----------
      // Keep rotating, settling into the final product angle. Vertical screen
      // position remains fixed.
      tl.to(a, {
        rotY: -5.683,
        duration: 0.35,
      }, 0.45)

      // --- Chapter text sync ---
      const show = (el: HTMLElement, at: number) =>
        tl.fromTo(
          el,
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.05, ease: "power2.out" },
          at
        )
      const hide = (el: HTMLElement, at: number) =>
        tl.to(
          el,
          { autoAlpha: 0, y: -22, duration: 0.05, ease: "power2.in" },
          at
        )

      if (chapterEls[0]) {
        show(chapterEls[0], 0.31)
        hide(chapterEls[0], 0.535)
      }
      if (chapterEls[1]) {
        show(chapterEls[1], 0.6)
        hide(chapterEls[1], 0.835)
      }
      if (chapterEls[2]) {
        show(chapterEls[2], 0.86)
        hide(chapterEls[2], 0.97)
      }

      // Final brand lockup on the last beat.
      if (brandEl) {
        tl.to(brandEl, {
          autoAlpha: 1,
          y: 0,
          duration: 0.08,
          ease: "power2.out",
        }, 0.98)
      }

      // Thin progress indicator along the bottom.
      if (lineEl) {
        tl.fromTo(
          lineEl,
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
    <section className="storypin" id="story" ref={sectionRef}>
      <div className="storypin__vignette" />

      <div className="storypin__overlay">
        <span className="storypin__tag eyebrow">The SONORA Standard</span>

        <div className="storypin__chapters">
          {chapters.map((c) => (
            <div className="storypin__chapter" key={c.num}>
              <span className="storypin__num">{c.num}</span>
              <h3 className="storypin__title">{c.title}</h3>
              <p className="storypin__text">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="storypin__brand" aria-hidden="true">
          <span className="storypin__brand-logo">SONORA</span>
          <span className="storypin__brand-sub">Reference</span>
        </div>
      </div>

      <div className="storypin__progress" aria-hidden="true">
        <span className="storypin__progress-fill" />
      </div>
    </section>
  )
}