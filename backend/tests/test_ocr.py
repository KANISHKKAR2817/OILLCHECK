from app.services.ocr_service import OcrService

def test_parse_structured_fields_complete():
    raw_text = (
        "LIPITOR 20 mg\n"
        "Tablets - Atorvastatin Calcium\n"
        "Manufactured by: Pfizer Pharmaceuticals\n"
        "Batch No: PF9842\n"
        "Mfg Date: 01/2024\n"
        "Exp Date: 01/2027\n"
        "Lic No: NDA-020702\n"
        "[QR_DATA: 300694200305]"
    )
    fields = OcrService.parse_structured_fields(raw_text)

    assert fields["medicine_name"]["value"] == "Lipitor"
    assert fields["dosage"]["value"] == "20 mg"
    assert fields["dosage_form"]["value"] == "Tablet"
    assert fields["active_ingredient"]["value"] == "Atorvastatin"
    assert "Pfizer" in fields["manufacturer"]["value"]
    assert fields["batch_number"]["value"] == "PF9842"
    assert fields["expiry_date"]["value"] == "01/2027"
    assert fields["regulatory_id"]["value"] == "NDA-020702"
    assert fields["barcode"]["value"] == "300694200305"

def test_parse_structured_fields_missing():
    raw_text = "Some random unlabelled packaging bottle with no numbers"
    fields = OcrService.parse_structured_fields(raw_text)

    assert fields["batch_number"]["value"] is None
    assert fields["batch_number"]["status"] == "missing"
    assert fields["expiry_date"]["value"] is None
    assert fields["expiry_date"]["status"] == "missing"
