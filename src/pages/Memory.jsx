import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

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

// Shuffle function
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
  const [images, setImages] = useState(initialImages);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showFail, setShowFail] = useState(false);
  const [scoreReset, setScoreReset] = useState(false); // for red color effect
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [count, setCount] = useState(6); // for fetching 10 characters
  const TARGET_SCORE = count - 3;
  const [level, setLevel] = useState(1); // NEW: level tracker

  useEffect(() => {
    if (score === TARGET_SCORE) {
      setShowCongrats(true);
    }
  }, [score]);

  const fetchCharacters = async (num = 10) => {
    setLoading(true);
    setError(null);
    setSelectedCharacter(null);

    try {
      // Create an array of promises for 10 characters
      const requests = Array(num)
        .fill()
        .map(() =>
          axios.get("https://api.jikan.moe/v4/random/characters", {
            headers: { Accept: "application/json" },
          })
        );

      // Execute all requests
      const responses = await Promise.all(requests);
      const characterData = responses.map((res) => res.data.data);

      setCharacters(characterData);
    } catch (err) {
      setError("Failed to fetch characters. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters(count);
  }, []);

  const handleClick = (id) => {
    if (showCongrats) return;

    console.log("Clicked ID:", id);

    const clickedImage = characters.find((img) => img.mal_id === id);
    console.log("Clicked Image:", clickedImage);
    if (!clickedImage) return;

    if (!clickedImage.isClicked) {
      const updatedCharacters = characters.map((img) =>
        img.mal_id === id ? { ...img, isClicked: true } : img
      );
      setScore((prev) => prev + 1);
      setCharacters(shuffleArray(updatedCharacters));
      setScoreReset(false);
    } else {
      // Reset
      setBestScore(Math.max(score, bestScore));
      setScore(0);
      setScoreReset(true);
      setShowFail(true); // show failure UI
      const resetCharacters = characters.map((img) => ({
        ...img,
        isClicked: false,
      }));
      setCharacters(shuffleArray(resetCharacters));
    }
  };

  const handlePlayAgain = () => {
    setBestScore(Math.max(score, bestScore));
    setScore(0);
    setScoreReset(false);
    setShowCongrats(false);
    setCharacters(
      shuffleArray(initialImages.map((img) => ({ ...img, isClicked: false })))
    );
  };

  const handleNextGame = () => {
    const newCount = count + 1;
    setLevel((prev) => prev + 1);
    setCount(newCount);
    fetchCharacters(newCount);
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

          <div className="absolute top-4 left-6 text-left">
            <p className="text-blue-300 font-bold text-lg">Level: {level}</p>
          </div>

          {showCongrats && (
            <>
              <Confetti width={window.innerWidth} height={window.innerHeight} />
              <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                <h2 className="text-4xl md:text-5xl font-extrabold text-yellow-300 mb-6 animate-pulse">
                  🎉 Congratulations! 🎉
                </h2>
                <p className="text-lg text-white mb-4">
                  You reached the target score of {TARGET_SCORE}!
                </p>
                <div className="flex gap-4 mt-4">
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
              <h2 className="text-4xl md:text-5xl font-extrabold text-red-400 mb-6 animate-pulse">
                ❌ Game Over ❌
              </h2>
              <p className="text-lg text-white mb-4">
                You clicked a character twice. Try again!
              </p>
              <div className="flex gap-4 mt-4">
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
                    setCharacters(shuffleArray(resetCharacters));
                  }}
                  className="bg-red-400 text-white px-6 py-2 rounded-full font-bold hover:bg-red-300 transition"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          <header className="text-center mb-6">
            <h1 className="text-5xl font-extrabold text-yellow-300 drop-shadow-md">
              Trip Down the Memory Lane
            </h1>
            <p className="text-orange-300 mt-2">
              Get points by clicking on an image but don't click on any more
              than once!
            </p>
            <div className="absolute top-4 right-6 text-right">
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
              <p>Best Score: {score}</p>
            </div>
          </header>

          <main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
            {characters.map((char) => (
              <div
                key={char.mal_id}
                onClick={() => handleClick(char.mal_id)}
                className="bg-green-300 rounded-lg p-3 cursor-pointer hover:scale-105 transform transition shadow-lg"
              >
                <img
                  src={char.images.jpg.image_url}
                  alt={char.name}
                  className="rounded-md w-full h-48 object-cover"
                />
                <p className="text-center font-semibold text-white mt-2 drop-shadow-md">
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
