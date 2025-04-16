import { Phone } from "lucide-react";
import "./WaitingScreen.css";

const WaitingScreen = () => {
    return (
        <div className="waiting-screen">
            <div className="phone-icon-container">
                <div className="phone-icon">
                    <Phone size={40} className="icon" />
                </div>
                <div className="pulse-effect"></div>
            </div>

            <h2 className="waiting-title">Waiting for connection...</h2>
            <p className="waiting-message">
                Your call is being established. Please wait while we connect you.
            </p>
        </div>
    );
};

export default WaitingScreen;