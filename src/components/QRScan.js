import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { debounce } from "lodash";
import { Button } from "antd";
import mqtt from "mqtt";

const ScanQR = ({ title }) => {
  const [errorCount, setErrorCount] = useState(0);

  const handleQrCodeSuccess = (data) => {
    // setQrData(data);
    sendMessageToMqtt(data);
    setErrorCount(0); // Reset error count on successful scan
  };

  const handleQrCodeError = debounce((err) => {
    console.error("Error: ", err);
    setErrorCount((count) => count + 1);
    if (errorCount > 5) {
      console.log("Too many errors, stopping scanner");
      // Optionally stop scanner here
    }
  }, 1000); // Debounce errors to avoid spamming logs

  const startQrCodeScanner = () => {
    const html5QrCodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    html5QrCodeScanner.render(handleQrCodeSuccess, handleQrCodeError);
  };

  useEffect(() => {
    startQrCodeScanner();
    return () => {
      // Cleanup function to clear the QR code scanner
      const html5QrCodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );
      html5QrCodeScanner.clear();
    };
  }, []);

  const sendMessageToMqtt = (message) => {
    // Tạo một client MQTT sử dụng WebSocket
    const client = mqtt.connect("ws://test.mosquitto.org:8080");

    // Sự kiện khi kết nối thành công
    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Tên topic bạn muốn gửi thông điệp
      const topic = "BTFood/sendQrCode";

      // Gửi thông điệp
      client.publish(topic, message, {}, (error) => {
        if (error) {
          console.error("Failed to send message:", error);
        }
      });

      // Ngắt kết nối sau khi gửi xong
      client.end();
    });

    // Xử lý khi có lỗi xảy ra
    client.on("error", (error) => {
      console.error("Connection to MQTT broker failed:", error);
      client.end();
    });
  };

  useEffect(() => {
    // Tạo một client MQTT sử dụng WebSocket
    const client = mqtt.connect("ws://test.mosquitto.org:8080");

    // Sự kiện khi kết nối thành công
    client.on("connect", () => {
      console.log("Connected to MQTT broker");

      // Đăng ký lắng nghe topic `sendUrl`
      client.subscribe("BTFood/receivedUrl", (err) => {
        if (err) {
          console.error("Subscription error:", err);
        }
      });
    });

    // Xử lý các thông điệp nhận được từ topic `sendUrl`
    client.on("message", (topic, message) => {
      console.log(`Received message from ${topic}: ${message.toString()}`);
      const url = message.toString(); // Giả sử message là một URL hợp lệ
      window.location.href = url; // Chuyển trang đến URL
    });

    // Xử lý khi có lỗi xảy ra
    client.on("error", (error) => {
      console.error("Connection to MQTT broker failed:", error);
      client.end();
    });

    // Dọn dẹp khi component unmount
    return () => {
      client.end();
    };
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>{title}</h2>
      <div id="reader" style={{ width: "100%" }}></div>
    </div>
  );
};

export default ScanQR;
