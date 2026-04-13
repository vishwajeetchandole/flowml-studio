import React, { useState } from 'react';
import { ThemeProvider } from './theme/ThemeProvider';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import ConsolePanel from './components/layout/ConsolePanel';
import Workflow from './pages/Workflow';

function App() {
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const toggleConsole = () => setIsConsoleOpen(!isConsoleOpen);

  return (
    <ThemeProvider>
      {/* ThemeProvider already renders a wrapper div with the theme class and min-h-screen.
          Its background/text come from the semantic CSS vars set in globals.css. */}
      <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <Navbar toggleConsole={toggleConsole} isConsoleOpen={isConsoleOpen} />

        <div className="flex flex-1 overflow-hidden relative">
          <Sidebar />

          <main className="flex-1 relative overflow-hidden">
            <Workflow onNodeClick={setSelectedNode} />
          </main>

          {selectedNode && (
            <RightPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
        </div>

        <ConsolePanel isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />
      </div>
    </ThemeProvider>
  );
}

export default App;
