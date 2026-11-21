# Runtime provenance and licenses

All runtime resources are vendored. The browser loads **no external URLs/CDNs**.

- Official MuJoCo single-thread WASM and JS: `@mujoco/mujoco@4.0.1`, Apache-2.0, Google DeepMind. Acquired from https://registry.npmjs.org/@mujoco/mujoco/-/mujoco-4.0.1.tgz . Official source: https://github.com/google-deepmind/mujoco/tree/4.0.1/wasm . License: vendor/mujoco-LICENSE.txt.
- Franka Emika Panda: MuJoCo Menagerie, Apache-2.0. Pinned commit `370c43965323c0944b433b202aac5058b5f907a9`. Source: https://github.com/google-deepmind/mujoco_menagerie/tree/370c43965323c0944b433b202aac5058b5f907a9/franka_emika_panda . A gzip-compressed, standard MuJoCo binary model is compiled with the same official 4.0.1 engine for quicker startup. Original XML and 67 meshes are preserved in models/panda; license in models/panda/LICENSE. The derived packing.xml adds a tool site, fingertip friction, a 2 ms timestep, three free parcels and a static physical box; removes the stock keyframe.
- Three.js 0.181.1: MIT, https://registry.npmjs.org/three/-/three-0.181.1.tgz . License: vendor/three-LICENSE.txt.

Development/testing only: Playwright 1.56.1 (Apache-2.0); Chromium (BSD and bundled license notices); ffmpeg supplied with Playwright; extracted Ubuntu browser shared libraries. These are not loaded by the page.

Original application code, native canvas labels, CSS, and task geometry: MIT, copyright 2026 Packing Demo Recorder contributors. Render-only mesh vertex clustering reduces visual detail at 3 mm resolution; physical collision meshes remain unchanged. No external art, fonts, copied game, or generative model calls.
