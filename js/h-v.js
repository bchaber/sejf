
class HexElement extends HTMLElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ['value'];
  }

  constructor() {
    super();
    this._internals = this.attachInternals();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
      div {
          display: flex;
          height: 100%;
          align-items: center;
      }

      div b {
          font-size: xx-small;
          transition: color 0.2s ease;
      }
      </style>
      <div></div>`;
    this._el = this.shadowRoot.querySelector('div');
  }

  connectedCallback() {
    this._upgradeProperty('value');

    if (!this.hasAttribute('value')) {
      this.value = this.textContent.trim();
    }

    this._render();
  }

  disconnectedCallback() {
  }

  attributeChangedCallback() {
    this._render();
  }

  _upgradeProperty(prop) {
    if (this.hasOwnProperty(prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  get value() {
    return this.getAttribute('value') ?? '';
  }

  set value(v) {
    this.setAttribute('value', v);
    this.textContent = v;
    this._internals.setFormValue(v);
  }

  _render() {
    const value = this.value;

    this._el.innerHTML = ""
    for (let i=0; i < value.length; i += 2) {
      const x = value.substr(i, 2)
      const b = document.createElement("b")
      const h = parseInt("0x" + x);
      b.textContent = x
      b.style.color = this._color(h)
      this._el.appendChild(b)
    }
  }

  _color(hex) {
    if (hex <  16) return '#ff7b72';
    if (hex <  32) return '#cc7b72';
    if (hex <  64) return '#c9c9c9';
    if (hex <  96) return '#d9d9d9';
    if (hex < 128) return '#ffffff';
    if (hex < 192) return '#79c0cc';
    if (hex < 256) return '#79c0ff';
  }
}

customElements.define('h-v', HexElement);