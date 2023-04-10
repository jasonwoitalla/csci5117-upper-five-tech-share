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
    async function uploadScreenshot() { 
        image && await useCloudUpload(image)
        console.log("Finishing upload") 
    }

    return ( 
        <>
            <div className="section">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
                {image && ( <img src={image} /> )}
                <div className="container">
                    <button onClick={capture} className="button">Get Screenshot</button>
                    <button onClick={uploadScreenshot} className="button">Upload Screenshot to Gallery</button>
                </div>
            </div>
        </>
    )
}

export default takePicture;
