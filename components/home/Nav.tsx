'use client'
import Brand from '@/components/Brand'
import Icon from '@/components/Icon'

interface Props { onRetake: () => void }

export default function Nav({ onRetake }: Props) {
  return (
    <nav className="nav">
      <div className="nav-brand"><Brand variant="nav"/></div>
      <div className="nav-links">
        {['Watch Now','Movies','TV Shows','Sports','Kids','Library'].map((l, i) => (
          <a key={l} className={`nav-link ${i === 0 ? 'active' : ''}`}>{l}</a>
        ))}
      </div>
      <div className="nav-search">
        <Icon name="search" size={14}/>
        <input placeholder="Search movies, series, channels" readOnly/>
      </div>
      <div className="nav-right">
        <button className="retake-pill" onClick={onRetake}>
          <Icon name="refresh" size={12}/><span className="retake-label"> Retake mood</span>
        </button>
        <button className="icon-btn"><Icon name="search" size={15}/></button>
        <button className="icon-btn"><Icon name="cast" size={15}/></button>
        <div className="nav-avatar">
          <div className="nav-avatar-pic">S</div>
          <span className="nav-avatar-name">Soar</span>
        </div>
      </div>
    </nav>
  )
}
