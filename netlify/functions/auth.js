// netlify/functions/auth.js
// Troca o código OAuth do GitHub por um token de acesso
// Deploy no Netlify (gratuito) - nunca expõe o CLIENT_SECRET no browser

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { code } = JSON.parse(event.body);

    if (!code) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Código OAuth ausente" }) };
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: data.error_description }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ access_token: data.access_token }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erro interno: " + err.message }),
    };
  }
};
