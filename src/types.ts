export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface Settings {
  model: string;
  fontSize?: number;
}
