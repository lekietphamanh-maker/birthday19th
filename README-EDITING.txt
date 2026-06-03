Chasing my way! — editing and running the game

HOW TO ADD THE FINAL VIDEO

1. Open this folder.
2. Put your video file here:
   assets/video/ending.mp4
3. Open config.js in a text editor.
4. Change this line:
   video: null, // "./assets/video/ending.mp4"
   to:
   video: "./assets/video/ending.mp4"
5. Save config.js.

Recommended video format:
- MP4
- H.264 video
- AAC audio
- Keep it short and compressed for iPhone.

HOW TO RUN ON MAC OR PC

Easy option:
- Open index.html in Chrome, Edge, Firefox, or Safari.

Better local-server option:
- Install Visual Studio Code.
- Install the VS Code extension called "Live Server".
- Open this folder in VS Code.
- Right-click index.html.
- Choose "Open with Live Server".

HOW TO RUN ON IPHONE

Best option:
- Upload the folder to a simple web host, or use the Perplexity deployed link.
- Open the link in Safari on iPhone.
- Tap Share, then "Add to Home Screen" if you want it to feel like an app.

If you want a real iPhone app:
- Use Xcode on a Mac and wrap the game in a WKWebView.
- This is more advanced, but the game files can be used as the web content.

FILES YOU USUALLY EDIT

- config.js: photo and video paths.
- assets/photos/: memory pictures.
- assets/video/ending.mp4: final video.

Do not rename index.html, game.js, or style.css unless you also update the references in index.html.
