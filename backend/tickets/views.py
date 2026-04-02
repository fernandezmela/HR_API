from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Ticket, TicketComment
from .serializers import TicketSerializer, TicketCommentSerializer
from .permissions import CanAccessTicket


class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user
        queryset = Ticket.objects.all()
    # role filtering
        if user.role == "staff":
            queryset = queryset.filter(assigned_to=user)
        elif user.role == "customer":
            queryset = queryset.filter(customer=user)

    #filtering
        status = self.request.query_params.get("status")
        priority = self.request.query_params.get("priority")
        search = self.request.query_params.get("search")

        if status:
            queryset = queryset.filter(status=status)

        if priority:
            queryset = queryset.filter(priority=priority)

        if search:
            queryset = queryset.filter(title__icontains=search)

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        if self.request.user.role != "customer":
            raise PermissionDenied("Only customers can create tickets.")
        serializer.save(customer=self.request.user)


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessTicket]

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ticket = get_object_or_404(Ticket, pk=self.kwargs["ticket_id"])
        return ticket.comments.all().order_by("created_at")

    def perform_create(self, serializer):
        ticket = get_object_or_404(Ticket, pk=self.kwargs["ticket_id"])
        serializer.save(ticket=ticket, author=self.request.user)