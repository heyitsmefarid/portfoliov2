// The ID photo, held to the form by a paperclip.
export default function Portrait({ photo }) {
  return (
    <figure className="idphoto">
      <svg className="paperclip" viewBox="0 0 30 76" aria-hidden="true">
        <path d="M9 22v34a6.5 6.5 0 0 0 13 0V14a10 10 0 0 0-20 0v44" />
      </svg>
      <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} fetchPriority="high" />
    </figure>
  )
}
