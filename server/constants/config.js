 export const corsOptions = {
  origin: "*",  
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const CHAT_TOKEN = "chat-token";

export { corsOptions, CHAT_TOKEN };
