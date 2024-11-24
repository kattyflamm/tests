import re
from typing import List, Dict

class QuestionFilters:
    def __init__(self, questions_db: List[Dict]):
        self.questions = questions_db
        self.stats = self.analyze_questions()

    def analyze_questions(self) -> Dict:
        """Анализирует вопросы и собирает статистику"""
        stats = {
            'total_questions': len(self.questions),
            'min_length': float('inf'),
            'max_length': 0
        }

        for question in self.questions:
            answer_length = len(question['correct_answer'])
            stats['min_length'] = min(stats['min_length'], answer_length)
            stats['max_length'] = max(stats['max_length'], answer_length)

        return stats

    @staticmethod
    def has_roman_numerals(text: str) -> bool:
        """Проверяет наличие римских цифр в тексте"""
        roman_pattern = r'\b[IVXLCDM]+\b'
        return bool(re.search(roman_pattern, text))

    def filter_questions(self, filters: Dict) -> List[Dict]:
        """Фильтрует вопросы по заданным критериям"""
        filtered = self.questions.copy()

        if filters.get('search_text'):
            search_text = filters['search_text'].lower()
            filtered = [q for q in filtered if 
                search_text in q['question'].lower() or 
                any(search_text in opt.lower() for opt in q['options'])]

        if filters.get('min_length'):
            min_len = self.stats['min_length']
            filtered = [q for q in filtered if len(q['correct_answer']) == min_len]

        if filters.get('max_length'):
            max_len = self.stats['max_length']
            filtered = [q for q in filtered if len(q['correct_answer']) == max_len]

        if filters.get('roman_numerals') and filters.get('subject') == 'philosophy':
            filtered = [q for q in filtered if self.has_roman_numerals(q['question'])]

        return filtered