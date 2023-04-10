import ImageUploadForm from "@/components/image-upload-form";
import Head from "next/head";
import { useCloudUpload } from "@/hooks/useCloudStorage";
import GalleryGrid from "@/components/gallery-grid";
import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";

function Gallery() {
    async function handleImageUpload(e) {
        e.preventDefault();

        const img = document.getElementById("imageField").files[0];
        await useCloudUpload(img);

        console.log("Finishing upload");
    }
    
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
            <Head>
                <title>Gallery</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
            </Head>
            <main>
                <div className="section">
                    <div className="container">
                        <h1 className="title">Cloud Storage Gallery</h1>
                        <p>
                            Welcome to the cloud storage gallery web
                            application! Powered by next.js, coodehooks, and
                            Backblaze S2.
                        </p>
                        <ImageUploadForm onSubmit={handleImageUpload} />
                        <h2 className="title is-4 mt-4">Screenshot Widget</h2>
                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
                        {image && ( <img src={image} /> )}
                        <div className="container">
                            <button onClick={capture} className="button">Get Screenshot</button>
                            <button onClick={uploadScreenshot} className="button">Upload Screenshot to Gallery</button>
                        </div>
                        <h2 className="title is-4 mt-4">Gallery</h2>
                        <GalleryGrid />
                    </div>
                </div>
            </main>
        </>
    );
}

export default Gallery;
