import { app } from "codehooks-js";
import {crudlify} from 'codehooks-crudlify'
import { object, string } from 'yup';

async function getAuthDetails() {
    console.log("Getting Backblaze auth details");

    const backblazeAuthUrl =
        "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
    let encoded = Buffer.from(
        process.env.B2_ACCOUNT_ID + ":" + process.env.B2_KEY
    ).toString("base64");

    const response = await fetch(backblazeAuthUrl, {
        method: "GET",
        headers: {
            Authorization: "Basic " + encoded,
        },
    });

    const data = await response.json();

    return {
        apiUrl: data.apiUrl,
        authToken: data.authorizationToken,
    };
}

app.get("/auth-cloud-storage", async (req, res) => {});

app.get("/upload-cloud-storage", async (req, res) => {
    authDetails = await getAuthDetails();

    const uploadUrl = `${authDetails.apiUrl}/b2api/v2/b2_get_upload_url`;

    const response = await fetch(uploadUrl, {
        method: "GET",
        headers: {
            Authorization: authDetails.authToken,
        },
        body: {
            bucketId: process.env.B2_BUCKET_ID,
        },
    });

    const data = await response.json();

    res.json({
        url: data.uploadUrl,
        auth: data.authorizationToken,
    });
});

const imageYup = object({ // json data validation
    name: string().required(),
    content: string().required(),
})

crudlify(app, {image: imageYup})
export default app.init();
