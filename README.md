# CratersAI

This repository contains a small web demo and a Python script for detecting and comparing lunar craters in two images.

## Python crater comparison

The `scripts/compare_craters.py` script uses OpenCV's Hough circle transform to detect potential craters in each image. It then highlights new and missing craters between the two images.

### Requirements

- Python 3
- `opencv-python` and `numpy`

Install the requirements with:

```bash
pip install opencv-python numpy
```

### Usage

```
python scripts/compare_craters.py <image1> <image2> --out result
```

This will create `result_img1.png` and `result_img2.png` showing detected craters. New craters in the second image are highlighted in green and missing craters from the first image are highlighted in red.
