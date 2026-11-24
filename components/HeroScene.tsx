"use client"

export default function HeroScene() {
  return (
    <>
      <div className="hero__vignette" />
      <div className="hero__content">
        <div className="hero__inner">
          <span className="eyebrow">SONORA Reference</span>
          <h1 className="display hero__headline gradient-text">
            Hear what
            <br />
            matters
          </h1>
          <p className="hero__sub">
            Reference-grade headphones engineered for people who
            listen closely. Every detail, nothing between you and the music.
          </p>
        </div>
      </div>
      <a href="#story" className="hero__scroll" aria-label="Scroll to product story">
        <span className="hero__scroll-line" />
        Scroll
      </a>
    </>
  )
}