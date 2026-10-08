import { useMemo } from 'react'
import { title } from '../lib/places'
import { ARCHIPELAGOS, project, VN_PATH, VN_VIEWBOX } from '../lib/vnmap'

/**
 * The illustrated S-shaped map of Vietnam. Places are dots; the journey route runs through them
 * north → south and is drawn as far as the place being read (`activeId`).
 */
export default function SMap({ places, activeId, lang, onPick, compact = false, showRoute = true, className = '' }) {
  const pts = useMemo(() => places.map((p) => ({ p, ...project(p.lat, p.lng) })), [places])
  const activeIndex = pts.findIndex((x) => x.p.id === activeId)
  const active = activeIndex >= 0 ? pts[activeIndex] : null
  const line = (list) => list.map((x, i) => `${i ? 'L' : 'M'}${x.x.toFixed(1)},${x.y.toFixed(1)}`).join('')

  return (
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
          <g key={x.p.id} className={`smap-dot ${on ? 'on' : ''} ${passed ? 'passed' : ''}`} transform={`translate(${x.x},${x.y})`}
            onClick={onPick ? () => onPick(x.p.id) : undefined} style={onPick ? { cursor: 'pointer' } : undefined}>
            {on && <circle r={compact ? 60 : 44} fill="url(#smap-glow)" className="smap-pulse" />}
            <circle r={on ? (compact ? 22 : 11) : (compact ? 13 : 6)} className="smap-dot-core" />
            {onPick && <title>{title(x.p, lang)}</title>}
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
  )
}
