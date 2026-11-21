# D2: free hand detectors on factory gloves

Open index.html for the three videos and human-labelled summary chart.
Each MP4 plays the first 15 seconds of its episode at 30 fps; the GIF is a smaller looping preview of the same 15 seconds.
The left panel displays every returned RTMDet-nano box with score >= 0.10.
The right panel displays MediaPipe Hand Landmarker with detection/presence confidence 0.50 and at most two hands.
Both methods receive the same native 1920 x 1080 frame; MediaPipe uses independent IMAGE-mode detection, matching E3b mp_default.
RTMDet uses the publisher's 320-square BGR normalization and right/bottom padding; boxes are scaled back to the source frame.
All outputs are fresh inference on the copied source videos, not sample-frame interpolation.

The running counter increments when the method outputs any box or landmark hand on that frame.
The videos have no frame-by-frame human labels, so this counter is an output-presence count, not verified hand recall.
RTMDet can count a hit while placing its boxes on background objects; inspect the boxes before interpreting its high rate.

The summary uses the supplied 120 human labels, retains all 118 hand-present frames (including one marked ambiguous), and excludes the two hand-absent frames.
Predictions are joined by episode ID and episode-relative frame index, with no missing matches or duplicate method/frame pairs.
The chart shows all 12 detector variants in E3b, excluding decode_png because it is a decoding measurement, not a detector.
The 118 frames comprise 109 gloved and 9 bare-hand frames; the original selection included 40 disagreement-selected frames.
The percentages describe this enriched review set, not population performance.
No human bounding boxes or landmarks exist in this truth file, so localization accuracy is unmeasured.

Source videos: NVIDIA PhysicalAI-Human-1M-100K, https://huggingface.co/datasets/nvidia/PhysicalAI-Human-1M-100K, CC BY 4.0.
Derived overlays retain episode IDs; source path/time mappings are copied in ../inputs/source_episodes.csv and ../inputs/selection_provenance.csv.
MediaPipe is Apache-2.0; the requested RTMDet-nano release comes from the Apache-2.0 OpenMMLab MMPose project.
The inherited model audit records no separate RTMDet weight licence and a non-commercial FreiHand training-data source; this demo does not claim commercial deployment clearance of those weights.
See ../licenses/E3b_LICENSE_AUDIT.md for the complete inherited provenance record and ../licenses/ for preserved notices.
No additional model or training dataset was downloaded.
Added encoding tooling: imageio-ffmpeg 0.6.0 (BSD), bundled FFmpeg 7.0.2 (GPLv3, commercial use permitted); generated video assets are not software derivatives of FFmpeg.

Compute is pinned with taskset to cores 0-3; OMP, MKL, OpenBLAS, NumExpr, OpenCV and ONNX intra/inter-op threads are 1.
Reproduce from this folder with the existing read-only /data/data-taste/.venv/bin/python:

    taskset -c 0-3 env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 PYTHONDONTWRITEBYTECODE=1 /data/data-taste/.venv/bin/python render_demo.py --seconds 15
    taskset -c 0-3 env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 PYTHONDONTWRITEBYTECODE=1 /data/data-taste/.venv/bin/python package_demo.py gifs
    taskset -c 0-3 env OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 PYTHONDONTWRITEBYTECODE=1 /data/data-taste/.venv/bin/python package_demo.py chart

Detailed fresh overlay predictions are retained in ../work/*_15s_predictions.json; the human/prediction join is retained in ../work/human_prediction_join.csv.
