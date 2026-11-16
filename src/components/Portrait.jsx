// The ID photo box in the corner of the form.
export default function Portrait({ photo }) {
  return (
    <figure className="idphoto">
      <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fetchPriority="high" />
    </figure>
  )
}
