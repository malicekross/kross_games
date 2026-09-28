import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layers, Wand2, Settings } from 'lucide-react';
import packageJson from '../../package.json';

const MainLayout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-gray-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <Wand2 className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                            Sprite Forge AI
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Wand2 className="w-4 h-4" />
                            Generate
                        </Link>
                        <Link
                            to="/editor"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive('/editor') ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            Editor
                        </Link>
                    </div>

                    <div className="flex items-center gap-4 relative group">
                        {/* Settings Dropdown */}
                        <button className="text-slate-400 hover:text-white transition-colors p-2">
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('gemini_api_key');
                                    window.location.reload();
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700/50 hover:text-red-300 transition-colors rounded-lg flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Clear API Key
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-6 mt-auto">
                <div className="container mx-auto px-4 flex justify-between items-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Sprite Forge AI</p>
                    <div className="flex items-center gap-2">
                        <span>v{packageJson.version}</span>
                        <span className="text-xs text-slate-600">({new Date().toLocaleString()})</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
