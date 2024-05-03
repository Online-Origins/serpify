import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const keywords = body.keywords || '';
    const language = body.language || '';
    const audience = body.audience || '';
    const toneOfVoice = body.toneOfVoice || '';
    const title = body.title || '';

    const response = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": `Generate a list of subtitles for a blog with the title: ${title}. The blog needs to be in ${language}, needs to have a ${toneOfVoice} tone of voice ${audience != '' ? ", and needs to target" + audience : ""}. The following keywords are going to be used in the blog: ${keywords.join(',')}. Only give back an JSON object with the following structure: [{id: , type: (h2,h3 or h4), title:}], for coding purposes only.`
            }
        ],
        model: "gpt-3.5-turbo",
    });

    const generatedOutlines = response.choices[0].message.content;
    return NextResponse.json({ generatedOutlines });
}