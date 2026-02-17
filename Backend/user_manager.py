import hashlib
import json
from pathlib import Path
from typing import Dict
from models import User

class UserManager:
    def __init__(self, storage_path="./users.json"):
        self.storage_path = Path(storage_path)
        self.users: Dict[str, User] = {}
        self._load_users()

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def _save_users(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump({email: user.dict() for email, user in self.users.items()}, f, ensure_ascii=False, indent=2)

    def _load_users(self):
        if self.storage_path.exists():
            try:
                data = json.load(open(self.storage_path, "r", encoding="utf-8"))
                for email, udata in data.items():
                    self.users[email] = User(**udata)
            except Exception as e:
                print("⚠️ Ошибка загрузки пользователей:", e)
                self.users = {}

    def register_user(self, email: str, password: str) -> User:
        if email in self.users:
            raise ValueError("Пользователь уже существует")
        user = User(email=email, password=self._hash_password(password))
        self.users[email] = user
        self._save_users()
        return user

    def login_user(self, email: str, password: str) -> User | None:
        user = self.users.get(email)
        if user and user.password == self._hash_password(password):
            return user
        return None

    def get_user_by_email(self, email: str) -> User | None:
        return self.users.get(email)
