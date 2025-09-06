// components/GiphyPicker.jsx
import React, { useState, useEffect } from "react";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY);

export default function GiphyPicker({ onGifSelect, searchTerm }) {
  const [width, setWidth] = useState(300);

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById("giphy-picker");
      if (container) {
        setWidth(container.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchGifs = (offset) => {
    if (searchTerm) {
      return gf.search(searchTerm, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  return (
    <div id="giphy-picker" style={{ width: "100%", maxWidth: 350, height: 350 }}>
      <Grid
        key={searchTerm || "trending"}
        fetchGifs={fetchGifs}
        width={width}
        columns={2}
        gutter={6}
        onGifClick={(gif, e) => {
          e.preventDefault();
          onGifSelect(gif);
        }}
      />
    </div>
  );
}

