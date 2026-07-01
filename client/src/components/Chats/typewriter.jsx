// typewriter.jsx (or .js)
import { useState, useEffect } from "react";

const Typewriter = ({ text = "Loading...", speed = 100, loop = true , className}) => {
  const [displayText, setDisplayText] = useState("");
  const cursor = "|";
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (loop) {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          i = 0;
        }
      } else {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);


  return <span className={className}>{displayText + cursor} </span>;
};

export default Typewriter;
