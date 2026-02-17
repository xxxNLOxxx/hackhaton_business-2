import hashlib
from models import User
from typing import Dict

class UserManager:
    def __init__(self):
        self.users: Dict[str, User] = {}  # ключ — email

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()

    def register_user(self, email: str, password: str):
        if email in self.users:
            raise ValueError("Пользователь уже существует")
        hashed_password = self._hash_password(password)
        user = User(email=email, password=hashed_password)
        self.users[email] = user
        return user

    def login_user(self, email: str, password: str):
        user = self.users.get(email)
        if not user or user.password != self._hash_password(password):
            return None
        return user

    def get_user_by_email(self, email: str):
        return self.users.get(email)
