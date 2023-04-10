import { app } from "codehooks-js";
import { crudlify } from "codehooks-crudlify";
import { object, string } from "yup";
import { Datastore } from "codehooks-js";
import fetch from "node-fetch";

const B2_ACCOUNT_ID = process.env.B2_ACCOUNT_ID;
const B2_KEY = process.env.B2_KEY;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;

async function getAuthDetails() {
    console.log("Getting Backblaze auth details");

    const backblazeAuthUrl =
        "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
    let encoded = Buffer.from(B2_ACCOUNT_ID + ":" + B2_KEY).toString("base64");

    console.log("Fetching detials");
    const response = await fetch(backblazeAuthUrl, {
        method: "GET",
        headers: {
            Authorization: "Basic " + encoded,
        },
    });

    const data = await response.json();

    console.log("Returning details");
    console.log("Url: " + data.apiUrl);
    console.log("Auth: " + data.authorizationToken);

    return {
        apiUrl: data.apiUrl,
        authToken: data.authorizationToken,
        downloadUrl: data.downloadUrl,
    };
}

app.get("/upload-cloud-storage", async (req, res) => {
    let authDetails = await getAuthDetails();

    const uploadUrl = `${authDetails.apiUrl}/b2api/v2/b2_get_upload_url`;

    const bodyData = {
        bucketId: B2_BUCKET_ID,
    };

    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            Authorization: authDetails.authToken,
        },
        body: JSON.stringify(bodyData),
    });

    const data = await response.json();

    if (!data.uploadUrl || !data.authorizationToken) {
        res.status(500).send("Failed to get upload URL");
        return;
    }

    res.json({
        url: data.uploadUrl,
        auth: data.authorizationToken,
    });
});

app.get("/download-url-cloud-storage", async (req, res) => {
    let authDetails = await getAuthDetails();

    res.json({
        downloadUrl: authDetails.downloadUrl,
        auth: authDetails.authToken,
    });
});

app.post("/upload-cloud-storage-id", async (req, res) => {
    const conn = await Datastore.open();
    const doc = await conn.insertOne("images", req.body);
    res.status(201).json(doc);
});

app.get("/get-all-images", async (req, res) => {
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
