"use client";
import { useState } from "react";

export default function ChatAgent() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);

    // Ajoute le message utilisateur dans la liste
    setMessages((prev) => [...prev, { role: "user", text: input }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });

    const data = await res.json();

    // Ajoute la réponse de l'IA
    setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);

    setInput("");
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white border rounded-2xl shadow-lg flex flex-col z-50">
      {/* Zone messages */}
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
        {loading && <p className="text-gray-400">⏳ L’agent écrit...</p>}
      </div>

      {/* Input */}
      <div className="flex border-t p-2">
        <input
          className="flex-1 border rounded-l-lg px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 rounded-r-lg text-sm"
          disabled={loading}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
