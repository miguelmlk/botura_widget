import { createRoot } from "react-dom/client";
import { ChatWidget } from "./components/ChatWidget";
import "./widget.css";

function mountWidget() {
  // Finde das Widget-Container-Element
  const widgetElement = document.getElementById("botura-chat-widget");
  
  if (!widgetElement) {
    console.error("❌ Botura Widget: Element #botura-chat-widget nicht gefunden");
    return;
  }

  // Lese die data-Attribute aus
  const chatbotId = widgetElement.getAttribute("data-chatbot-id");
  const chatbotName = widgetElement.getAttribute("data-chatbot-name") || "Chatbot";
  const color = widgetElement.getAttribute("data-color") || "#10b981";
  const avatarImage = widgetElement.getAttribute("data-avatar-image") || undefined;
  const welcomeMessage = widgetElement.getAttribute("data-welcome-message") || undefined;
  const placeholderText = widgetElement.getAttribute("data-placeholder-text") || undefined;
  const apiUrl = widgetElement.getAttribute("data-api-url") || "http://localhost:8000";
  const position = widgetElement.getAttribute("data-position") || "bottom-right";
  const size = widgetElement.getAttribute("data-size") || "normal";

  if (!chatbotId) {
    console.error("❌ Botura Widget: data-chatbot-id fehlt");
    return;
  }

  // Setze API URL global
  (window as any).BOTURA_API_URL = apiUrl;

  // Styling basierend auf Position
  const positionStyles: Record<string, string> = {
    "bottom-right": "position:fixed;bottom:20px;right:20px;z-index:9999;",
    "bottom-left": "position:fixed;bottom:20px;left:20px;z-index:9999;",
    "top-right": "position:fixed;top:20px;right:20px;z-index:9999;",
    "top-left": "position:fixed;top:20px;left:20px;z-index:9999;",
  };

  // Styling basierend auf Größe
  const sizeStyles: Record<string, string> = {
    small: "width:320px;height:500px;",
    normal: "width:400px;height:600px;",
    large: "width:480px;height:700px;",
  };

  // Wende Styles an
  widgetElement.setAttribute(
    "style",
    (positionStyles[position] || positionStyles["bottom-right"]) +
    (sizeStyles[size] || sizeStyles["normal"])
  );

  console.log("✅ Botura Widget mounting with:", {
    chatbotId,
    chatbotName,
    color,
    apiUrl,
    position,
    size
  });

  // Render das Widget
  const root = createRoot(widgetElement);
  root.render(
    <ChatWidget
      chatbotId={chatbotId}
      chatbotName={chatbotName}
      color={color}
      avatarImage={avatarImage}
      welcomeMessage={welcomeMessage}
      placeholderText={placeholderText}
    />
  );
}

// Mount when DOM is ready
if (document.readyState === "complete" || document.readyState === "interactive") {
  mountWidget();
} else {
  document.addEventListener("DOMContentLoaded", mountWidget);
}