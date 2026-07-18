THE GARAGE — setup notes
=========================

FOLDER STRUCTURE NEEDED (create these two folders next to index.html):

  models/     <- your .glb files go here
  sounds/     <- add one engine sound file per car here

MODEL FILES NEEDED (.glb, filenames must match exactly):

  models/vento.glb
  models/azuro.glb
  models/nightshade.glb
  models/bmw.glb
  models/audi.glb
  models/ferrari.glb
  models/mercedes.glb   <- NEW, you'll need to source/download this one
  models/bugatti.glb    <- NEW, you'll need to source/download this one

SOUND FILES NEEDED (mp3 format, one per car, filenames must match exactly):

  sounds/vento.mp3
  sounds/azuro.mp3
  sounds/nightshade.mp3
  sounds/bmw.mp3
  sounds/audi.mp3
  sounds/ferrari.mp3
  sounds/mercedes.mp3
  sounds/bugatti.mp3

If a sound file is missing for a car, the site won't crash — it just logs a
warning in the browser console and stays silent for that car until you add
the file.

EACH SOUND FILE SHOULD CONTAIN THE FULL SEQUENCE
--------------------------------------------------
One file per car, containing the whole rev-up + driving-away sound in one
clip (e.g. key-start -> rev -> pulls away -> fades). A single tap on the car
(or the "Rev Engine" button) plays that file start to finish. While it's
playing, the button shows "Playing…" and further taps are ignored so the
sequence never gets cut off mid-way — it always plays through completely
before it can be triggered again.

WHAT CHANGED IN THIS VERSION
-----------------------------
- Roster updated: removed Lumen X1, Solace Roadster, and Kestrel Spyder.
  Added Mercedes-AMG GT Black Series and Bugatti Chiron Super Sport (real
  specs: 730 hp / 325 km/h / 3.2s, and 1578 hp / 490 km/h / 2.3s). You'll
  need to add models/mercedes.glb, models/bugatti.glb, sounds/mercedes.mp3,
  and sounds/bugatti.mp3 — and can delete the old lumen/solace/kestrel
  files from models/ and sounds/ if they're still there.
- Removed: Interior/Engine view modes, bonnet-open hotspot, "view interior"
  hotspot, and all related code. The viewer now only ever shows the full
  car, rotatable 360°.
- Added: tap/click the car (a short tap, not a drag) to play that car's
  engine sound. There's also a "Rev Engine" button top-right that does
  the same thing.
- Fixed: main.js was importing "./carBuilder.js" but the file was named
  "car_builder.js" — this would have 404'd in the browser. Renamed the
  file to carBuilder.js to match.
- Removed the unused "body" field from cars.js (leftover from an earlier
  procedural-geometry version, not used now that real .glb models load).

HOW TO RUN
----------
Double-click start.command (Mac) — it starts a local server and opens
the site at http://localhost:8080
