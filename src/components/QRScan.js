import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { debounce } from "lodash";

const ScanQR = () => {
  const [qrData, setQrData] = useState(null);
  const [errorCount, setErrorCount] = useState(0);

  const handleQrCodeSuccess = (data) => {
    setQrData(data);
    console.log("QR Data: ", data);
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Xin mời quét</h2>
      <div id="reader" style={{ width: "100%" }}></div>
      {qrData ? <p>QR Data: {qrData}</p> : <p>Đang quét...</p>}
    </div>
  );
};

export default ScanQR;
