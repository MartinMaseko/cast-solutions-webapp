import "./caststyle.css";
import logo from "./assets/$.Luciano wht.png"; 

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <span className="footer-text">Developed by </span>
        <img src={logo} alt="Developer Logo" className="footer-logo" />
        <span className="footer-text">
          {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}