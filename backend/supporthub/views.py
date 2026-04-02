from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "SupportHub API is running",
        "routes": [
            "/admin/",
            "/api/accounts/register/",
            "/api/accounts/login/",
            "/api/accounts/me/",
            "/api/tickets/"
        ]
    })