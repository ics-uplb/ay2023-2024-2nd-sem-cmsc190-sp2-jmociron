from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'files', AllFilesViewSet, basename='files')
router.register(r'file/share', FileAccessViewSet, basename='file-access')
router.register(r'library/reference', AllReferenceLinksViewSet, basename='reference-library')

urlpatterns = [
    path('', include(router.urls)),
    path('social/login/google/', GoogleLogin.as_view(), name='google_login'),

    # User files:
    re_path('^files/reference/(?P<userID>.+)/$', UserReferenceViewSet.as_view(), name='user-references'),
    re_path('^files/reads/(?P<userID>.+)/$', UserReadsViewSet.as_view(), name='user-reads'),

    # Files shared to user:
    re_path('^files/shared/reference/(?P<accessID>.+)/$', SharedReferencesViewSet.as_view(), name='shared-references'),
    re_path('^files/shared/reads/(?P<accessID>.+)/$', SharedReadsViewSet.as_view(), name='shared-reads'),
    
    # Searching reference for reads:
    re_path('^search/files/(?P<userID>.+)/(?P<organism>.+)/$', SearchReferenceFileViewSet.as_view(), name='search-reference-file'),
    re_path('^search/shared/(?P<accessID>.+)/(?P<organism>.+)/$', SearchSharedReferencesViewSet.as_view(), name='search-shared-file'),
    re_path('^search/library/(?P<organism>.+)/$', SearchLibraryViewSet.as_view(), name='search-library'),
    re_path('^search/reference/(?P<id>.+)/$', ReferenceLinkViewSet.as_view(), name='search-reference'),
]
