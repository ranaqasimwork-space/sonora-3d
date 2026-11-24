"use client"

import { useEffect, useState } from "react"

const links = [
  { label: "Discover", href: "#discover" },
  { label: "Technology", href: "#technology" },
  { label: "About", href: "#about" },
]

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? " scrolled" : ""}`}>
      <a href="#discover" className="nav__logo">
        Sonora
      </a>
      <div className="nav__links">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="nav__link">
            {l.label}
          </a>
        ))}
        <a href="#shop" className="nav__link nav__shop">
          Shop
        </a>
      </div>
    </nav>
  )
}