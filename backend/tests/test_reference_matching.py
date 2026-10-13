from app.services.reference_matcher import ReferenceMatcher

def test_reference_exact_match(db_session):
    extracted = {
        "medicine_name": "Lipitor",
        "manufacturer": "Pfizer",
        "batch_number": "PF9842"
    }
    match_type, ref, batch, conflicts = ReferenceMatcher.match_fields(db_session, extracted)
    assert match_type == "EXACT_MATCH"
    assert ref is not None
    assert ref.brand_name == "Lipitor"
    assert batch is not None
    assert batch.batch_number == "PF9842"
    assert len(conflicts) == 0

def test_reference_conflicting_manufacturer(db_session):
    extracted = {
        "medicine_name": "Lipitor",
        "manufacturer": "Unknown Counterfeit Lab Inc",
        "batch_number": "PF9842"
    }
    match_type, ref, batch, conflicts = ReferenceMatcher.match_fields(db_session, extracted)
    assert match_type == "CONFLICTING_INFO"
    assert ref is not None
    assert len(conflicts) > 0
    assert "does not match official registered manufacturer" in conflicts[0]

def test_reference_not_found(db_session):
    extracted = {
        "medicine_name": "Unregistered Mystery Herb Mixture",
        "manufacturer": "No Brand"
    }
    match_type, ref, batch, conflicts = ReferenceMatcher.match_fields(db_session, extracted)
    assert match_type == "NO_REFERENCE_AVAILABLE"
    assert ref is None
