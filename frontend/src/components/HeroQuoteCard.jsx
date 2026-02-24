import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTasks } from "../context/TaskContext"; // Access the 4AM currentForgeDay

const HeroQuoteCard = () => {
  // Use currentForgeDay which is already calculated using getEffectiveDate()
  const { currentForgeDay } = useTasks();

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
  ];

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);

        // 1. Check LocalStorage for existing session data
        const savedHeroData = JSON.parse(
          localStorage.getItem("forge_hero_daily"),
        );

        // 2. COMPARE: Use currentForgeDay (4 AM logic) instead of standard midnight date
        if (savedHeroData && savedHeroData.date === currentForgeDay) {
          setQuoteData({
            text: savedHeroData.text,
            author: savedHeroData.author,
          });
          setBgImage(savedHeroData.image);
          setLoading(false);
          return;
        }

        // 3. FETCH: Only if the session has changed (passed 4 AM)
        const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
        const NINJA_KEY = import.meta.env.VITE_NINJA_QUOTE_KEY;
        const randomCat =
          CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

        let imageUrl =
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05";
        let selectedQuote =
          FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];

        // Image Fetch
        try {
          const imageRes = await axios.get(
            `https://api.unsplash.com/photos/random?query=nature,landscape,minimal&orientation=landscape&client_id=${UNSPLASH_KEY}`,
          );
          imageUrl = imageRes.data.urls.regular;
        } catch (e) {
          console.warn("Image fetch failed");
        }

        // Quote Fetch
        try {
          if (NINJA_KEY) {
            const quoteRes = await axios.get(
              `https://api.api-ninjas.com/v1/quotes?category=${randomCat}`,
              { headers: { "X-Api-Key": NINJA_KEY } },
            );
            if (quoteRes.data?.length > 0) {
              selectedQuote = {
                text: quoteRes.data[0].quote,
                author: quoteRes.data[0].author,
              };
            }
          }
        } catch (e) {
          console.warn("Quote fetch failed");
        }

        const newHeroData = {
          date: currentForgeDay, // Lock this data to the 4 AM session
          image: imageUrl,
          text: selectedQuote.text,
          author: selectedQuote.author,
        };

        // 4. Save to LocalStorage
        localStorage.setItem("forge_hero_daily", JSON.stringify(newHeroData));

        setBgImage(newHeroData.image);
        setQuoteData({ text: newHeroData.text, author: newHeroData.author });
      } catch (error) {
        console.error("Hero Section Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, [currentForgeDay]); // This dependency triggers a re-fetch exactly at 4 AM

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 min-h-65 sm:min-h-90"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-brightness-75" />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-xl text-center">
          {loading ? (
            <div className="animate-pulse text-white font-bold tracking-[0.5em]">
              FORGING...
            </div>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-serif italic text-white leading-relaxed mb-6">
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
