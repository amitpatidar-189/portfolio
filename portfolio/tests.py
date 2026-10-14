from django.contrib.staticfiles import finders
from django.test import TestCase
from django.urls import reverse

from . import content


class PortfolioTests(TestCase):
    def test_home_renders_core_content(self):
        r = self.client.get(reverse("portfolio:home"))
        self.assertEqual(r.status_code, 200)
        for s in ("Amit Patidar", "ShiftEaze", "mailto:amit.patidar189@gmail.com"):
            self.assertContains(r, s)

    def test_no_resume_download_anywhere(self):
        html = self.client.get("/").content.decode().lower()
        self.assertNotIn("download resume", html)
        self.assertNotIn("view resume", html)
        self.assertNotIn("/resume/", html)
        self.assertEqual(self.client.get("/resume/").status_code, 404)

    def test_linkedin_link_matches_profile(self):
        url = content.PROFILE["linkedin"]
        r = self.client.get("/")
        if url:
            self.assertContains(r, f'href="{url}"')
        else:
            self.assertNotContains(r, "linkedin.com")


class ContentGuardTests(TestCase):
    def test_removed_terms_do_not_appear(self):
        html = self.client.get("/").content.decode().lower()
        for term in ("adani", "football", "olympic"):
            self.assertNotIn(term, html)

    def test_sites_and_modules_render(self):
        r = self.client.get("/")
        for site in ("Mundra Port", "Mundra Wind Turbine Manufacturing", "Mundra Solar"):
            self.assertContains(r, site)
        self.assertEqual(len(content.MODULES), 9)
        names = {m[0] for m in content.MODULES}
        for _, _, links in content.MODULES:
            self.assertTrue(set(links) <= names)  # every module link points at a real module


    def test_case_studies_render(self):
        r = self.client.get("/")
        for t in ("CAT Personalized Diagnostic", "KrishiSaarthi", "Mandi price forecasting", "AI Facial Recognition System"):
            self.assertContains(r, t)

    def test_case_study_sections_render_cleanly(self):
        html = self.client.get("/").content.decode()
        self.assertNotIn("(&#x27;heading&#x27;", html)   # raw tuples leaking into markup
        self.assertNotIn("&lt;built-in method", html)
        self.assertIn("Traditional mock tests provide scores", html)


class SiteStructureTests(TestCase):
    def test_sections_and_labs_present(self):
        r = self.client.get("/")
        for anchor in ('id="labs"', 'id="projects"', 'id="work"', 'data-lab="cat"', 'data-lab="krishi"', 'data-lab="shifteaze"'):
            self.assertContains(r, anchor)

    def test_seo_endpoints(self):
        self.assertContains(self.client.get("/robots.txt"), "Sitemap:")
        self.assertContains(self.client.get("/sitemap.xml"), "<urlset")
        self.assertContains(self.client.get("/"), "application/ld+json")

    def test_lab_modules_and_og_image_exist(self):
        for f in ("js/labs/shifteaze.js", "js/labs/cat.js", "js/labs/krishi.js", "js/labs/util.js", "js/labs/skills.js", "js/labs/sysmap.js", "css/skills.css", "images/og.png", "css/labs.css"):
            self.assertIsNotNone(finders.find(f), f)

    def test_missing_page_uses_custom_404(self):
        with self.settings(DEBUG=False):
            r = self.client.get("/nope/")
        self.assertEqual(r.status_code, 404)

    def test_whatsapp_and_scroll_top(self):
        r = self.client.get("/")
        self.assertContains(r, "https://wa.me/919399277189")
        self.assertContains(r, 'class="to-top')


    def test_hero_counter_and_contact_logos(self):
        r = self.client.get("/")
        self.assertContains(r, 'data-since="2025-04-01T09:00:00+05:30"')
        for unit in ("years", "months", "days", "hours", "minutes", "seconds"):
            self.assertContains(r, f'data-u="{unit}"')
        self.assertContains(r, "Building intelligent products at the intersection")
        self.assertContains(r, content.PROFILE["role"].split()[0])
        for label in ("Opens your mail app", "Opens wa.me/919399277189", "Opens linkedin.com/in/amit-patidar"):
            self.assertContains(r, label)
        self.assertContains(r, "data-sysmap")
        html = r.content.decode()
        self.assertEqual(html.count('href="#contact"'), 1)  # one in-page route to Contact, not three
        self.assertIn("Message on WhatsApp", html)
