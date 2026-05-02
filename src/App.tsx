import AppRoutes from "./AppRoutes"
import { ToastProvider } from "./components/ui/toast"

function App() {
  return (
    <>
      <AppRoutes />
      <ToastProvider />
    </>
  )
}

export default App
