from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def validate_username(self, value):
        value = value.strip()
        if " " in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_role(self, value):
        allowed = ["customer", "staff", "manager"]
        value = value.strip().lower()
        if value not in allowed:
            raise serializers.ValidationError("Invalid role.")
        return value

    def create(self, validated_data):
        role = validated_data.get("role", "customer")
        user = User.objects.create_user(
            username=validated_data["username"].strip(),
            email=validated_data.get("email", "").strip().lower(),
            password=validated_data["password"],
            role=role,
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]