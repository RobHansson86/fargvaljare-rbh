export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, colorName } = request.body;

        if (!imageData || !colorName) {
            return response.status(400).json({ error: 'Missing imageData or colorName in request body' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables.');
            return response.status(500).json({ error: 'Server configuration error: API key is missing.' });
        }

        const systemPrompt = "You are an expert interior design AI. Your task is to realistically repaint the main walls of a room in a user-provided image to a specified color. You must carefully identify only the vertical wall surfaces. It is critical to exclude ceilings, floors, furniture, windows, doors, trim, and decorations. The new color should be applied with realistic lighting, shadows, and textures to seamlessly blend into the original image.";
        const userPrompt = `Recolor only the walls in this room to the NCS color "${colorName}". Do not color the ceiling or floor. Maintain all other elements of the room as they are.`;

        const payload = {
            contents: [{
                role: "user",
                parts: [
                    { text: userPrompt },
                    { inlineData: { mimeType: "image/jpeg", data: imageData } }
                ]
            }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const error = await geminiResponse.json();
            console.error('Gemini API Error:', error);
            // Don't expose detailed API errors to the client
            return response.status(502).json({ error: 'Ett fel inträffade vid kommunikation med bildtjänsten.' });
        }

        const result = await geminiResponse.json();
        const newBase64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

        if (newBase64Data) {
            return response.status(200).json({ imageData: newBase64Data });
        } else {
            console.error("Bildtjänsten returnerade inget bilddata. Svar:", result);
            return response.status(500).json({ error: 'Bildtjänsten returnerade inget bilddata.' });
        }

    } catch (error) {
        console.error('Internal Server Error:', error);
        return response.status(500).json({ error: 'Ett oväntat fel inträffade på servern.' });
    }
}
