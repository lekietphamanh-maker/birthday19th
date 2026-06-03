Original prompt: Mobile pixel RPG gift game, "Chasing my way!", with six memory puzzles, photos/keys, big memory, chase-light cutscene, and final video.

2026-05-18 update:
- Changed finale order to big memory first, then final chase cutscene, then final video screen.
- Reworked Christmas puzzle into a blinking light/radio-channel puzzle.
- Reworked 3/8 puzzle into a bouquet-building puzzle.
- Reworked Charlotte puzzle into a queen-move board puzzle.
- Enlarged the mobile direction pad.

TODO:
- If the user uploads the final video, place it in the configured video slot or update `config.js`.

QA note: Christmas light puzzle labels were widened to a 3-column mobile layout; 3/8 title/prompt polished.

2026-06-01 afternoon update:
- Christmas puzzle answer buttons now appear in random order, while the solution remains Badminton → light → radio → walk → dinner.
- Raleigh solution is Raleigh road → two of us → mochi donut → bbq chicken.
- After each puzzle, the player is kicked back into the world, a recovered-memory line appears for about 2 seconds, and the room gathers bricks into a topic-shaped building.
- The ? button now only shows how-to-play instructions.
- Building placement was lifted away from the treasure chest/frame so the building is easier to see clearly.

2026-06-03 update:
- Rewrote the six memorial letter titles by topic.
- Renamed the old block wording in the UI to “memorial block.”
- Added a reread button inside each puzzle so the memorial block can be opened again during the puzzle.
- Made memorial blocks blink/pulse before they are opened so they are easier to notice.
- Updated the journal so solved puzzles can be reread before the photo frame is unlocked.
- Reworked the Christmas light puzzle layout: randomized choices, two wider blocks on the second row, and Badminton forced into a wider block to prevent wrapping.
- Added a lockout guard to the CFCC matching puzzle so fast tapping cannot leave the puzzle stuck.
- QA passed for syntax, wording, Christmas randomization/layout, CFCC fast-tap recovery, and memorial reread flow.
