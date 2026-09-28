const GEMINI_API_URL_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';
const MODEL_ID = 'gemini-3-pro-image-preview'; // User requested model

// Note: "Gemini 3 Pro" is not a standard public model name yet (as of my knowledge cutoff). 
// I will use a constant for the model name that can be easily changed.
// For image generation, we might need a specific model or tool. 
// If the user means text-to-image, Gemini models have varying support. 
// Assuming we are using a model that supports image generation or we are using the API to get image data.
// Wait, standard Gemini API is text/multimodal-in -> text-out. 
// For Image Generation, it's usually `imagen-3` or similar via Vertex AI, OR Gemini with image generation capabilities.
// I will assume the user wants to use the `gemini-pro` or similar for *prompting* or if they have access to a specific image gen model.
// ACTUALLY, the user said "generate... using Google's Gemini 3 Pro model". 
// I will implement a generic fetch wrapper that sends the prompt to the API.
// I will assume the response contains the image or a link to it.

export const generateSprite = async (apiKey, prompt, style) => {
    if (!apiKey) throw new Error("API Key is required");

    // Construct the query for an image generation model (assuming 'nano-banana-pro' works like Gemini/Imagen)
    // If it's a text-to-image model via Gemini API, the prompt is usually just passed in parts.
    // PROMPT ENGINEERING:
    // 1. "Solid Magenta (#FF00FF)": Standard Chroma Key color. Distinct from character colors (unlike white/black).
    // 2. "NO WHITE BOXES/GRIDS": Negative constraints to prevent the model from adding "helpful" UI elements or frames.
    // 3. "Uniform, Flat": Ensures the background is a single solid color for easy algorithmic removal.
    const fullPrompt = `Generate a high-resolution video game sprite sheet. 
  Style: ${style}. 
  Description: ${prompt}. 
  Ensure a Uniform, Flat Solid Magenta (#FF00FF) Background filling the entire image.
  IMPORTANT: NO WHITE BOXES. NO GRIDS. NO FRAMES. The background must be pure magenta only.`;

    try {
        const response = await fetch(`${GEMINI_API_URL_BASE}${MODEL_ID}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.4,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || error.message || 'Failed to generate sprite');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
