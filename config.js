// config.js — replace assets here for a permanent build.
// Leave entries as null to use the built-in pixel-painted placeholders.
//
// Photos: any image works (jpg / png / webp). They will be drawn pixelated to fit the frame.
// Final picture: optional single image revealed in 6 pieces after memory unlocks.
// Video : any browser video (mp4 / webm). Shown on the ending screen.
//
// You can also use the in-game "?" menu to drop files in for the current session.

window.VALENTINE_ASSETS = {
  backgroundPhoto: "./assets/photos/main.jpg",
  photos: [
    "./assets/photos/memory-1.jpg", // memory 1 — Christmas
    "./assets/photos/memory-2.jpg", // memory 2 — New Year
    "./assets/photos/memory-3.jpg", // memory 3 — Raleigh
    "./assets/photos/memory-4.jpg", // memory 4 — 3/8 + Women's Day
    "./assets/photos/memory-5.jpg", // memory 5 — CFCC
    "./assets/photos/memory-6.jpg", // memory 6 — Queen City
  ],
  finalPicture: "./assets/photos/big-memory.jpg",
  video: null, // "./assets/video/ending.mp4"
};
