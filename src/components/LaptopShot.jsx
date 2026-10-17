import './Laptop.css'

// A screenshot (or any `children`) on a simple laptop frame.
export default function LaptopShot({ src, alt, width, height, eager = false, children }) {
  return (
    <div className="laptop">
      <div className="laptop__screen">
        {children ?? (
          <img src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        )}
      </div>
      <div className="laptop__base" aria-hidden="true" />
    </div>
  )
}
