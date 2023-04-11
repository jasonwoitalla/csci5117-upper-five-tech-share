import { useState } from "react";
import Resizer from "react-image-file-resizer";

function processPhoto() {
    const [originalImage, setOriginalImage] = useState(null);
    const [resizedImage, setResizedImage] = useState(null);

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        Resizer.imageFileResizer(
            file, //file name
            300, //max pixel width
            300, //max pixel height
            "JPEG", //compression format
            100, //quality
            0, //rotation
            (resizedFile) => {
                //Callback function
                setOriginalImage(URL.createObjectURL(file));
                setResizedImage(URL.createObjectURL(resizedFile));
            },
            "file" //output type
        );
    };

    return (
        <div className="section">
            <div className="container">
                <input
                    
                    type="file"
                    onChange={handleImageChange}
                />{" "}
                <br />
                {originalImage && <img src={originalImage} alt="Original" />}
                {resizedImage && <img src={resizedImage} alt="Resized" />}
            </div>
        </div>
    );
}

export default processPhoto;
