import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { debounce } from "lodash";
import { Button } from "antd";
import mqtt from "mqtt";

const ScanQR = ({ title }) => {
  const [errorCount, setErrorCount] = useState(0);

  const handleQrCodeSuccess = (data) => {
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
    if (document.getElementById('reader')) {
      const html5QrCodeScanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: 250 },
        false
      );
      html5QrCodeScanner.render(handleQrCodeSuccess, handleQrCodeError);
    }
  };

  useEffect(() => {
    startQrCodeScanner();
    return () => {
      if (document.getElementById('reader')) {
        const html5QrCodeScanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: 250 },
          false
        );
        html5QrCodeScanner.clear();
      }
    };
  }, []);

  const sendMessageToMqtt = (message) => {
    // const client = mqtt.connect("wss://test.mosquitto.org:8081");
    const client = mqtt.connect("wss://192.168.1.23:8081", {
      clean: true,
    });

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      const topic = "BTFood/sendQrCode";
      client.publish(topic, message, {}, (error) => {
        if (error) {
          console.error("Failed to send message:", error);
        }
      });
      client.end();
    });

    client.on("error", (error) => {
      console.error("Connection to MQTT broker failed:", error);
      client.end();
    });
  };

  useEffect(() => {
    // const client = mqtt.connect("wss://test.mosquitto.org:8081");
    const client = mqtt.connect("wss://192.168.1.23:8081", {
      clean: true,
    });

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
      client.subscribe("BTFood/receivedUrl", (err) => {
        if (err) {
          console.error("Subscription error:", err);
        }
      });
    });

    client.on("message", (topic, message) => {
      console.log(`Received message from ${topic}: ${message.toString()}`);
      const url = message.toString();
      window.location.href = url;
    });

    client.on("error", (error) => {
      console.error("Connection to MQTT broker failed:", error);
      client.end();
    });

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
