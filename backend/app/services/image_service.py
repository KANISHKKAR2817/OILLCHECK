import os
import uuid
from pathlib import Path
from typing import Tuple, Optional
from PIL import Image, ImageOps
import cv2
import numpy as np
from app.core.config import settings

class ImageService:
    @staticmethod
    def validate_and_save_upload(
        file_bytes: bytes,
        filename: str,
        subfolder: str = "scans"
    ) -> Tuple[str, int, int, str]:
        """
        Validates magic bytes, verifies image integrity with Pillow, strips metadata,
        and saves with a cryptographically safe UUID filename.
        Returns (relative_file_path, width, height, mime_type).
        """
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise ValueError(f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB")

        # Verify image using Pillow
        from io import BytesIO
        try:
            pil_image = Image.open(BytesIO(file_bytes))
            pil_image.verify()  # Verifies file format integrity
        except Exception as e:
            raise ValueError(f"Invalid or corrupt image file: {str(e)}")

        # Re-open to read format, dimensions and strip EXIF
        pil_image = Image.open(BytesIO(file_bytes))
        width, height = pil_image.size
        img_format = (pil_image.format or "JPEG").upper()
        
        format_to_ext = {
            "JPEG": ".jpg",
            "PNG": ".png",
            "WEBP": ".webp"
        }
        ext = format_to_ext.get(img_format, ".jpg")
        mime_type = f"image/{img_format.lower()}"
        if mime_type not in settings.ALLOWED_IMAGE_TYPES:
            raise ValueError(f"Unsupported image type: {mime_type}. Allowed: {settings.ALLOWED_IMAGE_TYPES}")

        # Correct orientation based on EXIF before stripping
        pil_image = ImageOps.exif_transpose(pil_image)
        # Convert RGBA to RGB for JPEG if needed
        if img_format == "JPEG" and pil_image.mode in ("RGBA", "P"):
            pil_image = pil_image.convert("RGB")

        # Save with UUID
        unique_name = f"{uuid.uuid4().hex}{ext}"
        target_dir = settings.UPLOAD_DIR / subfolder
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path = target_dir / unique_name

        pil_image.save(target_path, format=img_format, quality=92)
        relative_path = f"{subfolder}/{unique_name}"
        return relative_path, width, height, mime_type

    @staticmethod
    def assess_image_quality(file_path: Path) -> Tuple[float, bool, float]:
        """
        Computes blur score (Laplacian variance) and exposure score.
        Returns (blur_score, is_blurry, exposure_score).
        """
        if not file_path.exists():
            return 0.0, True, 0.0

        img = cv2.imread(str(file_path))
        if img is None:
            return 0.0, True, 0.0

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Laplacian variance for sharpness
        blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = blur_score < settings.BLUR_THRESHOLD

        # Exposure score: mean luminance (0 = underexposed, 255 = overexposed)
        exposure_score = float(np.mean(gray))

        return blur_score, is_blurry, exposure_score
