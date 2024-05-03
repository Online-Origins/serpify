import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const keywords = body.keywords || '';
    const language = body.language || '';
    const toneOfVoice = body.toneOfVoice || '';
    const type = body.type || '';
    const title = body.title || '';
    const subtitles = body.subtitles || '';

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                role: "user",
                content: `generate a new subtitle with the type ${type}, for a blog with the title "${title}". The blog is in ${language}, has a ${toneOfVoice} tone of voice and already contains the follwing subtitles: ${subtitles}. Only give back a string of the generated subtitle and nothing more.`
            }
        ],
        model: "gpt-3.5-turbo",
    });

    const generatedTitle = response.choices[0].message.content;
    return NextResponse.json({ generatedTitle });
}