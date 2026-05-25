// frontend/src/components/QRScanner.jsx
import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const success = (decodedText) => {
      html5QrcodeScanner.clear();
      onScanSuccess(decodedText);
    };

    const error = (err) => {
      if (onScanError) onScanError(err);
    };

    html5QrcodeScanner.render(success, error);
    setScanner(html5QrcodeScanner);

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div id="qr-reader" className="w-full"></div>
    </div>
  );
};

export default QRScanner;