import React, { useState, useEffect } from "react";
import axios from "axios";

const HeroQuoteCard = () => {
  const [quoteData, setQuoteData] = useState({ text: "", author: "" });
  const [bgImage, setBgImage] = useState("");
  const [loading, setLoading] = useState(true);

  const CATEGORIES = [
    "success",
    "motivation",
    "inspirational",
    "hope",
    "knowledge",
  ];

  const FALLBACK_QUOTES = [
    {
      text: "Discipline is the bridge between goals and accomplishment.",
      author: "Jim Rohn",
    },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "Innovation distinguishes between a leader and a follower.",
      author: "Steve Jobs",
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
  ];

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];

        // 1. Check LocalStorage first for BOTH Quote and Image
        const savedHeroData = JSON.parse(
          localStorage.getItem("forge_hero_daily"),
        );

        // 2. If data exists and is from today, use it and stop
        if (savedHeroData && savedHeroData.date === today) {
          setQuoteData({
            text: savedHeroData.text,
            author: savedHeroData.author,
          });
          setBgImage(savedHeroData.image);
          setLoading(false);
          return; // Exit early
        }

        // 3. If no data or date is old, fetch NEW data for the new day
        const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
        const randomCat =
          CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

        let imageUrl =
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05";
        let selectedQuote =
          FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];

        // Fetch image from Unsplash
        try {
          const imageRes = await axios.get(
            `https://api.unsplash.com/photos/random?query=nature,landscape,minimal&orientation=landscape&client_id=${UNSPLASH_KEY}`,
          );
          imageUrl = imageRes.data.urls.regular;
        } catch (imgError) {
          console.warn(
            "Unsplash fetch failed, using fallback image:",
            imgError,
          );
        }

        // Fetch quote from API-Ninjas (optional - use fallback if fails)
        try {
          const NINJA_KEY = import.meta.env.VITE_NINJA_QUOTE_KEY;
          if (NINJA_KEY) {
            const quoteRes = await axios.get(
              `https://api.api-ninjas.com/v1/quotes?category=${randomCat}`,
              {
                headers: { "X-Api-Key": NINJA_KEY },
              },
            );
            if (quoteRes.data && quoteRes.data.length > 0) {
              selectedQuote = {
                text: quoteRes.data[0].quote,
                author: quoteRes.data[0].author,
              };
            }
          }
        } catch (quoteError) {
          console.warn(
            "API-Ninjas fetch failed, using fallback quote:",
            quoteError,
          );
        }

        const newHeroData = {
          date: today,
          image: imageUrl,
          text: selectedQuote.text,
          author: selectedQuote.author,
        };

        // 4. Save to LocalStorage for the rest of the day
        localStorage.setItem("forge_hero_daily", JSON.stringify(newHeroData));

        setBgImage(newHeroData.image);
        setQuoteData({ text: newHeroData.text, author: newHeroData.author });
      } catch (error) {
        console.error("Hero Section Error:", error);
        // Fallback data
        setBgImage(
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
        );
        setQuoteData({
          text: "Discipline is the bridge between goals and accomplishment.",
          author: "Jim Rohn",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);
  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 min-h-65 sm:min-h-90"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 sm:p-8 rounded-2xl max-w-xl text-center">
          {loading ? (
            <div className="animate-pulse text-white/80 font-bold tracking-widest">
              FORGING...
            </div>
          ) : (
            <>
              <h1 className="text-lg sm:text-2xl font-serif italic text-white leading-relaxed mb-6 drop-shadow-lg">
                "{quoteData.text}"
              </h1>
              <div className="w-10 h-px bg-white/40 mx-auto mb-4" />
              <p className="text-white/90 font-light text-xs tracking-[0.3em] uppercase">
                ~ {quoteData.author}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroQuoteCard;
