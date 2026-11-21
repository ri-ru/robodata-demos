# H6: curriculum at the success frontier

This CPU-only experiment compares vanilla Stable-Baselines3 PPO with uniform,
hardest-only, and frontier training task selection. The custom two-link MuJoCo
arm is a reach task with six nominal initial-to-goal distances:
0.08, 0.16, 0.28, 0.43, 0.62, and 0.85 metres.

The arm starts near `[0.6, 0]`. Targets lie near a 0.6 m circle, at the polar
angle corresponding to each nominal distance, with random clockwise or
counterclockwise direction and radius jitter of ±0.01 m. Initial joints have
±0.025 rad noise. Both links are 0.4 m; every target is reachable. Two actions
apply shoulder/elbow torques up to 0.3 Nm. The simulator uses 0.01 s RK4 steps,
five simulator steps per action, and a 100-action horizon (5 s).

Success means entering a 0.04 m goal ball; the episode then ends. The reward is
`previous_distance - distance - 0.005 - 0.0005 * sum(action**2) + 5 * success`.
This small, fixed progress shaping is identical across methods. No analytical
controller, demonstration, replay buffer, or evaluation result trains PPO.

## Samplers

- Uniform: each difficulty has probability 1/6 at episode reset.
- Hardest-only: always train the 0.85 m target.
- Frontier: shared across the eight training environments, maintain per-level
  training-episode success EMA with alpha 0.05. Sample 90% uniformly among
  levels with estimated success in [0.2, 0.8], plus 10% uniformly over all levels.
  If the band is empty, select the first unmastered level; if all are mastered,
  select the hardest. The initial estimates are 0.5 for the easiest and zero for
  others. This is an explicit curriculum prior; it is not learned from evaluation.

PPO: CPU, separate actor/critic MLPs `[64,64]`, learning rate 3e-4, 8 environments,
512 steps/environment/rollout (4096 aggregate steps), batch 256, 5 epochs,
gamma 0.99, GAE lambda 0.95, clipping 0.2, entropy coefficient 0.01, value
coefficient 0.5, gradient clipping 0.5. All methods share these settings.

## Reproduce

Run from the parent workspace. Install the CPU PyTorch wheel separately:

```bash
python3 -m venv .venv
.venv/bin/pip install --index-url https://download.pytorch.org/whl/cpu torch
.venv/bin/pip install -r demo/requirements.txt
taskset -c 0 env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 CUDA_VISIBLE_DEVICES= .venv/bin/python demo/check_task.py
taskset -c 0 env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 CUDA_VISIBLE_DEVICES= .venv/bin/python demo/train.py --mode easy --seed 0 --steps 131072 --eval-episodes 100 --out demo/runs/positive_control
.venv/bin/python demo/batch.py --steps 262144 --episodes 40 --cores 1 2 3 --root demo/runs/screen
taskset -c 0 env OPENBLAS_NUM_THREADS=1 .venv/bin/python demo/analyze.py --root demo/runs/screen --cap 262144 --tag screen
```

Full-run commands and chosen methods are recorded in `../RESULT.md` and the
per-core command files in the corresponding run directory. `batch.py` uses at
most four explicitly pinned one-core workers and enforces the requested
2026-11-21 20:00 UTC stop deadline. Each numerical library and torch uses one
thread. No GPU or model API calls are used.

The completed confirmation uses seeds 10–12 and 524,288 steps/run, with 100
evaluation episodes/level every 4,096 steps through 65,536 and every 32,768
thereafter. Choose a fresh output directory when reproducing; existing results
require `--resume`. Checkpoints are saved after evaluations.

Execution-host SIGTERM events required recovery of two confirmation runs.
Uniform seed 12 was repeated from scratch. Frontier seed 12 was repeated and
then continued from its 40,960-step checkpoint, retaining PPO optimizer and
sampler state while resetting training environment/global random streams.
All reported early learning thresholds occur before that checkpoint, and the
repeated early success/sampler traces match the initial attempt exactly.
The final report and `interrupted/README.md` describe the recovery and its scope.

Evaluation uses deterministic policy actions and a fixed, separate random task
stream shared across methods and training seeds. Each evaluation has the stated
episodes per level; asynchronous vector evaluation can simulate extra episodes
at faster levels, which are excluded from success estimates. All evaluation
simulation steps, including extra episodes, are logged and excluded from the
training-step budget. Evaluations never update the sampler.

## Interpretation

`analyze.py` writes success curves for each level and the mean of the two
hardest levels. Shading is standard deviation across independent PPO seeds,
not a confidence interval based on treating evaluation episodes as independent
training replicates. Summary JSON includes first and sustained 80% crossings,
90% hardest-level crossings, and hard-level AUC. Crossings are quantized to the
evaluation interval. A missing crossing is right-censored, not a speed ratio.

The three-method screen chooses the two highest hard-level success AUC methods.
Full runs use three fresh training seeds to separate selection from confirmation.
This is a small shaped-reward reaching benchmark; it does not establish an effect
on contact-rich pushing, sparse-only rewards, or large robot policies.

Original code and XML: MIT (see `LICENSE`). MuJoCo: Apache-2.0;
Stable-Baselines3 and Gymnasium: MIT; NumPy/PyTorch: permissive licenses;
Matplotlib: permissive BSD/PSF-style license. Versions and metadata are recorded
in `requirements-lock.txt` and `dependency_licenses.json`.
