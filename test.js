import fcmService from "./firebase.js";

async function testFCM() {
  try {
    // 1. 단일 디바이스 테스트
    console.log("단일 디바이스 테스트 시작...");
    const singleResult = await fcmService.sendToDevice(
      "eoomg0IPTQ6gl8CRHhkL7u:APA91bGdcU9kBsAyCELCMFo0ZiBJJ6q31KC2qdxTmpqiTdT-RKR-XwzBJLyRghBRY_KSIjVbBfcwHOLhEO-uEbIRspt8KGTiFcK72eeeROUO2TkPhcOBVpc", // 실제 디바이스 토큰으로 교체
      "단일 테스트 알림",
      "테스트 메시지입니다",
      {
        type: "test",
        time: new Date().toISOString(),
      }
    );
    console.log("단일 디바이스 결과:", singleResult);

    // 2. 다중 디바이스 테스트
    // console.log("\n다중 디바이스 테스트 시작...");
    // const multiResult = await fcmService.sendToMultipleDevices(
    //   ["TOKEN1", "TOKEN2"], // 실제 디바이스 토큰 배열로 교체
    //   "다중 테스트 알림",
    //   "여러 기기로 전송되는 메시지입니다",
    //   {
    //     type: "multi_test",
    //     time: new Date().toISOString(),
    //   }
    // );
    // console.log("다중 디바이스 결과:", multiResult);

    // // 3. 토픽 테스트
    // console.log("\n토픽 테스트 시작...");
    // const topicResult = await fcmService.sendToTopic(
    //   "news", // 원하는 토픽 이름으로 교체
    //   "토픽 테스트 알림",
    //   "토픽 구독자들에게 전송되는 메시지입니다",
    //   {
    //     type: "topic_test",
    //     time: new Date().toISOString(),
    //   }
    // );
    // console.log("토픽 전송 결과:", topicResult);
  } catch (error) {
    console.error("테스트 중 오류 발생:", error);
  }
}

// 테스트 실행
testFCM();
