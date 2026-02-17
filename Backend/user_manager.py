import hashlib
from typing import Dict
from models import User


class UserManager:
    def __init__(self):
        self.users: Dict[str, User] = {}

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def register_user(self, email: str, password: str) -> User:
        if email in self.users:
            raise ValueError("Пользователь уже существует")

        user = User(
            email=email,
            password=self._hash_password(password)
        )
        self.users[email] = user
        return user

    def login_user(self, email: str, password: str) -> User | None:
        user = self.users.get(email)
        if not user:
            return None

        if user.password != self._hash_password(password):
            return None

        return user

    def get_user_by_email(self, email: str) -> User | None:
        return self.users.get(email)
