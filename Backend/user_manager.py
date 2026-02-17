import hashlib
import json
from pathlib import Path
from typing import Dict
from models import User
import uuid

class UserManager:
    def __init__(self, storage_path="./users.json"):
        self.storage_path = Path(storage_path)
        self.users: Dict[str, User] = {}
        self._load_users()

    # ------------------ INTERNAL ------------------

    def _hash_password(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def _save_users(self):
        with open(self.storage_path, "w", encoding="utf-8") as f:
            json.dump(
                {email: user.dict() for email, user in self.users.items()},
                f,
                ensure_ascii=False,
                indent=2
            )

    def _load_users(self):
        if self.storage_path.exists():
            try:
                data = json.load(open(self.storage_path, "r", encoding="utf-8"))
                for email, udata in data.items():
                    # если роли нет — добавляем user по умолчанию
                    if "role" not in udata:
                        udata["role"] = "user"
                    if "id" not in udata or not udata["id"]:
                        udata["id"] = str(uuid.uuid4())
                    self.users[email] = User(**udata)
                # пересохраняем, чтобы обновить старые JSON
                self._save_users()
            except Exception as e:
                print("⚠️ Ошибка загрузки пользователей:", e)
                self.users = {}

    # ------------------ PUBLIC ------------------

    def register_user(self, email: str, password: str, role="user") -> User:
        if email in self.users:
            raise ValueError("Пользователь уже существует")

        user = User(
            id=str(uuid.uuid4()),
            email=email,
            password=self._hash_password(password),
            role=role
        )
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

    # ------------------ ADMIN ONLY ------------------

    def delete_user(self, email: str):
        if email not in self.users:
            raise ValueError("User not found")
        del self.users[email]
        self._save_users()

    def update_user(self, email: str, *, role: str | None = None, password: str | None = None):
        user = self.users.get(email)
        if not user:
            raise ValueError("User not found")

        if role is not None:
            user.role = role

        if password is not None:
            user.password = self._hash_password(password)

        self._save_users()
