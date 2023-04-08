import { useState } from "react";
import * as styles from "./image-upload-form.module.scss";

function ImageUploadForm({ onSubmit }) {
    const [fileUpload, setFileUpload] = useState("Choose an image...");

    function handleFileOnChange(e) {
        setFileUpload(e.target.files[0].name);
    }

    return (
        <div>
            <form onSubmit={onSubmit} className={`${styles.form}`}>
                <div className="file is-boxed">
                    <label className="file-label">
                        <input
                            className="file-input"
                            type="file"
                            name="image"
                            id="imageField"
                            required="required"
                            accept="image/*"
                            onChange={handleFileOnChange}
                        />
                        <span className="file-cta">
                            <span className="file-label">{fileUpload}</span>
                        </span>
                    </label>
                </div>
                <div className="field">
                    <div className="control">
                        <input
                            type="submit"
                            value="Upload"
                            className="button is-link"
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

export default ImageUploadForm;
