from rest_framework import serializers
from .models import Ticket, TicketComment


class TicketCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = TicketComment
        fields = ["id", "ticket", "author", "author_username", "body", "created_at"]
        read_only_fields = ["author", "created_at", "ticket"]


class TicketSerializer(serializers.ModelSerializer):
    comments = TicketCommentSerializer(many=True, read_only=True)
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    assigned_to_username = serializers.CharField(source="assigned_to.username", read_only=True)

    class Meta:
        model = Ticket
        fields = [
            "id",
            "title",
            "description",
            "customer",
            "customer_username",
            "assigned_to",
            "assigned_to_username",
            "status",
            "priority",
            "created_at",
            "updated_at",
            "comments",
        ]
        read_only_fields = [
            "customer",
            "customer_username",
            "assigned_to_username",
            "created_at",
            "updated_at",
            "comments",
        ]

    def validate_assigned_to(self, value):
        if value and value.role != "staff":
            raise serializers.ValidationError("Assigned user must be a staff member.")
        return value