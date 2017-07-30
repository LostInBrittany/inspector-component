const createStyles = require('../styles/createStyles');
const toCss = require('../utils/inlineToStyle');
const parse = require('../utils/parser');

const defaultNodeRenderer = ({depth, name, data, isNonenumerable}) =>
  depth === 0
    ? `<object-root-label name='${name !== undefined ? name : '' }' data='${data}' ></object-root-label>`
    : `<object-label name='${name !== undefined ? name : '' }' data='${data}' isNonenumerable='${isNonenumerable}' ></object-label>`;

class Arrow extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback(){
    const expanded = this.getAttribute('expanded') == 'true' ? true : false;
    const styles = JSON.parse(this.getAttribute('styles') || '{}') || {};
    this.removeAttribute('styles')
    this.innerHTML = `<span style='${toCss({
        ...styles.base,
        ...(expanded === true ? styles.expanded : styles.collapsed)
      })}'>▶</span>`;
  }
}

customElements.define('tree-arrow', Arrow);

class TreeNode extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback(){
    const nodeRenderer = defaultNodeRenderer || (({ name }) => `<span>${name}</span>`);

    this._data = (this.getAttribute('data') || 'null');
    const data = parse(this._data);
    this.data = this._data;
    this.removeAttribute('data');

    this.title = this.getAttribute('title') || '';
    this.name = this.getAttribute('name') || '';
    this.path = this.getAttribute('path');
    this.theme = this.getAttribute('theme') || 'chromeLight';

    this.expanded = this.getAttribute('expanded') == 'true' ? true : false;

    this.shouldShowArrow = this.getAttribute('should-show-arrow') == 'false' ? false : true;
    this.shouldShowPlaceholder = this.getAttribute('should-show-placeholder') == 'true' ? true : false;

    const styles = createStyles('TreeNode', this.theme);
    const renderedNode = (nodeRenderer(this));
    const childNodes = this.innerHTML;
    // const childNodes = this.expanded ? this.innerHTML : '';

    console.log('this.innerHTML', this.innerHTML)
    console.log('renderedNode', renderedNode)

    this.innerHTML = (`
      <li aria-expanded='${this.expanded}' role="treeitem" style='${toCss(styles.treeNodeBase)}' title='${this.title}'>
        <div style='${toCss(styles.treeNodePreviewContainer)}' path='${this.path}' class="clickableNode">
          ${this.shouldShowArrow || this.innerHTML.length > 0
            ? `<tree-arrow expanded='${this.expanded}' styles='${JSON.stringify(styles.treeNodeArrow)}'></tree-arrow>`
            : (this.shouldShowPlaceholder) && `<span style='${toCss(styles.treeNodePlaceholder)}'>&nbsp;</span>`}
          ${renderedNode}
        </div>
        <div class='child-nodes'>
          ${childNodes.trim().length > 0
            ? `<ol role="group"
                style='${toCss(styles.treeNodeChildNodesContainer)}'>${childNodes}</ol>`
            : ''}
        </div>
      </li>
    `);
  }
}


customElements.define('tree-node', TreeNode);
