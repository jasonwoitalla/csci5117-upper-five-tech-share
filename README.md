# Image upload/manipulation and Storage

## Problem:

-   You need to build an app that allow users to upload their image

### Question that might arise

-   How do you allow user to upload their image
-   How do you manipulate image?
-   HOW do we store data?

## WE GOT ANSEWER

#### Architecture Overview

![Tech Share (1)](https://user-images.githubusercontent.com/65479968/230800447-d9de666f-94ec-40c1-b0ae-cd4c9645068c.png)

Just copy and paste our code for your own need for the project

## 1. Image Uploading

## 2. Image Resizing / Image manipulation

## 4. Using Cloud Storage

Intro: Cloud storage is the industry standard way of saving / downloading images and there are a lot of services our there. The good news is that interacting with their api is about the same for every service.
First step is to pick a service. For CSCI 5117 I would probably stick with one these two options:

-   Google Cloud Storage (Free 5gb, requires you to enter a credit card)
-   Backblaze B2 (Free 10gb, no credit card!)

We'll go through using Backblaze B2 since they give us more storage and don't require us to enter a credit card to get their 10gb for free.
There are a couple of operations and terms that we need to get familiar with before we begin.

-   Buckets: An independent file structure. Usually you have one bucket for one purpose. For a web app that has users upload a single image we only need one bucket to store those images. Buckets can have folders so each user can get their own folder.
-   Authorization: Our web app will authorize users, but when interacting with a cloud storage service we need to authenticate our web app. This is done through a series of IDs and API keys that we will generate and keep secret in our web app.

With those two major terms defined let's jump into our first operation.

### 1. Service Setup

First we have to setup our account. This is kind of a process and really boring so we'll move quickly.

1. Create an account at [backblaze.com](https://www.backblaze.com/)
2. We will need our master key to be able to interact with Backblaze through their CLI and through code. To get get your key ![Backblaze Master key creation](./images/backblaze_master_key.png)
   From here you will need to keep 2 things. First is the keyID it generates. Second is the masterKeyValue. Copy both of these and keep them save.
3. Download the Backblaze CLI:

    1. Windows: `wget https://github.com/Backblaze/B2_Command_Line_Tool/releases/latest/download/b2-windows.exe`
    2. Linux: `wget https://github.com/Backblaze/B2_Command_Line_Tool/releases/latest/download/b2-linux`
    3. Mac: `brew install b2-tools`

    Full info can be found here: [Get Backblaze CLI](https://www.backblaze.com/b2/docs/quick_command_line.html)

4. Use the shell script I wrote to create a bucket with browser upload permissions. If we were doing everything from a backend, this step would not be a lot simpler but since we are uploading through a browser we need to setup custom permissions on our bucket.

    1. First open the `create-bucket.sh` file so we can edit the things we need. First update the `b2` command to match your operating systems so either `b2-windows`, `b2-linux` or `b2-tools` for mac. This script must be run from the same directory as where you have the CLI downloaded. At the end of the script you'll see `<bucket-name>` and you should edit that to be the name you want the bucket.
    2. Run the script with `./create-bucket.sh` and if you're logged in, everything should work! In terminal it will paste your bucketId at the top. You MUST save this for later. So copy it and paste it with your other keys.

    That should do it for Backblaze setup! We're ready to move onto Codehooks backend so our frontend can get the api details it needs to upload images.

(**Note** Service setup for Google Cloud is very similar. You must create an account through their console and create a bucket. You then must get their CLI to set the CORS rules. The guide is here: [Google Cloud CORS Setup](https://cloud.google.com/storage/docs/using-cors#console))

### 2. Service Level Authentication

If you looked closely at the `create-bucket` script you'll notice we only gave access to a few commands. `b2_download_file_by_id`, `b2_download_file_by_name`, `b2_upload_file`, `b2_upload_part`. These are the only api endpoints Backblaze lets the browser perform. Therefore, all authentication and detail fetching needs to happen on Codehooks. We'll write a pretty standard endpoint for authorizing and getting our upload URL. First important note is that Node.js does NOT have the fetch api by default so we will need to install that with.

```
npm install node-fetch
```

Then at the top of our `index.js` in our Codehooks backend we must have this line:

```
import fetch from 'node-fetch'
```

Now we can do fetch requests just like we can on the frontend!

Let's write a function that will give our web app the needed Backblaze authentication details. This is an operation that happens every time we want to interact with our cloud storage service so let's put this in a function. Following the api documentation we can use this api to get auth details: [Backblaze B2 Auth Details](https://www.backblaze.com/b2/docs/b2_authorize_account.html).

First we must encode our account id and key then we can perform our fetch request:

```
let encoded = Buffer.from(ACCOUNT_ID + ":" + ACCOUNT_KEY).toString("base64");
const response = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: {
        Authorization: "Basic " + encoded,
    },
});
```

The result here will give us a JSON object that has all the information we need. Mainly what we need is `resData.authorizationToken` and `resData.apiUrl`. That is the URL we need to make API requests and the token we need to pass for those requests to succeed.

With our web app authorized and access to the needed information we can now actually use our service!

(**Google Cloud Setup** A similar process happens for google cloud. While you can setup your buckets to accept anonymous uploads, if you wish to have verified uploads you can recreate the steps above by following [API Authentication with Google Cloud Storage](https://cloud.google.com/docs/authentication/api-keys))

### 3. Getting Our Upload URL

Okay, now our backend is authorized to make API requests to Backblaze. There are several API requests that are of interest to us, they are:

-   [b2_get_upload_url](https://www.backblaze.com/b2/docs/b2_get_upload_url.html)
-   [b2_upload_file](https://www.backblaze.com/b2/docs/b2_upload_file.html)
-   [b2_download_file_by_id](https://www.backblaze.com/b2/docs/b2_download_file_by_id.html)

Those last 2 can be done in the browser so we will do that. The `b2_get_upload_url` request can not happen in the browser so we have to do it on the backend. Here is the fetch request for that:

```
authDetails = await getAuthDetails();
const response = await fetch(`${authDetails.apiUrl}//b2api/v2/b2_get_upload_url?buckedId=${BUCKET_ID}`, {
    method: "GET",
    headers: {
        Authorization: authDetails.authToken
    }
});
```

We will get a JSON object back that has a new `resData.authorizationToken` and the much needed `resData.uploadUrl`. Pass both of those values to the front-end so the browser can perform the upload for us!

### 4. Front-End Upload

To upload a file we can use our upload url and use this api call: [Uploading a File](https://www.backblaze.com/b2/docs/b2_upload_file.html)

There are a few required headers that we need to provide to this call for our upload to be successful.

-   Authorization: the new auth token from `b2_get_upload_url`
-   X-Bz-File-Name: what we want to name this file in our cloud storage
-   Content-Type: the mime type of the file, we can use `b2/auto` to get it automatically
-   Content-Length: the number of bytes in this file
-   X-Bz-Content-Sha1: A checksum hash so the server can make sure you file uploaded correctly and fully

We already have Authorization from our previous call, and Content-Type can be left as `b2/auto` to use the file's file extension. X-Bz-File-Name and Content-Length are easy to get from a blob object simply use `blob.name` and `blob.size`. The harder and more involved header is the X-Bz-Content-Sha1 for this we will use the CryptoJS package:

```
npm install crypto-js
```

To get the Sha1 hash a blob object we can use the following code:

```
import Hex from "crypto-js/enc-hex";
import SHA1 from "crypto-js/sha1";
import WordArray from "crypto-js/lib-typedarrays"

const reader = new FileReader();
reader.addEventListener("loadend", (e) => {
    const checksum = SHA1(WordArray.create(reader.result)).toString(Hex);
});
reader.readAsArrayBuffer(myBlobObject);
```

We know have all the pieces we need to upload a file!

```
const upload = await fetch(`${CODEHOOKS_API_URL}/get_upload_data`);
const uploadData = await upload.json();
const uploadUrl = uploadData.uploadUrl
const authorizationToken = uploadData.authorizationToken

fetch(uploadUrl, {
    method: "POST",
    headers: {
        "Authorization": authorizationToken,
        "Content-Type": "b2/auto",
        "Content-Length": myBlobObject.size,
        "X-Bz-File-Name": myBlobObject.name,
        "X-Bz-Content-Sha1": checksum,
    },
    body: myBlobObject
});
```

We'll want to look at the response object from this fetch request. It has a `resData.fileId` property that we can store in our database for download!

### 5. Downloading

Now that we have our file saved in Backblaze and we have the `fileId` of our uploaded file, it's very simple to download. One of the returned values from our `getAuthDetails` function is a `downloadUrl` property. We can use that URL to use the `b2_download_file_by_id` API call. Here is a very simple fetch request as an example:

```
fetch(`${CODEBLOCKS_API_URL}/get_donwload_url`)
    .then((res) => res.json())
    .then((data) => {
        fetch(`${data.downloadUrl}/b2api/v2/b2_download_file_by_id?fileId=${id}`, {
            method: "GET",
            headers: {
                Authorization: data.auth,
            },
        }).then((res) => res.json())
        .then((data) => {
            const blobData = await data.blob()
            return URL.createObjectURL(blob);
        })
    });
```

It's that simple! To explain the code a little more, we first get the download URL from codehooks. If we already have the ID of the file we don't need to get anything else, otherwise we can ask for it from the codehooks database. Then make a fetch request to the download file api, pass in the file id, and convert the binary result into a usable Javascript Blob object.

### 6. (Optional) Deleting

Deleting is very similar and can be done by following the [Backblze Delete FIle API](https://www.backblaze.com/b2/docs/b2_delete_file_version.html)

## Pros / Cons

### Pros / Cons: Base64

Pros: Light Weight / Easy to integrate into existing web applications
Cons: Inefficient, but for larger images it can be more efficient that making http request
Industry example: Google images

### Pros / Cons: Cloud

Pros: Faster and more efficient. Scalable and reliable.
Cons: Requires additional set up and maintenance.
Industry example:

### When to use

Base64:
Cloud:
