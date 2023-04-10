import ImageUploadForm from "@/components/image-upload-form";
import Head from "next/head";
import { useCloudUpload } from "@/hooks/useCloudStorage";
import GalleryGrid from "@/components/gallery-grid";
import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Resizer from "react-image-file-resizer";

function Gallery() {
    async function handleImageUpload(e) {
        e.preventDefault();

        const img = document.getElementById("imageField").files[0];

        try {
            const resized = await new Promise((resolve) => {
                Resizer.imageFileResizer(
                    img,
                    600,
                    600,
                    'JPEG',
                    100,
                    0,
                    (uri) => {
                    resolve(uri);
                    },
                    'file',
                    200,
                    200
              );
            });
            
            await useCloudUpload(resized);

          } catch (error) {
            console.log('Error while resizing image:', error);
          }

        console.log("Finishing upload");
    }

    const webcamRef = useRef(null)
    const [image, setImage] = useState(null)
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    }, [webcamRef, setImage]);

    async function uploadScreenshot() { 
        if (image) {
            //convert the base64 image to a blob: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
            console.log(image)
            const byteCharacters = atob(image.split(",")[1])
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
            const byteArray = new Uint8Array(byteNumbers)
            const blobImage = new Blob([byteArray], {type: "image/jpeg"})
            blobImage && await useCloudUpload(blobImage)
        } 
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
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                        />
                        {image && <img src={image} />}
                        <div className="container">
                            <button onClick={capture} className="button">
                                Get Screenshot
                            </button>
                            <button
                                onClick={uploadScreenshot}
                                className="button"
                            >
                                Upload Screenshot to Gallery
                            </button>
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
