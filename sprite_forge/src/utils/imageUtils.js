/**
 * Downloads a Base64 image string as a file.
 * @param {string} base64Data - The Base64 image string (Data URL).
 * @param {string} filename - The name of the file to save.
 */
export const downloadBase64Image = (base64Data, filename) => {
    const link = document.createElement('a');
    link.href = base64Data;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Removes the background from an image using a Logic-Based Chroma Filter.
 * Targets the entire Magenta/Purple spectrum regardless of brightness.
 * 
 * WHY THIS WORKS:
 * Distance-based tolerance reduces dark purple fringe pixels (which are a mix of Black outline and Magenta background)
 * to "Black", failing to detect them.
 * 
 * LOGIC FILTER:
 * Pure Magenta is (255, 0, 255).
 * Dark Purple Fringe is (~100, 0, ~100).
 * Both share the property: Red > Green AND Blue > Green.
 * 
 * Sprite Colors (Safe):
 * - Blue Uniform: High Blue, Low Red. (Fails R > G condition)
 * - Yellow Hair: High Red/Green, Low Blue. (Fails B > G condition)
 * 
 * @param {string} imageSrc - The source image Data URL.
 * @param {number} threshold - Min difference from Green channel (default 20).
 * @returns {Promise<string>} - A Promise resolving to the new Data URL.
 */
export const removeBackground = (imageSrc, threshold = 20) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Logic Filter: Target "Purpleness"
                // Magenta is High Red, High Blue, Low Green.
                // Even dark purple fringe follows this pattern (e.g. 100, 0, 100).
                // Blue Sprite is High Blue, Low Red. (Safe)
                // Yellow Sprite is High Red, High Green. (Safe)

                if (r > g + threshold && b > g + threshold) {
                    // It is significantly more Red/Blue than Green -> It is Purple/Magenta.
                    data[i + 3] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = (err) => {
            reject(err);
        };
    });
};
