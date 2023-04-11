import Link from "next/link";

function Header() {
    return (
        <header>
            <nav
                className="navbar is-success"
                role="navigation"
                aria-label="main navigation"
            >
                <div className="navbar-brand">
                    <a
                        role="button"
                        className="navbar-burger"
                        aria-label="menu"
                        aria-expanded="false"
                        data-target="navbarBasicExample"
                    >
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>

                <div id="navbarBasicExample" className="navbar-menu">
                    <div className="navbar-start">
                        <Link href="/gallery" className="navbar-item">
                            File Upload / Webcam
                        </Link>
                        <Link href="/process-photo" className="navbar-item">
                            Resize Picture
                        </Link>
                        <Link href="/base64-encode" className="navbar-item">
                            Base64 Upload
                        </Link>
                        <Link href="/cloud-storage" className="navbar-item">
                            Cloud Storage Upload
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
