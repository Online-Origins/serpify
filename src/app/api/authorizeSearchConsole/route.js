import { google } from "googleapis";
import { NextResponse } from "next/server";
const { OAuth2 } = google.auth;

// Replace with your client ID, client secret, and redirect URL
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL; 

const oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);

export async function POST() {
    try {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/webmasters.readonly']
        });

        return NextResponse.json(authUrl)
    } catch (error) {
        console.log(error)
    }
}