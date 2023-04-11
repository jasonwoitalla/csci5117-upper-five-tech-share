import { app } from "codehooks-js";
import { crudlify } from "codehooks-crudlify";
import { object, string } from "yup";
import { Datastore } from "codehooks-js";
import fetch from "node-fetch";

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;

async function getAuthDetails() {
    console.log("Getting Backblaze auth details");

    // 1. Encoded our account ID and key, as per the Backblaze docs
    let encoded = Buffer.from(B2_KEY_ID + ":" + B2_APPLICATION_KEY).toString(
        "base64"
    );

    // 2. Make the fetch request to get our system level auth details
    const response = await fetch(
        "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
        {
            method: "GET",
            headers: {
                Authorization: "Basic " + encoded,
            },
        }
    );
    const data = await response.json();
    console.log("Returning details");
    console.log("Url: " + data.apiUrl);
    console.log("Auth: " + data.authorizationToken);

    // 3. Return the apiUrl, authToken, and the downloadUrl to the user
    return {
        apiUrl: data.apiUrl,
        authToken: data.authorizationToken,
        downloadUrl: data.downloadUrl,
    };
}

app.get("/get_upload_url", async (req, res) => {
    // 1. Get the auth details
    let authDetails = await getAuthDetails();

    // 2. Make the fetch request to get the upload URL
    const response = await fetch(
        `${authDetails.apiUrl}/b2api/v2/b2_get_upload_url?bucketId=${B2_BUCKET_ID}`,
        {
            method: "GET",
            headers: {
                Authorization: authDetails.authToken,
            },
        }
    );
    const data = await response.json();
    // Optional, error checking
    if (!data.uploadUrl || !data.authorizationToken) {
        res.status(500).send("Failed to get upload URL");
        return;
    }

    res.json({
        uploadUrl: data.uploadUrl,
        uploadAuth: data.authorizationToken,
    });
});

app.get("/get_download_url", async (req, res) => {
    let authDetails = await getAuthDetails();

    res.json({
        downloadUrl: authDetails.downloadUrl,
        downloadAuth: authDetails.authToken,
    });
});

app.post("/store_file_id", async (req, res) => {
    const conn = await Datastore.open();
    const doc = await conn.insertOne("images", req.body);
    res.status(201).json(doc);
});

app.get("/get_all_images", async (req, res) => {
    const conn = await Datastore.open();
    conn.getMany("images").json(res);
});

const imageYup = object({
    // json data validation
    name: string().required(),
    content: string().required(),
});

crudlify(app, { image: imageYup });

export default app.init();
