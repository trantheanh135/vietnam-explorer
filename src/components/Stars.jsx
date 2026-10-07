// Read-only stars (supports halves) or an interactive 1–5 picker when onChange is given.
export default function Stars({ value = 0, onChange, size = 16, label }) {
  const stars = [1, 2, 3, 4, 5]
  if (!onChange) {
    return (
      <span className="stars" aria-label={label || `${value} / 5`} style={{ fontSize: size }}>
        {stars.map((n) => {
          const fill = value >= n ? 'full' : value >= n - 0.5 ? 'half' : 'empty'
          return <span key={n} className={`star ${fill}`}>★</span>
        })}
        <span className="stars-num">{value.toFixed(1)}</span>
      </span>
    )
  }
  return (
    <span className="stars interactive" role="radiogroup" aria-label={label} style={{ fontSize: size }}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} / 5`}
          className={`star ${value >= n ? 'full' : 'empty'}`}
          onClick={() => onChange(value === n ? 0 : n)}
        >
          ★
        </button>
      ))}
    </span>
  )
}
