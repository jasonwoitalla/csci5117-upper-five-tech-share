import Header from "./Header";
import * as styles from "./Layout.module.scss";

function Layout({ children }) {
    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.contentWrap}>
                    <Header />
                    <main>{children}</main>
                </div>
            </div>
        </>
    );
}

export default Layout;
