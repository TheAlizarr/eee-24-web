// This version adds logging at the very top to see the incoming request.

exports.handler = async function(event) {
    // **NEW DEBUGGING LINE**
    // Let's log the entire body of the request that the function receives.
    console.log("Function triggered. Received event body:", event.body);

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // It's possible the body is missing, so we'll check for that.
    if (!event.body) {
        return { statusCode: 400, body: 'Error: Request body is empty.' };
    }

    const body = JSON.parse(event.body);
    const userPrompt = body.prompt;

    if (!userPrompt) {
        console.error("Error: 'prompt' not found in the parsed body.", body);
        return { statusCode: 400, body: "Error: 'prompt' key is missing from request." };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const systemPrompt = "Provide a short, quick, and brief explanation for an undergraduate electrical engineering student. The explanation should be a single, concise paragraph.";

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            console.error('Error from Gemini API:', errorBody); 
            return { 
                statusCode: geminiResponse.status, 
                body: `An error occurred with the Gemini API. Error: ${errorBody}` 
            };
        }

        const result = await geminiResponse.json();
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error('Server error during fetch:', error);
        return { statusCode: 500, body: `Server error: ${error.toString()}` };
    }
};