import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const LoginBio = () => {
    const [image, setImage] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const stopTimeoutRef = useRef(null);
    const streamRef = useRef(null);
    const router = useRouter();

    // Capture Face Image
    const captureImage = () => {
        const canvas = document.createElement("canvas");
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL("image/png"));
    };

    // Start Voice Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunks.current = [];
            setIsRecording(true);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
                setAudioBlob(audioBlob);
                setIsRecording(false);
                audioChunks.current = [];
            };

            mediaRecorderRef.current.start();
            console.log("Recording started...");

            // Auto-stop after 30 seconds
            stopTimeoutRef.current = setTimeout(() => {
                stopRecording();
                console.log("Recording stopped after 30s.");
            }, 30000);
        } catch (error) {
            alert("Error accessing microphone: " + error.message);
        }
    };

    // Stop Voice Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current);
        }
        setIsRecording(false);
    };

    // Stop Camera
    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    };

    // Handle Face Login Request
    const handleFaceLogin = async () => {
        if (!image) {
            alert("Please capture your face first!");
            return false;
        }

        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch("/face-login/", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        return result.success; // Expecting { success: true/false }
    };

    // Handle Voice Login Request
    const handleVoiceLogin = async () => {
        if (!audioBlob) {
            alert("Please record your voice first!");
            return false;
        }

        const formData = new FormData();
        formData.append("audio", audioBlob);

        const response = await fetch("/voice-login/", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        return result.success; // Expecting { success: true/false }
    };

    // Handle Final Login (Both Face & Voice Required)
    const handleLogin = async () => {
        const faceSuccess = await handleFaceLogin();
        const voiceSuccess = await handleVoiceLogin();

        if (faceSuccess && voiceSuccess) {
            alert("Login Successful!");
            router.push("/dashboard"); // Redirect to dashboard
        } else {
            alert("Login Failed! Ensure both face and voice match.");
        }
    };

    useEffect(() => {
        // Start Video Stream
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        });

        return () => stopCamera(); // Stop camera when leaving page
    }, []);

    return (
        <div>
            <h2>Biometric Login (Face & Voice Required)</h2>

            {/* Face Capture Section */}
            <div>
                <video ref={videoRef} autoPlay></video>
                <button onClick={captureImage}>Capture Face</button>
            </div>

            {/* Voice Recording Section */}
            <div>
                <button onClick={startRecording} disabled={isRecording}>
                    {isRecording ? "Recording..." : "Start Voice Recording"}
                </button>
            </div>

            <button onClick={handleLogin}>Login</button>

            <p>
                Email and Password login?{" "}
                <span
                    onClick={() => { stopCamera(); router.push("/auth/login"); }}
                    className="switch-link"
                >
                    Switch to Normal Login
                </span>
            </p>
        </div>
    );
};

export default LoginBio;
