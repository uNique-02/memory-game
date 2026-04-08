import React, { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";
import useCharactersStore from "../stores/useCharacterStore";

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function ScoreBar({ label, value, color = "#00f5ff" }) {
  return (
    <div style={{ textAlign: "center", minWidth: 80 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#7a8fa6",
          fontFamily: "'Rajdhani', sans-serif",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color,
          fontFamily: "'Orbitron', sans-serif",
          lineHeight: 1,
          textShadow: `0 0 12px ${color}99`,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CharacterCard({ char, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(char.mal_id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease",
        transform: hovered ? "translateY(-8px) scale(1.03)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? "0 0 0 2px #00f5ff, 0 8px 40px #00f5ff44, 0 2px 8px #0008"
          : "0 0 0 1px #ffffff14, 0 2px 12px #0006",
        background: "linear-gradient(160deg, #0d1b2a 0%, #111c2e 100%)",
      }}
    >
      {/* Glow overlay on hover */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered
            ? "linear-gradient(180deg, transparent 50%, #00f5ff18 100%)"
            : "transparent",
          zIndex: 2,
          transition: "background 0.22s",
          pointerEvents: "none",
        }}
      />

      {/* Corner accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderTop: "2px solid #00f5ff88",
          borderLeft: "2px solid #00f5ff88",
          borderRadius: "16px 0 0 0",
          zIndex: 3,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 36,
          height: 36,
          borderBottom: "2px solid #ff3cac88",
          borderRight: "2px solid #ff3cac88",
          borderRadius: "0 0 16px 0",
          zIndex: 3,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      />

      <img
        src={char.images.jpg.image_url}
        alt={char.name}
        style={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          display: "block",
          filter: hovered ? "brightness(1.08) saturate(1.15)" : "brightness(0.92)",
          transition: "filter 0.22s",
        }}
      />

      <div
        style={{
          padding: "10px 12px 12px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: hovered ? "#e0f7ff" : "#9ab8cc",
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: "0.04em",
            textAlign: "center",
            textTransform: "uppercase",
            transition: "color 0.2s",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {char.name}
        </div>
      </div>
    </div>
  );
}

function Overlay({ show, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,8,20,0.88)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        opacity: show ? 1 : 0,
        pointerEvents: show ? "all" : "none",
        transition: "opacity 0.35s ease",
      }}
    >
      {children}
    </div>
  );
}

function GlowButton({ children, onClick, color = "#00f5ff", bg = "transparent" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 32px",
        borderRadius: 8,
        border: `2px solid ${color}`,
        background: hovered ? color + "22" : bg,
        color: hovered ? "#fff" : color,
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: "0.1em",
        cursor: "pointer",
        transition: "all 0.18s ease",
        boxShadow: hovered ? `0 0 24px ${color}66` : "none",
        textTransform: "uppercase",
      }}
    >
      {children}
    </button>
  );
}

export default function Memory() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [scoreReset, setScoreReset] = useState(false);
  const [count, setCount] = useState(6);
  const [level, setLevel] = useState(1);

  const TARGET_SCORE = count - 3;

  const characters = useCharactersStore((state) => state.characters);
  const fetchCharacters = useCharactersStore((state) => state.fetchCharacters);
  const loading = useCharactersStore((state) => state.loading);
  const error = useCharactersStore((state) => state.error);

  useEffect(() => { fetchCharacters(count); }, [count, fetchCharacters]);
  useEffect(() => { if (score === TARGET_SCORE) setShowCongrats(true); }, [score]);

  const handleClick = (id) => {
    if (showCongrats) return;
    const clickedImage = characters.find((img) => img.mal_id === id);
    if (!clickedImage) return;

    if (!clickedImage.isClicked) {
      const updated = characters.map((img) =>
        img.mal_id === id ? { ...img, isClicked: true } : img
      );
      useCharactersStore.setState({ characters: shuffleArray(updated) });
      setScore((prev) => prev + 1);
      setScoreReset(false);
    } else {
      setBestScore(Math.max(score, bestScore));
      setScore(0);
      setScoreReset(true);
      setShowFail(true);
      useCharactersStore.setState({
        characters: shuffleArray(characters.map((img) => ({ ...img, isClicked: false }))),
      });
    }
  };

  const handlePlayAgain = () => {
    setBestScore(Math.max(score, bestScore));
    setScore(0);
    setScoreReset(false);
    setShowCongrats(false);
    setShowFail(false);
    fetchCharacters(count);
  };

  const handleNextGame = () => {
    setLevel((prev) => prev + 1);
    setCount(count + 1);
    setBestScore(Math.max(score, bestScore));
    setScore(0);
    setScoreReset(false);
    setShowCongrats(false);
  };

  const resetFail = () => {
    setShowFail(false);
    setScoreReset(true);
    setScore(0);
    useCharactersStore.setState({
      characters: shuffleArray(characters.map((img) => ({ ...img, isClicked: false }))),
    });
  };

  return (
    <>
      {/* Font imports */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #050d18; }

        .memory-root {
          min-height: 100vh;
          background: #050d18;
          position: relative;
          overflow: hidden;
        }

        /* Animated grid bg */
        .memory-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        /* Glow orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 { width: 480px; height: 480px; background: #0033ff18; top: -120px; left: -100px; }
        .orb-2 { width: 360px; height: 360px; background: #ff3cac14; bottom: -80px; right: -60px; }
        .orb-3 { width: 280px; height: 280px; background: #00f5ff10; top: 40%; left: 50%; transform: translateX(-50%); }

        .memory-content {
          position: relative;
          z-index: 1;
          padding: 0 24px 48px;
          max-width: 1300px;
          margin: 0 auto;
        }

        /* Header */
        .memory-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 0 32px;
          border-bottom: 1px solid #ffffff0f;
          margin-bottom: 40px;
        }

        .level-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff08;
          border: 1px solid #00f5ff33;
          border-radius: 100px;
          padding: 6px 16px;
        }

        .title-area {
          text-align: center;
        }

        .main-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(22px, 3.5vw, 38px);
          font-weight: 900;
          letter-spacing: 0.06em;
          background: linear-gradient(90deg, #00f5ff, #a78bfa, #ff3cac);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.15;
        }

        .subtitle {
          font-family: 'Rajdhani', sans-serif;
          font-size: 13px;
          color: #4a6078;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 6px;
        }

        .scores-row {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .score-divider {
          width: 1px;
          height: 36px;
          background: #ffffff14;
        }

        /* Cards grid */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        /* Progress bar */
        .progress-wrap {
          margin-bottom: 28px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-family: 'Rajdhani', sans-serif;
          font-size: 12px;
          color: #4a6078;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .progress-track {
          height: 4px;
          background: #ffffff0d;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, #00f5ff, #a78bfa);
          box-shadow: 0 0 12px #00f5ff88;
          transition: width 0.4s cubic-bezier(.34,1.56,.64,1);
        }

        /* Loading */
        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          font-family: 'Rajdhani', sans-serif;
        }

        .spinner-ring {
          width: 56px;
          height: 56px;
          border: 3px solid #ffffff0f;
          border-top-color: #00f5ff;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-text {
          color: #4a7fa0;
          font-size: 14px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* Overlay panel */
        .overlay-panel {
          background: linear-gradient(160deg, #0a1525 0%, #0d1b2e 100%);
          border: 1px solid #ffffff14;
          border-radius: 24px;
          padding: 52px 64px;
          text-align: center;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 0 60px #00000080, 0 0 0 1px #ffffff08 inset;
        }

        .overlay-icon {
          font-size: 56px;
          margin-bottom: 16px;
          display: block;
        }

        .overlay-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0.06em;
          margin-bottom: 12px;
        }

        .overlay-sub {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px;
          color: #4a7fa0;
          letter-spacing: 0.05em;
          margin-bottom: 32px;
        }

        .overlay-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .memory-header { flex-direction: column; gap: 20px; text-align: center; }
          .cards-grid { grid-template-columns: repeat(2, 1fr); }
          .overlay-panel { padding: 36px 24px; }
        }
      `}</style>

      <div className="memory-root">
        <div className="memory-grid-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#0d1b2e",
              color: "#e0f0ff",
              border: "1px solid #00f5ff33",
              fontFamily: "'Rajdhani', sans-serif",
              letterSpacing: "0.05em",
            },
          }}
        />

        {loading && (
          <div className="loading-screen">
            <div className="spinner-ring" />
            <p className="loading-text">Summoning characters from the anime realm…</p>
          </div>
        )}

        {error && (
          <div className="loading-screen">
            <span style={{ color: "#ff3cac", fontFamily: "'Rajdhani', sans-serif", fontSize: 14, letterSpacing: "0.1em" }}>
              {error}
            </span>
          </div>
        )}

        {!loading && !error && (
          <div className="memory-content">
            {/* Header */}
            <header className="memory-header">
              <div className="level-badge">
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 10, color: "#4a7fa0", letterSpacing: "0.15em", textTransform: "uppercase" }}>LVL</span>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, color: "#00f5ff", textShadow: "0 0 12px #00f5ff66" }}>{level}</span>
              </div>

              <div className="title-area">
                <h1 className="main-title">Memory Lane</h1>
                <p className="subtitle">Click each card once — don't repeat</p>
              </div>

              <div className="scores-row">
                <ScoreBar label="Target" value={TARGET_SCORE} color="#a78bfa" />
                <div className="score-divider" />
                <ScoreBar label="Score" value={score} color={scoreReset ? "#ff3cac" : "#00f5ff"} />
                <div className="score-divider" />
                <ScoreBar label="Best" value={bestScore} color="#ffd700" />
              </div>
            </header>

            {/* Progress */}
            <div className="progress-wrap">
              <div className="progress-label">
                <span>Progress</span>
                <span>{score} / {TARGET_SCORE}</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${TARGET_SCORE > 0 ? (score / TARGET_SCORE) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Cards */}
            <main className="cards-grid">
              {characters.map((char) => (
                <CharacterCard key={char.mal_id} char={char} onClick={handleClick} />
              ))}
            </main>
          </div>
        )}

        {/* WIN overlay */}
        {showCongrats && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            colors={["#00f5ff", "#a78bfa", "#ff3cac", "#ffd700"]}
            numberOfPieces={220}
          />
        )}
        <Overlay show={showCongrats}>
          <div className="overlay-panel">
            <span className="overlay-icon">🏆</span>
            <h2 className="overlay-title" style={{ color: "#ffd700", textShadow: "0 0 24px #ffd70066" }}>
              STAGE CLEAR
            </h2>
            <p className="overlay-sub">You hit the target score of {TARGET_SCORE}. Impressive.</p>
            <div className="overlay-buttons">
              <GlowButton onClick={handlePlayAgain} color="#00f5ff">Play Again</GlowButton>
              <GlowButton onClick={handleNextGame} color="#a78bfa">Next Level →</GlowButton>
            </div>
          </div>
        </Overlay>

        {/* FAIL overlay */}
        <Overlay show={showFail}>
          <div className="overlay-panel">
            <span className="overlay-icon">💀</span>
            <h2 className="overlay-title" style={{ color: "#ff3cac", textShadow: "0 0 24px #ff3cac66" }}>
              GAME OVER
            </h2>
            <p className="overlay-sub">You clicked a character twice. Memory failed.</p>
            <div className="overlay-buttons">
              <GlowButton onClick={resetFail} color="#ff3cac">Try Again</GlowButton>
            </div>
          </div>
        </Overlay>
      </div>
    </>
  );
}