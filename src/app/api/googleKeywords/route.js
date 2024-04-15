const tokenRequestData = {
  grant_type: "refresh_token",
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  refresh_token: process.env.REFRESH_TOKEN,
};

const tokenRequestHeaders = {
  "Content-Type": "application/x-www-form-urlencoded",
};

export async function getGoogleKeywords(keywords, language) {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/token",
      {
        method: "POST",
        headers: tokenRequestHeaders,
        body: new URLSearchParams(tokenRequestData).toString(),
      }
    );

    if (!response.ok) {
      throw new Error("Error obtaining access token");
    }

    const data = await response.json();
    const accessToken = data.access_token;

    // Now that you have the access token, you can use it to get the keyword metrics.
    const googleKeywords = await generateGoogleKeywords(
      accessToken,
      keywords,
      language
    );

    return googleKeywords;
  } catch (error) {
    console.error("Error obtaining access token:", error);
    throw error;
  }
}

async function generateGoogleKeywords(accessToken, keywords, language) {

  const googleAdsRequestHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.DEVELOPER_TOKEN,
    "login-customer-id": process.env.CUSTOMER_ID,
  };

  try {
    const requestBody = {
      keywordSeed: {
        keywords: keywords,
      },
      language: `languageConstants/${language}`,
    };

    const response = await fetch(
      `https://googleads.googleapis.com/v16/customers/${process.env.CUSTOMER_ID}:generateKeywordIdeas`,
      {
        method: 'POST',
        headers: googleAdsRequestHeaders,
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error('Error generating keyword ideas');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error generating keyword ideas:', error);
    throw error;
  }
}