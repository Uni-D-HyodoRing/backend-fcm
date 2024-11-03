import express from "express";
import FCMService from "./firebase.js";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();

// Swagger 설정
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FCM Push Notification API",
      version: "1.0.0",
      description: "Firebase Cloud Messaging을 이용한 푸시 알림 서비스 API",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "개발 서버",
      },
    ],
    components: {
      schemas: {
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            error: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: ["./server.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: FCM 토큰 등록
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - member_id
 *             properties:
 *               token:
 *                 type: string
 *                 description: FCM 디바이스 토큰
 *               member_id:
 *                 type: integer
 *                 description: 사용자 ID
 *     responses:
 *       200:
 *         description: 토큰 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post("/api/notifications/subscribe", async (req, res) => {
  const { token, member_id } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: "token is required",
    });
  }

  console.log("Received token:", member_id, token);

  FCMService.subscribers.set(member_id, token);
  res.json({ success: true, message: "Successfully subscribed" });
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: 푸시 알림 전송
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member_id
 *               - title
 *               - body
 *             properties:
 *               member_id:
 *                 type: integer
 *                 description: 알림을 받을 사용자 ID
 *               title:
 *                 type: string
 *                 description: 알림 제목
 *               body:
 *                 type: string
 *                 description: 알림 내용
 *     responses:
 *       200:
 *         description: 알림 전송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: string
 *       400:
 *         description: 잘못된 요청 (토큰이 없는 경우)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post("/api/notifications", async (req, res) => {
  const { member_id, title, body } = req.body;
  const token = FCMService.subscribers.get(member_id);
  if (!token) {
    return res.status(400).json({
      success: false,
      error: "token is required",
    });
  }
  const result = await FCMService.sendToDevice(token, title, body);
  res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
