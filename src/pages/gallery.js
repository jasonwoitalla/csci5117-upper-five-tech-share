import ImageUploadForm from "@/components/image-upload-form";
import Head from "next/head";
import { useCloudUpload } from "@/hooks/useCloudStorage";
import GalleryGrid from "@/components/gallery-grid";

function Gallery() {
    async function handleImageUpload(e) {
        e.preventDefault();

        const image = document.getElementById("imageField").files[0];
        await useCloudUpload(image);

        console.log("Finishing upload");
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
                        <h2 className="title is-4 mt-4">Gallery</h2>
                        <GalleryGrid />
                    </div>
                </div>
            </main>
        </>
    );
}

export default Gallery;
