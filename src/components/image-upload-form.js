import * as styles from "./image-upload-form.module.scss";

function ImageUploadForm({ onSubmit }) {
    return (
        <div>
            <form onSubmit={onSubmit} className={styles.form}>
                <label>
                    Name of the image:
                    <input type="text" name="name" />
                </label>
                <label>
                    Image:
                    <input type="file" name="image" id="imageField" />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>
    );
}

export default ImageUploadForm;
