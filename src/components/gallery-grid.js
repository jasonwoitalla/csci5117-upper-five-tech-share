import { useState, useEffect } from "react";
import { useCloudDownloads } from "@/hooks/useCloudStorage";
import Image from "next/image";
import useSWR from "swr";

const CODEHOOKS_URL = process.env.NEXT_PUBLIC_API_URL;
const CODEHOOKS_KEY = process.env.NEXT_PUBLIC_API_KEY;

function GalleryGrid({ refresh, page = 1, displayNum = 100 }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadUrls, setDownloadUrls] = useState(null);
    const [fileData, setFileData] = useState(null);

    const fetcher = async (urls) => {
        const dataPromises = urls.map((url) => fetch(url));
        const data = await Promise.all(dataPromises);

        const blobPromises = data.map((blob) => blob.blob());
        const blobs = await Promise.all(blobPromises);

        const srcPromises = blobs.map((blob) => URL.createObjectURL(blob));
        const srcs = await Promise.all(srcPromises);

        return srcs;
    };
    const { data } = useSWR(downloadUrls, fetcher);

    async function fetchImages() {
        setLoading(true);
        setImages([]);

        // 1. Fetch the download url from the backend
        const response = await fetch(`${CODEHOOKS_URL}/get_download_url`, {
            method: "GET",
            headers: {
                "x-api-key": CODEHOOKS_KEY,
            },
        });
        const downloadData = await response.json();

        // 2. Fetch the image details from the database
        console.log(`${CODEHOOKS_URL}/get_all_images`);
        fetch(`${CODEHOOKS_URL}/get_all_images`, {
            method: "GET",
            headers: {
                "x-api-key": CODEHOOKS_KEY,
            },
        })
            .then((res) => res.json())
            .then(async (files) => {
                console.log("Finished downloading everything");
                setFileData(files);

                const urlArray = [];
                files.forEach((file) => {
                    urlArray.push(
                        `${downloadData.downloadUrl}/b2api/v2/b2_download_file_by_id?fileId=${file.id}`
                    );
                });
                setDownloadUrls(urlArray);
            });
    }

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        fetchImages();
    }, [refresh]);

    useEffect(() => {
        if (data) {
            let myImages = [];
            data.forEach((srcFile, index) => {
                myImages.push({
                    imgName: fileData[index].name,
                    id: fileData[index]._id,
                    src: srcFile,
                    key: fileData[index]._id,
                });

                setLoading(false);
                setImages(myImages);
            });
        }
    }, [data]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (images.length > 0) {
        let imageChunks = [];
        for (let i = 0; i < images.length; i += 3) {
            imageChunks.push({ images: images.slice(i, i + 3), key: i });
        }

        return (
            <div className="columns is-multiline mt-4">
                {imageChunks.map((chunk) => {
                    return chunk.images.map((image) => {
                        return (
                            <div className="column is-one-third">
                                <div className="card">
                                    <div className="card-image">
                                        <figure>
                                            <Image
                                                src={image.src}
                                                alt={image.imgName}
                                                width={640}
                                                height={480}
                                            />
                                        </figure>
                                    </div>
                                    <div className="card-content">
                                        <div className="media">
                                            <div className="media-content">
                                                <p className="title is-4">
                                                    {image.imgName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    });
                })}
            </div>
        );
    } else {
        return <div>No images to display</div>;
    }
}

export default GalleryGrid;
