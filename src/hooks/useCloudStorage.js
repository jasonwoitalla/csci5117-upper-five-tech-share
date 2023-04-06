import Hex from "crypto-js/enc-hex";
import SHA1 from "crypto-js/sha1";
import WordArray from "crypto-js/lib-typedarrays";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function useCloudUpload(file) {
    // 1. Fetch the upload URL
    fetch(`${API_URL}/upload-cloud-storage`, {
        method: "GET",
        headers: {
            "x-api-key": API_KEY,
        },
    }).then(async (res) => {
        const data = await res.json();
        //console.log(JSON.stringify(data));

        // 2. Create file details
        const fileName = file.name;
        //console.log("File: " + fileName);
        const mimeType = file.type;
        const fileSize = file.size;

        const reader = new FileReader();
        reader.addEventListener("loadend", (e) => {
            const checksum = SHA1(WordArray.create(reader.result)).toString(
                Hex
            );
            //console.log("SHA1: " + checksum);

            // 3. Use the upload URL to upload the file
            fetch(data.url, {
                method: "POST",
                headers: {
                    Authorization: data.auth,
                    "Content-Type": mimeType,
                    "Content-Length": fileSize,
                    "X-Bz-File-Name": fileName,
                    "X-Bz-Content-Sha1": checksum,
                },
                body: file,
            }).then(async (res) => {
                //console.log("Finished the upload with status: " + res.status);

                const resData = await res.json();
                //console.log("Upload response data: ");
                //console.log(JSON.stringify(resData));

                // 4. Image uploaded, store the image details in the database
                fetch(`${API_URL}/upload-cloud-storage-id`, {
                    method: "POST",
                    headers: {
                        "x-api-key": API_KEY,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: resData.fileName,
                        id: resData.fileId,
                    }),
                });
            });
        });
        reader.readAsArrayBuffer(file);
    });
}

export async function useCloudDownload(id) {
    // 1. Fetch the download url from the backend
    const res = await fetch(`${API_URL}/download-url-cloud-storage`, {
        method: "GET",
        headers: {
            "x-api-key": API_KEY,
        },
    });

    // 2. Download the image
    const resData = await res.json();
    const data = await fetch(
        `${resData.downloadUrl}/b2api/v2/b2_download_file_by_id?fileId=${id}`,
        {
            method: "GET",
            headers: {
                Authorization: resData.auth,
            },
        }
    );

    // 3. Convert the image to a blob
    const blob = await data.blob();
    // console.log("Blob: " + blob);
    // console.log("Blob type: " + blob.type);
    // console.log("Object: " + URL.createObjectURL(blob));
    return URL.createObjectURL(blob);
}

export function useCloudDelete(url, auth, file) {}
