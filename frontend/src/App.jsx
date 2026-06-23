import "./index.css";
import ThemeToggle from "./components/ThemeToggle";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { currentMode, toggleMode } = useTheme();

  return (
    // Added relative positioning, full width, and full viewport height
    <div className="relative min-h-screen w-full bg-base-100 text-base-content">
      
      {/* Container forced to the absolute viewport top-right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle currentMode={currentMode} toggleMode={toggleMode} />
      </div>

      {/* Main app content goes here */}
      <main className="p-8">
        <h1 className="text-3xl font-bold">Welcome to my App</h1>
        <p className="mt-2">The current mode is: <strong>{currentMode}</strong></p>
      </main>

    </div>
  );
}

export default App;
