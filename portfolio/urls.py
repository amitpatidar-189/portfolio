from django.urls import path
from django.views.generic import RedirectView
from django.templatetags.static import static

from django.views.generic import TemplateView

from . import views

app_name = "portfolio"

urlpatterns = [
    path("", views.home, name="home"),
    path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain")),
    path("sitemap.xml", TemplateView.as_view(template_name="sitemap.xml", content_type="application/xml")),
    path("resume/", RedirectView.as_view(url=static("files/Amit_Patidar_Resume.pdf")), name="resume"),
]
