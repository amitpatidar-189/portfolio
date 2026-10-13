from django.shortcuts import render

from . import content


def _case_studies():
    """Sections are (heading, text) or (heading, [bullets]); give the template a uniform shape."""
    return [
        {**c, "sections": [
            {"heading": h, "bullets": b} if isinstance(b, list) else {"heading": h, "text": b}
            for h, b in c["sections"]
        ]}
        for c in content.CASE_STUDIES
    ]


def home(request):
    return render(request, "portfolio/home.html", {
        "profile": content.PROFILE,
        "stats": content.HERO_STATS,
        "glance": content.GLANCE,
        "pillars": content.PILLARS,
        "shifteaze": content.SHIFTEAZE,
        "sites": content.SITES,
        "features": content.FEATURES,
        "modules": [{"name": n, "desc": d, "links": "|".join(l)} for n, d, l in content.MODULES],
        "compare": content.COMPARE,
        "faces": content.TWO_FACES,
        "journey": content.JOURNEY,
        "projects": content.OTHER_PROJECTS,
        "cases": _case_studies(),
        "experience": content.EXPERIENCE,
        "capabilities": content.CAPABILITIES,
        "education": content.EDUCATION,
        "credentials": content.CREDENTIALS,
    })
