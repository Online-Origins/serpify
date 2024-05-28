import { NextResponse } from "next/server";

const tokenRequestData = {
  grant_type: "refresh_token",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  refresh_token: process.env.REFRESH_TOKEN,
};

const tokenRequestHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
};

export async function POST(request) {
  const body = await request.json();
  const keywords = body.keywords || '';
  const language = body.language || '';
  const country = body.country || '';

  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/token",
      {
        method: "POST",
        headers: tokenRequestHeaders,
        body: new URLSearchParams(tokenRequestData).toString(),
      },
    );

    if (!response.ok) {
      throw new Error("Error obtaining access token");
    }

    const data = await response.json();
    const accessToken = data.access_token;

    // Now that you have the access token, you can use it to get the keyword metrics.
    const googleAdsMetrics = await getGoogleKeywordsMetrics(
      accessToken,
      keywords,
      language,
      country
    );

    return NextResponse.json(googleAdsMetrics);
  } catch (error) {
    throw error;
  }
}

async function getGoogleKeywordsMetrics(accessToken, keywords, language, country) {
  const googleAdsRequestData = {
    keywords: keywords,
    keywordPlanNetwork: "GOOGLE_SEARCH_AND_PARTNERS",
    language: `languageConstants/${language}`,
    geoTargetConstants: [`geoTargetConstants/${country}`]
  };

  const googleAdsRequestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.DEVELOPER_TOKEN,
    "login-customer-id": process.env.CUSTOMER_ID,
  };

  try {
    const response = await fetch(
      `https://googleads.googleapis.com/v16/customers/${process.env.CUSTOMER_ID}:generateKeywordHistoricalMetrics`,
      {
        method: "POST",
        headers: googleAdsRequestHeaders,
        body: JSON.stringify(googleAdsRequestData),
      }
    );

    // if (!response.ok) {
    //   throw new Error("Error making Google Ads API request");
    // }

    const data = await response.json();
    return data.results;
  } catch (error) {
    throw error;
  }
}