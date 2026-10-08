import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { title } from '../lib/places'
import { ARCHIPELAGOS, project, VN_PATH, VN_VIEWBOX } from '../lib/vnmap'
import PlaceHoverCard from './PlaceHoverCard'

const SAME_SPOT = 14 // viewBox units: dots closer than this overlap on screen

/**
 * The illustrated S-shaped map of Vietnam. Places are dots; the journey route runs through them
 * north → south and is drawn as far as the place being read (`activeId`).
 */
export default function SMap({ places, activeId, lang, onPick, onOpen, compact = false, showRoute = true, className = '' }) {
  const pts = useMemo(() => places.map((p) => ({ p, ...project(p.lat, p.lng) })), [places])
  const activeIndex = pts.findIndex((x) => x.p.id === activeId)
  const active = activeIndex >= 0 ? pts[activeIndex] : null
  const [hover, setHover] = useState(null) // { id, x, y } in screen pixels
  const hideTimer = useRef(null)
  const showTimer = useRef(null)
  const canHover = !!onOpen && !compact

  // While a card is open, only switch to another dot after the pointer rests on it, so that moving
  // across other dots on the way to the card doesn't swap the card.
  const show = (id, el) => {
    clearTimeout(showTimer.current)
    const go = () => {
      clearTimeout(hideTimer.current)
      const r = el.getBoundingClientRect()
      setHover({ id, x: r.right, y: r.top + r.height / 2, left: r.left })
    }
    if (hover && hover.id !== id) showTimer.current = setTimeout(go, 260)
    else go()
  }
  const hideSoon = () => {
    clearTimeout(showTimer.current)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setHover(null), 220)
  }
  const keep = () => clearTimeout(hideTimer.current)
  useEffect(() => {
    const close = () => setHover(null)
    window.addEventListener('scroll', close, { passive: true })
    return () => {
      window.removeEventListener('scroll', close)
      clearTimeout(hideTimer.current)
      clearTimeout(showTimer.current)
    }
  }, [])

  const hovered = hover && pts.find((x) => x.p.id === hover.id)
  const others = hovered ? pts.filter((x) => x !== hovered && Math.hypot(x.x - hovered.x, x.y - hovered.y) < SAME_SPOT).map((x) => x.p) : []
  const line = (list) => list.map((x, i) => `${i ? 'L' : 'M'}${x.x.toFixed(1)},${x.y.toFixed(1)}`).join('')

  return (
    <>
    <svg className={`smap ${compact ? 'compact' : ''} ${className}`} viewBox={VN_VIEWBOX} role="img"
      aria-label={lang === 'vi' ? 'Bản đồ Việt Nam' : 'Map of Vietnam'}>
      <defs>
        <pattern id="smap-waves" width="36" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 9 q9 -6 18 0 t18 0" fill="none" className="smap-wave" />
        </pattern>
        <radialGradient id="smap-glow">
          <stop offset="0" className="smap-glow-in" />
          <stop offset="1" className="smap-glow-out" />
        </radialGradient>
      </defs>
      {!compact && <rect x="380" y="0" width="620" height="1063" fill="url(#smap-waves)" className="smap-sea" />}
      <path d={VN_PATH} className="smap-land" />

      {ARCHIPELAGOS.map((a) => {
        const lp = project(a.label[0], a.label[1])
        return (
          <g key={a.vi} className="smap-islands">
            {a.islands.map(([la, ln]) => {
              const q = project(la, ln)
              return <circle key={`${la},${ln}`} cx={q.x} cy={q.y} r={compact ? 5 : 3.2} />
            })}
            {!compact && <text x={lp.x} y={lp.y} textAnchor="middle">{lang === 'vi' ? a.vi : a.en}</text>}
          </g>
        )
      })}
      {!compact && (
        <text x="720" y="520" className="smap-sea-label" textAnchor="middle">{lang === 'vi' ? 'Biển Đông' : 'East Sea'}</text>
      )}

      {showRoute && pts.length > 1 && (
        <>
          <path d={line(pts)} className="smap-route" />
          {activeIndex > 0 && <path d={line(pts.slice(0, activeIndex + 1))} className="smap-route done" />}
        </>
      )}

      {pts.map((x, i) => {
        const on = x.p.id === activeId
        const passed = activeIndex >= 0 && i < activeIndex
        return (
          <g key={x.p.id} className={`smap-dot ${on ? 'on' : ''} ${passed ? 'passed' : ''} ${hover?.id === x.p.id ? 'hover' : ''}`} transform={`translate(${x.x},${x.y})`}
            onClick={onPick ? () => onPick(x.p.id) : undefined} style={onPick ? { cursor: 'pointer' } : undefined}
            onMouseEnter={canHover ? (e) => show(x.p.id, e.currentTarget.querySelector('.smap-dot-core')) : undefined}
            onMouseLeave={canHover ? hideSoon : undefined}>
            {canHover && <circle r="16" className="smap-hit" />}
            {on && <circle r={compact ? 60 : 44} fill="url(#smap-glow)" className="smap-pulse" />}
            <circle r={on ? (compact ? 22 : 11) : (compact ? 13 : 6)} className="smap-dot-core" />
            {onPick && !canHover && <title>{title(x.p, lang)}</title>}
          </g>
        )
      })}

      {active && !compact && (
        <g className="smap-label" transform={`translate(${active.x + 18},${active.y})`}>
          <text className="smap-label-bg" y="7">{title(active.p, lang)}</text>
          <text y="7">{title(active.p, lang)}</text>
        </g>
      )}
    </svg>
    {hovered && createPortal(
      <div className="smap-hover" onMouseEnter={keep} onMouseLeave={hideSoon} style={placeCard(hover)}>
        <PlaceHoverCard place={hovered.p} lang={lang} others={others} onOpen={(id) => { setHover(null); onOpen(id) }} />
      </div>,
      document.body,
    )}
    </>
  )
}

/** Beside the dot, flipped to its left near the right edge, kept inside the viewport vertically. */
function placeCard({ x, y, left }) {
  const W = 300
  const H = 380
  const toRight = x + 16 + W < window.innerWidth
  return {
    left: toRight ? x + 14 : Math.max(8, left - 14 - W),
    top: Math.min(Math.max(y - 90, 72), window.innerHeight - H - 12),
  }
}
