import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const prompt = body.prompt || "";

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": `${prompt}`
            }
        ],
        model: "gpt-4o",
    });

    const generatedContent = response.choices[0].message.content.replace(/["#]/g, '').replace(/^\s+/, '');
    return NextResponse.json({ generatedContent });
}