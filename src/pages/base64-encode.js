import { useEffect, useState, useRef } from "react";
import ImageUploadForm from "@/components/image-upload-form";
import styles from "@/styles/Home.module.css"

function base64Encode() {

    const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL;
    const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
    const dataFetchedRef = useRef(false);
    const buttonClicked = useRef(false);
    const[ dataUrl, setDataUrl] = useState("");
    const[ content, setContent] = useState("");
    const [id, setId] = useState("")
    const[ imageName, setImageName] = useState("");

    useEffect(()=>{
        if(id !== ""){
            console.log("making GET request from DB");
            console.log(API_ENDPOINT+`/image/${id}`);
            fetch(API_ENDPOINT+`/image/${id}`, {
                headers: {
                    'x-apikey': API_KEY,
                    'Content-Type': 'application/json', 
                },
            }).then(response => response.json())
            .then(json =>{
                console.log(json);
                setContent(json.content);
            });
            dataFetchedRef.current = true;
        }
    },[id]);

    useEffect(()=>{
        if(buttonClicked.current){
            console.log("making POST request from DB");
            console.log(API_ENDPOINT+`/image`);
            fetch(API_ENDPOINT+`/image`, {
                method:"POST",
                headers: {
                    'x-apikey': API_KEY,
                    'Content-Type': 'application/json', 
                },
                body: JSON.stringify({
                    name: imageName,
                    content: dataUrl
                })
            }).then(response => response.json())
            .then(json =>{
                console.log(json);
                setId(json._id);
                buttonClicked.current = false;
            });
        }
    },[dataUrl]);
    
    function process_and_upload(e){
        e.preventDefault();
     
        const fileInput = document.getElementById('imageField');
        const upload_imaged = fileInput.files[0];
        let reader = new FileReader();
        reader.onloadend = function() {
            setDataUrl(reader.result);
            buttonClicked.current = true;
        }
        reader.readAsDataURL(upload_imaged);
    }

    return <>
    <h1 className={`${styles.heading} ${styles.margins}`}>Uploading a base64Encoded Image</h1>
    <div className={`container ${styles.margins}`}>
        <div className="notification is-primary">
            <p>Enter name of image:</p>
            <input type="text" id="file-name" required onChange={(e)=> setImageName(e.target.value)}></input>
            <p>Select a file to upload:</p>
            <ImageUploadForm onSubmit={process_and_upload}></ImageUploadForm>
            {dataFetchedRef.current && <>
                <p>Image from the database</p>
                <img src={content} alt="Base64 uploaded" width="500"/>
            </>}
        </div>
    </div>
    </>;
}

export default base64Encode;
