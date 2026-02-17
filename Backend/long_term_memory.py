# long_term_memory.py
import json
import os
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pathlib import Path
import shutil
from collections import defaultdict


class LongTermMemory:
    """
    Система долговременной памяти на JSON-файлах
    """

    def __init__(self, agent_name: str, memory_dir: str = "./memory_storage"):
        self.agent_name = agent_name
        self.memory_dir = Path(memory_dir)
        self.agent_dir = self.memory_dir / agent_name
        self.agent_dir.mkdir(parents=True, exist_ok=True)

        # Основной файл памяти
        self.memory_file = self.agent_dir / "memories.json"
        self.summary_file = self.agent_dir / "summaries.json"

        # Загружаем или создаём память
        self.memories = self._load_memories()
        self.summaries = self._load_summaries()

        # Параметры суммаризации
        self.max_memories = 50  # Максимум воспоминаний до суммаризации
        self.max_context = 10  # Сколько воспоминаний показывать в контексте

        print(f"📚 Память для {agent_name} загружена. Всего воспоминаний: {len(self.memories)}")

    def _load_memories(self) -> List[Dict]:
        """Загружает воспоминания из JSON-файла"""
        if self.memory_file.exists():
            try:
                with open(self.memory_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []

    def _load_summaries(self) -> List[Dict]:
        """Загружает суммаризации из JSON-файла"""
        if self.summary_file.exists():
            try:
                with open(self.summary_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []

    def _save_memories(self):
        """Сохраняет воспоминания в JSON-файл"""
        with open(self.memory_file, 'w', encoding='utf-8') as f:
            json.dump(self.memories, f, ensure_ascii=False, indent=2)

    def _save_summaries(self):
        """Сохраняет суммаризации в JSON-файл"""
        with open(self.summary_file, 'w', encoding='utf-8') as f:
            json.dump(self.summaries, f, ensure_ascii=False, indent=2)

    def add_memory(self,
                   text: str,
                   emotion: str = "neutral",
                   importance: float = 0.5,
                   metadata: Optional[Dict] = None):
        """
        Добавляет новое воспоминание
        """
        memory = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now().isoformat(),
            "text": text,
            "emotion": emotion,
            "importance": importance,
            "metadata": metadata or {}
        }

        self.memories.append(memory)

        # Проверяем, не пора ли сделать суммаризацию
        if len(self.memories) > self.max_memories:
            self._summarize_old_memories()

        self._save_memories()
        return memory["id"]

    def recall_similar(self, query: str, n_results: int = 5) -> List[Dict]:
        """
        Поиск похожих воспоминаний по ключевым словам
        (простая замена векторному поиску)
        """
        # Разбиваем запрос на слова (приводим к нижнему регистру)
        query_words = set(query.lower().split())

        scored_memories = []
        for mem in self.memories:
            # Считаем совпадения слов
            mem_words = set(mem["text"].lower().split())
            common_words = query_words.intersection(mem_words)

            # Вес: количество общих слов + важность
            score = len(common_words) + mem["importance"] * 0.5

            # Учитываем свежесть (новые воспоминания важнее)
            age = datetime.now() - datetime.fromisoformat(mem["timestamp"])
            freshness = max(0, 1 - age.days / 30)  # За 30 дней важность падает до 0

            score += freshness * 0.3

            scored_memories.append((score, mem))

        # Сортируем по убыванию релевантности
        scored_memories.sort(key=lambda x: x[0], reverse=True)

        # Возвращаем топ результатов
        return [mem for score, mem in scored_memories[:n_results] if score > 0]

    def get_recent(self, n: int = 10) -> List[Dict]:
        """Возвращает последние n воспоминаний"""
        recent = sorted(
            self.memories,
            key=lambda x: x["timestamp"],
            reverse=True
        )[:n]
        return recent

    def _summarize_old_memories(self):
        """
        Автоматическая суммаризация старых воспоминаний
        (при переполнении контекста)
        """
        # Сортируем воспоминания по времени
        sorted_mems = sorted(self.memories, key=lambda x: x["timestamp"])

        # Берём самые старые 30%
        old_count = int(len(sorted_mems) * 0.3)
        old_memories = sorted_mems[:old_count]

        if not old_memories:
            return

        # Группируем по дням
        memories_by_day = defaultdict(list)
        for mem in old_memories:
            day = mem["timestamp"][:10]  # YYYY-MM-DD
            memories_by_day[day].append(mem)

        # Создаём суммаризации для каждого дня
        for day, day_mems in memories_by_day.items():
            # Простая суммаризация: собираем ключевые слова и эмоции
            texts = [m["text"] for m in day_mems]
            emotions = [m["emotion"] for m in day_mems]

            # Считаем эмоции
            emotion_counts = {}
            for e in emotions:
                emotion_counts[e] = emotion_counts.get(e, 0) + 1
            main_emotion = max(emotion_counts, key=emotion_counts.get)

            # Создаём суммаризацию
            summary = {
                "id": f"summary_{day}",
                "timestamp": f"{day}T23:59:59",
                "text": f"События за {day}: {len(texts)} значимых моментов. "
                        f"Преобладающая эмоция: {main_emotion}. "
                        f"Кратко: {'; '.join(t[:50] for t in texts[:3])}",
                "emotion": main_emotion,
                "importance": 0.8,  # Суммаризации важнее обычных воспоминаний
                "is_summary": True,
                "original_count": len(texts)
            }

            self.summaries.append(summary)

            # Удаляем старые воспоминания из основной памяти
            self.memories = [m for m in self.memories if m not in day_mems]

        # Ограничиваем количество суммаризаций (храним только последние 30)
        if len(self.summaries) > 30:
            self.summaries = self.summaries[-30:]

        self._save_memories()
        self._save_summaries()

        print(f"📊 Суммаризировано {old_count} старых воспоминаний. "
              f"Создано {len(memories_by_day)} суммаризаций.")

    def get_context_memories(self, query: str = None) -> str:
        """
        Формирует контекст из памяти для передачи в LLM
        """
        context_parts = []

        # Сначала пытаемся найти похожие воспоминания
        if query:
            similar = self.recall_similar(query, n_results=3)
            if similar:
                context_parts.append("📝 ПОХОЖИЕ ВОСПОМИНАНИЯ:")
                for mem in similar:
                    date = mem["timestamp"][:16].replace("T", " ")
                    context_parts.append(
                        f"  • [{date}] {mem['text']} (эмоция: {mem['emotion']})"
                    )

        # Добавляем последние воспоминания
        recent = self.get_recent(5)
        if recent:
            context_parts.append("\n📌 ПОСЛЕДНИЕ СОБЫТИЯ:")
            for mem in recent:
                date = mem["timestamp"][:16].replace("T", " ")
                context_parts.append(
                    f"  • [{date}] {mem['text']}"
                )

        # Добавляем суммаризации (если есть)
        if self.summaries:
            recent_sums = sorted(
                self.summaries,
                key=lambda x: x["timestamp"],
                reverse=True
            )[:3]
            if recent_sums:
                context_parts.append("\n📚 ВАЖНЫЕ ВОСПОМИНАНИЯ ИЗ ПРОШЛОГО:")
                for summ in recent_sums:
                    context_parts.append(f"  • {summ['text']}")

        if context_parts:
            return "\n".join(context_parts)
        else:
            return "📭 В долговременной памяти пока нет записей."

    def get_stats(self) -> Dict:
        """Возвращает статистику памяти"""
        return {
            "total_memories": len(self.memories),
            "total_summaries": len(self.summaries),
            "memory_file": str(self.memory_file),
            "emotions": self._get_emotion_stats()
        }

    def _get_emotion_stats(self) -> Dict:
        """Статистика по эмоциям"""
        emotions = {}
        for mem in self.memories:
            e = mem.get("emotion", "neutral")
            emotions[e] = emotions.get(e, 0) + 1
        return emotions

    def clear_old_memories(self, days: int = 30):
        """Удаляет воспоминания старше указанного количества дней"""
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()

        self.memories = [
            m for m in self.memories
            if m["timestamp"] >= cutoff
        ]
        self._save_memories()
        print(f"🧹 Удалены воспоминания старше {days} дней")