import React, { useState, useEffect } from 'react';

export default function Counter() {
  const [counter, setCounter] = useState(0);
  const [isMounted, setIsMounted] = useState(0);

  useEffect(() => setIsMounted(true));

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.3.2/dist/confetti.browser.min.js" />
      <button
        type="button"
        onClick={() => {
          setCounter(counter + 1);
          window.confetti({ origin: { x: 0, y: 1 }, angle: 45, spread: 90 });
          window.confetti({ origin: { x: 1, y: 1 }, angle: 135, spread: 90 });
        }}
      >
        {isMounted
          ? counter > 0
            ? `You clicked on this button ${counter} times.`
            : 'Hit me if you dare!'
          : 'Nothing happens, but the button is here!'}
      </button>
    </>
  );
}
