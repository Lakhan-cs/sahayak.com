const { Server } = require("socket.io");
const mongoose = require("mongoose");

const memoryMessages = new Map();
const messageSchema = new mongoose.Schema({
  gigId: { type: String, required: true, index: true },
  senderRole: { type: String, enum: ["customer", "worker"], required: true },
  text: { type: String, required: true, maxlength: 1000 },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.models.NabhiMessage || mongoose.model("NabhiMessage", messageSchema);

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

async function readHistory(gigId) {
  if (mongoReady()) {
    return Message.find({ gigId }).sort({ timestamp: 1 }).limit(100).lean();
  }
  return (memoryMessages.get(gigId) || []).slice(-100);
}

function setupMessaging(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: true, credentials: true }
  });

  io.on("connection", socket => {
    socket.on("joinRoom", async ({ gigId } = {}) => {
      if (!gigId) return;
      socket.join(gigId);
      try {
        socket.emit("chatHistory", await readHistory(gigId));
      } catch (error) {
        console.error("Chat history error:", error.message);
        socket.emit("chatHistory", (memoryMessages.get(gigId) || []).slice(-100));
      }
    });

    socket.on("chatMessage", async ({ gigId, senderRole, text } = {}) => {
      const cleanText = typeof text === "string" ? text.trim().slice(0, 1000) : "";
      if (!gigId || !["customer", "worker"].includes(senderRole) || !cleanText) return;

      const messageData = {
        gigId,
        senderRole,
        text: cleanText,
      };
      let message;
      try {
        message = mongoReady()
          ? (await Message.create(messageData)).toObject()
          : { ...messageData, timestamp: new Date().toISOString() };
      } catch (error) {
        console.error("Chat persistence error:", error.message);
        message = { ...messageData, timestamp: new Date().toISOString() };
      }
      const messages = memoryMessages.get(gigId) || [];
      messages.push(message);
      memoryMessages.set(gigId, messages.slice(-100));
      io.to(gigId).emit("message", message);
    });

    socket.on("typing", ({ gigId, role } = {}) => {
      if (gigId && role) socket.to(gigId).emit("typing", { role });
    });

    socket.on("stopTyping", ({ gigId, role } = {}) => {
      if (gigId && role) socket.to(gigId).emit("stopTyping", { role });
    });
  });

  return io;
}

module.exports = setupMessaging;
