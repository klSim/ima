import ReactDOM from 'react-dom';

import App from '#/App';
import styles from '#/app.less';
import { OverlayContext, defaultOverlayContext } from '#/components';

/**
 * Custom web component wrapper.
 */
class ImaErrorOverlay extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: 'open' });

    // Create app root element
    const root = document.createElement('div');
    root.setAttribute('data-ima-error-overlay', '');

    // Append styles and root
    styles.use({ target: this.shadowRoot });
    this.shadowRoot?.appendChild(root);

    // Get component attributes
    const publicUrl = this.getAttribute('public-url');
    const serverError = this.getAttribute('server-error');

    // Render App
    ReactDOM.render(
      <OverlayContext.Provider
        value={{
          publicUrl: publicUrl ?? defaultOverlayContext.publicUrl,
        }}
      >
        <App serverError={serverError} />
      </OverlayContext.Provider>,
      root
    );
  }
}

customElements.define('ima-error-overlay', ImaErrorOverlay);