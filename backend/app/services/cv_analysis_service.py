from pathlib import Path
from typing import Optional, Tuple, Dict, Any
import cv2
import numpy as np
from app.core.config import settings

class CvAnalysisService:
    @staticmethod
    def compare_packaging_images(
        scanned_image_path: Path,
        reference_image_path: Optional[Path] = None
    ) -> Tuple[Optional[float], Optional[str]]:
        """
        Compares scanned packaging image against an approved reference packaging image.
        Uses OpenCV color histogram correlation and ORB feature descriptor matching.
        Returns:
            (visual_similarity_score [0.0 - 100.0], packaging_analysis_notes)
        """
        if not reference_image_path or not reference_image_path.exists():
            return None, "No approved reference packaging photograph on file for this medicine record."

        if not scanned_image_path.exists():
            return None, "Scanned image file could not be accessed."

        # Load both images
        img_scan = cv2.imread(str(scanned_image_path))
        img_ref = cv2.imread(str(reference_image_path))

        if img_scan is None or img_ref is None:
            return None, "Failed to decode image data for computer vision comparison."

        # 1. Histogram comparison in HSV color space
        hsv_scan = cv2.cvtColor(img_scan, cv2.COLOR_BGR2HSV)
        hsv_ref = cv2.cvtColor(img_ref, cv2.COLOR_BGR2HSV)

        # Quantize hue to 50 levels and saturation to 60 levels
        hist_scan = cv2.calcHist([hsv_scan], [0, 1], None, [50, 60], [0, 180, 0, 256])
        hist_ref = cv2.calcHist([hsv_ref], [0, 1], None, [50, 60], [0, 180, 0, 256])

        cv2.normalize(hist_scan, hist_scan, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)
        cv2.normalize(hist_ref, hist_ref, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX)

        hist_sim = cv2.compareHist(hist_scan, hist_ref, cv2.HISTCMP_CORREL)
        # Normalize -1..1 to 0..100
        hist_score = max(0.0, float(hist_sim)) * 100.0

        # 2. ORB Feature keypoint matching for layout and packaging geometry
        orb = cv2.ORB_create(nfeatures=500)
        kp1, des1 = orb.detectAndCompute(img_scan, None)
        kp2, des2 = orb.detectAndCompute(img_ref, None)

        feature_score = 50.0
        good_matches_count = 0
        if des1 is not None and des2 is not None and len(des1) > 5 and len(des2) > 5:
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            matches = bf.match(des1, des2)
            matches = sorted(matches, key=lambda x: x.distance)
            good_matches = [m for m in matches if m.distance < 60]
            good_matches_count = len(good_matches)
            feature_score = min(100.0, float(good_matches_count * 2.5))

        # Composite visual similarity score
        composite_score = round((hist_score * 0.4) + (feature_score * 0.6), 1)
        composite_score = max(0.0, min(100.0, composite_score))

        notes = (
            f"Computer vision feature comparison detected {good_matches_count} matching structural packaging points. "
            f"Color distribution correlation: {hist_score:.1f}%. "
            f"Note: Packaging layout and colors can naturally vary across manufacturing runs, market regions, or batch packaging formats."
        )

        return composite_score, notes
