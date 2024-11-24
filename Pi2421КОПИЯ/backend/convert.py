import json
import os

def convert_questions(input_file, output_file):
    print(f"Читаю файл {input_file}...")
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, input_file)
    output_path = os.path.join(script_dir, '..', 'frontend', 'questions', output_file)
    
    questions = []
    seen_questions = set()
    question_id = 1
    duplicates = 0
    skipped = 0
    total_blocks = 0

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            text = f.read()
        
        # Улучшенное разделение на блоки
        blocks = [block.strip() for block in text.split('}') if block.strip()]
        total_blocks = len(blocks)
        
        print(f"Найдено блоков: {total_blocks}")
        
        for block in blocks:
            if '{' not in block:
                skipped += 1
                continue
            
            # Разделяем на вопрос и варианты ответов
            parts = block.split('{')
            question = parts[0].strip()
            options_text = parts[1].strip() if len(parts) > 1 else ""
            
            if not question or not options_text:
                skipped += 1
                continue
            
            # Проверка на дубликаты
            question_lower = question.lower()
            if question_lower in seen_questions:
                print(f"Дубликат: {question[:100]}...")
                duplicates += 1
                continue
            
            seen_questions.add(question_lower)
            
            options = []
            correct_answer = None
            
            # Обработка вариантов ответов
            for line in options_text.split('\n'):
                line = line.strip()
                if not line or line in ['{', '}']:
                    continue
                
                if line.startswith('~'):
                    answer = line[1:].strip()
                    options.append(answer)
                    correct_answer = answer
                elif line.startswith('#'):
                    answer = line[1:].strip()
                    options.append(answer)
            
            if options and correct_answer:
                questions.append({
                    "id": question_id,
                    "question": question,
                    "options": options,
                    "correct_answer": correct_answer
                })
                question_id += 1
            else:
                skipped += 1
                print(f"Пропущен (нет вариантов/ответа): {question[:100]}...")

        # Сохраняем результат
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        js_content = f"const questionsDB = {json.dumps(questions, ensure_ascii=False, indent=4)};"
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
            
        print(f"\nСтатистика обработки:")
        print(f"Всего блоков найдено: {total_blocks}")
        print(f"Успешно обработано: {len(questions)}")
        print(f"Дубликатов найдено: {duplicates}")
        print(f"Пропущено некорректных: {skipped}")
        print(f"Результат сохранен в {output_path}")

    except Exception as e:
        print(f"Ошибка: {str(e)}")
        print(f"Место ошибки: {e.__traceback__.tb_lineno}")

if __name__ == "__main__":
    convert_questions("philosophy_questions.txt", "Philosophy.js")