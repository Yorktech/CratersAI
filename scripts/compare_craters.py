import cv2
import numpy as np
import argparse


def detect_craters(image, dp=1.2, min_dist=30, param1=50, param2=30, min_radius=5, max_radius=50):
    """Detect potential craters in an image using Hough circle transform."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=dp,
        minDist=min_dist,
        param1=param1,
        param2=param2,
        minRadius=min_radius,
        maxRadius=max_radius,
    )
    if circles is not None:
        circles = np.round(circles[0, :]).astype(int)
        return circles.tolist()
    return []


def match_craters(base, comp, thresh=15):
    """Return new and missing craters comparing comp image to base."""
    base_matched = [False] * len(base)
    comp_matched = [False] * len(comp)
    for i, c2 in enumerate(comp):
        for j, c1 in enumerate(base):
            dist = np.linalg.norm(np.array(c2[:2]) - np.array(c1[:2]))
            if dist < thresh and abs(c2[2] - c1[2]) < thresh:
                base_matched[j] = True
                comp_matched[i] = True
                break
    new = [c for c, m in zip(comp, comp_matched) if not m]
    missing = [c for c, m in zip(base, base_matched) if not m]
    return new, missing


def annotate(image, circles, color):
    for x, y, r in circles:
        cv2.circle(image, (x, y), r, color, 2)


def main(img1_path, img2_path, out_prefix):
    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    if img1 is None or img2 is None:
        raise SystemExit("Could not load input images")
    c1 = detect_craters(img1)
    c2 = detect_craters(img2)
    new, missing = match_craters(c1, c2)

    annotate(img1, c1, (255, 0, 0))
    annotate(img2, c2, (255, 0, 0))
    annotate(img2, new, (0, 255, 0))
    annotate(img1, missing, (0, 0, 255))

    cv2.imwrite(f"{out_prefix}_img1.png", img1)
    cv2.imwrite(f"{out_prefix}_img2.png", img2)

    print("Image1 craters:", len(c1))
    print("Image2 craters:", len(c2))
    print("New craters in image2:", len(new))
    print("Missing craters from image1:", len(missing))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compare lunar craters between two images")
    parser.add_argument("image1", help="Earlier image")
    parser.add_argument("image2", help="Later image")
    parser.add_argument("--out", default="comparison", help="Output image prefix")
    args = parser.parse_args()
    main(args.image1, args.image2, args.out)
