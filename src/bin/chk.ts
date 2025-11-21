// Main entry point for chk CLI
import './chk-env.js'

// Run the application after environment is set up
setTimeout(async () => {
  try {
    const { runChkApp } = await import('./chk-env')
    await runChkApp()
  } catch (error) {
    console.error("%cError running chk app:", 'color: #F44336; font-weight: bold', error)
  }
}, 100)