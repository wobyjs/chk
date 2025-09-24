class AnotherComponent extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.render()
    }

    render() {
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = `
                <div>Another Custom Component</div>
            `
        }
    }
}

class MyComponent2 extends HTMLElement {
    static get observedAttributes() {
        return ['message']
    }

    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.render()
    }

    attributeChangedCallback() {
        this.render()
    }

    render() {
        if (this.shadowRoot) {
            const message = this.getAttribute('message') || 'Default Message'
            this.shadowRoot.innerHTML = `
                <div>${message}</div>
            `
        }
    }
}

// Register custom elements
customElements.define('another-component', AnotherComponent)
customElements.define('my-component2', MyComponent2)