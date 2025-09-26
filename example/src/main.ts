import { render } from 'woby'
import { App } from './app'
import { Checks } from '@woby/chk' // Import Check to run tests
import './index.css'
import '@woby/chk/index.css'

// Initialize the global chk instance if it's not already
if (!window.checks) {
    window.checks = new Checks()
}

// Render the App component
render(App(), document.getElementById('app')!)

// // Run the tests after the components have rendered and registered their snapshots
// // This might need to be debounced or triggered after a short delay
// // to ensure all Chk components have registered.
// setTimeout(() => {
//     console.log("Running Chk tests...")
//     window.checks.run({ head: false, noLocation: true })
// }, 500) // Small delay to allow components to render and register