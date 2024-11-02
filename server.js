// Firebase Admin SDK 초기화 및 Express 설정
import express from "express";
import FCMService from "./firebase.js";
import cors from "cors";

const app = express();
// CORS 설정 추가
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", // 허용할 출처 설정
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/api/notifications/subscribe", async (req, res) => {
  // 쿼리 파라미터에서 token 추출
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "token is required",
    });
  }

  console.log("Received token:", token);

  FCMService.subscribers.add(token);
  res.json({ success: true, message: "Successfully subscribed" });
});

app.post("/api/notifications/send", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({
      success: false,
      error: "token, title, and body are required",
    });
  }

  const result = await FCMService.sendToDevice(token, title, body, data);

  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// 여러 기기로 푸시 알림 전송
app.post("/api/notifications/send-multiple", async (req, res) => {
  const { tokens, title, body, data } = req.body;

  if (!tokens || !Array.isArray(tokens) || !title || !body) {
    return res.status(400).json({
      success: false,
      error: "tokens array, title, and body are required",
    });
  }

  const result = await FCMService.sendToMultipleDevices(
    tokens,
    title,
    body,
    data
  );

  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// 토픽으로 푸시 알림 전송
app.post("/api/notifications/send-topic", async (req, res) => {
  const { topic, title, body, data } = req.body;

  if (!topic || !title || !body) {
    return res.status(400).json({
      success: false,
      error: "topic, title, and body are required",
    });
  }

  const result = await FCMService.sendToTopic(topic, title, body, data);

  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

// 토픽 구독 관리
app.post("/api/notifications/subscribe-to-topic", async (req, res) => {
  const { token, topic } = req.body;

  if (!token || !topic) {
    return res.status(400).json({
      success: false,
      error: "token and topic are required",
    });
  }

  try {
    await admin.messaging().subscribeToTopic(token, topic);
    res.json({ success: true, message: "Successfully subscribed to topic" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 토픽 구독 해제
app.post("/api/notifications/unsubscribe-from-topic", async (req, res) => {
  const { token, topic } = req.body;

  if (!token || !topic) {
    return res.status(400).json({
      success: false,
      error: "token and topic are required",
    });
  }

  try {
    await admin.messaging().unsubscribeFromTopic(token, topic);
    res.json({
      success: true,
      message: "Successfully unsubscribed from topic",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
