/* ============================================================
   character & the light — game.js
   2D pixel-art RPG with a color/detail arc tied to memory unlocks.

   World is rendered to a tiny 180×320 canvas (pixel grid),
   then CSS scales it up with pixelated filtering for the
   classic crunchy pixel look.

   STAGE: 0 = monochrome dream  → 6 = full color/promise
   ============================================================ */

(() => {
  'use strict';

  // ---------- Constants ----------
  const TILE = 12;             // logical tile size in pixels (canvas)
  const VIEW_W = 180;
  const VIEW_H = 320;
  const COLS = 30;             // world is bigger than view (camera scrolls)
  const ROWS = 40;
  const WORLD_W = COLS * TILE;
  const WORLD_H = ROWS * TILE;
  const NUM_MEMORIES = 6;

  // Stage palette ramp — each entry is what the WORLD looks like
  // AFTER `stage` memories have been unlocked. stage 0 is the cold opening.
  const STAGES = [
    // 0 — almost monochrome, no warmth, no props
    {
      ground: '#0d0d14',
      groundAlt: '#101019',
      ground2: '#161620',
      cloak: '#1a1822',     // soft cloak landscape
      cloakDark: '#0c0b14',
      wall: '#2a2934',
      mist: 'rgba(160,158,170,0.06)',
      ink: '#c8c6cf',
      ink2: '#8a8893',
      gold: '#d9d4c0',      // desaturated
      goldGlow: 'rgba(217,212,192,0.18)',
      rose: '#6f6671',
      violet: '#5a5870',
      sky: '#070710',
      stars: 0.25,          // emission intensity of ambient stars
      hue: 'grayscale(0.85) saturate(0.4)',
      flowers: false,
      petals: false,
      windowGlow: false,
      laughBalloons: false,
      promiseRose: false,
    },
    // 1 — first spark: tiny gold accent appears, slight warmth
    {
      ground: '#0e0e18',
      groundAlt: '#12121e',
      ground2: '#181826',
      cloak: '#1c1a26',
      cloakDark: '#0e0c17',
      wall: '#2c2b38',
      mist: 'rgba(170,165,200,0.07)',
      ink: '#d5d2dc',
      ink2: '#9591a0',
      gold: '#f0d57a',
      goldGlow: 'rgba(240,213,122,0.4)',
      rose: '#7a6f7a',
      violet: '#6c6885',
      sky: '#080812',
      stars: 0.45,
      hue: 'grayscale(0.55) saturate(0.7)',
      flowers: false,
      petals: false,
      windowGlow: false,
      laughBalloons: false,
      promiseRose: false,
    },
    // 2 — quiet walk: violet/blue dusk arrives
    {
      ground: '#11102a',
      groundAlt: '#15143a',
      ground2: '#1c1b4a',
      cloak: '#1a1830',
      cloakDark: '#0c0a1f',
      wall: '#2f2c4a',
      mist: 'rgba(180,170,220,0.12)',
      ink: '#dad7e9',
      ink2: '#a39fbf',
      gold: '#f4d782',
      goldGlow: 'rgba(244,215,130,0.5)',
      rose: '#977b94',
      violet: '#a39bd8',
      sky: '#0a0a1c',
      stars: 0.65,
      hue: 'grayscale(0.3) saturate(0.9)',
      flowers: false,
      petals: true,        // small drifting motes
      windowGlow: false,
      laughBalloons: false,
      promiseRose: false,
    },
    // 3 — laughing room: rose/coral, brighter, balloons
    {
      ground: '#181030',
      groundAlt: '#1c1336',
      ground2: '#241845',
      cloak: '#1d1633',
      cloakDark: '#100a22',
      wall: '#3a2e5a',
      mist: 'rgba(220,180,210,0.14)',
      ink: '#ecdcec',
      ink2: '#c0a3c0',
      gold: '#f6db8b',
      goldGlow: 'rgba(246,219,139,0.55)',
      rose: '#e1a4c0',
      violet: '#b8a8e4',
      sky: '#0d0925',
      stars: 0.8,
      hue: 'none',
      flowers: true,
      petals: true,
      windowGlow: false,
      laughBalloons: true,
      promiseRose: false,
    },
    // 4 — rain window: cool blues blooming with warm windows
    {
      ground: '#181238',
      groundAlt: '#1c163c',
      ground2: '#241c4d',
      cloak: '#1c1538',
      cloakDark: '#110a26',
      wall: '#3e3266',
      mist: 'rgba(190,200,255,0.16)',
      ink: '#f0e2ec',
      ink2: '#c2aac8',
      gold: '#fadf90',
      goldGlow: 'rgba(250,223,144,0.65)',
      rose: '#e1a4c0',
      violet: '#c5a8ff',
      sky: '#0e0830',
      stars: 0.9,
      hue: 'none',
      flowers: true,
      petals: true,
      windowGlow: true,
      laughBalloons: true,
      promiseRose: false,
    },
    // 5 — the promise: full color, warm gold, full petals
    {
      ground: '#1f1442',
      groundAlt: '#251748',
      ground2: '#2e1c58',
      cloak: '#21194a',
      cloakDark: '#15103a',
      wall: '#4a3a78',
      mist: 'rgba(255, 210, 220, 0.18)',
      ink: '#fff2e0',
      ink2: '#e4b8c8',
      gold: '#ffd866',
      goldGlow: 'rgba(255,216,102,0.75)',
      rose: '#ff8aa9',
      violet: '#c5a8ff',
      sky: '#180a40',
      stars: 1.0,
      hue: 'none',
      flowers: true,
      petals: true,
      windowGlow: true,
      laughBalloons: true,
      promiseRose: true,
    },
    // 6 — whole picture: saturated finale, everything alive
    {
      ground: '#24134d',
      groundAlt: '#2b1759',
      ground2: '#39206d',
      cloak: '#2b1f5c',
      cloakDark: '#1a1145',
      wall: '#5b43a0',
      mist: 'rgba(255, 226, 176, 0.24)',
      ink: '#fff7df',
      ink2: '#f0c8d4',
      gold: '#ffe072',
      goldGlow: 'rgba(255,224,114,0.88)',
      rose: '#ff7fa8',
      violet: '#bea1ff',
      sky: '#1b074a',
      stars: 1.18,
      hue: 'none',
      flowers: true,
      petals: true,
      windowGlow: true,
      laughBalloons: true,
      promiseRose: true,
    },
  ];

  // ---------- Memories (story content) ----------
  // Note text uses dreamy/Valentine tone. Each memory has:
  //   triggerKind: 'star' | 'note' | 'frame'
  //   noteText: shown when player picks up the note
  //   unlockTitle: shown in unlock celebration + journal
  //   unlockLine: poetic one-liner about what changes
  //   puzzleHint: small hint shown by interactable
  //   thumbDraw(ctx, stageAtUnlock): paints the photo frame thumbnail in pixel art
  const MEMORIES = [
    {
      key: 'christmas_lights',
      title: 'Memories come with the bells',
      // poetic note read at trigger
      note: `Our very first Christmas together.
After badminton, we chased the holiday lights,
wandering through the cold evening side by side.
Do you remember that one display—
the lights dancing perfectly 
to a radio station playing Christmas songs?
Walking through that sparkling street filled with lights felt magical,
tiring and dining after that felt cozy and warm,
I remember looking at the lights,
but I remember looking at you even more.`,
      unlockLine: 'christmas lights become the first key.',
      framePrompt: 'memory · christmas',
    },
    {
      key: 'new_year_beach',
      title: 'Memories come with fireworks',
      note: `Carolina Beach was crowded that day,
filled with strangers and endless noise,
but somehow, all I could see was you.
I still remember the coffee in our hands,
and the way we stood together,
waiting for the giant sphere to fall from the sky.
Out of everyone there,
you were the only part of the night that mattered.`,
      unlockLine: 'the countdown becomes the second key.',
      framePrompt: 'memory · new year',
    },
    {
      key: 'raleigh_trip',
      title: 'Memories of the first trip together',
      note: `I think this was our first trip to Raleigh,
just the two of us.
I still remember the mochi donut shop you wanted to show me,
and how we got a little lost trying to find it.
Looking back, I think getting lost was part of the fun.
Even the BBQ chicken dinner stays in my memory—
the way you proudly showed it to me,
as if sharing a small piece of yourself.
Those little moments became some of my favorite ones.`,
      unlockLine: 'raleigh becomes the third key.',
      framePrompt: 'memory · raleigh',
    },
    {
      key: 'womens_day',
      title: 'Memories of the bouquet I was most proud of',
      note: `I took the day off just to get you flowers.
Of all the bouquets I made,
that one was my favorite.
Maybe because I made it for you,
or maybe because I put a little more of my heart into it.
I dressed up that day,
trying to look nice,
and you never stopped teasing me about it.
But secretly,
I loved every second of it.`,
      unlockLine: 'the flowers become the fourth key.',
      framePrompt: 'memory · 3/8',
    },
    {
      key: 'cfcc_morning',
      title: 'Memories of the quiet morning together',
      note: `This one happened not long ago.
We went to CFCC for your classes,
but we arrived too early,
so we stayed together for a little while longer.
Nothing extraordinary happened,
yet somehow it felt special.
Just having that extra time with you
made an ordinary morning feel beautiful.`,
      unlockLine: 'that quiet morning becomes the fifth key.',
      framePrompt: 'memory · cfcc',
    },
    {
      key: 'queen_city',
      title: 'Memories of the Queen City',
      note: `Our first trip to Charlotte together.
We took so many pictures,
trying to hold on to every moment.
I was a little tired from all the driving,
but none of that really mattered.
Because every new street,
every new place,
felt better simply because I was experiencing it with you.
When I think back on that trip,
I don't remember being tired.
I just remember being happy.`,
      unlockLine: 'queen city becomes the sixth key.',
      framePrompt: 'memory · queen city',
    },
  ];

  const PUZZLES = [
    {
      title: 'Meowry · christmas',
      type: 'lightline',
      prompt: 'tap the memory words in order: badminton, light, radio, walk, dinner.',
      bulbs: ['Badminton', 'light', 'radio', 'walk', 'dinner'],
      order: [0, 1, 2, 3, 4],
      randomizeChoices: true,
      success: 'the christmas lights blink back for us.',
    },
    {
      title: 'No one else but you.',
      type: 'maze',
      prompt: 'move through the crowded beach countdown, collect every light, then reach the frame.',
      map: [
        '########',
        '#S.*...#',
        '#.##.#.#',
        '#..*.#.#',
        '##.#...#',
        '#..*##G#',
        '#......#',
        '########',
      ],
      success: 'the road learns the color of us.',
    },
    {
      title: 'Little trip together',
      type: 'order',
      prompt: 'tap the raleigh memories in the order the memorial block says.',
      labels: ['mochi donut', 'two of us', 'bbq chicken', 'raleigh road'],
      order: [3, 1, 0, 2],
      success: 'raleigh remembers the two of us.',
    },
    {
      title: 'My most cherished bouquet',
      type: 'bouquet',
      prompt: 'build the 3/8 bouquet: stem, flower, ribbon, then little note.',
      pieces: [
        { label: 'stem', icon: '╽' },
        { label: 'flower', icon: '✿' },
        { label: 'ribbon', icon: '∞' },
        { label: 'note', icon: '♡' },
      ],
      order: [0, 1, 2, 3],
      success: 'the bouquet blooms into the fourth key.',
    },
    {
      title: 'A quiet morning together',
      type: 'match',
      prompt: 'match the small pieces of that early morning together.',
      cards: ['school', 'coffee', 'time', 'time', 'school', 'coffee'],
      success: 'the cfcc morning stays with us.',
    },
    {
      title: 'Wandering through the queen city',
      prompt: 'move the queen across queen city. collect the crowns, then reach the castle.',
      type: 'queenpath',
      size: 5,
      start: [0, 4],
      crowns: [[0, 0], [2, 2], [4, 0]],
      goal: [4, 4],
      success: 'the last key opens the big memory.',
    },
  ];

  const RECOVERY_LINES = [
    'Memory recovering.',
    'Shocked by your beauty.',
    'You’ll be there.',
    'Even with the distance, we’ll find each other.',
    'You’re my life.',
    'I’ll be there for you.',
  ];

  // ---------- World map ----------
  // Tile types:
  // . = open / cloak floor
  // # = wall
  // ~ = soft dunes (decorative, walkable)
  // d = doorway threshold (walkable, drawn lighter)
  // We'll lay out a small interior + open dream landscape.
  // 30 wide × 40 tall.
  // Open dreamscape: no locked rooms. Five distinct "shrines" the player can
  // wander freely between. '~' is decorative cloak dune (still walkable),
  // '*' is a soft starfield band (decorative bright floor), 'p' is a stone
  // shrine plinth (walkable, drawn lighter), '#' is a wall (rare, used as
  // memory pedestal backing only). Six memories are spread vertically so the
  // final shrine feels like a last small climb.
  const MAP = [
    '..............................', // 0
    '..............................',
    '...~~..........s..........~~..', // 2 — star spawns here
    '..~~~~~..............~~~~~~~..',
    '.~~....~~~~......~~~~....~~~..',
    '.~........~~~~~~~~........~~..',
    '..~........................~..',
    '...~~....................~~...',
    '.....~~~~..........~~~~~......',
    '..............................',
    '..............................',
    '...........ppppppp............', // 11 — shrine 1
    '..........p...1...p...........', // memory 1 frame
    '..........p.......p...........',
    '..........p...N...p...........', // memory 1 note
    '...........ppppppp............',
    '..............................',
    '..............................',
    '...~~~~~~~~~~..~~~~~~~~~~~~...', // 18 — quiet walk path
    '..~..........**............~..',
    '..~...2..N........N...3....~..', // memory 2 + 3 (notes paired)
    '..~..........**............~..',
    '...~~~~~~~~~~~~~~~~~~~~~~~~..',
    '..............................',
    '..............................',
    '...........ppppppp............', // 25 — shrine 3 (laughing room)
    '..........p.......p...........',
    '..........p...4...p...........',
    '..........p..N....p...........',
    '...........ppppppp............',
    '..............................',
    '..............................',
    '..............~~..............',
    '....ppppppp.....~~~~~~........', // 33 — promise shrine
    '...p...5...p...~~~~~~~~.......',
    '...p..N....p....ppppppp.......',
    '....ppppppp....p...6...p......',
    '...............p..N....p......',
    '................ppppppp.......',
  ];
  // Confirm dimensions match (silently pad/truncate)
  while (MAP.length < ROWS) MAP.push('.'.repeat(COLS));
  for (let r = 0; r < MAP.length; r++) {
    if (MAP[r].length < COLS) MAP[r] = MAP[r] + '.'.repeat(COLS - MAP[r].length);
    if (MAP[r].length > COLS) MAP[r] = MAP[r].slice(0, COLS);
  }

  // ---------- Interactables (parsed from MAP) ----------
  // Each memory has one note and one frame. The first star appears at 's'.
  // Player must read note first → frame becomes interactable → unlock memory.
  // For memory 1 there's an extra step: chase the star to its drop-spot first
  // (the star teleports a few times around it).
  const interactables = []; // { kind, memIdx, col, row, used }
  let starSpawn = { col: 15, row: 7 };
  // Track per-memory note/frame positions in declaration order
  // We'll map encoded chars to memory indices: notes are encoded with N+order-of-appearance.
  // Simpler: assign in scan order matching memory order: walk MAP rows top→bottom; group notes per memory area.
  // To get correct pairing we'll assign manually:
  const notePositions = [];   // 6 entries
  const framePositions = [];  // 6 entries by their digit in map
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const ch = MAP[r][c];
      if (ch === 's') starSpawn = { col: c, row: r };
      if (ch >= '1' && ch <= '6') framePositions[parseInt(ch, 10) - 1] = { col: c, row: r };
    }
  }
  // Collect notes in row order; first 1 note maps to memory 1, etc. The MAP places notes
  // adjacent to their frames so the natural reading order matches memory index.
  const noteScan = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (MAP[r][c] === 'N') noteScan.push({ col: c, row: r });
  for (let i = 0; i < NUM_MEMORIES; i++) notePositions[i] = noteScan[i] || { col: 1 + i, row: 1 };

  for (let i = 0; i < NUM_MEMORIES; i++) {
    interactables.push({ kind: 'note', memIdx: i, col: notePositions[i].col, row: notePositions[i].row, used: false });
    interactables.push({ kind: 'frame', memIdx: i, col: framePositions[i].col, row: framePositions[i].row, used: false });
  }

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const canvas = $('#game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const screens = {
    start: $('#start-screen'),
    how: $('#how-screen'),
    intro: $('#intro-screen'),
    note: $('#note-screen'),
    unlock: $('#unlock-screen'),
    journal: $('#journal-screen'),
    memoryView: $('#memory-view'),
    puzzle: $('#puzzle-screen'),
    finalPuzzle: $('#final-puzzle-screen'),
    help: $('#help-screen'),
    finalCutscene: $('#final-cutscene-screen'),
    ending: $('#ending-screen'),
    videoEnding: $('#video-ending-screen'),
  };
  const hud = $('#hud');
  const controls = $('#controls');
  const promptEl = $('#prompt');
  const memHaveEl = $('#mem-have');
  const keyHaveEl = $('#key-have');
  const finalPuzzleCanvas = $('#final-puzzle-canvas');
  const finalPuzzleCtx = finalPuzzleCanvas.getContext('2d');
  finalPuzzleCtx.imageSmoothingEnabled = false;
  const finalPuzzleHelpEl = $('#final-puzzle-help');

  const FINAL_MAZE = [
    '#####################',
    '#S..#.....#...#.....#',
    '#...#.....#...#..#..#',
    '#......#......#.....#',
    '#.###..#..#.##...##.#',
    '#......#..#.........#',
    '#.........#.........#',
    '###############.#####',
    '#..#..#...#..#......#',
    '#.....#...#..#..###.#',
    '#..##...#.#.........#',
    '#.......#......#....#',
    '#..#......#.#..#....#',
    '#.........#.........#',
    '#####.###############',
    '#..#......#..#......#',
    '#..#..###.#..#..##..#',
    '#...................#',
    '#....##...#.#..##...#',
    '#.........#........G#',
    '#####################',
  ];
  const FINAL_MAZE_SIZE = 21;
  const FINAL_MAZE_CELL = 8;
  const FINAL_MAZE_OFFSET = { x: 6, y: 64 };
  const FINAL_QR_PATTERN = [
    '11111110010111111',
    '10000010010100001',
    '10111010110101101',
    '10111010000101101',
    '10111010110101101',
    '10000010100100001',
    '11111110101111111',
    '00000000100000000',
    '11101011101110101',
    '00111000100010110',
    '10101110111011101',
    '00100010001000100',
    '11111110101111111',
    '10000010001100001',
    '10111011111011101',
    '10000010100000001',
    '11111110101111111',
  ];
  const FINAL_MEMORY_KEYS = [
    { shape: 'bouquet', label: 'bouquet', clears: 0 },
    { shape: 'bell', label: 'Christmas bell', clears: 1 },
    { shape: 'queen', label: 'queen chess', clears: 2 },
    { shape: 'donut', label: 'matcha donut', clears: 3 },
    { shape: 'fireworks', label: 'fireworks', clears: 4 },
    { shape: 'coffee', label: 'coffee cup', clears: 5 },
  ];
  const FINAL_SPIKES = [
    { col: 10, row: 3, key: 0 },
    { col: 15, row: 7, key: 1 },
    { col: 10, row: 11, key: 2 },
    { col: 5, row: 14, key: 3 },
    { col: 10, row: 17, key: 4 },
    { col: 18, row: 19, key: 5 },
  ];
  const FINAL_FIELDS = [
    {
      name: 'bouquet field',
      shape: 'bouquet',
      tint: '#15101f',
      accent: '#fff7df',
      tiles: [[1, 1, 9, 6]],
      keySpawns: [[8, 6], [5, 1], [8, 2], [1, 5], [6, 6]],
    },
    {
      name: 'Christmas bell field',
      shape: 'bell',
      tint: '#15101f',
      accent: '#fff7df',
      tiles: [[11, 1, 19, 6]],
      keySpawns: [[12, 2], [16, 1], [19, 2], [15, 5], [19, 6]],
    },
    {
      name: 'queen field',
      shape: 'queen',
      tint: '#15101f',
      accent: '#fff7df',
      tiles: [[11, 8, 19, 13]],
      keySpawns: [[12, 9], [18, 8], [14, 10], [12, 13], [19, 13]],
    },
    {
      name: 'matcha mochi field',
      shape: 'donut',
      tint: '#15101f',
      accent: '#fff7df',
      tiles: [[1, 8, 9, 13]],
      keySpawns: [[2, 9], [5, 9], [1, 12], [7, 13], [9, 13]],
    },
    {
      name: 'fireworks field',
      shape: 'fireworks',
      tint: '#15101f',
      accent: '#fff7df',
      tiles: [[1, 15, 9, 19]],
      keySpawns: [[2, 16], [4, 15], [8, 15], [2, 19], [9, 19]],
    },
    {
      name: 'coffee field',
      shape: 'coffee',
      tint: '#15101f',
      accent: '#fff7df',
      tiles: [[11, 15, 19, 19]],
      keySpawns: [[12, 16], [15, 15], [19, 16], [14, 19], [17, 19]],
    },
  ];
  const finalPuzzle = {
    phase: 'maze',
    player: { col: 1, row: 1 },
    moveCooldown: 0,
    revealTimer: 0,
    scan: { x: 42, y: 212 },
    scanTarget: { x: 90, y: 170, r: 18 },
    scanReady: false,
    keys: Array(6).fill(false),
    keySpawns: [],
    collectedCount: 0,
    shapeFlash: null,
    promptHold: 0,
  };

  // ---------- State ----------
  const State = {
    mode: 'start',          // 'start' | 'intro' | 'play' | 'modal' | 'ending'
    stage: 0,               // 0..6 — number of memories unlocked
    unlocked: Array(NUM_MEMORIES).fill(false),
    starVisible: true,      // first star is the lead-in
    starHopsLeft: 3,        // first-spark "chase" puzzle
    starPos: { x: starSpawn.col * TILE + TILE / 2, y: starSpawn.row * TILE + TILE / 2 },
    memoryReadiness: Array(NUM_MEMORIES).fill(0), // 0 = not started, 1 = puzzle solved (frame ready), 2 = unlocked
    puzzleSolved: Array(NUM_MEMORIES).fill(false),
    memoryBuildings: Array(NUM_MEMORIES).fill(null),
    keys: 0,
    finalPuzzleStarted: false,
    finalPuzzleSolved: false,
    nearInteractable: null, // current interactable in range
    cameraX: 0,
    cameraY: 0,
    time: 0,
    petals: [],             // ambient particles
    customPhotos: Array(NUM_MEMORIES).fill(null),
    customFinalPicture: null,
    customVideo: null,
  };

  // Apply initial palette on <html>
  document.documentElement.setAttribute('data-stage', String(State.stage));

  // ---------- Player ----------
  const player = {
    x: 15 * TILE + TILE / 2,
    y: 5 * TILE + TILE / 2,
    w: 8,
    h: 10,
    vx: 0, vy: 0,
    facing: 'down',         // up/down/left/right
    walkFrame: 0,
    walkTimer: 0,
    moving: false,
  };
  // Reset spawn just below the star
  player.x = starSpawn.col * TILE + TILE / 2;
  player.y = (starSpawn.row + 4) * TILE + TILE / 2;

  // ---------- Input ----------
  const Input = {
    keys: {},
    dpad: { up: false, down: false, left: false, right: false },
    actionPressed: false,
    init() {
      window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
        if (activePuzzleState && State.mode === 'modal') {
          const puzzleDir = ({
            arrowup: 'up', w: 'up',
            arrowdown: 'down', s: 'down',
            arrowleft: 'left', a: 'left',
            arrowright: 'right', d: 'right',
          })[k];
          if (puzzleDir) {
            movePuzzle(puzzleDir);
            return;
          }
        }
        this.keys[k] = true;
        if (k === ' ' || k === 'enter' || k === 'e') this.actionPressed = true;
        if (k === 'escape') { closeAllModals(); }
      });
      window.addEventListener('keyup', (e) => {
        this.keys[e.key.toLowerCase()] = false;
      });

      // D-pad: support touchstart/end + mouse for desktop too
      document.querySelectorAll('.dpad-btn').forEach((btn) => {
        const dir = btn.dataset.dir;
        const press = (e) => { e.preventDefault(); this.dpad[dir] = true; btn.classList.add('active'); };
        const release = (e) => { e.preventDefault(); this.dpad[dir] = false; btn.classList.remove('active'); };
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
        btn.addEventListener('touchcancel', release, { passive: false });
        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
      });
      const actionBtn = $('#action-btn');
      const actionPress = (e) => { e.preventDefault(); this.actionPressed = true; };
      actionBtn.addEventListener('touchstart', actionPress, { passive: false });
      actionBtn.addEventListener('click', actionPress);

      document.querySelectorAll('[data-puzzle-move]').forEach((btn) => {
        const dir = btn.dataset.puzzleMove;
        const press = (e) => { e.preventDefault(); movePuzzle(dir); };
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('click', press);
      });
    },
    moveDir() {
      let dx = 0, dy = 0;
      if (this.keys['arrowleft'] || this.keys['a'] || this.dpad.left)  dx -= 1;
      if (this.keys['arrowright']|| this.keys['d'] || this.dpad.right) dx += 1;
      if (this.keys['arrowup']   || this.keys['w'] || this.dpad.up)    dy -= 1;
      if (this.keys['arrowdown'] || this.keys['s'] || this.dpad.down)  dy += 1;
      // Normalize diagonal
      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }
      return { dx, dy };
    },
    consumeAction() { const v = this.actionPressed; this.actionPressed = false; return v; },
  };
  Input.init();

  // ---------- Collision ----------
  function tileAt(px, py) {
    const c = Math.floor(px / TILE), r = Math.floor(py / TILE);
    if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return '#';
    return MAP[r][c];
  }
  function solidAt(px, py) {
    // Open dreamscape — nothing in the world map is solid. Memory pedestals
    // are still walkable; the player can stand right at the frame. The world
    // boundary clamp keeps them on screen.
    const ch = tileAt(px, py);
    return false; // no walls
  }

  // ---------- Star (lead-in puzzle) ----------
  function moveStarRandomly() {
    // Hop within a small ring relative to player to keep the chase doable
    const tries = 16;
    for (let i = 0; i < tries; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 24 + Math.random() * 32;
      const x = player.x + Math.cos(angle) * dist;
      const y = player.y + Math.sin(angle) * dist;
      if (x > 8 && x < WORLD_W - 8 && y > 8 && y < WORLD_H - 8 && !solidAt(x, y)) {
        State.starPos.x = x;
        State.starPos.y = y;
        return;
      }
    }
  }

  // ---------- Petals / particles ----------
  function spawnPetal() {
    State.petals.push({
      x: Math.random() * WORLD_W,
      y: Math.random() * WORLD_H,
      vx: -4 + Math.random() * 8,
      vy: 6 + Math.random() * 10,
      life: 4 + Math.random() * 3,
      maxLife: 6,
      color: Math.random() < 0.5 ? STAGES[State.stage].rose : STAGES[State.stage].violet,
      size: Math.random() < 0.7 ? 1 : 2,
    });
  }
  function updatePetals(dt) {
    const s = STAGES[State.stage];
    if (s.petals) {
      // Maintain population
      const target = State.stage >= 4 ? 40 : 20;
      while (State.petals.length < target) spawnPetal();
    } else {
      State.petals.length = 0;
    }
    for (let i = State.petals.length - 1; i >= 0; i--) {
      const p = State.petals[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0 || p.y > WORLD_H + 8) State.petals.splice(i, 1);
    }
  }

  // ---------- Update loop ----------
  function update(dt) {
    State.time += dt;
    if (State.mode === 'finalPuzzle') {
      updateFinalPuzzle(dt);
      return;
    }
    if (State.mode !== 'play') return;

    // Movement
    const { dx, dy } = Input.moveDir();
    const speed = 56; // px/s on the 180x320 canvas
    let nx = player.x + dx * speed * dt;
    let ny = player.y + dy * speed * dt;
    // Tile-based collision (test small bounding box corners)
    const half = 3;
    const tryX = nx, tryY = player.y;
    if (!solidAt(tryX - half, tryY - half) && !solidAt(tryX + half, tryY - half) &&
        !solidAt(tryX - half, tryY + half) && !solidAt(tryX + half, tryY + half)) {
      player.x = Math.max(half, Math.min(WORLD_W - half, tryX));
    }
    const tryY2 = ny;
    if (!solidAt(player.x - half, tryY2 - half) && !solidAt(player.x + half, tryY2 - half) &&
        !solidAt(player.x - half, tryY2 + half) && !solidAt(player.x + half, tryY2 + half)) {
      player.y = Math.max(half, Math.min(WORLD_H - half, tryY2));
    }
    player.moving = (dx !== 0 || dy !== 0);
    if (player.moving) {
      if (Math.abs(dx) > Math.abs(dy)) player.facing = dx > 0 ? 'right' : 'left';
      else player.facing = dy > 0 ? 'down' : 'up';
      player.walkTimer += dt;
      if (player.walkTimer > 0.15) {
        player.walkTimer = 0;
        player.walkFrame = (player.walkFrame + 1) % 4;
      }
    } else {
      player.walkFrame = 0;
    }

    // Camera follow (lock to integers to avoid sub-pixel shimmer)
    const targetCX = player.x - VIEW_W / 2;
    const targetCY = player.y - VIEW_H / 2;
    State.cameraX = Math.max(0, Math.min(WORLD_W - VIEW_W, targetCX));
    State.cameraY = Math.max(0, Math.min(WORLD_H - VIEW_H, targetCY));

    // Star chase (first spark)
    if (State.starVisible) {
      const dxs = State.starPos.x - player.x, dys = State.starPos.y - player.y;
      const d = Math.sqrt(dxs * dxs + dys * dys);
      if (d < 10) {
        // Hop, then on last hop drop the note (memory 1) where the star vanished.
        if (State.starHopsLeft > 0) {
          State.starHopsLeft -= 1;
          moveStarRandomly();
          showFloat('the light flickers away…');
        } else {
          // Star settles: it has guided us. Mark memory 1's note position to the current star spot.
          State.starVisible = false;
          // Move note 1 to the star's last position for narrative cohesion
          const noteInt = interactables.find((it) => it.kind === 'note' && it.memIdx === 0);
          if (noteInt) {
            noteInt.col = Math.floor(State.starPos.x / TILE);
            noteInt.row = Math.floor(State.starPos.y / TILE);
          }
          showFloat('the star left something behind.');
        }
      }
    }

    // Find nearest interactable in range
    State.nearInteractable = null;
    let bestD = 999;
    for (const it of interactables) {
      if (it.used) continue;
      // Gating rules:
      //   note can always be read if memoryReadiness[memIdx] === 0
      //   frame requires readiness === 1
      const readiness = State.memoryReadiness[it.memIdx];
      if (it.kind === 'note' && readiness !== 0) continue;
      if (it.kind === 'frame' && readiness !== 1) continue;
      // Memory 1's note also requires the star sequence to be done
      if (it.memIdx === 0 && it.kind === 'note' && State.starVisible) continue;

      const cx = it.col * TILE + TILE / 2;
      const cy = it.row * TILE + TILE / 2;
      const d = Math.hypot(player.x - cx, player.y - cy);
      if (d < 12 && d < bestD) { bestD = d; State.nearInteractable = it; }
    }

    // Prompt
    if (State.nearInteractable) {
      const it = State.nearInteractable;
      const label =
        it.kind === 'note'  ? '✦ memorial'   :
        it.kind === 'frame' ? '✦ unlock' :
        '✦ interact';
      promptEl.textContent = label;
      promptEl.classList.remove('hidden');
    } else {
      promptEl.classList.add('hidden');
    }

    // Action input
    if (Input.consumeAction()) {
      if (State.nearInteractable) {
        triggerInteract(State.nearInteractable);
      }
    }

    // Petals
    updatePetals(dt);
  }

  // ---------- Floating world text ----------
  let floatText = null;
  function showFloat(text, ms = 1800) {
    floatText = { text, life: ms / 1000, max: ms / 1000 };
  }
  function randomRecoveryLine() {
    return RECOVERY_LINES[Math.floor(Math.random() * RECOVERY_LINES.length)];
  }
  function shuffleList(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function makeLightChoiceOrder(puzzle) {
    const all = puzzle.bulbs.map((_, idx) => idx);
    if (!puzzle.randomizeChoices) return all;
    const badmintonIdx = puzzle.bulbs.findIndex((label) => label.toLowerCase() === 'badminton');
    const rest = shuffleList(all.filter((idx) => idx !== badmintonIdx));
    if (badmintonIdx < 0) return shuffleList(all);
    const insertAt = 3 + Math.floor(Math.random() * 2);
    rest.splice(insertAt, 0, badmintonIdx);
    return rest;
  }

  // ---------- Final maze + dream QR puzzle ----------
  function resetFinalPuzzle() {
    finalPuzzle.phase = 'maze';
    finalPuzzle.player.col = 1;
    finalPuzzle.player.row = 1;
    finalPuzzle.moveCooldown = 0;
    finalPuzzle.revealTimer = 0;
    finalPuzzle.scan.x = 42;
    finalPuzzle.scan.y = 212;
    finalPuzzle.scanReady = false;
    finalPuzzle.keys = Array(6).fill(false);
    finalPuzzle.keySpawns = FINAL_FIELDS.map((field) => {
      const choices = field.keySpawns || [];
      const pick = choices[Math.floor(Math.random() * choices.length)] || [1, 1];
      return { col: pick[0], row: pick[1] };
    });
    finalPuzzle.collectedCount = 0;
    finalPuzzle.shapeFlash = null;
    finalPuzzle.promptHold = 0;
    if (finalPuzzleHelpEl) finalPuzzleHelpEl.textContent = 'find the key in each field. each key opens that field’s spike gate.';
  }

  function openFinalPuzzleIntro(onDone = openFinalPuzzle) {
    State.mode = 'cutscene';
    hud.classList.add('hidden');
    controls.classList.add('hidden');
    promptEl.classList.add('hidden');
    screens.start.classList.add('hidden');
    screens.how.classList.add('hidden');
    screens.intro.classList.add('hidden');
    screens.finalPuzzle.classList.add('hidden');
    screens.ending.classList.add('hidden');
    screens.videoEnding.classList.add('hidden');
    screens.finalCutscene.classList.remove('hidden');
    runFinalPuzzleIntro(() => {
      screens.finalCutscene.classList.add('hidden');
      onDone();
    });
  }

  function runFinalPuzzleIntro(onDone) {
    const cc = $('#final-cutscene-canvas');
    const cx = cc.getContext('2d');
    cx.imageSmoothingEnabled = false;
    const text = $('#final-cutscene-text');
    let elapsed = 0;
    let last = performance.now();
    let stopped = false;
    screens.finalCutscene.classList.remove('whiteout');

    function step() {
      if (stopped) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const shake = elapsed < 2.15 ? Math.round(Math.sin(elapsed * 54) * (3 - elapsed)) : 0;
      cx.save();
      cx.translate(shake, -shake);
      const bg = cx.createLinearGradient(0, 0, 0, 320);
      bg.addColorStop(0, '#130b27');
      bg.addColorStop(0.55, '#05040c');
      bg.addColorStop(1, '#000');
      cx.fillStyle = bg;
      cx.fillRect(-8, -8, 196, 336);
      for (let i = 0; i < 70; i++) {
        cx.globalAlpha = elapsed < 2.1 ? 0.28 + Math.sin(elapsed * 10 + i) * 0.12 : Math.max(0, 0.3 - (elapsed - 2.1) * 0.45);
        cx.fillStyle = i % 6 === 0 ? '#ffe072' : '#d7ccff';
        cx.fillRect((i * 29 + Math.floor(elapsed * 9)) % 180, (i * 43) % 320, 1, 1);
      }
      cx.globalAlpha = 1;

      if (elapsed < 2.3) {
        cx.strokeStyle = 'rgba(255,224,114,.28)';
        cx.lineWidth = 1;
        for (let y = 52; y < 250; y += 18) {
          cx.beginPath();
          cx.moveTo(24 + Math.sin(elapsed * 20 + y) * 4, y);
          cx.lineTo(156 + Math.cos(elapsed * 19 + y) * 4, y + 3);
          cx.stroke();
        }
        drawRunner(cx, 90, 188, false, elapsed);
        text.textContent = 'the dream starts shaking.';
      } else {
        cx.fillStyle = '#000';
        cx.fillRect(-8, -8, 196, 336);
        const fallP = Math.min(1, Math.max(0, (elapsed - 2.55) / 2.6));
        const y = 74 + fallP * 210;
        const spin = Math.sin(elapsed * 10) * (1 - fallP) * 0.55;
        cx.save();
        cx.translate(90, y);
        cx.rotate(spin);
        drawRunner(cx, 0, 0, false, elapsed);
        cx.restore();
        for (let s = 0; s < 18; s++) {
          cx.globalAlpha = 0.16 + 0.16 * Math.sin(elapsed * 6 + s);
          cx.fillStyle = '#d7ccff';
          cx.fillRect((s * 37) % 180, (elapsed * 42 + s * 21) % 320, 1, 7);
        }
        cx.globalAlpha = 1;
        text.textContent = '';
      }
      cx.restore();

      if (elapsed >= 5.45) {
        stopped = true;
        text.textContent = '';
        onDone();
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function openFinalPuzzle() {
    if (State.finalPuzzleSolved) return openHeartFrameCutscene(openEnding);
    State.mode = 'finalPuzzle';
    State.finalPuzzleStarted = true;
    resetFinalPuzzle();
    screens.start.classList.add('hidden');
    screens.how.classList.add('hidden');
    screens.intro.classList.add('hidden');
    screens.ending.classList.add('hidden');
    screens.videoEnding.classList.add('hidden');
    screens.finalCutscene.classList.add('hidden');
    screens.finalPuzzle.classList.remove('hidden');
    hud.classList.add('hidden');
    controls.classList.remove('hidden');
    promptEl.textContent = 'final maze';
    promptEl.classList.remove('hidden');
    renderFinalPuzzle();
  }

  function isFinalMazeOpen(col, row) {
    if (row < 0 || row >= FINAL_MAZE.length || col < 0 || col >= FINAL_MAZE[row].length) return false;
    if (FINAL_MAZE[row][col] === '#') return false;
    return !isFinalSpikeActive(col, row);
  }

  function getFinalSpike(col, row) {
    return FINAL_SPIKES.find((spike) => spike.col === col && spike.row === row) || null;
  }

  function isFinalSpikeActive(col, row) {
    const spike = getFinalSpike(col, row);
    return !!spike && !finalPuzzle.keys[spike.key];
  }

  function collectFinalMemoryKey(col, row) {
    const idx = finalPuzzle.keySpawns.findIndex((spot, i) => !finalPuzzle.keys[i] && spot.col === col && spot.row === row);
    if (idx < 0) return;
    const key = FINAL_MEMORY_KEYS[idx];
    finalPuzzle.keys[idx] = true;
    finalPuzzle.collectedCount = finalPuzzle.keys.filter(Boolean).length;
    finalPuzzle.shapeFlash = { shape: key.shape, label: key.label, time: 1.65, star: true };
    holdFinalPuzzlePrompt(`${key.label} recovered. it becomes a star and lights your way.`, 1.45);
  }

  function updateFinalPuzzle(dt) {
    finalPuzzle.moveCooldown = Math.max(0, finalPuzzle.moveCooldown - dt);
    finalPuzzle.promptHold = Math.max(0, finalPuzzle.promptHold - dt);
    if (finalPuzzle.shapeFlash) {
      finalPuzzle.shapeFlash.time -= dt;
      if (finalPuzzle.shapeFlash.time <= 0) finalPuzzle.shapeFlash = null;
    }
    if (finalPuzzle.phase === 'maze') {
      const { dx, dy } = Input.moveDir();
      if (finalPuzzle.moveCooldown <= 0 && (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15)) {
        const stepX = Math.abs(dx) > Math.abs(dy) ? Math.sign(dx) : 0;
        const stepY = stepX === 0 ? Math.sign(dy) : 0;
        const nc = finalPuzzle.player.col + stepX;
        const nr = finalPuzzle.player.row + stepY;
        if (isFinalMazeOpen(nc, nr)) {
          finalPuzzle.player.col = nc;
          finalPuzzle.player.row = nr;
          collectFinalMemoryKey(nc, nr);
          if (FINAL_MAZE[nr][nc] === 'G') startFinalPuzzleReveal();
        } else {
          holdFinalPuzzlePrompt(isFinalSpikeActive(nc, nr) ? 'this spike seals the next part. find this part’s key.' : 'a wall of the dream pushes back.', 0.7);
        }
        finalPuzzle.moveCooldown = 0.12;
      }
      showFinalPuzzlePrompt(`memory stars: ${finalPuzzle.collectedCount}/6. each star opens its spike gate.`);
    } else if (finalPuzzle.phase === 'reveal') {
      finalPuzzle.revealTimer += dt;
      showFinalPuzzlePrompt('the path becomes a code.');
      if (finalPuzzle.revealTimer > 3.2) {
        finalPuzzle.phase = 'scan';
        finalPuzzle.revealTimer = 0;
        showFinalPuzzlePrompt('move the camera frame. press ✦ to scan.');
      }
    } else if (finalPuzzle.phase === 'scan') {
      const { dx, dy } = Input.moveDir();
      finalPuzzle.scan.x = Math.max(28, Math.min(152, finalPuzzle.scan.x + dx * 64 * dt));
      finalPuzzle.scan.y = Math.max(104, Math.min(246, finalPuzzle.scan.y + dy * 64 * dt));
      const d = Math.hypot(finalPuzzle.scan.x - finalPuzzle.scanTarget.x, finalPuzzle.scan.y - finalPuzzle.scanTarget.y);
      finalPuzzle.scanReady = d < finalPuzzle.scanTarget.r;
      showFinalPuzzlePrompt(finalPuzzle.scanReady ? 'code found. press ✦ to scan.' : 'search for the dream code.');
      const scanning = Input.consumeAction();
      if (scanning && finalPuzzle.scanReady) completeFinalPuzzle();
      else if (scanning) showFinalPuzzlePrompt('not here. keep looking.');
    }
  }

  function showFinalPuzzlePrompt(text) {
    if (finalPuzzle.promptHold > 0) return;
    promptEl.textContent = text;
    promptEl.classList.add('hidden');
    if (finalPuzzleHelpEl) {
      finalPuzzleHelpEl.textContent = text;
      finalPuzzleHelpEl.classList.toggle('is-hidden', finalPuzzle.phase === 'maze');
    }
  }

  function holdFinalPuzzlePrompt(text, seconds) {
    promptEl.textContent = text;
    promptEl.classList.add('hidden');
    if (finalPuzzleHelpEl) {
      finalPuzzleHelpEl.textContent = text;
      finalPuzzleHelpEl.classList.toggle('is-hidden', finalPuzzle.phase === 'maze');
    }
    finalPuzzle.promptHold = seconds;
  }

  function startFinalPuzzleReveal() {
    finalPuzzle.phase = 'reveal';
    finalPuzzle.revealTimer = 0;
    showFinalPuzzlePrompt('you found the way out.');
  }

  function completeFinalPuzzle() {
    if (State.finalPuzzleSolved) return;
    State.finalPuzzleSolved = true;
    finalPuzzle.phase = 'complete';
    showFinalPuzzlePrompt('scanned.');
    setTimeout(() => {
      screens.finalPuzzle.classList.add('hidden');
      controls.classList.add('hidden');
      promptEl.classList.add('hidden');
      openHeartFrameCutscene(openEnding);
    }, 550);
  }

  // ---------- Interact ----------
  function triggerInteract(it) {
    if (it.kind === 'note') {
      const mem = MEMORIES[it.memIdx];
      openNote(mem, () => {
        it.used = true;
        openPuzzle(it.memIdx);
      });
    } else if (it.kind === 'frame') {
      const mem = MEMORIES[it.memIdx];
      it.used = true;
      State.memoryReadiness[it.memIdx] = 2;
      State.unlocked[it.memIdx] = true;
      State.keys = State.unlocked.filter(Boolean).length;
      // STAGE advance!
      State.stage = Math.min(NUM_MEMORIES, State.unlocked.filter(Boolean).length);
      document.documentElement.setAttribute('data-stage', String(State.stage));
      memHaveEl.textContent = String(State.unlocked.filter(Boolean).length);
      keyHaveEl.textContent = String(State.keys);
      openUnlock(mem, it.memIdx);
    }
  }

  // ---------- UI: Note modal ----------
  let noteOnClose = null;
  let noteReturnMode = 'play';
  function openNote(mem, onClose, returnMode = 'play') {
    State.mode = 'modal';
    noteReturnMode = returnMode;
    $('#note-title').textContent = `memorial block · ${mem.title}`;
    $('#note-body').textContent = mem.note;
    screens.note.style.zIndex = '40';
    screens.note.classList.remove('hidden');
    noteOnClose = onClose;
  }
  $('#note-close').addEventListener('click', () => {
    screens.note.classList.add('hidden');
    screens.note.style.zIndex = '';
    State.mode = noteReturnMode;
    noteReturnMode = 'play';
    if (noteOnClose) { const cb = noteOnClose; noteOnClose = null; cb(); }
  });

  // ---------- UI: Memory puzzles ----------
  let activePuzzleIdx = -1;
  let activePuzzleState = null;
  function openPuzzle(memIdx) {
    State.mode = 'modal';
    activePuzzleIdx = memIdx;
    const puzzle = PUZZLES[memIdx];
    $('#puzzle-title').textContent = puzzle.title;
    $('#puzzle-prompt').textContent = puzzle.prompt;
    $('#puzzle-feedback').textContent = 'memorial block = hint. solve it to wake the picture.';
    const options = $('#puzzle-options');
    options.innerHTML = '';
    options.className = 'puzzle-options';
    activePuzzleState = makePuzzleState(puzzle);
    renderPuzzle();
    screens.puzzle.classList.remove('hidden');
  }
  $('#puzzle-reread').addEventListener('click', () => {
    if (activePuzzleIdx < 0) return;
    openNote(MEMORIES[activePuzzleIdx], null, 'modal');
  });

  function makePuzzleState(puzzle) {
    if (puzzle.type === 'maze') {
      const rows = puzzle.map.map((row) => row.split(''));
      let px = 1, py = 1, need = 0;
      rows.forEach((row, y) => row.forEach((tile, x) => {
        if (tile === 'S') { px = x; py = y; rows[y][x] = '.'; }
        if (tile === '*') need++;
      }));
      return { type: 'maze', rows, px, py, collected: 0, need, complete: false };
    }
    if (puzzle.type === 'sequence') return { type: 'sequence', progress: 0, complete: false };
    if (puzzle.type === 'lightline') {
      const choiceOrder = makeLightChoiceOrder(puzzle);
      return { type: 'lightline', progress: 0, lit: [], choiceOrder, complete: false };
    }
    if (puzzle.type === 'order') return { type: 'order', progress: 0, picked: [], complete: false };
    if (puzzle.type === 'bouquet') return { type: 'bouquet', progress: 0, picked: [], complete: false };
    if (puzzle.type === 'switches') return { type: 'switches', switches: [...puzzle.switches], complete: false };
    if (puzzle.type === 'match') {
      return {
        type: 'match',
        cards: puzzle.cards.map((value, i) => ({ value, i, open: false, matched: false })),
        open: [],
        locked: false,
        complete: false,
      };
    }
    if (puzzle.type === 'constellation') return { type: 'constellation', progress: 0, complete: false };
    if (puzzle.type === 'queenpath') {
      return {
        type: 'queenpath',
        qx: puzzle.start[0],
        qy: puzzle.start[1],
        crowns: puzzle.crowns.map(([x, y]) => ({ x, y, got: false })),
        complete: false,
      };
    }
    return { type: 'unknown', complete: false };
  }

  function renderPuzzle() {
    if (!activePuzzleState) return;
    if (activePuzzleState.type === 'maze') return renderPuzzleGrid();
    const puzzle = PUZZLES[activePuzzleIdx];
    const options = $('#puzzle-options');
    options.innerHTML = '';
    options.className = `puzzle-options ${activePuzzleState.type}-mode`;

    if (activePuzzleState.type === 'sequence') {
      const guide = document.createElement('div');
      guide.className = 'puzzle-progress';
      guide.textContent = `rhythm: ${puzzle.symbols.map((s, i) => i < activePuzzleState.progress ? s : '□').join('  ')}`;
      options.appendChild(guide);
      puzzle.choices.forEach((symbol) => {
        const btn = document.createElement('button');
        btn.className = 'puzzle-option';
        btn.textContent = symbol;
        btn.addEventListener('click', () => chooseSequence(symbol));
        options.appendChild(btn);
      });
    }

    if (activePuzzleState.type === 'lightline') {
      const board = document.createElement('div');
      board.className = 'lightline-board';
      activePuzzleState.choiceOrder.forEach((idx, visualIdx) => {
        const label = puzzle.bulbs[idx];
        const btn = document.createElement('button');
        btn.className = 'light-bulb'
          + (activePuzzleState.lit.includes(idx) ? ' lit' : '')
          + (visualIdx >= 3 ? ' wide' : '')
          + (label.toLowerCase() === 'badminton' ? ' long-label' : '');
        btn.dataset.lightIdx = String(idx);
        btn.innerHTML = `<span class="bulb-glow">✦</span><small>${label}</small>`;
        btn.addEventListener('click', () => chooseLight(idx));
        board.appendChild(btn);
      });
      options.appendChild(board);
      const guide = document.createElement('div');
      guide.className = 'puzzle-progress';
      guide.textContent = `${activePuzzleState.progress}/${puzzle.order.length} lights blinking`;
      options.appendChild(guide);
    }

    if (activePuzzleState.type === 'order') {
      puzzle.labels.forEach((label, idx) => {
        const btn = document.createElement('button');
        btn.className = 'puzzle-option' + (activePuzzleState.picked.includes(idx) ? ' correct' : '');
        btn.textContent = label;
        btn.disabled = activePuzzleState.picked.includes(idx);
        btn.addEventListener('click', () => chooseOrder(idx));
        options.appendChild(btn);
      });
      const guide = document.createElement('div');
      guide.className = 'puzzle-progress';
      guide.textContent = `${activePuzzleState.progress}/${puzzle.order.length} echoes awake`;
      options.appendChild(guide);
    }

    if (activePuzzleState.type === 'bouquet') {
      const vase = document.createElement('div');
      const isFullBouquet = activePuzzleState.complete || activePuzzleState.picked.length >= puzzle.order.length;
      vase.className = 'bouquet-vase' + (isFullBouquet ? ' full-flower' : '');
      const pickedIcons = activePuzzleState.picked.map((idx) => puzzle.pieces[idx].icon).join(' ');
      vase.innerHTML = isFullBouquet
        ? `<div class="full-flower-shape" aria-label="completed flower">
            <span class="petal p1">✿</span>
            <span class="petal p2">✿</span>
            <span class="petal p3">✿</span>
            <span class="petal p4">✿</span>
            <span class="flower-heart">♡</span>
            <span class="flower-ribbon">∞</span>
            <span class="flower-stem">╲╱</span>
          </div>`
        : `<div class="bouquet-bloom">${pickedIcons || '⋯'}</div><div class="bouquet-stem">╲╱</div>`;
      options.appendChild(vase);
      const board = document.createElement('div');
      board.className = 'bouquet-board';
      puzzle.pieces.forEach((piece, idx) => {
        const btn = document.createElement('button');
        btn.className = 'bouquet-piece' + (activePuzzleState.picked.includes(idx) ? ' picked' : '');
        btn.disabled = activePuzzleState.picked.includes(idx);
        btn.innerHTML = `<span>${piece.icon}</span><small>${piece.label}</small>`;
        btn.addEventListener('click', () => chooseBouquet(idx));
        board.appendChild(btn);
      });
      options.appendChild(board);
      const guide = document.createElement('div');
      guide.className = 'puzzle-progress';
      guide.textContent = `${activePuzzleState.progress}/${puzzle.order.length} bouquet pieces`;
      options.appendChild(guide);
    }

    if (activePuzzleState.type === 'switches') {
      const board = document.createElement('div');
      board.className = 'switch-board';
      activePuzzleState.switches.forEach((on, idx) => {
        const btn = document.createElement('button');
        btn.className = 'window-switch' + (on ? ' on' : '');
        btn.textContent = on ? 'lit' : 'rain';
        btn.addEventListener('click', () => toggleWindow(idx));
        board.appendChild(btn);
      });
      options.appendChild(board);
    }

    if (activePuzzleState.type === 'match') {
      const board = document.createElement('div');
      board.className = 'match-board';
      activePuzzleState.cards.forEach((card, idx) => {
        const btn = document.createElement('button');
        btn.className = 'match-card' + (card.open || card.matched ? ' open' : '');
        btn.textContent = card.open || card.matched ? card.value : '?';
        btn.disabled = card.matched || activePuzzleState.locked || (activePuzzleState.open.length >= 2 && !card.open);
        btn.addEventListener('click', () => flipCard(idx));
        board.appendChild(btn);
      });
      options.appendChild(board);
    }

    if (activePuzzleState.type === 'constellation') {
      const sky = document.createElement('div');
      sky.className = 'constellation-board';
      puzzle.stars.forEach((star, idx) => {
        const btn = document.createElement('button');
        btn.className = 'constellation-star' + (puzzle.order.indexOf(idx) < activePuzzleState.progress ? ' connected' : '');
        btn.textContent = '✦';
        btn.style.left = `${star.x}px`;
        btn.style.top = `${star.y}px`;
        btn.addEventListener('click', () => chooseConstellation(idx));
        sky.appendChild(btn);
      });
      options.appendChild(sky);
      const guide = document.createElement('div');
      guide.className = 'puzzle-progress';
      guide.textContent = `${activePuzzleState.progress}/${puzzle.order.length} stars connected`;
      options.appendChild(guide);
    }

    if (activePuzzleState.type === 'queenpath') {
      const allCrowns = activePuzzleState.crowns.every((c) => c.got);
      const board = document.createElement('div');
      board.className = 'queen-board';
      board.style.setProperty('--queen-size', String(puzzle.size));
      for (let y = 0; y < puzzle.size; y++) {
        for (let x = 0; x < puzzle.size; x++) {
          const btn = document.createElement('button');
          const isQueen = x === activePuzzleState.qx && y === activePuzzleState.qy;
          const crown = activePuzzleState.crowns.find((c) => c.x === x && c.y === y && !c.got);
          const isGoal = x === puzzle.goal[0] && y === puzzle.goal[1];
          const legal = isQueenMove(activePuzzleState.qx, activePuzzleState.qy, x, y) && !isQueen;
          btn.className = `queen-cell ${(x + y) % 2 ? 'dark' : 'light'}${isQueen ? ' queen' : ''}${legal ? ' legal' : ''}${isGoal ? ' castle' : ''}`;
          btn.dataset.queenX = String(x);
          btn.dataset.queenY = String(y);
          btn.textContent = isQueen ? '♛' : crown ? '♕' : isGoal ? '▰' : '';
          btn.addEventListener('click', () => moveQueen(x, y));
          board.appendChild(btn);
        }
      }
      options.appendChild(board);
      const guide = document.createElement('div');
      guide.className = 'puzzle-progress';
      guide.textContent = allCrowns ? 'all crowns collected. reach the castle.' : `${activePuzzleState.crowns.filter((c) => c.got).length}/${activePuzzleState.crowns.length} crowns`;
      options.appendChild(guide);
    }
  }

  function renderPuzzleGrid() {
    if (!activePuzzleState) return;
    const options = $('#puzzle-options');
    options.innerHTML = '';
    options.className = 'puzzle-options grid-mode';
    const { rows, px, py, collected, need } = activePuzzleState;
    const board = document.createElement('div');
    board.className = 'puzzle-board';
    board.style.setProperty('--puzzle-cols', String(rows[0].length));
    rows.forEach((row, y) => row.forEach((tile, x) => {
      const cell = document.createElement('div');
      const isPlayer = x === px && y === py;
      cell.className = `puzzle-cell tile-${tile === '#' ? 'wall' : tile === '*' ? 'spark' : tile === 'G' ? 'goal' : 'floor'}${isPlayer ? ' player' : ''}`;
      cell.dataset.testid = `cell-puzzle-${activePuzzleIdx}-${x}-${y}`;
      cell.textContent = isPlayer ? '◆' : tile === '*' ? '✦' : tile === 'G' ? '▣' : tile === '#' ? '' : '·';
      board.appendChild(cell);
    }));
    const progress = document.createElement('div');
    progress.className = 'puzzle-progress';
    progress.textContent = `${collected}/${need} lights`;
    options.appendChild(board);
    options.appendChild(progress);
  }

  function movePuzzle(dir) {
    if (!activePuzzleState || activePuzzleState.complete || activePuzzleState.type !== 'maze') return;
    const deltas = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const [dx, dy] = deltas[dir] || [0, 0];
    const nx = activePuzzleState.px + dx;
    const ny = activePuzzleState.py + dy;
    const row = activePuzzleState.rows[ny];
    const tile = row && row[nx];
    if (!tile || tile === '#') {
      $('#puzzle-feedback').textContent = 'the dream wall does not move.';
      return;
    }
    activePuzzleState.px = nx;
    activePuzzleState.py = ny;
    if (tile === '*') {
      activePuzzleState.rows[ny][nx] = '.';
      activePuzzleState.collected++;
      $('#puzzle-feedback').textContent = activePuzzleState.collected === activePuzzleState.need
        ? 'all lights are awake. find the glowing frame.'
        : 'a small light joins you.';
    } else if (tile === 'G') {
      if (activePuzzleState.collected >= activePuzzleState.need) {
        completePuzzle();
        return;
      }
      $('#puzzle-feedback').textContent = 'the frame is still asleep. collect every light first.';
    } else {
      $('#puzzle-feedback').textContent = 'keep chasing the path.';
    }
    renderPuzzleGrid();
  }

  function chooseSequence(symbol) {
    if (!activePuzzleState || activePuzzleState.type !== 'sequence') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    if (symbol === puzzle.symbols[activePuzzleState.progress]) {
      activePuzzleState.progress++;
      $('#puzzle-feedback').textContent = 'the rhythm answers.';
      if (activePuzzleState.progress >= puzzle.symbols.length) return completePuzzle();
    } else {
      activePuzzleState.progress = 0;
      $('#puzzle-feedback').textContent = 'the rhythm breaks. try the hint again.';
    }
    renderPuzzle();
  }

  function chooseLight(idx) {
    if (!activePuzzleState || activePuzzleState.type !== 'lightline') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    if (idx === puzzle.order[activePuzzleState.progress]) {
      activePuzzleState.lit.push(idx);
      activePuzzleState.progress++;
      $('#puzzle-feedback').textContent = 'that light blinks with the radio.';
      if (activePuzzleState.progress >= puzzle.order.length) return completePuzzle();
    } else {
      activePuzzleState.progress = 0;
      activePuzzleState.lit = [];
      $('#puzzle-feedback').textContent = 'the blink goes off beat. follow the lights again.';
    }
    renderPuzzle();
  }

  function chooseOrder(idx) {
    if (!activePuzzleState || activePuzzleState.type !== 'order') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    if (idx === puzzle.order[activePuzzleState.progress]) {
      activePuzzleState.picked.push(idx);
      activePuzzleState.progress++;
      $('#puzzle-feedback').textContent = 'that echo wakes.';
      if (activePuzzleState.progress >= puzzle.order.length) return completePuzzle();
    } else {
      activePuzzleState.progress = 0;
      activePuzzleState.picked = [];
      $('#puzzle-feedback').textContent = 'wrong echo. the room forgets the order.';
    }
    renderPuzzle();
  }

  function chooseBouquet(idx) {
    if (!activePuzzleState || activePuzzleState.type !== 'bouquet') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    if (idx === puzzle.order[activePuzzleState.progress]) {
      activePuzzleState.picked.push(idx);
      activePuzzleState.progress++;
      $('#puzzle-feedback').textContent = 'the bouquet grows softer.';
      if (activePuzzleState.progress >= puzzle.order.length) return completePuzzle();
    } else {
      activePuzzleState.progress = 0;
      activePuzzleState.picked = [];
      $('#puzzle-feedback').textContent = 'the bouquet falls apart. start from the stem.';
    }
    renderPuzzle();
  }

  function toggleWindow(idx) {
    if (!activePuzzleState || activePuzzleState.type !== 'switches') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    puzzle.toggles[idx].forEach((i) => activePuzzleState.switches[i] = !activePuzzleState.switches[i]);
    $('#puzzle-feedback').textContent = 'the rain shifts.';
    if (activePuzzleState.switches.every(Boolean)) return completePuzzle();
    renderPuzzle();
  }

  function flipCard(idx) {
    if (!activePuzzleState || activePuzzleState.type !== 'match') return;
    if (activePuzzleState.complete || activePuzzleState.locked || activePuzzleState.open.length >= 2) return;
    const card = activePuzzleState.cards[idx];
    if (!card || card.open || card.matched) return;
    card.open = true;
    activePuzzleState.open.push(idx);
    if (activePuzzleState.open.length === 2) {
      const [a, b] = activePuzzleState.open;
      const ca = activePuzzleState.cards[a], cb = activePuzzleState.cards[b];
      if (ca.value === cb.value) {
        ca.matched = cb.matched = true;
        activePuzzleState.open = [];
        $('#puzzle-feedback').textContent = 'a pair becomes a bridge.';
        if (activePuzzleState.cards.every((c) => c.matched)) return completePuzzle();
      } else {
        $('#puzzle-feedback').textContent = 'not the same memory. look again.';
        activePuzzleState.locked = true;
        setTimeout(() => {
          if (!activePuzzleState || activePuzzleState.type !== 'match') return;
          ca.open = false;
          cb.open = false;
          activePuzzleState.open = [];
          activePuzzleState.locked = false;
          renderPuzzle();
        }, 550);
      }
    }
    renderPuzzle();
  }

  function isQueenMove(fromX, fromY, toX, toY) {
    if (fromX === toX && fromY === toY) return false;
    return fromX === toX || fromY === toY || Math.abs(fromX - toX) === Math.abs(fromY - toY);
  }

  function moveQueen(x, y) {
    if (!activePuzzleState || activePuzzleState.type !== 'queenpath') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    if (!isQueenMove(activePuzzleState.qx, activePuzzleState.qy, x, y)) {
      $('#puzzle-feedback').textContent = 'the queen can only move straight or diagonal.';
      return;
    }
    activePuzzleState.qx = x;
    activePuzzleState.qy = y;
    const crown = activePuzzleState.crowns.find((c) => c.x === x && c.y === y && !c.got);
    if (crown) {
      crown.got = true;
      $('#puzzle-feedback').textContent = 'a queen city crown joins you.';
    } else if (x === puzzle.goal[0] && y === puzzle.goal[1]) {
      if (activePuzzleState.crowns.every((c) => c.got)) return completePuzzle();
      $('#puzzle-feedback').textContent = 'the castle is locked. collect every crown first.';
    } else {
      $('#puzzle-feedback').textContent = 'the queen keeps moving through the city.';
    }
    renderPuzzle();
  }

  function chooseConstellation(idx) {
    if (!activePuzzleState || activePuzzleState.type !== 'constellation') return;
    const puzzle = PUZZLES[activePuzzleIdx];
    if (idx === puzzle.order[activePuzzleState.progress]) {
      activePuzzleState.progress++;
      $('#puzzle-feedback').textContent = 'the star stays connected.';
      if (activePuzzleState.progress >= puzzle.order.length) return completePuzzle();
    } else {
      activePuzzleState.progress = 0;
      $('#puzzle-feedback').textContent = 'the line fades. start from the first star.';
    }
    renderPuzzle();
  }

  function completePuzzle() {
    if (activePuzzleIdx < 0 || !activePuzzleState) return;
    if (activePuzzleState.complete) return;
    activePuzzleState.complete = true;
    const puzzle = PUZZLES[activePuzzleIdx];
    const feedback = $('#puzzle-feedback');
    const solvedIdx = activePuzzleIdx;
    State.puzzleSolved[activePuzzleIdx] = true;
    State.memoryReadiness[activePuzzleIdx] = 1;
    State.memoryBuildings[activePuzzleIdx] = {
      start: State.time,
      topic: MEMORIES[activePuzzleIdx].key,
    };
    if (puzzle.type === 'bouquet') renderPuzzle();
    feedback.textContent = puzzle.success;
    $('#puzzle-options').classList.add('complete');
    setTimeout(() => {
      screens.puzzle.classList.add('hidden');
      $('#puzzle-options').classList.remove('complete');
      State.mode = 'play';
      activePuzzleState = null;
      kickPlayerOutOfRoom(solvedIdx);
      showFloat(randomRecoveryLine(), 2000);
    }, puzzle.type === 'bouquet' ? 1600 : 850);
  }

  function kickPlayerOutOfRoom(memIdx) {
    const fp = framePositions[memIdx] || notePositions[memIdx];
    if (!fp) return;
    player.x = fp.col * TILE + TILE / 2;
    player.y = Math.min(WORLD_H - 8, (fp.row + 2) * TILE + TILE / 2);
    player.facing = 'up';
    player.moving = false;
    State.cameraX = Math.max(0, Math.min(WORLD_W - VIEW_W, player.x - VIEW_W / 2));
    State.cameraY = Math.max(0, Math.min(WORLD_H - VIEW_H, player.y - VIEW_H / 2));
  }

  // ---------- UI: Unlock celebration ----------
  function openUnlock(mem, memIdx) {
    State.mode = 'modal';
    $('#unlock-title').textContent = mem.title;
    $('#unlock-line').textContent = mem.unlockLine;
    renderPictureReveal(memIdx);
    screens.unlock.classList.remove('hidden');
  }
  $('#unlock-close').addEventListener('click', () => {
    screens.unlock.classList.add('hidden');
    State.mode = 'play';
    // Check final condition: six keys unlock the final maze before the final letter.
    if (State.keys >= NUM_MEMORIES && !State.finalPuzzleStarted && !State.finalPuzzleSolved) {
      setTimeout(openFinalPuzzleIntro, 700);
    }
  });

  // ---------- UI: Journal ----------
  function openJournal() {
    State.mode = 'modal';
    const grid = $('#journal-grid');
    grid.innerHTML = '';
    MEMORIES.forEach((mem, i) => {
      const card = document.createElement('div');
      const canRead = State.unlocked[i] || State.memoryReadiness[i] > 0;
      card.className = 'journal-card' + (canRead ? '' : ' locked');
      if (canRead) {
        card.dataset.memIdx = i;
        if (State.unlocked[i] && State.customPhotos[i]) {
          const img = document.createElement('img');
          img.src = State.customPhotos[i];
          img.alt = `${mem.title} photo`;
          img.className = 'journal-photo';
          card.appendChild(img);
        } else if (State.unlocked[i]) {
          const thumb = makeMemoryThumb(i, 64);
          card.appendChild(thumb);
        } else {
          const icon = document.createElement('div');
          icon.className = 'journal-locked-icon memorial-ready';
          icon.textContent = '✉';
          card.appendChild(icon);
        }
        const t = document.createElement('p');
        t.className = 'journal-title';
        t.textContent = mem.title;
        card.appendChild(t);
        card.addEventListener('click', () => {
          screens.journal.classList.add('hidden');
          openMemoryView(i);
        });
      } else {
        const icon = document.createElement('div');
        icon.className = 'journal-locked-icon';
        icon.textContent = '♡';
        card.appendChild(icon);
        const t = document.createElement('p');
        t.className = 'journal-title';
        t.textContent = '— — —';
        card.appendChild(t);
      }
      grid.appendChild(card);
    });
    screens.journal.classList.remove('hidden');
  }
  $('#journal-btn').addEventListener('click', openJournal);
  $('#journal-close').addEventListener('click', () => {
    screens.journal.classList.add('hidden');
    State.mode = 'play';
  });

  // ---------- UI: Memory detail ----------
  function openMemoryView(i) {
    State.mode = 'modal';
    const mem = MEMORIES[i];
    $('#memory-view-title').textContent = mem.title;
    $('#memory-view-body').textContent = mem.note;
    $('#memory-view-hint').textContent = State.unlocked[i]
      ? 'memory unlocked · photo and letter saved'
      : 'memorial block recovered · unlock the frame to see the photo';
    const frame = $('#memory-frame');
    frame.innerHTML = '';
    if (State.unlocked[i] && State.customPhotos[i]) {
      const img = document.createElement('img');
      img.src = State.customPhotos[i];
      frame.appendChild(img);
    } else if (State.unlocked[i]) {
      frame.appendChild(makeMemoryThumb(i, 240));
    } else {
      const block = document.createElement('div');
      block.className = 'memorial-letter-placeholder';
      block.textContent = 'memorial block';
      frame.appendChild(block);
    }
    screens.memoryView.classList.remove('hidden');
  }
  $('#memory-view-back').addEventListener('click', () => {
    screens.memoryView.classList.add('hidden');
    openJournal();
  });

  // ---------- UI: Help / Replace assets ----------
  $('#help-btn').addEventListener('click', () => {
    State.mode = 'modal';
    screens.help.classList.remove('hidden');
  });
  $('#help-close').addEventListener('click', () => {
    screens.help.classList.add('hidden');
    State.mode =
      screens.ending.classList.contains('hidden') && screens.videoEnding.classList.contains('hidden')
        ? 'play'
        : 'ending';
  });
  // File input wiring
  document.querySelectorAll('[data-slot-input]').forEach((input) => {
    const slot = input.parentElement;
    input.addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const slotKey = input.dataset.slotInput;
      const url = URL.createObjectURL(f);
      if (slotKey === 'video') {
        State.customVideo = url;
        const v = $('#ending-video');
        v.src = url;
        $('#video-frame').classList.add('has-video');
      } else if (slotKey === 'final') {
        State.customFinalPicture = url;
        renderPictureReveal();
      } else {
        const idx = parseInt(slotKey, 10);
        State.customPhotos[idx] = url;
      }
      slot.classList.add('loaded');
    });
  });

  // ---------- Whole-picture reveal ----------
  function renderPictureReveal(latestIdx = -1) {
    const grid = $('#picture-reveal');
    if (!grid) return;
    grid.innerHTML = '';
    if (latestIdx >= 0) {
      const preview = document.createElement('div');
      preview.className = 'picture-piece memory-photo latest';
      if (State.customPhotos[latestIdx]) {
        const img = document.createElement('img');
        img.src = State.customPhotos[latestIdx];
        img.alt = `${MEMORIES[latestIdx].title} photo`;
        img.className = 'unlock-photo';
        preview.appendChild(img);
      } else {
        preview.appendChild(makeMemoryThumb(latestIdx, 88));
      }
      const label = document.createElement('span');
      label.className = 'key-label';
      label.textContent = 'picture unlocked';
      preview.appendChild(label);
      grid.appendChild(preview);
    }
    for (let i = 0; i < NUM_MEMORIES; i++) {
      const piece = document.createElement('div');
      piece.className = 'picture-piece key-piece' + (State.unlocked[i] ? ' revealed' : ' locked') + (i === latestIdx ? ' latest' : '');
      piece.dataset.piece = String(i + 1);
      if (State.unlocked[i]) {
        const key = document.createElement('span');
        key.className = 'key-icon';
        key.textContent = '⚿';
        piece.appendChild(key);
      } else {
        const lock = document.createElement('span');
        lock.textContent = '—';
        piece.appendChild(lock);
      }
      grid.appendChild(piece);
    }
    const count = State.keys;
    $('#picture-reveal-caption').textContent = count < NUM_MEMORIES
      ? `memory picture unlocked. key ${count}/${NUM_MEMORIES} collected.`
      : 'all 6 keys collected. the big memory opens.';
  }

  function makePicturePiece(pieceIdx, size) {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 48;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const pieceCol = pieceIdx % 3;
    const pieceRow = Math.floor(pieceIdx / 3);

    if (State.customFinalPicture) {
      // In-session final picture preview. Cropping works after the image has loaded.
      const img = new Image();
      img.onload = () => {
        const sw = img.width / 3;
        const sh = img.height / 2;
        x.clearRect(0, 0, 48, 48);
        x.drawImage(img, sw * pieceCol, sh * pieceRow, sw, sh, 0, 0, 48, 48);
      };
      img.src = State.customFinalPicture;
    } else {
      drawDefaultWholePicture(x, pieceCol, pieceRow);
    }

    c.className = 'picture-piece-canvas';
    c.style.width = size + 'px';
    c.style.height = size + 'px';
    c.style.imageRendering = 'pixelated';
    return c;
  }

  function drawDefaultWholePicture(x, pieceCol, pieceRow) {
    // Draw a 144×96 pixel-art final picture, then crop each 48×48 piece.
    const full = document.createElement('canvas');
    full.width = 144;
    full.height = 96;
    const f = full.getContext('2d');
    f.imageSmoothingEnabled = false;
    const sky = f.createLinearGradient(0, 0, 0, 96);
    sky.addColorStop(0, '#25115b');
    sky.addColorStop(0.55, '#6d3ca5');
    sky.addColorStop(1, '#ffd47a');
    f.fillStyle = sky;
    f.fillRect(0, 0, 144, 96);
    // stars and petals
    [[16,14],[38,8],[72,18],[112,11],[128,28],[24,48],[106,50]].forEach(([sx,sy], i) => {
      f.fillStyle = i % 2 ? '#fff7df' : '#ffe072';
      drawPixelStar(f, sx, sy, i % 3 ? 1 : 2);
    });
    f.fillStyle = '#2f1b67';
    f.fillRect(0, 68, 144, 28);
    f.fillStyle = '#3d2679';
    for (let i = 0; i < 144; i += 12) f.fillRect(i, 70 + (i % 24), 10, 2);
    // glowing path
    f.fillStyle = 'rgba(255,224,114,0.45)';
    f.fillRect(50, 72, 44, 4);
    f.fillRect(44, 78, 56, 3);
    // the character
    drawFinalFigure(f, 57, 57, false);
    // the light
    drawFinalFigure(f, 81, 57, true);
    f.fillStyle = '#ffe072';
    f.fillRect(68, 58, 8, 1);
    f.fillStyle = '#ff7fa8';
    f.fillRect(70, 48, 1, 1);
    f.fillRect(73, 48, 1, 1);
    f.fillRect(70, 49, 4, 1);
    f.fillRect(71, 50, 2, 1);
    x.drawImage(full, pieceCol * 48, pieceRow * 48, 48, 48, 0, 0, 48, 48);
  }

  function drawFinalFigure(x, cx, cy, light = false) {
    x.fillStyle = light ? '#fff2d0' : '#efe4d1';
    x.fillRect(cx - 3, cy - 10, 6, 6);
    x.fillStyle = light ? '#ffe072' : '#3a2a44';
    x.fillRect(cx - 3, cy - 10, 6, 2);
    x.fillStyle = light ? '#ff8fb3' : '#7d3a8a';
    x.fillRect(cx - 5, cy - 4, 10, 12);
    x.fillStyle = light ? '#ffe072' : '#bea1ff';
    x.fillRect(cx - 4, cy - 4, 8, 2);
    x.fillStyle = '#1a1145';
    x.fillRect(cx - 3, cy + 8, 3, 6);
    x.fillRect(cx + 1, cy + 8, 3, 6);
  }

  // ---------- Final 2D chase cutscene ----------
  function openFinalCutscene(onDone = openVideoEnding) {
    State.mode = 'cutscene';
    hud.classList.add('hidden');
    controls.classList.add('hidden');
    promptEl.classList.add('hidden');
    screens.ending.classList.add('hidden');
    screens.videoEnding.classList.add('hidden');
    screens.finalCutscene.classList.remove('hidden');
    runFinalCutscene(() => {
      screens.finalCutscene.classList.add('hidden');
      onDone();
    });
  }

  function runFinalCutscene(onDone) {
    const cc = $('#final-cutscene-canvas');
    const cx = cc.getContext('2d');
    cx.imageSmoothingEnabled = false;
    const text = $('#final-cutscene-text');
    let elapsed = 0;
    let last = performance.now();
    let stopped = false;

    function step() {
      if (stopped) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      const chase = Math.min(1, elapsed / 6.4);
      const flash = Math.max(0, Math.min(1, (elapsed - 6.15) / 1.05));
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 8);

      // POV chase: the world rushes toward the viewer while the light grows.
      const bg = cx.createLinearGradient(0, 0, 0, 320);
      bg.addColorStop(0, '#070411');
      bg.addColorStop(0.48, '#170a3b');
      bg.addColorStop(1, '#3a1c72');
      cx.fillStyle = bg;
      cx.fillRect(0, 0, 180, 320);

      const centerX = 90 + Math.sin(elapsed * 1.7) * (3 - chase * 2);
      const centerY = 106 - chase * 22 + Math.sin(elapsed * 2.1) * 2;
      const horizonY = 180 - chase * 34;

      // Perspective path rushing under your feet.
      cx.fillStyle = '#20104b';
      cx.beginPath();
      cx.moveTo(centerX - 10 - chase * 10, horizonY);
      cx.lineTo(centerX + 10 + chase * 10, horizonY);
      cx.lineTo(180, 320);
      cx.lineTo(0, 320);
      cx.closePath();
      cx.fill();
      cx.fillStyle = 'rgba(255, 224, 114, 0.18)';
      for (let i = 0; i < 12; i++) {
        const z = ((i / 12 + elapsed * (0.24 + chase * 0.42)) % 1);
        const y = horizonY + z * z * (330 - horizonY);
        const w = 8 + z * 170;
        cx.fillRect(centerX - w / 2, y, w, Math.max(1, z * 4));
      }

      // Speed streaks and stars move from the light outward.
      for (let i = 0; i < 56; i++) {
        const angle = (i * 2.399 + elapsed * 0.7) % (Math.PI * 2);
        const base = ((i * 17) % 100) / 100;
        const r = 8 + ((base + elapsed * (0.18 + chase * 0.55)) % 1) * (64 + chase * 98);
        const x1 = centerX + Math.cos(angle) * r;
        const y1 = centerY + Math.sin(angle) * r * 1.35;
        const len = 2 + chase * 8 + (i % 4);
        cx.globalAlpha = 0.25 + chase * 0.5;
        cx.fillStyle = i % 5 === 0 ? '#ffe072' : '#fff7df';
        cx.fillRect(Math.floor(x1), Math.floor(y1), Math.max(1, len), i % 3 === 0 ? 2 : 1);
      }
      cx.globalAlpha = 1;

      // The light ahead grows until it becomes the whole screen.
      const glowR = 12 + chase * 92 + pulse * 3;
      const light = cx.createRadialGradient(centerX, centerY, 2, centerX, centerY, glowR);
      light.addColorStop(0, '#ffffff');
      light.addColorStop(0.12, '#fff7df');
      light.addColorStop(0.28, '#ffe072');
      light.addColorStop(0.62, 'rgba(255, 224, 114, 0.34)');
      light.addColorStop(1, 'rgba(255, 224, 114, 0)');
      cx.fillStyle = light;
      cx.fillRect(0, 0, 180, 320);
      cx.fillStyle = '#ffffff';
      drawPixelStar(cx, Math.floor(centerX), Math.floor(centerY), Math.floor(2 + chase * 5));

      // Brief POV hand/step flashes at the bottom to imply "my view".
      if (elapsed < 5.9) {
        cx.globalAlpha = 0.20 + pulse * 0.16;
        cx.fillStyle = '#f7d36a';
        cx.fillRect(34 + Math.sin(elapsed * 10) * 5, 292, 20, 5);
        cx.fillRect(126 - Math.sin(elapsed * 10) * 5, 292, 20, 5);
        cx.globalAlpha = 1;
      }

      text.textContent = elapsed < 2.1
        ? 'chasing the light.'
        : elapsed < 4.5
          ? 'closer. closer. at the end of the road.'
          : elapsed < 6.25
            ? 'when the light opened—'
            : '';

      if (flash > 0) {
        cx.globalAlpha = flash;
        cx.fillStyle = '#fff';
        cx.fillRect(0, 0, 180, 320);
        cx.globalAlpha = 1;
        screens.finalCutscene.classList.toggle('whiteout', flash > 0.65);
      }

      if (elapsed >= 7.35) {
        stopped = true;
        screens.finalCutscene.classList.remove('whiteout');
        onDone();
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function drawRunner(x, cx, cy, light, t) {
    const run = Math.floor(t * 10) % 2;
    const palette = STAGES[6];
    x.fillStyle = light ? '#fff3d2' : '#efe4d1';
    x.fillRect(cx - 3, cy - 24, 6, 6);
    x.fillStyle = light ? '#ffe072' : '#3a2a44';
    x.fillRect(cx - 3, cy - 24, 6, 2);
    x.fillStyle = light ? palette.rose : '#7d3a8a';
    x.fillRect(cx - 4, cy - 18, 8, 12);
    x.fillStyle = light ? '#ffe072' : palette.violet;
    x.fillRect(cx - 4, cy - 18, 8, 2);
    // arms reaching
    x.fillStyle = light ? palette.rose : '#7d3a8a';
    x.fillRect(cx + (light ? -6 : 4), cy - 16, 5, 2);
    x.fillRect(cx + (light ? 4 : -7), cy - 13 + run, 4, 2);
    // legs
    x.fillStyle = '#1a1145';
    x.fillRect(cx - 3, cy - 6, 3, 6 + run);
    x.fillRect(cx + 1, cy - 6, 3, 5 - run);
  }

  // ---------- Final heart-frame cutscene after the QR maze ----------
  function openHeartFrameCutscene(onDone = openEnding) {
    State.mode = 'cutscene';
    hud.classList.add('hidden');
    controls.classList.add('hidden');
    promptEl.classList.add('hidden');
    screens.finalPuzzle.classList.add('hidden');
    screens.ending.classList.add('hidden');
    screens.videoEnding.classList.add('hidden');
    screens.finalCutscene.classList.remove('hidden');
    runHeartFrameCutscene(() => {
      screens.finalCutscene.classList.add('hidden');
      onDone();
    });
  }

  function runHeartFrameCutscene(onDone) {
    const cc = $('#final-cutscene-canvas');
    const cx = cc.getContext('2d');
    cx.imageSmoothingEnabled = false;
    const text = $('#final-cutscene-text');
    let elapsed = 0;
    let last = performance.now();
    let stopped = false;
    const heartCells = makeHeartCells();
    const memoryBlocks = [
      { shape: 'bouquet', x: -24, y: 76, holdX: 44, holdY: 100 },
      { shape: 'bell', x: 206, y: 70, holdX: 90, holdY: 92 },
      { shape: 'queen', x: 28, y: -22, holdX: 136, holdY: 100 },
      { shape: 'donut', x: 152, y: -28, holdX: 44, holdY: 152 },
      { shape: 'fireworks', x: -30, y: 248, holdX: 90, holdY: 162 },
      { shape: 'coffee', x: 206, y: 252, holdX: 136, holdY: 152 },
    ];

    function step() {
      if (stopped) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      cx.fillStyle = '#05040c';
      cx.fillRect(0, 0, 180, 320);
      const bg = cx.createRadialGradient(90, 150, 8, 90, 150, 180);
      bg.addColorStop(0, '#24104d');
      bg.addColorStop(0.5, '#0f0822');
      bg.addColorStop(1, '#030208');
      cx.fillStyle = bg;
      cx.fillRect(0, 0, 180, 320);

      for (let i = 0; i < 56; i++) {
        cx.globalAlpha = 0.18 + 0.3 * Math.sin(elapsed * 2 + i);
        cx.fillStyle = i % 7 === 0 ? '#ffe072' : '#d7ccff';
        cx.fillRect((i * 31) % 180, (i * 47 + Math.floor(elapsed * 10)) % 320, 1, 1);
      }
      cx.globalAlpha = 1;

      const blockEnterP = Math.max(0, Math.min(1, (elapsed - 0.8) / 1.2));
      const holdP = elapsed >= 2 && elapsed < 7 ? 1 : 0;
      const fillP = Math.max(0, Math.min(1, (elapsed - 7.0) / 3.0));
      const fireP = Math.max(0, Math.min(1, (elapsed - 10.2) / 1.1));
      const blackout = Math.max(0, Math.min(1, (elapsed - 20.1) / 0.95));

      drawMemoryHeartGlow(cx, fillP);
      drawMemoryBlocksForHeart(cx, memoryBlocks, blockEnterP, holdP, fillP);
      drawHeartPieces(cx, heartCells, fillP);
      if (fireP > 0) drawBirthdayFireworks(cx, fireP);

      text.textContent = elapsed < 1.4
        ? 'the memories gather.'
        : elapsed < 7.0
          ? 'every memorial block returns.'
        : elapsed < 10.2
          ? 'the memories fill the heart.'
            : '';

      if (blackout > 0) {
        cx.globalAlpha = blackout;
        cx.fillStyle = '#000';
        cx.fillRect(0, 0, 180, 320);
        cx.globalAlpha = 1;
      }

      if (elapsed >= 21.1) {
        stopped = true;
        text.textContent = '';
        onDone();
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function makeHeartCells() {
    const rows = [
      '001110011100',
      '011111111110',
      '111111111111',
      '111111111111',
      '011111111110',
      '001111111100',
      '000111111000',
      '000011110000',
      '000001100000',
    ];
    const cells = [];
    rows.forEach((row, y) => {
      [...row].forEach((v, x) => {
        if (v === '1') cells.push({ x: 48 + x * 7, y: 100 + y * 7 });
      });
    });
    return cells;
  }

  function drawMemoryHeartGlow(x, p) {
    if (p <= 0) return;
    x.save();
    const glow = x.createRadialGradient(90, 132, 8, 90, 132, 86);
    glow.addColorStop(0, `rgba(255,224,114,${0.18 * p})`);
    glow.addColorStop(0.5, `rgba(255,143,179,${0.10 * p})`);
    glow.addColorStop(1, 'rgba(255,143,179,0)');
    x.fillStyle = glow;
    x.fillRect(0, 48, 180, 150);
    x.restore();
  }

  function drawMemoryBlocksForHeart(x, blocks, enterP, holdP, fillP) {
    const e = enterP * enterP * (3 - 2 * enterP);
    blocks.forEach((block, i) => {
      const cell = makeHeartCells()[Math.floor((i + 0.5) * makeHeartCells().length / blocks.length)];
      const target = cell || { x: 90, y: 135 };
      const f = fillP * fillP * (3 - 2 * fillP);
      const holdX = block.x + (block.holdX - block.x) * e;
      const holdY = block.y + (block.holdY - block.y) * e;
      const bx = holdX + (target.x - holdX) * f;
      const by = holdY + (target.y - holdY) * f;
      x.save();
      x.globalAlpha = fillP > 0.75 ? Math.max(0, 1 - (fillP - 0.75) * 4) : Math.min(1, enterP * 1.4);
      x.translate(bx, by);
      x.rotate(Math.sin(State.time * 3 + i) * 0.05 * (1 - fillP));
      x.fillStyle = 'rgba(255,247,223,.13)';
      x.fillRect(-14, -14, 28, 28);
      x.strokeStyle = i % 2 ? '#ff8fb3' : '#ffe072';
      x.strokeRect(-14, -14, 28, 28);
      drawMemoryShapeIcon(x, block.shape, 0, 1, 0.72);
      x.restore();
    });
  }

  function drawHeartPieces(x, cells, p) {
    const revealCount = Math.floor(cells.length * p);
    cells.forEach((cell, i) => {
      if (i > revealCount) return;
      const colorPick = i % 6;
      x.fillStyle = colorPick === 0 ? '#fff7df' : colorPick === 1 ? '#ff8fb3' : colorPick === 2 ? '#ffe072' : colorPick === 3 ? '#d7ccff' : colorPick === 4 ? '#b9e889' : '#bdfcff';
      x.fillRect(cell.x, cell.y, 6, 6);
    });
    if (p >= 1) {
      const icons = [
        ['bouquet', 70, 120],
        ['bell', 90, 113],
        ['queen', 110, 120],
        ['donut', 66, 142],
        ['fireworks', 91, 147],
        ['coffee', 115, 142],
      ];
      icons.forEach(([shape, ix, iy], i) => {
        x.save();
        x.globalAlpha = 0.68 + 0.22 * Math.sin(State.time * 5 + i);
        drawMemoryShapeIcon(x, shape, ix, iy, 0.42);
        x.restore();
      });
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2 + State.time * 0.35;
        const r = 36 + ((i % 3) * 9);
        x.globalAlpha = 0.22 + 0.22 * Math.sin(State.time * 4 + i);
        x.fillStyle = i % 2 ? '#ffe072' : '#fff7df';
        x.fillRect(90 + Math.cos(a) * r, 132 + Math.sin(a) * r * 0.76, 2, 2);
      }
      x.globalAlpha = 1;
    }
  }

  function drawBirthdayFireworks(x, p) {
    const launchers = [
      { x: 74, y: 132, tx: 24, ty: 38, c: '#ffe072' },
      { x: 90, y: 120, tx: 88, ty: 34, c: '#ff8fb3' },
      { x: 106, y: 132, tx: 154, ty: 42, c: '#d7ccff' },
      { x: 58, y: 152, tx: 36, ty: 210, c: '#bdfcff' },
      { x: 122, y: 152, tx: 146, ty: 210, c: '#b9e889' },
      { x: 90, y: 170, tx: 90, ty: 252, c: '#fff7df' },
    ];
    const fade = Math.min(1, p * 2);
    launchers.forEach((f, i) => {
      const cycle = (State.time * 0.38 + i * 0.17) % 1;
      const t = Math.min(1, Math.max(0, cycle * 1.45));
      const x1 = f.x + (f.tx - f.x) * t;
      const y1 = f.y + (f.ty - f.y) * t;
      x.strokeStyle = f.c;
      x.globalAlpha = 0.55 * fade * (1 - Math.max(0, t - 0.82) * 3);
      x.beginPath();
      x.moveTo(f.x, f.y);
      x.lineTo(x1, y1);
      x.stroke();
      x.globalAlpha = 1;
      for (let k = 0; k < 18; k++) {
        const a = (k / 18) * Math.PI * 2;
        const bloom = Math.max(0, Math.min(1, (t - 0.46) * 2.2));
        const r = bloom * (16 + (i % 3) * 6);
        x.globalAlpha = fade * Math.max(0, 1 - bloom * 0.45);
        x.fillStyle = f.c;
        x.fillRect(x1 + Math.cos(a) * r, y1 + Math.sin(a) * r, 2, 2);
      }
    });
    for (let i = 0; i < 36; i++) {
      const a = (i * 2.399 + State.time * 0.35) % (Math.PI * 2);
      const r = 20 + ((i * 13) % 80);
      const bx = 90 + Math.cos(a) * r;
      const by = 160 + Math.sin(a * 1.3) * (r * 0.9);
      x.globalAlpha = fade * (0.35 + 0.35 * Math.sin(State.time * 5 + i));
      x.fillStyle = ['#ffe072', '#ff8fb3', '#d7ccff', '#bdfcff'][i % 4];
      x.fillRect(bx, by, 2, 2);
    }
    x.globalAlpha = 1;
    if (p > 0.12) {
      const textP = Math.min(1, (p - 0.12) / 0.42);
      x.save();
      x.globalAlpha = textP;
      x.shadowColor = '#ff8fb3';
      x.shadowBlur = 14;
      x.fillStyle = 'rgba(5,4,12,.70)';
      x.fillRect(12, 56, 156, 48);
      x.shadowBlur = 0;
      x.strokeStyle = '#ffe072';
      x.strokeRect(15, 59, 150, 42);
      x.strokeStyle = 'rgba(255,143,179,.78)';
      x.strokeRect(18, 62, 144, 36);
      const grad = x.createLinearGradient(20, 62, 160, 101);
      grad.addColorStop(0, '#fff7df');
      grad.addColorStop(0.45, '#ffe072');
      grad.addColorStop(1, '#ff8fb3');
      x.fillStyle = grad;
      x.textAlign = 'center';
      x.font = "16px Georgia, 'Times New Roman', serif";
      x.fillText('Happy 19th Birthday', 90, 78);
      x.font = "18px Georgia, 'Times New Roman', serif";
      x.fillText('my love', 90, 96);
      x.fillStyle = '#fff7df';
      [[31, 69], [149, 70], [42, 95], [137, 95]].forEach(([sx, sy], i) => {
        x.globalAlpha = textP * (0.55 + 0.35 * Math.sin(State.time * 6 + i));
        x.fillRect(sx - 2, sy, 5, 1);
        x.fillRect(sx, sy - 2, 1, 5);
      });
      x.textAlign = 'left';
      x.restore();
    }
  }

  // ---------- Ending ----------
  function applyVideoAsset() {
    const v = $('#ending-video');
    const frame = $('#video-frame');
    if (!v || !frame) return null;

    const videoSrc =
      State.customVideo ||
      (window.VALENTINE_ASSETS && window.VALENTINE_ASSETS.video) ||
      '';

    if (videoSrc) {
      v.src = videoSrc;
      frame.classList.add('has-video');
    } else {
      v.removeAttribute('src');
      frame.classList.remove('has-video');
    }

    return v;
  }

  function openEnding() {
    State.mode = 'ending';
    const bigImg = $('#big-memory-img');
    if (bigImg && State.customFinalPicture) {
      bigImg.src = State.customFinalPicture;
      bigImg.parentElement.classList.add('loaded');
    }
    const v = $('#ending-video');
    if (v) v.pause();
    screens.videoEnding.classList.add('hidden');
    screens.ending.classList.remove('hidden');
    screens.ending.scrollTop = 0;
    hud.classList.add('hidden');
    controls.classList.add('hidden');
    promptEl.classList.add('hidden');
  }

  function openVideoEnding() {
    State.mode = 'ending';
    screens.ending.classList.add('hidden');
    screens.videoEnding.classList.remove('hidden');
    screens.videoEnding.scrollTop = 0;
    hud.classList.add('hidden');
    controls.classList.add('hidden');
    promptEl.classList.add('hidden');
    const v = applyVideoAsset();
    if (v && v.src) {
      v.play().catch(() => {});
    }
  }
  $('#play-final-video').addEventListener('click', () => openFinalCutscene(openVideoEnding));
  $('#video-back-memory').addEventListener('click', () => {
    const v = $('#ending-video');
    if (v) v.pause();
    screens.videoEnding.classList.add('hidden');
    screens.ending.classList.remove('hidden');
  });
  $('#ending-replay').addEventListener('click', () => {
    // Soft reset: go back to start, clear progress
    location.reload();
  });
  $('#video-replay').addEventListener('click', () => {
    location.reload();
  });

  // ---------- Memory thumbnail painter (pixel art) ----------
  // Returns a small canvas drawn with a pixel-art interpretation of the memory.
  function makeMemoryThumb(memIdx, size) {
    const c = document.createElement('canvas');
    c.width = 32; c.height = 32;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;

    // Use the stage palette at unlock time (we just unlocked memIdx+1, so use STAGES[memIdx+1])
    const sIdx = Math.min(NUM_MEMORIES, memIdx + 1);
    const s = STAGES[sIdx];

    // Background sky
    x.fillStyle = s.sky;
    x.fillRect(0, 0, 32, 32);

    // Soft stars
    x.fillStyle = '#ffffff';
    [[4,4],[10,2],[24,5],[28,12],[6,18],[14,9]].forEach(([sx,sy]) => x.fillRect(sx, sy, 1, 1));

    if (memIdx === 0) {
      // First spark — distant figure + big star
      x.fillStyle = s.gold;
      drawPixelStar(x, 20, 8, 1.4);
      // ground
      x.fillStyle = s.cloak;
      x.fillRect(0, 22, 32, 10);
      // tiny figure
      drawTinyFigure(x, 14, 18, s);
    } else if (memIdx === 1) {
      // Quiet walk — two figures, lampposts
      x.fillStyle = s.cloak;
      x.fillRect(0, 24, 32, 8);
      // path
      x.fillStyle = s.ground2;
      x.fillRect(0, 23, 32, 1);
      // lampposts
      x.fillStyle = s.wall;
      x.fillRect(5, 14, 1, 10); x.fillRect(26, 14, 1, 10);
      x.fillStyle = s.gold;
      x.fillRect(4, 13, 3, 2); x.fillRect(25, 13, 3, 2);
      // figures
      drawTinyFigure(x, 12, 19, s);
      drawTinyFigure(x, 18, 19, s, /*alt*/ true);
    } else if (memIdx === 2) {
      // Laughing room — room with balloons
      x.fillStyle = s.wall;
      x.fillRect(2, 4, 28, 22);
      x.fillStyle = s.ground;
      x.fillRect(3, 24, 26, 2);
      // window
      x.fillStyle = s.gold;
      x.globalAlpha = 0.6; x.fillRect(20, 8, 6, 6); x.globalAlpha = 1;
      // balloons
      x.fillStyle = s.rose; x.fillRect(7, 8, 2, 2); x.fillRect(9, 9, 1, 4);
      x.fillStyle = s.violet; x.fillRect(11, 6, 2, 2); x.fillRect(12, 8, 1, 5);
      // figures
      drawTinyFigure(x, 8, 20, s);
      drawTinyFigure(x, 16, 20, s, true);
    } else if (memIdx === 3) {
      // Rain window — window with rain streaks, two figures inside
      x.fillStyle = s.wall;
      x.fillRect(0, 0, 32, 32);
      // window frame
      x.fillStyle = '#000';
      x.fillRect(4, 4, 24, 18);
      x.fillStyle = s.violet;
      x.globalAlpha = 0.5; x.fillRect(5, 5, 22, 16); x.globalAlpha = 1;
      // rain streaks
      x.fillStyle = '#aac8ff';
      for (let i = 0; i < 9; i++) x.fillRect(6 + i * 2, 6 + (i % 3) * 4, 1, 3);
      // cross bars
      x.fillStyle = s.wall;
      x.fillRect(15, 4, 2, 18);
      x.fillRect(4, 12, 24, 1);
      // two figures inside (silhouettes)
      x.fillStyle = '#000';
      x.fillRect(9, 24, 4, 6); x.fillRect(19, 24, 4, 6);
    } else if (memIdx === 4) {
      // The promise — heart + two figures hand-in-hand under big star
      x.fillStyle = s.cloak;
      x.fillRect(0, 22, 32, 10);
      // big star
      x.fillStyle = s.gold;
      drawPixelStar(x, 16, 6, 2);
      // heart
      x.fillStyle = s.rose;
      const heart = [
        [1,0,0,1,0], [1,1,1,1,1], [1,1,1,1,1], [0,1,1,1,0], [0,0,1,0,0],
      ];
      for (let yy = 0; yy < heart.length; yy++)
        for (let xx = 0; xx < heart[yy].length; xx++)
          if (heart[yy][xx]) x.fillRect(13 + xx, 13 + yy, 1, 1);
      // figures
      drawTinyFigure(x, 11, 19, s);
      drawTinyFigure(x, 17, 19, s, true);
    } else if (memIdx === 5) {
      // Whole picture — six tiles joining into one bright scene
      x.fillStyle = s.cloak;
      x.fillRect(0, 22, 32, 10);
      x.fillStyle = s.gold;
      for (let yy = 0; yy < 2; yy++) {
        for (let xx = 0; xx < 3; xx++) {
          x.globalAlpha = 0.55 + 0.08 * (xx + yy);
          x.fillRect(7 + xx * 6, 8 + yy * 6, 5, 5);
        }
      }
      x.globalAlpha = 1;
      drawTinyFigure(x, 10, 21, s);
      drawTinyFigure(x, 20, 21, s, true);
    }

    // Vintage scanline overlay for a film-still feel
    x.globalAlpha = 0.08;
    x.fillStyle = '#000';
    for (let yy = 0; yy < 32; yy += 2) x.fillRect(0, yy, 32, 1);
    x.globalAlpha = 1;

    // Frame border
    x.strokeStyle = s.gold;
    x.strokeRect(0.5, 0.5, 31, 31);

    // CSS-scale to requested size
    c.style.width = size + 'px';
    c.style.height = size + 'px';
    c.style.imageRendering = 'pixelated';
    return c;
  }
  function drawPixelStar(x, cx, cy, scale) {
    const pts = [[0,-2],[-2,0],[0,0],[2,0],[0,2],[-1,-1],[1,-1],[-1,1],[1,1]];
    for (const [dx,dy] of pts) x.fillRect(cx + dx * scale, cy + dy * scale, scale, scale);
  }
  function drawTinyFigure(x, cx, cy, palette, alt = false) {
    // 4-tall figure
    x.fillStyle = alt ? palette.gold : palette.ink;
    x.fillRect(cx, cy, 2, 2);     // head
    x.fillStyle = alt ? palette.rose : palette.violet;
    x.fillRect(cx - 1, cy + 2, 4, 3); // body
  }

  // ---------- World rendering ----------
  // Per-tile drawing of the cloak landscape + rooms.
  function renderWorld() {
    const s = STAGES[State.stage];

    // Sky background
    ctx.fillStyle = s.sky;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    // Distant stars (more numerous at higher stage)
    drawAmbientStars(s);

    // Translate to camera
    const camX = Math.floor(State.cameraX);
    const camY = Math.floor(State.cameraY);
    ctx.save();
    ctx.translate(-camX, -camY);

    const startCol = Math.floor(camX / TILE) - 1;
    const endCol = Math.floor((camX + VIEW_W) / TILE) + 1;
    const startRow = Math.floor(camY / TILE) - 1;
    const endRow = Math.floor((camY + VIEW_H) / TILE) + 1;

    for (let r = Math.max(0, startRow); r < Math.min(ROWS, endRow); r++) {
      for (let c = Math.max(0, startCol); c < Math.min(COLS, endCol); c++) {
        const ch = MAP[r][c];
        const px = c * TILE, py = r * TILE;
        drawTile(ch, c, r, px, py, s);
      }
    }

    // Solved rooms rebuild themselves into small memory buildings.
    for (let i = 0; i < NUM_MEMORIES; i++) {
      if (!State.memoryBuildings[i]) continue;
      const fp = framePositions[i];
      if (!fp) continue;
      drawMemoryBuilding(fp.col * TILE, fp.row * TILE, i, s);
    }

    // Memory frames (pixel-art pedestals) — drawn for ALL slots; locked vs unlocked styles
    for (let i = 0; i < NUM_MEMORIES; i++) {
      const fp = framePositions[i];
      if (!fp) continue;
      const px = fp.col * TILE, py = fp.row * TILE;
      drawFramePedestal(px, py, i, s);
    }
    // Notes (pixel-art folded paper)
    for (const it of interactables) {
      if (it.kind !== 'note') continue;
      if (it.used) continue;
      // hide note 1 until star puzzle completes
      if (it.memIdx === 0 && State.starVisible) continue;
      // hide notes whose memory not yet ready
      if (State.memoryReadiness[it.memIdx] !== 0) continue;
      drawNote(it.col * TILE, it.row * TILE, s, !it.used);
    }

    // The star
    if (State.starVisible) drawStar(State.starPos.x, State.starPos.y, s);

    // Petals
    drawPetals(s);

    // Player
    drawPlayer(s);

    // Float text
    if (floatText) {
      floatText.life -= 1 / 60;
      if (floatText.life <= 0) floatText = null;
      else {
        const alpha = Math.min(1, floatText.life / 0.8);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.ink;
        ctx.font = "6px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        wrapFloatText(floatText.text, 30).forEach((line, idx, lines) => {
          ctx.fillText(line, player.x, player.y - 16 - (lines.length - 1 - idx) * 8);
        });
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
      }
    }

    ctx.restore();

    // Vignette
    drawVignette(s);
  }

  function wrapFloatText(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 2);
  }

  function drawAmbientStars(s) {
    // Deterministic background star field, intensity scales with stage
    const a = s.stars;
    const seed = (i) => (i * 9301 + 49297) % 233280;
    for (let i = 0; i < 60; i++) {
      const x = seed(i) % VIEW_W;
      const y = seed(i * 3 + 1) % VIEW_H;
      const tw = 0.5 + 0.5 * Math.sin(State.time * 1.5 + i);
      ctx.globalAlpha = a * (0.4 + 0.6 * tw);
      ctx.fillStyle = (i % 7 === 0 && State.stage >= 3) ? s.gold
                    : (i % 11 === 0 && State.stage >= 4) ? s.rose
                    : '#ffffff';
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawTile(ch, c, r, x, y, s) {
    // 1) Always paint a base dream floor first, so the world is continuous and
    //    there are no floating wall artifacts against the void.
    const tone = ((c + r) & 1) === 0 ? s.ground : s.groundAlt;
    ctx.fillStyle = tone;
    ctx.fillRect(x, y, TILE, TILE);
    if (((c * 7 + r * 13) % 17) === 0) {
      ctx.fillStyle = s.ground2;
      ctx.fillRect(x + (c % 3) * 3 + 1, y + (r % 3) * 3 + 2, 2, 1);
    }
    if (s.flowers && ((c * 11 + r * 5) % 23) === 0) {
      ctx.fillStyle = s.rose;
      ctx.fillRect(x + 4, y + 6, 1, 1);
      ctx.fillRect(x + 5, y + 5, 1, 1);
      ctx.fillRect(x + 5, y + 7, 1, 1);
      ctx.fillStyle = s.gold;
      ctx.fillRect(x + 5, y + 6, 1, 1);
    }

    // 2) Then overlay decorative tile features.
    if (ch === '~') {
      // soft cloak dune — lighter undulation
      ctx.fillStyle = s.cloak;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, TILE, TILE - 2);
      ctx.globalAlpha = 1;
      ctx.fillStyle = s.cloakDark;
      ctx.fillRect(x, y + TILE - 2, TILE, 2);
      ctx.fillStyle = s.groundAlt;
      ctx.fillRect(x + 2, y + 2, 2, 1);
    } else if (ch === 'p') {
      // stone plinth/shrine floor — lighter rectangle, contains a memory
      ctx.fillStyle = s.wall;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = s.ground2;
      ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
      // pulse of light tied to stage
      ctx.globalAlpha = 0.06 + 0.05 * State.stage;
      ctx.fillStyle = s.gold;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.globalAlpha = 1;
    } else if (ch === '*') {
      // soft starfield strip
      ctx.fillStyle = s.ground2;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = s.gold;
      ctx.globalAlpha = 0.4 + 0.3 * Math.sin(State.time * 2 + c + r);
      ctx.fillRect(x + (c % 4) * 2 + 1, y + (r % 4) * 2 + 1, 1, 1);
      ctx.globalAlpha = 1;
    }
  }

  function drawMemoryBuilding(x, y, i, s) {
    const building = State.memoryBuildings[i];
    if (!building) return;
    const raw = Math.min(1, Math.max(0, (State.time - building.start) / 2));
    const p = raw * raw * (3 - 2 * raw);
    const bx = x + 6;
    const by = y - 44;
    drawGatheringBricks(bx, by, i, p, s);
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.75 * p;
    ctx.translate(0, Math.round((1 - p) * 12));
    if (i === 0) drawBellBuilding(bx, by, p);
    else if (i === 1) drawFireworkBuilding(bx, by, p);
    else if (i === 2) drawMochiBuilding(bx, by, p);
    else if (i === 3) drawTulipBuilding(bx, by, p);
    else if (i === 4) drawCoffeeBuilding(bx, by, p);
    else if (i === 5) drawQueenBuilding(bx, by, p);
    ctx.restore();
    drawBuildingGapMarker(bx, by, y, p, s);
  }

  function renderFinalPuzzle() {
    const x = finalPuzzleCtx;
    const pulse = 0.5 + 0.5 * Math.sin(State.time * 5);
    x.fillStyle = '#05040c';
    x.fillRect(0, 0, VIEW_W, VIEW_H);

    const bg = x.createLinearGradient(0, 0, 0, VIEW_H);
    bg.addColorStop(0, '#05040c');
    bg.addColorStop(0.52, '#100728');
    bg.addColorStop(1, '#1b0e38');
    x.fillStyle = bg;
    x.fillRect(0, 0, VIEW_W, VIEW_H);

    for (let i = 0; i < 40; i++) {
      const sx = (i * 37 + Math.floor(State.time * 8)) % VIEW_W;
      const sy = (i * 53) % VIEW_H;
      x.globalAlpha = 0.18 + 0.25 * Math.sin(State.time * 2 + i);
      x.fillStyle = i % 6 === 0 ? '#ffe072' : '#d7ccff';
      x.fillRect(sx, sy, 1, 1);
    }
    x.globalAlpha = 1;

    drawFinalMaze(x);
    if (finalPuzzle.phase === 'reveal' || finalPuzzle.phase === 'scan' || finalPuzzle.phase === 'complete') {
      drawFinalQrReveal(x);
      drawFinalSceneryJunk(x);
    }
    if (finalPuzzle.phase === 'scan' || finalPuzzle.phase === 'complete') {
      drawScanFrame(x, pulse);
    }

    x.font = "8px 'Press Start 2P', monospace";
    x.textAlign = 'center';
    x.fillStyle = '#ffe072';
    if (finalPuzzle.phase === 'maze') {
      x.fillText('find the way out', 90, 42);
    } else if (finalPuzzle.phase === 'reveal') {
      x.fillText('look from above', 90, 42);
    } else {
      x.fillText('scan the dream code', 90, 42);
    }
    x.textAlign = 'left';
    drawFinalKeyHud(x);
  }

  function drawFinalKeyHud(x) {
    x.save();
    x.fillStyle = 'rgba(5,4,12,.72)';
    x.fillRect(18, 246, 144, 26);
    x.strokeStyle = 'rgba(255,224,114,.28)';
    x.strokeRect(18, 246, 144, 26);
    x.font = "7px 'Press Start 2P', monospace";
    x.fillStyle = '#fff7df';
    x.textAlign = 'center';
    x.fillText(`${finalPuzzle.collectedCount}/6 stars`, 90, 240);
    FINAL_MEMORY_KEYS.forEach((key, i) => {
      const px = 34 + i * 22;
      const py = 258;
      x.globalAlpha = finalPuzzle.keys[i] ? 1 : 0.24;
      drawMemoryShapeIcon(x, key.shape, px, py, 0.7);
    });
    x.restore();
  }

  function getFinalFieldIndex(col, row) {
    for (let i = 0; i < FINAL_FIELDS.length; i++) {
      const field = FINAL_FIELDS[i];
      if (field.tiles.some(([x1, y1, x2, y2]) => col >= x1 && col <= x2 && row >= y1 && row <= y2)) return i;
    }
    return -1;
  }

  function getFinalFollowerStars() {
    const offsets = [
      { x: -1.05, y: -0.75 },
      { x: 1.08, y: -0.65 },
      { x: -1.25, y: 0.62 },
      { x: 1.25, y: 0.62 },
      { x: 0, y: -1.35 },
      { x: 0, y: 1.25 },
    ];
    return finalPuzzle.keys
      .map((on, i) => {
        if (!on) return null;
        const wobble = Math.sin(State.time * 2.6 + i * 1.7) * 0.14;
        return {
          index: i,
          col: finalPuzzle.player.col + offsets[i].x + wobble,
          row: finalPuzzle.player.row + offsets[i].y + Math.cos(State.time * 2.2 + i) * 0.12,
          radius: 1.55 + Math.min(i, 2) * 0.08,
        };
      })
      .filter(Boolean);
  }

  function isFinalTileVisible(c, r, reveal) {
    if (reveal) return true;
    const playerDist = Math.hypot(c - finalPuzzle.player.col, r - finalPuzzle.player.row);
    if (playerDist < 1.58) return true;
    return getFinalFollowerStars().some((star) => Math.hypot(c - star.col, r - star.row) < star.radius);
  }

  function drawFinalFollowerStars(x, px, py) {
    const cell = FINAL_MAZE_CELL;
    const ox = FINAL_MAZE_OFFSET.x;
    const oy = FINAL_MAZE_OFFSET.y;
    getFinalFollowerStars().forEach((star, i) => {
      const sx = ox + star.col * cell + cell / 2;
      const sy = oy + star.row * cell + cell / 2;
      const glow = x.createRadialGradient(sx, sy, 1, sx, sy, 18);
      glow.addColorStop(0, 'rgba(255,247,223,.75)');
      glow.addColorStop(0.35, 'rgba(255,224,114,.22)');
      glow.addColorStop(1, 'rgba(255,224,114,0)');
      x.fillStyle = glow;
      x.fillRect(sx - 20, sy - 20, 40, 40);
      x.save();
      x.translate(sx, sy);
      x.rotate(State.time * 1.6 + i);
      x.fillStyle = '#fff7df';
      x.fillRect(-1, -5, 2, 10);
      x.fillRect(-5, -1, 10, 2);
      x.fillStyle = '#ffe072';
      x.fillRect(-2, -2, 4, 4);
      x.restore();
    });
  }

  function drawFinalStarBurst(x, cx, cy, p) {
    x.save();
    const glow = x.createRadialGradient(cx, cy, 1, cx, cy, 28);
    glow.addColorStop(0, `rgba(255,247,223,${0.85 * p})`);
    glow.addColorStop(0.35, `rgba(255,224,114,${0.45 * p})`);
    glow.addColorStop(1, 'rgba(255,224,114,0)');
    x.fillStyle = glow;
    x.fillRect(cx - 30, cy - 30, 60, 60);
    x.translate(cx, cy);
    x.rotate(State.time * 4);
    x.globalAlpha = p;
    x.fillStyle = '#fff7df';
    x.fillRect(-1, -12, 2, 24);
    x.fillRect(-12, -1, 24, 2);
    x.fillStyle = '#ffe072';
    x.fillRect(-3, -3, 6, 6);
    x.fillStyle = '#ff8fb3';
    x.fillRect(-1, -1, 2, 2);
    x.restore();
  }

  function drawFinalMaze(x) {
    const cell = FINAL_MAZE_CELL;
    const ox = FINAL_MAZE_OFFSET.x;
    const oy = FINAL_MAZE_OFFSET.y;
    const reveal = finalPuzzle.phase !== 'maze';
    for (let r = 0; r < FINAL_MAZE.length; r++) {
      for (let c = 0; c < FINAL_MAZE[r].length; c++) {
        const ch = FINAL_MAZE[r][c];
        const px = ox + c * cell;
        const py = oy + r * cell;
        const visible = isFinalTileVisible(c, r, reveal);
        if (ch === '#') {
          x.fillStyle = visible ? '#1a1230' : '#030208';
          x.fillRect(px, py, cell, cell);
          if (visible) {
            x.fillStyle = 'rgba(99,77,144,.36)';
            x.fillRect(px + 1, py + 1, cell - 2, 1);
          }
        } else {
          const fieldIdx = getFinalFieldIndex(c, r);
          x.fillStyle = visible ? '#0d091b' : '#020107';
          x.fillRect(px, py, cell, cell);
          if (visible && fieldIdx >= 0) {
            x.globalAlpha = 0.08;
            x.fillStyle = FINAL_FIELDS[fieldIdx].tint;
            x.fillRect(px, py, cell, cell);
            x.globalAlpha = 1;
          }
          if (visible && ((c * 7 + r * 5) % 9 === 0)) {
            x.fillStyle = 'rgba(255,224,114,.28)';
            x.fillRect(px + 3, py + 3, 2, 2);
          }
        }
        if (visible) {
          const spike = getFinalSpike(c, r);
          if (spike) drawFinalSpike(x, px, py, cell, !finalPuzzle.keys[spike.key]);
        }
        if (ch === 'G' && visible) {
          x.fillStyle = '#ffe072';
          x.fillRect(px + 2, py + 2, 4, 4);
        }
      }
    }
    FINAL_MEMORY_KEYS.forEach((key, i) => {
      if (finalPuzzle.keys[i]) return;
      const spot = finalPuzzle.keySpawns[i];
      if (!spot) return;
      if (!isFinalTileVisible(spot.col, spot.row, reveal)) return;
      const kx = ox + spot.col * cell + cell / 2;
      const ky = oy + spot.row * cell + cell / 2;
      const bob = Math.sin(State.time * 6 + i) * 1.2;
      drawKeyCollectible(x, kx, ky + bob, key.shape);
    });
    const px = ox + finalPuzzle.player.col * cell + 4;
    const py = oy + finalPuzzle.player.row * cell + 4;
    if (finalPuzzle.phase === 'maze') {
      const glow = x.createRadialGradient(px, py, 1, px, py, 27);
      glow.addColorStop(0, 'rgba(255,224,114,.16)');
      glow.addColorStop(0.32, 'rgba(255,224,114,.035)');
      glow.addColorStop(1, 'rgba(0,0,0,.94)');
      x.fillStyle = glow;
      x.fillRect(0, 0, VIEW_W, VIEW_H);
    }
    drawFinalFollowerStars(x, px, py);
    x.fillStyle = '#fff7df';
    x.fillRect(px - 3, py - 4, 6, 8);
    x.fillStyle = '#ff8fb3';
    x.fillRect(px - 3, py - 1, 6, 5);
    x.fillStyle = '#1a1145';
    x.fillRect(px - 2, py + 4, 2, 3);
    x.fillRect(px + 1, py + 4, 2, 3);
    if (finalPuzzle.shapeFlash) {
      const p = Math.max(0, finalPuzzle.shapeFlash.time / 1.65);
      x.save();
      x.globalAlpha = Math.min(1, p * 1.4);
      if (finalPuzzle.shapeFlash.star) {
        drawFinalStarBurst(x, px, py - 18 - (1 - p) * 10, Math.min(1, p * 1.35));
      } else {
        drawMemoryShapeIcon(x, finalPuzzle.shapeFlash.shape, px, py - 18 - (1 - p) * 10, 1.05 + (1 - p) * 0.4);
      }
      x.restore();
    }
  }

  function drawFinalSpike(x, px, py, cell, active) {
    x.save();
    if (!active) {
      x.globalAlpha = 0.22;
      x.fillStyle = '#7df0c0';
      x.fillRect(px + 2, py + 5, cell - 4, 1);
      x.restore();
      return;
    }
    const pulse = 0.72 + Math.sin(State.time * 10) * 0.28;
    x.globalAlpha = 0.82;
    x.fillStyle = '#2a0b1c';
    x.fillRect(px + 1, py + 1, cell - 2, cell - 2);
    x.globalAlpha = pulse;
    x.fillStyle = '#ff4e6a';
    x.beginPath();
    x.moveTo(px + 1, py + cell - 1);
    x.lineTo(px + cell / 2, py + 1);
    x.lineTo(px + cell - 1, py + cell - 1);
    x.closePath();
    x.fill();
    x.fillStyle = '#fff7df';
    x.fillRect(px + Math.floor(cell / 2), py + 3, 1, 2);
    x.restore();
  }

  function drawKeyCollectible(x, cx, cy, shape) {
    x.save();
    x.globalAlpha = 0.78 + 0.22 * Math.sin(State.time * 8);
    x.fillStyle = '#ffe072';
    x.fillRect(cx - 4, cy - 1, 8, 2);
    x.fillRect(cx + 2, cy - 4, 3, 7);
    x.strokeStyle = '#fff7df';
    x.strokeRect(cx - 7, cy - 4, 5, 5);
    x.globalAlpha = 1;
    drawMemoryShapeIcon(x, shape, cx, cy - 11, 0.48);
    x.restore();
  }

  function drawMemoryShapeIcon(x, shape, cx, cy, scale = 1) {
    x.save();
    x.translate(Math.round(cx), Math.round(cy));
    x.scale(scale, scale);
    if (shape === 'bouquet') {
      x.fillStyle = '#8a5a38';
      x.fillRect(-8, 4, 16, 8);
      x.fillStyle = '#b89162';
      x.fillRect(-6, 5, 12, 5);
      x.fillStyle = '#82c97a';
      x.fillRect(-3, -1, 2, 7);
      x.fillRect(2, -1, 2, 7);
      x.fillStyle = '#eaf7ff';
      x.fillRect(-8, -8, 5, 8);
      x.fillRect(-2, -10, 5, 10);
      x.fillRect(4, -8, 5, 8);
    } else if (shape === 'bell') {
      x.fillStyle = '#ffe072';
      x.fillRect(-5, -6, 10, 12);
      x.fillRect(-8, 2, 16, 5);
      x.fillStyle = '#e23a55';
      x.fillRect(-7, -4, 14, 2);
      x.fillRect(-2, -7, 4, 8);
      x.fillRect(-10, -5, 5, 4);
      x.fillRect(5, -5, 5, 4);
    } else if (shape === 'queen') {
      x.fillStyle = '#d9c7ff';
      x.fillRect(-7, -5, 14, 13);
      x.fillRect(-10, 6, 20, 4);
      x.fillStyle = '#7d3a8a';
      x.fillRect(-5, -2, 10, 7);
      x.fillStyle = '#ffe072';
      x.fillRect(-8, -8, 3, 5);
      x.fillRect(-1, -10, 3, 7);
      x.fillRect(6, -8, 3, 5);
      x.fillRect(-8, -4, 17, 2);
    } else if (shape === 'donut') {
      x.fillStyle = '#b9e889';
      x.fillRect(-9, -5, 18, 13);
      x.fillRect(-6, -8, 12, 5);
      x.fillStyle = '#6fa84b';
      x.fillRect(-7, -5, 14, 3);
      x.fillStyle = '#fff7df';
      x.fillRect(-4, 0, 4, 4);
      x.fillRect(2, 0, 4, 4);
    } else if (shape === 'fireworks') {
      const bursts = [[0, -5, '#ffe072'], [-7, 2, '#ff8fb3'], [8, 3, '#bdfcff']];
      bursts.forEach(([bx, by, col], i) => {
        const r = 4 + ((Math.sin(State.time * 7 + i) + 1) * 1.5);
        x.fillStyle = col;
        x.fillRect(bx - r, by, r * 2 + 1, 1);
        x.fillRect(bx, by - r, 1, r * 2 + 1);
        x.fillRect(bx - 1, by - 1, 3, 3);
      });
      x.fillStyle = '#6d5b7d';
      x.fillRect(-10, 8, 20, 4);
    } else if (shape === 'coffee') {
      x.fillStyle = '#fff7df';
      x.fillRect(-8, -7, 16, 15);
      x.fillStyle = '#c7985a';
      x.fillRect(-7, -4, 14, 3);
      x.fillStyle = '#5a341f';
      x.fillRect(-5, 1, 10, 5);
      x.strokeStyle = '#fff7df';
      x.lineWidth = 2;
      x.strokeRect(7, -3, 5, 6);
      x.fillStyle = 'rgba(255,255,255,.8)';
      x.fillRect(-3, -11, 1, 3);
      x.fillRect(2, -12, 1, 3);
    }
    x.restore();
  }

  function drawFinalQrReveal(x) {
    const qrSize = 7;
    const ox = 30;
    const oy = 110;
    const revealP = finalPuzzle.phase === 'reveal'
      ? Math.min(1, finalPuzzle.revealTimer / 2.6)
      : 1;
    x.save();
    x.globalAlpha = 0.18 + revealP * 0.82;
    x.fillStyle = 'rgba(255,247,223,.08)';
    x.fillRect(ox - 8, oy - 8, 17 * qrSize + 16, 17 * qrSize + 16);
    x.strokeStyle = 'rgba(255,224,114,.35)';
    x.strokeRect(ox - 8, oy - 8, 17 * qrSize + 16, 17 * qrSize + 16);

    for (let r = 0; r < FINAL_QR_PATTERN.length; r++) {
      for (let c = 0; c < FINAL_QR_PATTERN[r].length; c++) {
        if (FINAL_QR_PATTERN[r][c] !== '1') continue;
        const order = (r * 17 + c) / (17 * 17);
        if (order > revealP) continue;
        x.fillStyle = (r + c) % 5 === 0 ? '#ff8fb3' : '#ffe072';
        x.fillRect(ox + c * qrSize, oy + r * qrSize, qrSize - 1, qrSize - 1);
      }
    }

    // The lit maze route draws over the code like the solved path became the QR.
    x.globalAlpha = 0.35 + 0.35 * Math.sin(State.time * 8) * revealP;
    x.fillStyle = '#fff7df';
    for (let r = 0; r < FINAL_MAZE.length; r++) {
      for (let c = 0; c < FINAL_MAZE[r].length; c++) {
        if (FINAL_MAZE[r][c] !== '.') continue;
        if ((c + r * 2) % 5 !== 0) continue;
        const mx = FINAL_MAZE_OFFSET.x + c * FINAL_MAZE_CELL + 3;
        const my = FINAL_MAZE_OFFSET.y + r * FINAL_MAZE_CELL + 3;
        x.fillRect(mx, my, 2, 2);
      }
    }
    x.restore();
  }

  function drawFinalSceneryJunk(x) {
    const junk = [
      [18, 100, '#46375f'], [148, 94, '#5f3754'], [22, 250, '#2f5b65'],
      [148, 256, '#6b4a2f'], [14, 160, '#3f2f65'], [154, 174, '#655b2f'],
      [74, 258, '#5b2f45'], [120, 92, '#2f6550'],
    ];
    junk.forEach(([jx, jy, col], i) => {
      x.save();
      x.globalAlpha = 0.72;
      x.fillStyle = col;
      x.fillRect(jx, jy, 10 + (i % 3) * 3, 5 + (i % 2) * 4);
      x.fillStyle = 'rgba(255,255,255,.18)';
      x.fillRect(jx + 2, jy + 1, 3, 1);
      x.restore();
    });
  }

  function drawScanFrame(x, pulse) {
    const sx = Math.round(finalPuzzle.scan.x);
    const sy = Math.round(finalPuzzle.scan.y);
    const w = 54;
    const h = 54;
    x.save();
    x.globalAlpha = 0.12;
    x.fillStyle = '#000';
    x.fillRect(0, 0, VIEW_W, VIEW_H);
    x.globalAlpha = 1;
    x.strokeStyle = finalPuzzle.scanReady ? '#ffe072' : '#d7ccff';
    x.lineWidth = 2;
    x.strokeRect(sx - w / 2, sy - h / 2, w, h);
    x.fillStyle = finalPuzzle.scanReady ? '#ffe072' : '#d7ccff';
    const l = 10;
    x.fillRect(sx - w / 2, sy - h / 2, l, 2);
    x.fillRect(sx - w / 2, sy - h / 2, 2, l);
    x.fillRect(sx + w / 2 - l, sy - h / 2, l, 2);
    x.fillRect(sx + w / 2 - 2, sy - h / 2, 2, l);
    x.fillRect(sx - w / 2, sy + h / 2 - 2, l, 2);
    x.fillRect(sx - w / 2, sy + h / 2 - l, 2, l);
    x.fillRect(sx + w / 2 - l, sy + h / 2 - 2, l, 2);
    x.fillRect(sx + w / 2 - 2, sy + h / 2 - l, 2, l);
    x.globalAlpha = 0.35 + pulse * 0.35;
    x.fillRect(sx - w / 2 + 6, sy, w - 12, 1);
    x.globalAlpha = 1;
    x.restore();
  }

  function drawBuildingGapMarker(cx, buildingY, chestY, p, s) {
    const top = buildingY + 27;
    const bottom = chestY - 3;
    if (bottom <= top) return;
    ctx.globalAlpha = 0.18 + 0.22 * p;
    ctx.fillStyle = s.gold;
    for (let y = top; y < bottom; y += 5) {
      ctx.fillRect(cx, y, 1, 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawGatheringBricks(cx, cy, i, p, s) {
    if (p >= 0.98) return;
    const colors = ['#ffe072', '#ff4e6a', '#9be27a', '#fff7df', '#b89162', '#d9c7ff'];
    for (let b = 0; b < 10; b++) {
      const angle = b * 0.93 + i;
      const radius = (1 - p) * (16 + (b % 4) * 5);
      const px = cx + Math.cos(angle) * radius - 2;
      const py = cy + Math.sin(angle) * radius * 0.65 + 10 - 2;
      ctx.fillStyle = colors[(i + b) % colors.length] || s.gold;
      ctx.fillRect(Math.round(px), Math.round(py), 4, 3);
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.fillRect(Math.round(px), Math.round(py) + 2, 4, 1);
    }
  }

  function drawBellBuilding(cx, cy, p) {
    const h = Math.max(3, Math.round(22 * p));
    const top = cy + 24 - h;
    ctx.fillStyle = '#ffe072';
    ctx.fillRect(cx - 5, top + 4, 10, h - 4);
    ctx.fillRect(cx - 7, top + 11, 14, h - 10);
    ctx.fillRect(cx - 9, cy + 22, 18, 4);
    ctx.fillStyle = '#fff7df';
    ctx.fillRect(cx - 2, top + 3, 4, 2);
    ctx.fillStyle = '#e23a55';
    ctx.fillRect(cx - 7, top + 8, 14, 2);
    ctx.fillRect(cx - 2, top + 6, 4, 8);
    ctx.fillRect(cx - 10, top + 7, 5, 4);
    ctx.fillRect(cx + 5, top + 7, 5, 4);
  }

  function drawFireworkBuilding(cx, cy, p) {
    ctx.fillStyle = '#6d5b7d';
    ctx.fillRect(cx - 10, cy + 18, 20, 5);
    ctx.fillStyle = '#2d2543';
    ctx.fillRect(cx - 7, cy + 13, 14, 5);
    const bursts = [[0, -2], [-8, 4], [9, 5]];
    bursts.forEach(([ox, oy], k) => {
      const pulse = 0.65 + 0.35 * Math.sin(State.time * 7 + k * 2);
      const r = Math.round((5 + k * 2) * pulse * p);
      ctx.fillStyle = k === 0 ? '#ffe072' : k === 1 ? '#ff8fb3' : '#bdfcff';
      ctx.fillRect(cx + ox - r, cy + oy, r * 2 + 1, 1);
      ctx.fillRect(cx + ox, cy + oy - r, 1, r * 2 + 1);
      ctx.fillRect(cx + ox - r / 2, cy + oy - r / 2, 1, 1);
      ctx.fillRect(cx + ox + r / 2, cy + oy + r / 2, 1, 1);
    });
  }

  function drawMochiBuilding(cx, cy, p) {
    ctx.fillStyle = '#b9e889';
    ctx.fillRect(cx - 10, cy + 12, 20, 11);
    ctx.fillRect(cx - 7, cy + 8, 14, 5);
    ctx.fillStyle = '#6fa84b';
    ctx.fillRect(cx - 8, cy + 10, 16, 2);
    ctx.fillStyle = '#fff7df';
    ctx.fillRect(cx - 5, cy + 14, 4, 4);
    ctx.fillRect(cx + 2, cy + 14, 4, 4);
    ctx.fillStyle = '#31532a';
    ctx.fillRect(cx - 4, cy + 15, 2, 1);
    ctx.fillRect(cx + 3, cy + 15, 2, 1);
  }

  function drawTulipBuilding(cx, cy, p) {
    ctx.fillStyle = '#8a5a38';
    ctx.fillRect(cx - 10, cy + 17, 20, 7);
    ctx.fillStyle = '#b89162';
    ctx.fillRect(cx - 8, cy + 18, 16, 5);
    ctx.fillStyle = '#eaf7ff';
    ctx.fillRect(cx - 7, cy + 8, 6, 8);
    ctx.fillRect(cx - 1, cy + 5, 6, 11);
    ctx.fillRect(cx + 5, cy + 8, 6, 8);
    ctx.fillStyle = '#82c97a';
    ctx.fillRect(cx - 1, cy + 15, 2, 5);
    ctx.fillRect(cx + 3, cy + 15, 2, 5);
  }

  function drawCoffeeBuilding(cx, cy, p) {
    ctx.fillStyle = '#fff7df';
    ctx.fillRect(cx - 8, cy + 9, 16, 14);
    ctx.fillStyle = '#c7985a';
    ctx.fillRect(cx - 7, cy + 12, 14, 3);
    ctx.fillStyle = '#5a341f';
    ctx.fillRect(cx - 5, cy + 17, 10, 5);
    ctx.strokeStyle = '#fff7df';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx + 7, cy + 13, 5, 6);
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(255,255,255,.8)';
    ctx.fillRect(cx - 4, cy + 5 - Math.round(Math.sin(State.time * 4)), 1, 3);
    ctx.fillRect(cx + 2, cy + 4 - Math.round(Math.sin(State.time * 3)), 1, 3);
  }

  function drawQueenBuilding(cx, cy, p) {
    ctx.fillStyle = '#d9c7ff';
    ctx.fillRect(cx - 7, cy + 9, 14, 14);
    ctx.fillRect(cx - 10, cy + 20, 20, 4);
    ctx.fillStyle = '#7d3a8a';
    ctx.fillRect(cx - 5, cy + 12, 10, 8);
    ctx.fillStyle = '#ffe072';
    ctx.fillRect(cx - 8, cy + 6, 3, 4);
    ctx.fillRect(cx - 1, cy + 4, 3, 6);
    ctx.fillRect(cx + 6, cy + 6, 3, 4);
    ctx.fillRect(cx - 8, cy + 9, 17, 2);
  }

  function drawFramePedestal(x, y, i, s) {
    const unlocked = State.unlocked[i];
    const ready = State.memoryReadiness[i] === 1;
    // pedestal base
    ctx.fillStyle = s.wall;
    ctx.fillRect(x + 2, y + 6, 8, 4);
    ctx.fillStyle = s.cloakDark;
    ctx.fillRect(x + 2, y + 9, 8, 1);
    // frame
    if (unlocked) {
      ctx.fillStyle = s.gold;
      ctx.fillRect(x + 2, y, 8, 6);
      // inside: glimpse of memory pixel art (just two colors hint)
      ctx.fillStyle = STAGES[Math.min(NUM_MEMORIES, i + 1)].rose;
      ctx.fillRect(x + 3, y + 1, 6, 4);
      ctx.fillStyle = STAGES[Math.min(NUM_MEMORIES, i + 1)].violet;
      ctx.fillRect(x + 3, y + 3, 6, 2);
      // tiny gold bracket
      ctx.fillStyle = s.gold;
      ctx.fillRect(x + 2, y, 8, 1);
      ctx.fillRect(x + 2, y + 5, 8, 1);
    } else {
      // empty pewter frame
      ctx.fillStyle = ready ? s.gold : s.ink2;
      ctx.fillRect(x + 2, y, 8, 6);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 3, y + 1, 6, 4);
      if (ready) {
        // pulsing inner glow
        const pulse = 0.5 + 0.5 * Math.sin(State.time * 4);
        ctx.globalAlpha = 0.3 + 0.4 * pulse;
        ctx.fillStyle = s.gold;
        ctx.fillRect(x + 3, y + 1, 6, 4);
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawNote(x, y, s, blinking = false) {
    // small folded paper with subtle bob
    const bob = Math.sin(State.time * 3 + x * 0.1) * 1;
    if (blinking) {
      const pulse = 0.5 + 0.5 * Math.sin(State.time * 7);
      ctx.globalAlpha = 0.35 + 0.35 * pulse;
      ctx.fillStyle = s.gold;
      ctx.fillRect(x, y + 1 + bob, 12, 10);
      ctx.fillRect(x + 4, y - 4 + bob, 4, 3);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = '#f4ecd8';
    ctx.fillRect(x + 3, y + 4 + bob, 6, 5);
    ctx.fillStyle = '#cdb98a';
    ctx.fillRect(x + 3, y + 4 + bob, 6, 1);
    ctx.fillStyle = '#8a7a4a';
    ctx.fillRect(x + 4, y + 6 + bob, 4, 1);
    // glow
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(State.time * 4);
    ctx.fillStyle = s.gold;
    ctx.fillRect(x + 2, y + 3 + bob, 8, 7);
    ctx.globalAlpha = 1;
    if (blinking) {
      ctx.fillStyle = '#ffe072';
      ctx.fillRect(x + 5, y - 4 + bob, 2, 1);
      ctx.fillRect(x + 5, y - 2 + bob, 2, 1);
    }
  }

  function drawStar(sx, sy, s) {
    const t = State.time * 4;
    const pulse = 0.7 + 0.3 * Math.sin(t);
    // big halo
    ctx.globalAlpha = 0.35 * pulse;
    ctx.fillStyle = s.gold;
    ctx.fillRect(Math.floor(sx) - 4, Math.floor(sy), 9, 1);
    ctx.fillRect(Math.floor(sx), Math.floor(sy) - 4, 1, 9);
    // diamond core
    ctx.globalAlpha = 1;
    ctx.fillStyle = s.gold;
    ctx.fillRect(Math.floor(sx) - 1, Math.floor(sy), 3, 1);
    ctx.fillRect(Math.floor(sx), Math.floor(sy) - 1, 1, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.floor(sx), Math.floor(sy), 1, 1);
  }

  function drawPetals(s) {
    for (const p of State.petals) {
      ctx.globalAlpha = Math.min(1, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawVignette(s) {
    // Soft dark vignette at corners; eases with stage (still present but thinner)
    const g = ctx.createRadialGradient(VIEW_W / 2, VIEW_H / 2, 30, VIEW_W / 2, VIEW_H / 2, 200);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    const edgeAlpha = State.stage < 2 ? 0.7 : State.stage < 4 ? 0.55 : 0.4;
    g.addColorStop(1, `rgba(0,0,0,${edgeAlpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // ---------- Player rendering (detail grows with stage) ----------
  function drawPlayer(s) {
    const px = Math.floor(player.x - 4);
    const py = Math.floor(player.y - 6);
    const bob = player.moving ? Math.floor((player.walkFrame % 2)) : 0;

    // soft shadow
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 1, py + 11, 6, 1);
    ctx.globalAlpha = 1;

    // STAGE 0: barely-there silhouette (no face, near-monochrome)
    // STAGE 1: add small gold spark over chest
    // STAGE 2: introduce violet cloak / scarf
    // STAGE 3: rose accent (heart pin)
    // STAGE 4: face lights up (eyes visible), hair detail
    // STAGE 5: full color, hand-holding pose available

    // head
    ctx.fillStyle = State.stage >= 1 ? '#efe4d1' : '#8c8995'; // skin warms in
    ctx.fillRect(px + 2, py + bob, 4, 4);

    // hair
    ctx.fillStyle = State.stage >= 4 ? '#3a2a44' : State.stage >= 2 ? '#2a2638' : '#1c1c24';
    ctx.fillRect(px + 2, py + bob, 4, 2);
    if (State.stage >= 3) {
      // side bangs
      ctx.fillRect(px + 2, py + 2 + bob, 1, 1);
      ctx.fillRect(px + 5, py + 2 + bob, 1, 1);
    }

    // face details
    if (State.stage >= 4) {
      // eyes
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(px + 3, py + 2 + bob, 1, 1);
      ctx.fillRect(px + 5, py + 2 + bob, 1, 1);
      if (State.stage >= 5) {
        // tiny smile
        ctx.fillStyle = '#a85a6a';
        ctx.fillRect(px + 4, py + 3 + bob, 1, 1);
      }
    }

    // body / cloak
    const bodyTop = py + 4 + bob;
    const cloakColor =
      State.stage >= 5 ? '#7d3a8a' :
      State.stage >= 4 ? '#5a3a8a' :
      State.stage >= 2 ? '#3a3460' :
      State.stage >= 1 ? '#2a2a3a' :
      '#1f1e26';
    ctx.fillStyle = cloakColor;
    ctx.fillRect(px + 1, bodyTop, 6, 5);
    // cloak shading
    ctx.fillStyle = State.stage >= 2 ? '#2a2440' : '#15141c';
    ctx.fillRect(px + 1, bodyTop + 4, 6, 1);

    // arms / sway
    const sway = player.moving ? (player.walkFrame % 2 === 0 ? 0 : 1) : 0;
    ctx.fillStyle = cloakColor;
    ctx.fillRect(px, bodyTop + 1 + sway, 1, 3);
    ctx.fillRect(px + 7, bodyTop + 1 - sway, 1, 3);

    // gold spark on chest (stage 1+)
    if (State.stage >= 1) {
      const pulse = 0.6 + 0.4 * Math.sin(State.time * 6);
      ctx.globalAlpha = pulse;
      ctx.fillStyle = s.gold;
      ctx.fillRect(px + 3, bodyTop + 1, 2, 1);
      ctx.fillRect(px + 4, bodyTop, 1, 1);
      ctx.globalAlpha = 1;
    }
    // rose heart (stage 3+)
    if (State.stage >= 3) {
      ctx.fillStyle = s.rose;
      ctx.fillRect(px + 2, bodyTop + 2, 1, 1);
      ctx.fillRect(px + 4, bodyTop + 2, 1, 1);
      ctx.fillRect(px + 2, bodyTop + 3, 3, 1);
      ctx.fillRect(px + 3, bodyTop + 4, 1, 1);
    }
    // violet scarf (stage 2+)
    if (State.stage >= 2) {
      ctx.fillStyle = s.violet;
      ctx.fillRect(px + 1, bodyTop, 6, 1);
    }

    // legs
    ctx.fillStyle = State.stage >= 2 ? '#1a1830' : '#15151a';
    const legA = bodyTop + 5;
    if (player.moving && player.walkFrame % 2 === 1) {
      ctx.fillRect(px + 2, legA, 2, 2);
      ctx.fillRect(px + 4, legA, 2, 1);
    } else {
      ctx.fillRect(px + 2, legA, 2, 1);
      ctx.fillRect(px + 4, legA, 2, 2);
    }

    // ambient glow around player at higher stages
    if (State.stage >= 4) {
      const g = ctx.createRadialGradient(player.x, player.y, 2, player.x, player.y, 14);
      g.addColorStop(0, s.goldGlow);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(player.x - 16, player.y - 16, 32, 32);
    }
  }

  // ---------- Main loop ----------
  let lastT = performance.now();
  function frame(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000);
    lastT = t;
    update(dt);
    if (State.mode === 'play' || State.mode === 'modal') {
      renderWorld();
    } else if (State.mode === 'finalPuzzle') {
      renderFinalPuzzle();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Expose for QA hooks
  window.render_game_to_text = () => JSON.stringify({
      mode: State.mode,
      stage: State.stage,
      keys: State.keys,
      finalPuzzleStarted: State.finalPuzzleStarted,
      finalPuzzleSolved: State.finalPuzzleSolved,
      finalPuzzle: State.mode === 'finalPuzzle' ? {
        phase: finalPuzzle.phase,
        player: finalPuzzle.player,
        keys: finalPuzzle.keys,
        keySpawns: finalPuzzle.keySpawns,
        currentField: getFinalFieldIndex(finalPuzzle.player.col, finalPuzzle.player.row),
        collectedCount: finalPuzzle.collectedCount,
        activeSpikes: FINAL_SPIKES.filter((spike) => !finalPuzzle.keys[spike.key]).map((spike) => ({ col: spike.col, row: spike.row, key: spike.key })),
        scan: { x: Math.round(finalPuzzle.scan.x), y: Math.round(finalPuzzle.scan.y), ready: finalPuzzle.scanReady },
      } : null,
      unlocked: State.unlocked,
    player: { x: Math.round(player.x), y: Math.round(player.y) },
    star: State.starVisible ? State.starPos : null,
    near: State.nearInteractable ? { kind: State.nearInteractable.kind, mem: State.nearInteractable.memIdx } : null,
    readiness: State.memoryReadiness,
    floatText: floatText ? floatText.text : null,
  });
  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / 16));
    for (let i = 0; i < steps; i++) update(1 / 60);
    if (State.mode === 'play' || State.mode === 'modal') renderWorld();
    else if (State.mode === 'finalPuzzle') renderFinalPuzzle();
  };
  // Test helpers
  window.__game = {
    State,
    player,
    MEMORIES,
    interactables,
    framePositions,
    notePositions,
    openPuzzle,
    completePuzzle,
    openEnding,
    openFinalPuzzleIntro,
    openFinalPuzzle,
    completeFinalPuzzle,
    openHeartFrameCutscene,
    openFinalCutscene,
    openVideoEnding,
    triggerInteract,
  };

  // ---------- Intro cutscene ----------
  function runIntro(onDone) {
    State.mode = 'intro';
    screens.intro.classList.remove('hidden');
    const ic = $('#intro-canvas');
    const ix = ic.getContext('2d');
    ix.imageSmoothingEnabled = false;

    const beats = [
      { t: 0,    text: '' },
      { t: 0.6,  text: 'falling.' },
      { t: 3.0,  text: 'they did not know where.' },
      { t: 5.6,  text: 'the dark was soft, like a cloak.' },
      { t: 8.4,  text: 'and then —' },
      { t: 10.2, text: 'a star, out of nowhere.' },
      { t: 12.6, text: '' },
    ];
    const total = 13.5;
    let elapsed = 0;
    let last = performance.now();
    let stopped = false;
    const figure = { x: 90, y: -20, vy: 30 };

    function step() {
      if (stopped) return;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;

      // Background
      ix.fillStyle = '#04040a';
      ix.fillRect(0, 0, 180, 320);
      // moving cloak waves at bottom
      for (let i = 0; i < 6; i++) {
        const wy = 220 + i * 14 + Math.sin(elapsed * 0.5 + i) * 6;
        ix.fillStyle = i % 2 === 0 ? '#0c0a18' : '#15122a';
        ix.fillRect(0, wy, 180, 18);
      }
      // ambient sparse stars
      ix.fillStyle = '#fff';
      [[20,30],[60,18],[100,40],[140,22],[160,80],[30,90],[120,90]].forEach(([sx,sy], i) => {
        ix.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(elapsed * 1.2 + i));
        ix.fillRect(sx, sy, 1, 1);
      });
      ix.globalAlpha = 1;

      // falling figure
      figure.y += figure.vy * dt;
      // tumble: alternate facing
      const fy = Math.floor(figure.y);
      // body
      ix.fillStyle = '#8c8995';
      ix.fillRect(figure.x - 2, fy, 4, 4);     // head
      ix.fillStyle = '#1f1e26';
      ix.fillRect(figure.x - 3, fy + 4, 6, 6); // robe
      // robe tail
      ix.fillStyle = '#0c0a18';
      ix.fillRect(figure.x - 4, fy + 9, 8, 2);
      // arms flailing
      ix.fillStyle = '#1f1e26';
      const a = Math.sin(elapsed * 6);
      ix.fillRect(figure.x - 5, fy + 4 + Math.floor(a * 2), 1, 2);
      ix.fillRect(figure.x + 4, fy + 4 - Math.floor(a * 2), 1, 2);

      // landed: clamp figure on ground after ~7s
      if (figure.y > 230) {
        figure.y = 230;
        // small dust puff
        ix.fillStyle = 'rgba(180,178,200,0.25)';
        ix.fillRect(figure.x - 6, 240, 12, 3);
      }

      // appearance of the star at t≈10
      if (elapsed > 9.5) {
        const sx = 110;
        const sy = 110 + Math.sin(elapsed * 2) * 4;
        const intensity = Math.min(1, (elapsed - 9.5) / 1.5);
        ix.globalAlpha = intensity;
        ix.fillStyle = '#f7d36a';
        // halo
        ix.fillRect(sx - 5, sy, 11, 1);
        ix.fillRect(sx, sy - 5, 1, 11);
        // core
        ix.globalAlpha = intensity;
        ix.fillRect(sx - 1, sy, 3, 1);
        ix.fillRect(sx, sy - 1, 1, 3);
        ix.fillStyle = '#fff';
        ix.fillRect(sx, sy, 1, 1);
        ix.globalAlpha = 1;
      }

      // Vignette
      const g = ix.createRadialGradient(90, 160, 40, 90, 160, 200);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.85)');
      ix.fillStyle = g;
      ix.fillRect(0, 0, 180, 320);

      // Choose current beat text
      let currentText = '';
      for (let i = 0; i < beats.length; i++) {
        if (elapsed >= beats[i].t) currentText = beats[i].text;
      }
      $('#intro-text').textContent = currentText;

      if (elapsed >= total) {
        stopped = true;
        finish();
        return;
      }
      requestAnimationFrame(step);
    }

    function finish() {
      screens.intro.classList.add('hidden');
      $('#intro-text').textContent = '';
      State.mode = 'play';
      hud.classList.remove('hidden');
      controls.classList.remove('hidden');
      memHaveEl.textContent = '0';
      // first-spark prompt
      showFloat('chase the light…');
      if (onDone) onDone();
    }

    $('#intro-skip').onclick = () => { stopped = true; finish(); };
    requestAnimationFrame(step);
  }

  // ---------- Boot ----------
  function startGame() {
    screens.start.classList.add('hidden');
    runIntro(() => { /* gameplay begins */ });
  }
  $('#start-btn').addEventListener('click', startGame);
  $('#how-btn').addEventListener('click', () => {
    screens.start.classList.add('hidden');
    screens.how.classList.remove('hidden');
  });
  $('#how-back').addEventListener('click', () => {
    screens.how.classList.add('hidden');
    screens.start.classList.remove('hidden');
  });

  // ESC closes whatever modal is open
  function closeAllModals() {
    [screens.note, screens.puzzle, screens.unlock, screens.help, screens.journal, screens.memoryView].forEach((el) => {
      if (!el.classList.contains('hidden')) el.classList.add('hidden');
    });
    if (State.mode === 'modal') State.mode = 'play';
  }

  // ---------- Persistent config (assets at boot) ----------
  if (window.VALENTINE_ASSETS && Array.isArray(window.VALENTINE_ASSETS.photos)) {
    window.VALENTINE_ASSETS.photos.forEach((p, i) => { if (p) State.customPhotos[i] = p; });
  }
  if (window.VALENTINE_ASSETS && window.VALENTINE_ASSETS.finalPicture) {
    State.customFinalPicture = window.VALENTINE_ASSETS.finalPicture;
  }
  if (window.VALENTINE_ASSETS && window.VALENTINE_ASSETS.backgroundPhoto) {
    document.documentElement.style.setProperty('--main-photo', `url("${window.VALENTINE_ASSETS.backgroundPhoto}")`);
    document.documentElement.classList.add('has-main-photo');
  }

})();
