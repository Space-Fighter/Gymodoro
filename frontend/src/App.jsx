import "./index.css";
import ThemeToggle from "./components/ThemeToggle";
import ThemeDropdown from "./components/ThemeDropdown";
import { useTheme } from "./hooks/useTheme";

function App() {
  const { 
    currentMode, 
    currTheme, 
    currLightTheme, // 👈 Grab this
    currDarkTheme,  // 👈 Grab this
    toggleMode, 
    lightThemes, 
    darkThemes, 
    updatePreference 
  } = useTheme();

  return (
    <div className="relative min-h-screen w-full bg-base-100 text-base-content transition-colors duration-300">
      
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle 
          currentMode={currentMode} 
          toggleMode={toggleMode} 
        />
        <ThemeDropdown 
          lightThemes={lightThemes} 
          darkThemes={darkThemes} 
          currLightTheme={currLightTheme} // 👈 Pass it down
          currDarkTheme={currDarkTheme}   // 👈 Pass it down
          updatePreference={updatePreference} 
        />
      </div>

      <main className="p-8">
        <h1 className="text-3xl font-bold">Welcome to my App</h1>
        <ul className="mt-4 list-disc list-inside">
          <li>Current mode: <strong>{currentMode}</strong></li>
          <li>Active theme: <strong>{currTheme}</strong></li>
        </ul>
      </main>

    </div>
  );
}

export default App;