import React from "react";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";

const ParticlesBackground: React.FC = () => {
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: { color: "#050505" },
        fpsLimit: 60,
        particles: {
          number: { value: 40, density: { enable: true, area: 800 } }, // Slightly increased for richness
          color: { value: ["#00ffcc", "#00ff99", "#00ffaa"] }, // Neon green-cyan palette
          shape: { type: "circle" },
          opacity: {
            value: 0.7,
            anim: { enable: true, speed: 0.5, opacity_min: 0.3 }, // Soft glowing pulse effect
          },
          size: { value: { min: 1, max: 4 }, anim: { enable: true, speed: 2, size_min: 0.8 } },
          move: { enable: true, speed: 1.8, outModes: { default: "bounce" } },
          links: { enable: true, distance: 140, color: "#00ffaa", opacity: 0.3, width: 1.2 }, // Changed to neon green link lines
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 130 },
            push: { quantity: 4 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
