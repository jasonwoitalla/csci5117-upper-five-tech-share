import { useState, useEffect } from "react";
import { useCloudDownload } from "@/hooks/useCloudStorage";
import Image from "next/image";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

function GalleryGrid() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchImages() {
        const res = await fetch(`${apiUrl}/get-all-images`, {
            method: "GET",
            headers: {
                "x-api-key": apiKey,
            },
        });
        const data = await res.json();
        console.log("Images: " + JSON.stringify(data));

        let images = [];
        for (let i = 0; i < data.length; i++) {
            const src = await useCloudDownload(data[i].id);
            images.push({
                imgName: data[i].name,
                id: data[i]._id,
                src: src,
                key: data[i]._id,
            });
        }

        console.log("Processed Images: " + JSON.stringify(images));

        setImages(images);
        setLoading(false);
    }

    useEffect(() => {
        fetchImages();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (images.length > 0) {
        let imageChunks = [];
        for (let i = 0; i < images.length; i += 3) {
            imageChunks.push(images.slice(i, i + 3));
        }

        return (
            <div className="columns is-multiline mt-4">
                {imageChunks.map((chunk) => {
                    return chunk.map((image) => {
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
