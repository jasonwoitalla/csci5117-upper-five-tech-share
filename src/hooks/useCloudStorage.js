/*
 * CLOUD STORAGE TABLE OF CONTENTS
 *
 * Things the front-end can do: uplaod, download, delete
 * Things the front-end can't do: authorize accounts, get upload urls, get download urls
 *
 * Chapter 0. The setup
 *
 * 0.1. Create a B2 account
 * 0.2. Create a bucket
 * 0.3. Setup the CORS rules for the bucket
 * 0.4. Create an application key
 *
 * Chapter 1. The back-end
 *
 * 1.1. Authorize the account
 *  - This is done by making a request to the B2 API
 *  - We must pass in our application key and application id encoded in Base64
 *
 * 1.2. Get the upload URL
 *  - This is done by making a request to the B2 API
 *  - We must pass in our authorization token and the bucket id
 *
 * Chapter 2. The front-end
 *
 * 2.1. Upload the file
 *  - This is done by making a request to the upload URL
 *  - B2 needs some information about our file to process the upload
 *  - Information needed: file name, file size, file type, file checksum
 *  - Returns an ID that we can use for download
 *
 * 2.2. Download the file
 *  - This is done by making a request to the download URL
 *  - We can use the file ID we got to download it
 */

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

export async function useCloudDownloadLatest() {
    // 1. Get the download url
    const downloadRes = await fetch(`${CODEHOOKS_URL}/get_download_url`, {
        method: "GET",
        headers: {
            "x-api-key": CODEHOOKS_KEY,
        },
    });
    const downloadData = await downloadRes.json();

    // 2. Get the file ID and download URL from the server
    const res = await fetch(`${CODEHOOKS_URL}/get_all_images`, {
        method: "GET",
        headers: {
            "x-api-key": CODEHOOKS_KEY,
        },
    });
    const resData = await res.json();
    let latestId = resData[resData.length - 1].id;

    // 2. Build our download urls
    const downloadUrl = `${downloadData.downloadUrl}/b2api/v2/b2_download_file_by_id?fileId=${latestId}`;

    // 3. Fetch request for each download url
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const src = URL.createObjectURL(blob);

    return src;
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
