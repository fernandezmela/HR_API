from rest_framework.permissions import BasePermission, SAFE_METHODS

class CanAccessTicket(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == "manager":
            return True
        if user.role == "staff":
            return obj.assigned_to == user
        if user.role == "customer":
            return obj.customer == user
        return False

class CanAccessComment(BasePermission):
    def has_object_permission(self, request, view, obj):
        ticket = obj.ticket
        user = request.user
        if user.role == "manager":
            return True
        if user.role == "staff":
            return ticket.assigned_to == user
        if user.role == "customer":
            return ticket.customer == user
        return False