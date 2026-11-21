# robodata demos

Demos from our robot-data experiments, November 2026: what breaks robot training data, shown on real simulator runs and open datasets.

Online: gallery https://ri-ru.github.io/robodata-demos/demos/ and robot page https://ri-ru.github.io/robodata-demos/demos/H4-packing-recorder/site/ . Or open `demos/index.html` locally. To serve everything locally:

```
python3 -m http.server 8000
```

Then open http://localhost:8000/demos/ (gallery) or http://localhost:8000/demos/H4-packing-recorder/site/ (interactive MuJoCo page).

## Contents

| Folder | What it shows | Key numbers |
|---|---|---|
| `demos/D1-wrong-clock/` | robomimic robot: same start state, policies trained on clean vs time-shifted data, and without the last 10 % of each demo | Lift: clean 93.3 %, observation 50 ms late 72.0 %, 100 ms 41.3 %, 200 ms 0.7 %. Can: last 10 % cut 66.7 % (clean 94.7 %) |
| `demos/D2-glove-overlay/` | Two free hand detectors (RTMDet, MediaPipe) side by side on gloved and bare hands (NVIDIA Human-1M, CC BY 4.0) | Dark gloves: MediaPipe finds a hand in 14 of 450 frames. On 118 human-labelled frames: RTMDet 117, MediaPipe 24 |
| `demos/D3-step-vocabulary/` | Grouping 41,705 free-text step labels into a fixed vocabulary | Cross-vendor next-step top-1: free text 0.02 %, 200 groups 37.8 %, "repeat last step" 54.7 % |
| `demos/H4-packing-recorder/` | Interactive browser page: MuJoCo 4.0.1 WASM + Menagerie Franka Panda. Record a packing demo by keyboard, replay it, train a nearest-neighbour policy with shifted camera timestamps | One take: 0 ms shift packs 1 parcel, 200 ms packs 0 |
| `demos/H6-frontier-curriculum/` | PPO on a 2-link reach: uniform vs "frontier" task sampling | No gain: 80 % on hard levels at 24.6k–28.7k steps (uniform) vs 28.7k (frontier), 3 fresh seeds |

## Limits

Simulation and open data only; robot-state policies, not image policies; 3 seeds per setting; H4 is one take. The D2 RTMDet weights were trained partly on non-commercial data (FreiHand): research use only.

## Sources and licences

robomimic (MIT), MuJoCo and MuJoCo Menagerie (Apache 2.0), Three.js (MIT), NVIDIA PhysicalAI-Human-1M-100K (CC BY 4.0), MediaPipe (Apache 2.0). Details per demo in the folders.

## What was done

- 2026-11-21: robot page follows the house rules: one font and text size, greys only, no monospace labels or side bar
- 2026-11-21: gallery: one font (IBM Plex Sans, self-hosted), greys only, no coloured accents or borders
- 2026-11-21: calmer design (one headline, no banner, badges, numbering or footer); videos cropped of burned-in titles (*_web.mp4); robot page header cleaned
- 2026-11-21: public, served by GitHub Pages at https://ri-ru.github.io/robodata-demos/demos/ ; restored the H4 page's index.html (dropped by the first copy)
- 2026-11-21: first version: D1–D3, H4, H6 demos and the gallery page
