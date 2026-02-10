export interface ChatMessage {
  messageId: string;
  content: string;
  sender: "user" | "agent";
  timestamp: number;
}

export interface SendMessagePayload {
  message: string;
}

export interface SendMessageResponse {
  messageId: string;
  timestamp: number;
}
