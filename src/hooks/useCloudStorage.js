import Hex from "crypto-js/enc-hex";
import SHA1 from "crypto-js/sha1";
import WordArray from "crypto-js/lib-typedarrays";
import useSWR from "swr";

const CODEHOOKS_URL = process.env.NEXT_PUBLIC_API_URL;
const CODEHOOKS_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function useCloudUpload(file) {
    // 1. Fetch the upload URL
    const response = await fetch(`${CODEHOOKS_URL}/get_upload_url`, {
        method: "GET",
        headers: {
            "x-api-key": CODEHOOKS_KEY,
        },
    });
    const data = await response.json();

    // 2. Create file details
    const fileName = file.name;
    const mimeType = file.type;
    const fileSize = file.size;

    const reader = new FileReader();

    reader.addEventListener("loadend", async (e) => {
        const checksum = SHA1(WordArray.create(reader.result)).toString(Hex);

        // 3. Use the upload URL to upload the file
        const uploadResponse = await fetch(data.uploadUrl, {
            method: "POST",
            headers: {
                Authorization: data.uploadAuth,
                "Content-Type": mimeType,
                "Content-Length": fileSize,
                "X-Bz-File-Name": fileName,
                "X-Bz-Content-Sha1": checksum,
            },
            body: file,
        });
        const uploadData = await uploadResponse.json();

        // 4. Image uploaded, store the image details in the database
        fetch(`${CODEHOOKS_URL}/store_file_id`, {
            method: "POST",
            headers: {
                "x-api-key": CODEHOOKS_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: uploadData.fileName,
                id: uploadData.fileId,
            }),
        });
    });

    reader.readAsArrayBuffer(file);
}

export async function useCloudDownloads(downloadUrls) {
    const dataPromises = downloadUrls.map((url) => fetch(url));
    const data = await Promise.all(dataPromises);

    const blobPromises = data.map((blob) => blob.blob());
    const blobs = await Promise.all(blobPromises);

    const urlPromises = blobs.map((blob) => URL.createObjectURL(blob));
    const urls = await Promise.all(urlPromises);

    return urls;
}
