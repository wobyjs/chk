import { render } from 'woby'
import { App } from './App'
import { Verifies } from 'verifies' // Import Check to run tests
import './index.css'
import 'verifies/index.css'

// Initialize the global chk instance if it's not already
if (!window.verifies) {
    window.verifies = new Verifies()
}

// Render the App component
render(App(), document.getElementById('app')!)

// Run the tests after the components have rendered and registered their snapshots
// This might need to be debounced or triggered after a short delay
// to ensure all Chk components have registered.
setTimeout(() => {
    console.log("Running Chk tests...")
    window.verifies.run()
}, 500) // Small delay to allow components to render and register