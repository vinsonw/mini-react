import ReactDOM from "../core/ReactDOM.js"
import React from "../core/React.js"
import App from "./App.jsx"

console.log("main.jsx: App", App)

ReactDOM.createRoot(document.querySelector("#root")).render(<App />)
