import os


def analytics(request):
    """Plausible analytics stays off unless PLAUSIBLE_DOMAIN is set."""
    return {"plausible_domain": os.environ.get("PLAUSIBLE_DOMAIN", "")}
