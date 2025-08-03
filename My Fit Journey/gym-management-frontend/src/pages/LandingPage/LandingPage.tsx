import React from "react";
import { useNavigate } from "react-router-dom";
import ParticlesBackground from "../../components/common/ParticlesBackground";
import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/login");
  };

  return (
    <div className="landing-page">
      <ParticlesBackground /> {/* Neon particles */}
      <div className="landing-content">
        <h1 className="landing-title">My FIT JOURNEY</h1>
        <p className="landing-subtitle">
          Your gym experience starts here. Manage members, trainers, and plans seamlessly.
        </p>
        <button className="landing-button" onClick={handleStart}>
          Start My Journey
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
