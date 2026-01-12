"use client"

import dynamic from "next/dynamic"

// Dynamically import the App component with SSR disabled since it uses React Router
const App = dynamic(() => import("../src/App"), { ssr: false })

export default function Page() {
  return <App />
}
