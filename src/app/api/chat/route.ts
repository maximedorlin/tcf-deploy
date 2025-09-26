import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Tu es un agent RH d'AFREETECH. Tu aides les candidats à comprendre les offres d'emploi et le processus de recrutement.",
          },
          { role: "user", content: question },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      reply: response.data.choices[0].message.content,
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);

    if (error.response?.status === 429) {
      return NextResponse.json(
        { message: "Trop de requêtes, veuillez réessayer dans quelques secondes." },
        { status: 429 }
      );
    }

    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
