import ImageUploadForm from "@/components/image-upload-form";
import Head from "next/head";
import { useCloudUpload } from "@/hooks/useCloudStorage";
import GalleryGrid from "@/components/gallery-grid";
import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import Resizer from "react-image-file-resizer";
import { useRouter } from "next/router";
import Link from "next/link";

function Gallery() {
    // Webcam Stuff
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
    }, [webcamRef, setImage]);

    // States
    const [refresh, setRefresh] = useState(false);

    // Router Stuff
    const router = useRouter();
    const { page } = router.query;
    const imagePerPage = 24;

    async function handleImageUpload(e) {
        e.preventDefault();

        const img = document.getElementById("imageField").files[0];

        try {
            const resized = await new Promise((resolve) => {
                Resizer.imageFileResizer(
                    img,
                    600,
                    600,
                    "JPEG",
                    100,
                    0,
                    (uri) => {
                        resolve(uri);
                    },
                    "file",
                    200,
                    200
                );
            });

            await useCloudUpload(resized);
            setRefresh(!refresh);
        } catch (error) {
            console.log("Error while resizing image:", error);
        }

        console.log("Finishing upload");
        document.getElementById("imageField").value = "";
    }

    async function uploadScreenshot() {
        if (image) {
            //convert the base64 image to a blob: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
            console.log(image);
            const byteCharacters = atob(image.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++)
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            const byteArray = new Uint8Array(byteNumbers);
            const blobImage = new Blob([byteArray], { type: "image/jpeg" });
            blobImage && (await useCloudUpload(blobImage));
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
                        {<img src={image} />}
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
                        <GalleryGrid
                            refresh={refresh}
                            page={page}
                            displayNum={imagePerPage}
                        />
                    </div>
                    <nav
                        className="pagination is-large is-centered mt-6"
                        role="navigation"
                        aria-label="pagination"
                    >
                        <Link
                            href={`/gallery?page=${parseInt(page) - 1}`}
                            className="pagination-previous"
                        >
                            Previous
                        </Link>
                        <Link
                            href={`/gallery?page=${parseInt(page) + 1}`}
                            className="pagination-next"
                        >
                            Next page
                        </Link>
                        <ul className="pagination-list">
                            <li
                                style={{
                                    display: page === "1" ? "none" : "",
                                }}
                            >
                                <Link
                                    href={`/gallery?page=1`}
                                    className="pagination-link"
                                    aria-label="Goto page 1"
                                >
                                    1
                                </Link>
                            </li>
                            <li
                                style={{
                                    display: page === "1" ? "none" : "",
                                }}
                            >
                                <span className="pagination-ellipsis">
                                    &hellip;
                                </span>
                            </li>
                            <li
                                style={{
                                    display:
                                        page === "1" || page === "2"
                                            ? "none"
                                            : "",
                                }}
                            >
                                <Link
                                    href={`/gallery?page=${parseInt(page) - 1}`}
                                    className="pagination-link"
                                    aria-label={`Goto page ${
                                        parseInt(page) - 1
                                    }`}
                                >
                                    {parseInt(page) - 1}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/gallery?page=${parseInt(page)}`}
                                    className="pagination-link is-current"
                                    aria-label={`Goto page ${parseInt(page)}`}
                                >
                                    {parseInt(page)}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/gallery?page=${parseInt(page) + 1}`}
                                    className="pagination-link"
                                    aria-label={`Goto page ${
                                        parseInt(page) + 1
                                    }`}
                                >
                                    {parseInt(page) + 1}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={`/gallery?page=${parseInt(page) + 2}`}
                                    className="pagination-link"
                                    aria-label={`Goto page ${
                                        parseInt(page) + 2
                                    }`}
                                >
                                    {parseInt(page) + 2}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </main>
        </>
    );
}

export default Gallery;
