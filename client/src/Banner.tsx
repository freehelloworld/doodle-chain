import { useState, useEffect } from 'react';

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call a fake noodle? An Impasta.",
  "Why did the scarecrow win an award? Because he was outstanding in his field.",
  "I'm reading a book on anti-gravity. It's impossible to put down!",
  "What do you call a lazy kangaroo? Pouch potato.",
  "I used to be a baker, but I couldn't make enough dough.",
  "What do you call a dog that does magic tricks? A labracadabrador.",
  "Why don't skeletons fight each other? They don't have the guts.",
  "What do you call a can opener that doesn't work? A can't opener.",
  "I'm on a seafood diet. I see food and I eat it.",
  "Why did the bicycle fall over? Because it was two tired.",
  "What do you call a fish with no eyes? Fsh.",
  "I would tell you a joke about an elevator, but it's an uplifting story.",
  "Why did the coffee file a police report? It got mugged.",
  "I'm so good at sleeping, I can do it with my eyes closed.",
  "What do you call a bear with no teeth? A gummy bear.",
  "I'm not a vegetarian because I love animals. I'm a vegetarian because I hate plants.",
  "Why did the scarecrow win an award? Because he was outstanding in his field.",
  "I'm reading a book on the history of glue. I just can't seem to put it down."
];

function Banner() {
  const [currentJoke, setCurrentJoke] = useState(jokes[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * jokes.length);
      setCurrentJoke(jokes[randomIndex]);
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-banner">
      <p>{currentJoke}</p>
    </div>
  );
}

export default Banner;
