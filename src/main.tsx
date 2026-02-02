import React from "react";
import ReactDOM from "react-dom";
import { ChatWidget } from "./ChatWidget";

// Funktion, um Widget in fremde Website zu mounten
function mountWidget() {
  const container = document.createElement("div");
  container.id = "botura-chat-widget-container";
  document.body.appendChild(container);

  ReactDOM.render(
    <React.StrictMode>
      <ChatWidget
        chatbotId="db0274b1-784f-4730-a225-d43d86444745"
        chatbotName="Bastel Laden"
        color="#f97316"
      />
    </React.StrictMode>,
    container
  );
}

// Widget mounten, wenn DOM geladen ist
if (document.readyState === "complete" || document.readyState === "interactive") {
  mountWidget();
} else {
  document.addEventListener("DOMContentLoaded", mountWidget);
}
