import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const RegisterBio = () => {
    const [image, setImage] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunks = useRef([]);
    const stopTimeoutRef = useRef(null);
    const streamRef = useRef(null); // Store camera stream
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

    // Start Voice Recording (Auto-stop after 30 sec)
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

    // Handle Face Registration
    const handleFaceRegister = async () => {
        if (!image) {
            alert("Please capture a face image!");
            return;
        }

        const formData = new FormData();
        formData.append("image", image);

        const response = await fetch("/api/auth/upload-face/", { 
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        alert(result.message);
    };

    // Handle Voice Registration
    const handleVoiceRegister = async () => {
        if (!audioBlob) {
            alert("Please record your voice!");
            return;
        }

        const formData = new FormData();
        formData.append("audio", audioBlob);

        const response = await fetch("/api/auth/upload-voice/", { 
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        alert(result.message);
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
            <h2>Biometric Registration</h2>
            
            {/* Face Registration */}
            <video ref={videoRef} autoPlay></video>
            <button onClick={captureImage}>Capture Face</button>
            <button onClick={handleFaceRegister}>Register Face</button>

            {/* Voice Registration */}
            <div>
                <button onClick={startRecording}>Start Voice Recording (Auto Stops in 30s)</button>
                {isRecording && <div className="recording-animation"></div>}
                <button onClick={handleVoiceRegister}>Register Voice</button>
            </div>

            <p>
                Register Using Email?{" "}
                <span
                    onClick={() => { stopCamera(); router.push("/auth/register"); }}
                    style={{ color: "blue", cursor: "pointer"}}
                >
                    Switch to Normal Registration
                </span>
            </p>
        </div>
    );
};

export default RegisterBio;
