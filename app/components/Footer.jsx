export default function Footer() {
  return (
    <div id="site-footer">
      <div className="feedback-overlay" id="feedbackOverlay" aria-hidden="true">
        <div className="feedback-backdrop"></div>

        <div className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedbackTitle">
          <button className="feedback-close" id="closeFeedback" aria-label="Close feedback form">
            A-
          </button>

          <h2 id="feedbackTitle" className="feedback-title">
            Contact &amp; Feedback
          </h2>
          <p className="feedback-subtitle">
            Tell us what you think about Vendors Market, or report an issue.
          </p>

          <form className="feedback-form">
            <label className="input-label" htmlFor="fb-name">
              Name (optional)
            </label>
            <input id="fb-name" type="text" className="input-field" placeholder="Your name" />

            <label className="input-label" htmlFor="fb-email">
              Email (optional)
            </label>
            <input id="fb-email" type="email" className="input-field" placeholder="you@example.com" />

            <label className="input-label" htmlFor="fb-message">
              Message
            </label>
            <textarea
              id="fb-message"
              className="input-field feedback-textarea"
              rows="4"
              placeholder="Share your feedback or question..."
            ></textarea>

            <button type="submit" className="btn-primary feedback-submit">
              Send feedback
            </button>
          </form>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-section">
          <h3>Vendors Market</h3>
          <p>Shop local. Support small businesses.</p>
        </div>

        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Help</a>
        </div>

        <button className="footer-feedback-btn" id="openFeedback">
          Contact &amp; Feedback
        </button>

        <p className="footer-copy">Ac 2025 Vendors Market</p>
      </footer>
    </div>
  );
}
