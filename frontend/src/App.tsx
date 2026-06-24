import React from "react";
import { ThemeProvider } from "@/components/theme-provider"
import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import Home from "./pages/Home";
import ModeToggle from "./components/mode-toggle";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <div className="fixed top-4 right-4 z-50">
            <ModeToggle />
          </div>
          <BrowserRouter>
              <Routes>
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/" element={<Home />} />
              </Routes>
          </BrowserRouter>
        </ThemeProvider>
        
    );
}

export default App;