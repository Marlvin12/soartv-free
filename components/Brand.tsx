export default function Brand({ variant }: { variant?: 'nav' | 'default' }) {
  return (
    <div className={`brand ${variant === 'nav' ? 'brand--nav' : ''}`}>
      <span className="brand-word">soar<span className="brand-dot">.</span>tv</span>
    </div>
  )
}
