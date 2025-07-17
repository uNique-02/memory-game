import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";
import useCharactersStore from "../stores/useCharacterStore";

const initialImages = [
  {
    id: crypto.randomUUID(),
    name: "Laptops and Computers",
    imageUrl: "/laptop.jpg",
    isClicked: false,
  },
  {
    id: crypto.randomUUID(),
    name: "Phones and Tablets",
    imageUrl: "/smartphone.png",
    isClicked: false,
  },
  {
    id: crypto.randomUUID(),
    name: "Furniture",
    imageUrl: "/sofa.png",
    isClicked: false,
  },
  {
    id: crypto.randomUUID(),
    name: "Home Appliances",
    imageUrl: "/fridge.png",
    isClicked: false,
  },
  {
    id: crypto.randomUUID(),
    name: "Clothing and Accessories",
    imageUrl: "/t-shirt.png",
    isClicked: false,
  },
  {
    id: crypto.randomUUID(),
    name: "Watches and Jewelry",
    imageUrl: "/smartwatch.png",
    isClicked: false,
  },
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
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

  useEffect(() => {
    fetchCharacters(count);
  }, [count, fetchCharacters]);

  useEffect(() => {
    if (score === TARGET_SCORE) {
      setShowCongrats(true);
    }
  }, [score]);

  const handleClick = (id) => {
    if (showCongrats) return;

    const clickedImage = characters.find((img) => img.mal_id === id);
    if (!clickedImage) return;

    if (!clickedImage.isClicked) {
      const updatedCharacters = characters.map((img) =>
        img.mal_id === id ? { ...img, isClicked: true } : img
      );
      useCharactersStore.setState({
        characters: shuffleArray(updatedCharacters),
      });
      setScore((prev) => prev + 1);
      setScoreReset(false);
    } else {
      setBestScore(Math.max(score, bestScore));
      setScore(0);
      setScoreReset(true);
      setShowFail(true);
      const resetCharacters = characters.map((img) => ({
        ...img,
        isClicked: false,
      }));
      useCharactersStore.setState({
        characters: shuffleArray(resetCharacters),
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

  return (
    <>
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Summoning characters from the anime realm...</p>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="relative min-h-screen bg-gradient-to-b from-green-900 to-green-700 text-white p-4 overflow-hidden">
          <Toaster position="top-center" />

          {showCongrats && (
            <>
              <Confetti width={window.innerWidth} height={window.innerHeight} />
              <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-300 mb-6 animate-pulse text-center">
                  🎉 Congratulations! 🎉
                </h2>
                <p className="text-lg text-white mb-4 text-center">
                  You reached the target score of {TARGET_SCORE}!
                </p>
                <div className="flex gap-4 mt-4 flex-wrap justify-center">
                  <button
                    onClick={handlePlayAgain}
                    className="bg-yellow-400 text-green-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition"
                  >
                    Play Again
                  </button>
                  <button
                    onClick={handleNextGame}
                    className="bg-yellow-400 text-green-900 px-6 py-2 rounded-full font-bold hover:bg-yellow-300 transition"
                  >
                    Next Game
                  </button>
                </div>
              </div>
            </>
          )}

          {showFail && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
              <h2 className="text-4xl md:text-5xl font-extrabold text-red-400 mb-6 animate-pulse text-center">
                ❌ Game Over ❌
              </h2>
              <p className="text-lg text-white mb-4 text-center">
                You clicked a character twice. Try again!
              </p>
              <div className="flex gap-4 mt-4 flex-wrap justify-center">
                <button
                  onClick={() => {
                    setBestScore(Math.max(score, bestScore));
                    setScore(0);
                    setScoreReset(true);
                    setShowFail(false);
                    const resetCharacters = characters.map((img) => ({
                      ...img,
                      isClicked: false,
                    }));
                    useCharactersStore.setState({
                      characters: shuffleArray(resetCharacters),
                    });
                  }}
                  className="bg-red-400 text-white px-6 py-2 rounded-full font-bold hover:bg-red-300 transition"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 text-center md:text-left">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-md break-words">
                Trip Down the Memory Lane
              </h1>
              <p className="text-orange-300 mt-1 text-sm sm:text-base">
                Get points by clicking on an image but don't click on any more
                than once!
              </p>
            </div>

            <div className="flex flex-col items-end text-sm sm:text-base text-right">
              <p className="text-blue-300 font-bold">Level: {level}</p>
              <p className="text-green-400 font-bold">
                Target Score: {TARGET_SCORE}
              </p>
              <p
                className={`transition-colors font-bold ${
                  scoreReset ? "text-red-400" : "text-white"
                }`}
              >
                Score: {score}
              </p>
              <p>Best Score: {bestScore}</p>
            </div>
          </header>

          {/* Game Grid */}
          <main className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 justify-center">
            {characters.map((char) => (
              <div
                key={char.mal_id}
                onClick={() => handleClick(char.mal_id)}
                className="bg-green-300 rounded-lg p-3 cursor-pointer hover:scale-105 transform transition shadow-lg"
              >
                <img
                  src={char.images.jpg.image_url}
                  alt={char.name}
                  className="rounded-md w-full h-40 sm:h-48 object-cover"
                />
                <p className="text-center font-semibold text-white mt-2 drop-shadow-md text-sm sm:text-base">
                  {char.name}
                </p>
              </div>
            ))}
          </main>
        </div>
      )}
    </>
  );
}
