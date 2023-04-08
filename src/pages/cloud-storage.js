import ImageUploadForm from "@/components/image-upload-form";
import { useCloudUpload } from "@/hooks/useCloudStorage";
import { useEffect } from "react";

function cloudStorage() {
    async function uploadImage(e) {
        e.preventDefault();

        const image = document.getElementById("imageField").files[0];
        let uploadRes = await useCloudUpload(image);

        console.log("Finishing upload");
        console.log(uploadRes);
    }

    return (
        <>
            <h1>Example of Cloud Storage</h1>
            <p>
                First we have a form where the user can upload an image. Since
                we're using FaaS and our backend can not support files being
                sent to it, we will need to handle everything on the frontend.
                The first step to using a cloud storage solution is to validate
                that the client can actually upload images. This is something
                that happens at the start of every session. This authorization
                process has sensitive information so it will be handled on our
                backend.
            </p>
            <h2>File Upload Form</h2>
            <ImageUploadForm onSubmit={uploadImage} />
        </>
    );
}

export default cloudStorage;
