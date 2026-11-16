import './Printout.css'

// A screenshot printed on white stock and attached to the form.
export default function Printout({ src, alt, width, height, eager = false, caption, className = '', children }) {
  return (
    <figure className={`printout ${className}`}>
      <div className="printout__sheet">
        {children ?? (
          <img src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
        )}
      </div>
      {caption && <figcaption className="printout__caption">{caption}</figcaption>}
    </figure>
  )
}
