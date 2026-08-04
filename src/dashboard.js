import React from 'react'
import { render } from 'ink'
import { App } from './components/App.js'

// Renders the local operator dashboard to the terminal the `alveare`
// process itself was launched from — not to any queen/bee socket.
export function mountDashboard (props) {
  return render(React.createElement(App, props))
}
