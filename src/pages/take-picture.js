import { useCloudUpload } from "@/hooks/useCloudStorage";
import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";

function takePicture() {
    const webcamRef = useRef(null)
    const [image, setImage] = useState(null)
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot()
        setImage(imageSrc)
    }, [webcamRef, setImage])
    async function uploadScreenshot() { await useCloudUpload(image) }

    return 
    ( 
        <>
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
            <button onClick={capture}>Get Screenshot</button>
            {image && ( <img src={image} /> )}
            <button onClick={uploadScreenshot}>Upload Screenshot to Gallery</button>
        </>
    )
}

export default takePicture;
