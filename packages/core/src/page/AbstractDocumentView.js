import AbstractPureComponent from './AbstractPureComponent';

const PRIVATE = {
  masterElementId: Symbol('masterElementId'),
};

if (typeof $Debug !== 'undefined' && $Debug) {
  Object.freeze(PRIVATE);
}

// @server-side class AbstractDocumentView extends __VARIABLE__ {__CLEAR__}\nexports.default = AbstractDocumentView;

/**
 * The base class for document view components. The document view components
 * create the basic markup, i.e. the {@code html} or {@code head} elements,
 * along with an element that will contain the view associated with the current
 * route.
 *
 * Note that the document views are always rendered only at the server-side and
 * cannot be switched at the client-side. Because of this, the document view
 * component must be pure and cannot contain a state.
 *
 * @abstract
 */
export default class AbstractDocumentView extends AbstractPureComponent {
  //#if _SERVER
  /**
   * Returns the ID of the element (the value of the {@code id} attribute)
   * generated by this component that will contain the rendered page view.
   *
   * @abstract
   * @return {string} The ID of the element generated by this component that
   *         will contain the rendered page view.
   */
  static get masterElementId() {
    if (this[PRIVATE.masterElementId] !== undefined) {
      return this[PRIVATE.masterElementId];
    }

    throw new Error(
      'The masterElementId getter is abstract and must be overridden'
    );
  }

  /**
   * Setter for the ID of the element (the value of the {@code id} attribute)
   * generated by this component that will contain the rendered page view.
   *
   * This setter is used only for compatibility with the public class fields
   * and can only be used once per component.
   *
   * @param {string} masterElementId The ID of the element generated by this
   *        component that will contain the rendered page view.
   */
  static set masterElementId(masterElementId) {
    if ($Debug) {
      if (this[PRIVATE.masterElementId] !== undefined) {
        throw new Error(
          'The masterElementId can be set only once and cannot be ' +
            'reconfigured'
        );
      }
    }

    this[PRIVATE.masterElementId] = masterElementId;
  }
  //#endif
}
