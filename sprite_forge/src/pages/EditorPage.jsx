import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Download, Eraser, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { downloadBase64Image, removeBackground } from '../utils/imageUtils';

const EditorPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { generatedData, prompt, style } = location.state || {};

    const [imageSrc, setImageSrc] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (generatedData) {
            try {
                const candidate = generatedData.candidates?.[0];
                const part = candidate?.content?.parts?.[0];

                if (part?.inlineData?.data) {
                    console.log('Found inlineData (camelCase)');
                    setImageSrc(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
                } else if (part?.inline_data?.data) {
                    console.log('Found inline_data (snake_case)');
                    setImageSrc(`data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`);
                } else {
                    console.error('No image data found in response parts:', part);
                }
            } catch (error) {
                console.error('Error parsing generated data:', error);
            }
        }
    }, [generatedData]);

    const handleDownload = () => {
        if (imageSrc) {
            const filename = `sprite-forge-${Date.now()}.png`;
            downloadBase64Image(imageSrc, filename);
        }
    };

    const handleRemoveBackground = async () => {
        if (!imageSrc) return;

        setIsProcessing(true);
        try {
            const newImageSrc = await removeBackground(imageSrc);
            setImageSrc(newImageSrc);
        } catch (error) {
            console.error('Failed to remove background:', error);
            alert('Failed to remove background. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!generatedData && !imageSrc) {
        return (
            <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-300 mb-2">No Sprite Generated</h2>
                <p className="text-slate-500 mb-6">Go back to the generator to create your first sprite.</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    <ArrowLeft className="w-4 h-4" />
                    Go to Generator
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <header className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Generator
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handleRemoveBackground}
                        className="btn btn-secondary"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Eraser className="w-4 h-4" />
                        )}
                        {isProcessing ? 'Processing...' : 'Remove Background'}
                    </button>
                    <button onClick={handleDownload} className="btn btn-primary">
                        <Download className="w-4 h-4" />
                        Download Asset
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Editor Area */}
                <div className="lg:col-span-2">
                    <div className="card h-[600px] flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0ib3BhY2l0eSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUyOTNiIiAvPjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWUyOTNiIiAvPjwvc3ZnPg==')]">
                        {imageSrc && (
                            <img
                                src={imageSrc}
                                alt="Generated Sprite"
                                className="max-w-full max-h-full object-contain shadow-2xl"
                            />
                        )}
                    </div>
                </div>

                {/* Sidebar / Details */}
                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 text-white">Asset Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Prompt</label>
                                <p className="text-slate-300 text-sm mt-1">{prompt || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Style</label>
                                <div className="inline-block mt-1 px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30">
                                    {style || 'N/A'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Dimensions</label>
                                <p className="text-slate-300 text-sm mt-1">1024 x 1024 px</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 text-white">Adjustments</h3>
                        <p className="text-sm text-slate-500 italic">
                            Advanced editing tools coming soon...
                        </p>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 text-white">Debug Info</h3>
                        <details open>
                            <summary className="text-xs text-slate-500 cursor-pointer">View Raw API Response</summary>
                            <pre className="mt-2 p-2 bg-slate-900 rounded text-xs text-slate-400 overflow-auto max-h-60">
                                {JSON.stringify(generatedData, null, 2)}
                            </pre>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
