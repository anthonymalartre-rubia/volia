"use client";

import { useState, useEffect, useRef } from "react";

const WORDS = [
  "l'email de chaque entreprise",
  "scraping + Google",
  "150+ catégories B2B",
  "un scoring de confiance",
  "101 départements",
  "49€/mois tout inclus",
];

const TYPING_SPEED = 60;
const DELETING_SPEED = 35;
const PAUSE_AFTER_TYPE = 2200;
const PAUSE_AFTER_DELETE = 400;

export default function TypewriterText() {
  const [displayed, setDisplayed] = useState("");
  const wordIndexRef = useRef(0);
  const charIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function tick() {
      const currentWord = WORDS[wordIndexRef.current];

      if (!isDeletingRef.current) {
        // Typing forward
        charIndexRef.current++;
        setDisplayed(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current >= currentWord.length) {
          // Finished typing — pause then delete
          isDeletingRef.current = true;
          timeoutRef.current = setTimeout(tick, PAUSE_AFTER_TYPE);
          return;
        }
        timeoutRef.current = setTimeout(tick, TYPING_SPEED);
      } else {
        // Deleting
        charIndexRef.current--;
        setDisplayed(currentWord.slice(0, charIndexRef.current));

        if (charIndexRef.current <= 0) {
          // Finished deleting — next word
          isDeletingRef.current = false;
          wordIndexRef.current = (wordIndexRef.current + 1) % WORDS.length;
          timeoutRef.current = setTimeout(tick, PAUSE_AFTER_DELETE);
          return;
        }
        timeoutRef.current = setTimeout(tick, DELETING_SPEED);
      }
    }

    timeoutRef.current = setTimeout(tick, PAUSE_AFTER_DELETE);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
      {displayed}
      <span className="inline-block w-[3px] h-[0.85em] bg-violet-400 ml-1 align-middle animate-blink" />
    </span>
  );
}
