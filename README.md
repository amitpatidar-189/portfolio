# Amit Patidar — Portfolio (Django)

White glassmorphism portfolio. Django templates, static CSS, vanilla JS modules, GSAP + ScrollTrigger (vendored locally in `static/js/vendor/`).

## Run locally
```bash
cd ~/Desktop/Amit_Patidar_Portfolio
source .venv/bin/activate
pip install -r requirements.txt   # only needed on a fresh machine
cp .env.example .env              # then set DJANGO_SECRET_KEY
python manage.py runserver        # http://127.0.0.1:8000/
```
No database models are used, so no migrations are needed to view the site.

## Where things live
- `portfolio/content.py` — **all copy and facts** (sourced from the resume). Edit here.
- `templates/base.html`, `templates/portfolio/home.html` — page structure.
- `static/css/` — `design-system` (tokens), `base`, `glassmorphism`, `layout`, `components`, `animations`, `responsive`.
- `static/js/main.js` — nav, tabs, GSAP animations, pointer effects. Respects `prefers-reduced-motion`.
- `static/files/Amit_Patidar_Resume.pdf` — served at `/resume/`. Replace the file to update.

## To finish
- Set `linkedin` in `portfolio/content.py` (the button is hidden while empty).

## Tests
```bash
python manage.py check && python manage.py test
```

## Deployment prep
Set `DJANGO_DEBUG=0`, a real `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS=yourdomain.com`; run `python manage.py collectstatic`; serve with gunicorn behind HTTPS (WhiteNoise serves static files). Do not use `runserver` in production.

## Interactive pieces
- Module map, before/after slider and roster simulator live in the "Selected work" section. Their text is in `portfolio/content.py` (`MODULES`, `COMPARE`); the simulator uses made-up numbers and is labelled as such.
- "Calm mode" (footer) turns off animation and remembers the choice in the browser.
- Optional analytics: set `PLAUSIBLE_DOMAIN` in `.env` to enable Plausible. It is off by default.

## Deploying (Render)
`render.yaml`, `build.sh` and `Procfile` are included. Push to GitHub, create a Render web service from the repo, and set `DJANGO_ALLOWED_HOSTS` to your domain. CI (`.github/workflows/ci.yml`) runs checks and tests on every push.
