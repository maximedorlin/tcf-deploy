

"use client";
import { useState } from "react";
import Image from "next/image"; // si tu veux utiliser ton logo

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    {
      role: "assistant",
      text: "Bienvenue chez AFREETECH ! Je suis votre assistant RH. Je peux répondre à vos questions sur nos offres d'emploi et le processus de recrutement.",
    },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Ajouter le message utilisateur
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setInput("");

    // Appel API OpenAI
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Erreur serveur" }]);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <div
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <Image
          src="/afreetech-logo.png" // ton logo AFREETECH
          alt="AFREETECH Chat"
          width={60}
          height={60}
          className="rounded-full shadow-lg"
        />
      </div>

      {/* Chat box */}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white border border-gray-200 shadow-lg rounded-xl flex flex-col">
          <div className="p-3 h-64 overflow-y-auto text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  msg.role === "user" ? "text-blue-600 text-right" : "text-gray-800"
                }`}
              >
                <span className="block px-2 py-1 rounded-lg bg-gray-100">
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex border-t p-2">
            <input
              type="text"
              placeholder="Pose ta question..."
              className="flex-1 border rounded-l-md px-2 py-1 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded-r-md text-sm"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}
    </>
  );
}


