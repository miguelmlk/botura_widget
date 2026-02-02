// import React from "react";
import { createRoot } from "react-dom/client";
import { ChatWidget } from "./components/ChatWidget";

function mountWidget() {
  const container = document.createElement("div");
  container.id = "botura-chat-widget-container";
  document.body.appendChild(container);

  const root = createRoot(container); // <-- React 18
  root.render(
    <ChatWidget
      chatbotId="db0274b1-784f-4730-a225-d43d86444745"
      chatbotName="Bastel Laden"
      color="#f97316"
    />
  );
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  mountWidget();
} else {
  document.addEventListener("DOMContentLoaded", mountWidget);
}

