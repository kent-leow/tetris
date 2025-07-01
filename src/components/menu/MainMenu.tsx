import React from "react";

/**
 * MainMenu component displays the main menu for the Tetris game.
 * - Accessible via keyboard and mouse
 * - Responsive and visually distinct
 * - Uses semantic HTML for accessibility
 */
const MainMenu: React.FC = () => {
  return (
    <nav
      aria-label="Main Menu"
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white px-4"
    >
      <h1 className="text-4xl font-bold mb-8 focus:outline-none" tabIndex={-1}>
        Tetris
      </h1>
      <ul className="w-full max-w-xs space-y-4" role="menu">
        <li>
          <button
            className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition text-lg font-semibold"
            role="menuitem"
            tabIndex={0}
            autoFocus
          >
            Start Game
          </button>
        </li>
        <li>
          <button
            className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition text-lg font-semibold"
            role="menuitem"
            tabIndex={0}
          >
            Leaderboard
          </button>
        </li>
        <li>
          <button
            className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 focus:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition text-lg font-semibold"
            role="menuitem"
            tabIndex={0}
          >
            Settings
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default MainMenu;
