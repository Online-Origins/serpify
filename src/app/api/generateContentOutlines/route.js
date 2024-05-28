import { NextResponse } from 'next/server'
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request) {
    const body = await request.json();
    const subKeywords = body.sub_keywords || '';
    const keyword = body.keyword || '';
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
                "content": `Generate a list of subtitles for a blog with the title: ${title}. The blog needs to be in ${language}, needs to have a ${toneOfVoice} tone of voice ${audience != '' ? ", and needs to target" + audience : ""}. The following keyword: "${keyword}", and subkeywords are going to be used in the blog: ${subKeywords.join(',')}. Only give back an JSON format array with the following structure: [{id: , type: (h2,h3 or h4), title: }], for coding purposes only.`
            }
        ],
        model: "gpt-4o",
        response_format: { type: "json_object" },
    });

    const generatedOutlinesJSON = response.choices[0].message.content;
    const generatedOutlines = JSON.parse(generatedOutlinesJSON);
    return NextResponse.json({ generatedOutlines });
}