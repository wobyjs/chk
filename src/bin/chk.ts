// Main entry point for chk CLI
import './chk-env.js'

// Run the application after environment is set up
setTimeout(async () => {
  try {
    const { runChkApp } = await import('./chk-env.js')
    await runChkApp()
  } catch (error) {
    console.error("Error running chk app:", error)
  }
}, 100)