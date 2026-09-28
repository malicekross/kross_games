import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { generateSprite } from '../services/gemini';

const GenerationPage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [style, setStyle] = useState('Pixel Art');
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!apiKey) {
            setError('Please enter your Gemini API Key');
            return;
        }

        // Save API key for convenience
        localStorage.setItem('gemini_api_key', apiKey);

        setLoading(true);
        setError(null);

        try {
            const result = await generateSprite(apiKey, prompt, style);
            // Navigate to editor with the result
            // For now, passing result via state. In a real app, might use Context or Store.
            navigate('/editor', { state: { generatedData: result, prompt, style } });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 pb-1">
                    Forge Your Sprites
                </h1>
                <p className="text-slate-400 text-lg">
                    Generate high-quality game assets using Gemini 3 Pro
                </p>
            </div>

            <div className="card">
                <form onSubmit={handleGenerate} className="space-y-6">

                    <div className="input-group">
                        <label htmlFor="apiKey">Gemini API Key</label>
                        <input
                            id="apiKey"
                            type="password"
                            className="input-field"
                            placeholder="Enter your API key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="prompt">Sprite Description</label>
                        <textarea
                            id="prompt"
                            className="input-field min-h-[120px] resize-y"
                            placeholder="e.g., A brave knight in silver armor wielding a glowing sword, idle animation frame"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="style">Art Style</label>
                        <select
                            id="style"
                            className="input-field"
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                        >
                            <option>Pixel Art</option>
                            <option>Vector Flat</option>
                            <option>Hand Drawn</option>
                            <option>3D Rendered</option>
                            <option>Retro 8-bit</option>
                        </select>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Forging Sprites...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Assets
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GenerationPage;
