import Panel from './Panel.jsx'

// The two-minute walkthrough of this portfolio, attached to the form.
export default function PortfolioReel() {
  return (
    <Panel id="walkthrough" area="reel" title="Walkthrough video, 2:02" flush className="portfolio-reel">
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
    </Panel>
  )
}
