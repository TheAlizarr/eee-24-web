// This is the Vercel-native format for a serverless function.
export default async function handler(req, res) {
    // 1. We only accept POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    // 2. Get the API key securely from Vercel's environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'API key not configured' });
        return;
    }

    // 3. Get the user's prompt from the request body
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: 'Prompt is required' });
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    // 4. Construct the payload to send to Google
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: "Provide a short, quick, and brief explanation in a single paragraph." }]
        },
    };

    // 5. Call the Gemini API
    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            // If Google returns an error, send it back to the user
            console.error('Error from Gemini API:', data);
            res.status(geminiResponse.status).json({ body: data.error.message });
        } else {
            // If successful, send the data back to the user's browser
            res.status(200).json(data);
        }
    } catch (error) {
        console.error('Failed to fetch from Gemini API:', error);
        res.status(500).json({ error: 'Failed to fetch from Gemini API' });
    }
}
