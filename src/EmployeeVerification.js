import React, { useState, useRef } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from '@radix-ui/react-alert-dialog';

const API_ENDPOINT = 'https://9zbkb4x9ni.execute-api.us-east-1.amazonaws.com/prod/verify';

const EmployeeVerification = () => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Failed to access camera. Please try again or use file upload.");
    }
  };

  const captureImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCapturedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const verifyEmployee = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const base64Data = capturedImage.split(',')[1];
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64Data
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setVerificationStatus({
          verified: data.verified,
          employeeData: data.employeeData
        });
      } else {
        setVerificationStatus({
          verified: false,
          message: data.body || 'Verification failed'
        });
      }
    } catch (err) {
      setError('Failed to verify employee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '20px auto', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Employee Verification</h1>
      
      {!capturedImage && (
        <>
          <button onClick={startCamera} style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
            Capture Image
          </button>
          <input type="file" accept="image/*" onChange={handleFileUpload} style={{ marginTop: '10px' }} />
        </>
      )}
      
      {videoRef.current && (
        <div style={{ marginTop: '20px' }}>
          <video ref={videoRef} autoPlay style={{ width: '100%' }} />
          <button onClick={captureImage} style={{ backgroundColor: '#008CBA', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', marginTop: '10px' }}>
            Capture
          </button>
        </div>
      )}
      
      {capturedImage && (
        <div style={{ marginTop: '20px' }}>
          <img src={capturedImage} alt="Captured" style={{ width: '100%' }} />
          <button onClick={verifyEmployee} disabled={isLoading} style={{ backgroundColor: '#f44336', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', marginTop: '10px' }}>
            {isLoading ? 'Verifying...' : 'Verify Employee'}
          </button>
        </div>
      )}
      
      {verificationStatus && (
        <AlertDialog open={true}>
          <AlertDialogContent style={{ backgroundColor: verificationStatus.verified ? '#DFF2BF' : '#FFBABA', padding: '20px', borderRadius: '4px', marginTop: '20px' }}>
            <AlertDialogTitle style={{ display: 'flex', alignItems: 'center' }}>
              {verificationStatus.verified ? 'Verified' : 'Not Verified'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {verificationStatus.verified
                ? `Employee ID: ${verificationStatus.employeeData.EmployeeID}`
                : verificationStatus.message}
            </AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}
      
      {error && (
        <AlertDialog open={true}>
          <AlertDialogContent style={{ backgroundColor: '#FFBABA', padding: '20px', borderRadius: '4px', marginTop: '20px' }}>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default EmployeeVerification;