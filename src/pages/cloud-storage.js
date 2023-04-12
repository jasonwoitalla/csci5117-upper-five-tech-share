import ImageUploadForm from "@/components/image-upload-form";
import {
    useCloudUpload,
    useCloudDownloadLatest,
} from "@/hooks/useCloudStorage";
import Image from "next/image";
import { useState, useEffect } from "react";

function cloudStorage() {
    const [uploaded, setUploaded] = useState(false);
    const [image, setImage] = useState(<span>Loading...</span>);

    async function uploadImage(e) {
        e.preventDefault();

        const image = document.getElementById("imageField").files[0];
        let uploadRes = await useCloudUpload(image);
        setUploaded(!uploaded);
    }

    async function downloadImage() {
        const src = await useCloudDownloadLatest();
        setImage(<Image src={src} width={500} height={500} />);
    }

    useEffect(() => {
        downloadImage();
    }, []);

    useEffect(() => {
        downloadImage();
    }, [uploaded]);

    return (
        <div className="section">
            <div className="container">
                <h1>Example of Cloud Storage</h1>
                <p>
                    First we have a form where the user can upload an image.
                    Since we're using FaaS and our backend can not support files
                    being sent to it, we will need to handle everything on the
                    frontend. The first step to using a cloud storage solution
                    is to validate that the client can actually upload images.
                    This is something that happens at the start of every
                    session. This authorization process has sensitive
                    information so it will be handled on our backend.
                </p>
                <h2>File Upload Form</h2>
                <ImageUploadForm onSubmit={uploadImage} reset={uploaded} />
                <h2 className="title is-3 mt-4">Last Uploaded Image</h2>
                {image}
            </div>
        </div>
    );
}

export default cloudStorage;
