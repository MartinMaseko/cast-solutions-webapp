import "./caststyle.css";
import Logo from "./assets/logo.png"

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <img src={Logo} alt="Cast Solutions Services Logo" className="footer-logo" />
        <span className="footer-text">Developed by @ <a className="footer-link" href="https://www.martinmasekodev.co.za/" target="_blank" rel="noopener noreferrer">Martin Maseko</a></span>
      </div>
    </footer>
  );
}