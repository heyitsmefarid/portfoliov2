import './PortfolioReel.css'

export default function PortfolioReel() {
  return (
    <figure className="portfolio-reel" data-reveal>
      <video
        className="portfolio-reel__video"
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        poster="/profile/portfolio-walkthrough-poster.png"
        aria-label="Portfolio walkthrough, 2 minutes 2 seconds"
        onContextMenu={(event) => event.preventDefault()}
      >
        <source src="/profile/portfolio-walkthrough.mp4" type="video/mp4" />
        Your browser cannot play this video.
      </video>
      <figcaption className="portfolio-reel__caption">
        <span>Portfolio walkthrough</span>
        <span aria-label="Duration: 2 minutes 2 seconds">02:02</span>
      </figcaption>
    </figure>
  )
}
