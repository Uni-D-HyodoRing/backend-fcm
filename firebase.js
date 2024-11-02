import admin from "firebase-admin";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 서비스 계정 키 파일 읽기
const serviceAccount = JSON.parse(
  await readFile(
    join(__dirname, "./unid-06-firebase-adminsdk-58kme-fce06463d9.json"),
    "utf8"
  )
);

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// FCM 메시지 전송을 위한 유틸리티 클래스
class FCMService {
  constructor() {
    // 토큰 구독자 저장
    this.subscribers = new Map();
  }
  // 단일 기기로 메시지 전송
  async sendToDevice(token, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK", // Flutter/Android 앱용
        },
        token,
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
      return { success: true, response };
    } catch (error) {
      console.error("Error sending message:", error);
      return { success: false, error: error.message };
    }
  }

  // 여러 기기로 메시지 전송
  async sendToMultipleDevices(tokens, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        tokens,
      };

      const response = await admin.messaging().sendMulticast(message);
      console.log("Successfully sent messages:", response);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error("Error sending messages:", error);
      return { success: false, error: error.message };
    }
  }

  // 토픽으로 메시지 전송
  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        topic,
      };

      const response = await admin.messaging().send(message);
      console.log("Successfully sent message to topic:", response);
      return { success: true, response };
    } catch (error) {
      console.error("Error sending message to topic:", error);
      return { success: false, error: error.message };
    }
  }
}

// FCM 서비스 인스턴스 생성 및 내보내기
const fcmService = new FCMService();
export default fcmService;
