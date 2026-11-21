# Packing Demo Recorder

Serve **only `demo/site/`** with any static HTTP server:

```sh
python3 -m http.server 8000 --directory demo/site
```

Open http://localhost:8000 . No build, npm install, network connection, server API, or cross-origin isolation headers are needed at runtime. The folder contains the official MuJoCo 4.0.1 WebAssembly build, Three.js, a precompiled standard MuJoCo binary scene plus all 67 source Menagerie Panda meshes, source, licenses, and a recorded example. Runtime external URLs/CDNs: **none**. Downloaded asset source URLs are listed in `site/THIRD_PARTY.md`.

- Click **Start recording** (or R).
- **W/S** move toward/away from the box, **A/D** move left/right in world coordinates; **Q/E** lower/raise. Arrow keys also move in the table plane.
- **Space** closes/opens the physical fingers. The initial gripper is above the coral parcel. Lower to roughly 0.036 m, close, pause, lift above the 0.12 m walls, move over the box, lower and open.
- Stop recording, **Replay demo**, or download the JSON.
- Move **Camera lag** from 0 to 200 ms, then **Train & run policy**. Every run restores the same initial physics state and uses the same demonstration.
- **Load a recorded example** supplies the tested keyboard-recorded packing take. It packs the coral parcel and leaves the other two available.
- Drag the canvas to orbit; scroll to zoom. Recordings remain in browser memory until downloaded. Reset retains the saved take.

The lag experiment isolates **training timestamp error**: camera timestamps are shifted later before pairing to actions. Live policy observations stay current. A local, order-preserving 1-NN policy chooses short future joint controls from idealized tracked scene features (tool xyz, aperture, parcel xyz), not rendered pixels. It is a deliberately simple baseline, with no GPU or learned vision model. Some takes are more robust than others; the page reports actual packing and tool mismatch. See `site/about.html` for the details.

`tools/` contains reproducible Playwright tests and the small scene generator. `packing` is a browser test instrumentation object; `paused=true` and `advance(seconds)` let tests exercise the same keyboard/control/physics loop deterministically without waiting for software-rendered frames. These hooks do not change dynamics or substitute saved object positions.

All substantial test processes use four CPU cores (`taskset -c 0-3`) and OMP/MKL threads 1. Browser rendering is software-only (SwiftShader, `--disable-gpu`). Model/API calls: 0.
