var crypto = require("crypto");

export function useCloudAuth() {
    fetch(`${process.env.API_URL}/auth-cloud-storage`, {
        method: "GET",
        headers: {
            "x-api-key": process.env.API_KEY,
        },
    })
        .then((res) => {
            return res.json();
        })
        .catch((err) => {
            console.log(err);
        });
}

export function useCloudUpload(file) {
    // 1. Fetch the upload URL
    fetch(`${process.env.API_URL}/upload-cloud-storage`, {
        method: "GET",
        headers: {
            "x-api-key": process.env.API_KEY,
        },
    }).then((res) => {
        // 2. Create file details
        let fileName = file.name;
        console.log("File: " + fileName);
        let mimeType = file.type;

        let sha1 = crypto.createHash("sha1").update(file).digest("hex");
        console.log("SHA1: " + sha1);

        // 3. Use the upload URL to upload the file
        fetch(res.url, {
            method: "POST",
            headers: {
                Authorization: res.auth,
                "Content-Type": mimeType,
                "X-Bz-File-Name": fileName,
                "X-Bz-Content-Sha1": sha1,
            },
            body: file,
        }).then((res) => {
            console.log(res.status);
            console.log(JSON.stringify(res.json()));
            return res.json();
        });
    });
}

export function useCloudDownload(url, auth, file) {}

export function useCloudDelete(url, auth, file) {}
