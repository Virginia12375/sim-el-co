from rest_framework import generics
from .models import Review
from .serializers import ReviewSerializer

# List all reviews and create new ones
class ReviewListCreate(generics.ListCreateAPIView):
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = ReviewSerializer
