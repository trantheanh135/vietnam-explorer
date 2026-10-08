import { ChevronLeft, ChevronRight, Heart, MapPin, Star } from 'lucide-react'
import { useRef } from 'react'
import { title } from '../lib/places'
import PlaceImage from './PlaceImage'

/** A horizontally scrolling row of large portrait cards. */
export default function FeaturedRow({ title: heading, places, lang, reviews, onOpen }) {
  const row = useRef(null)
  const scroll = (dir) => row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="featured">
      <div className="section-head">
        <h2>{heading}</h2>
        <div className="row-arrows">
          <button type="button" onClick={() => scroll(-1)} aria-label="‹"><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => scroll(1)} aria-label="›"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="featured-row" ref={row}>
        {places.map((p) => (
          <button type="button" key={p.id} className="feature-card" onClick={() => onOpen(p.id)}>
            <PlaceImage place={p} />
            <span className="feature-shade" />
            {p.category === 'food' && (
              <span className="feature-rating"><Star size={12} fill="currentColor" strokeWidth={0} /> {p.rating.toFixed(1)}</span>
            )}
            {reviews[p.id]?.favourite && <span className="feature-fav"><Heart size={14} fill="currentColor" /></span>}
            <span className="feature-text">
              <b>{title(p, lang)}</b>
              <small>{p.category === 'food' ? p.venue : (lang === 'vi' ? p.nameEn : p.nameVi)}</small>
              <small className="feature-area"><MapPin size={11} /> {p.area}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
