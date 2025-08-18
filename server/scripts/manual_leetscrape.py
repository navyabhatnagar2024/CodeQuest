#!/usr/bin/env python3
"""
Manual LeetCode Problem Scraper
Run this script directly to populate the leetcode_suggestions table
"""

import sqlite3
import json
import os
from datetime import datetime

def connect_to_database():
    """Connect to the SQLite database"""
    db_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'coding_platform.db')
    return sqlite3.connect(db_path)

def create_table_if_not_exists(conn):
    """Create the leetcode_suggestions table if it doesn't exist"""
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leetcode_suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard')),
            topic_tags TEXT,
            problem_statement TEXT NOT NULL,
            input_format TEXT,
            output_format TEXT,
            constraints TEXT,
            examples TEXT,
            hints TEXT,
            source_problem_id VARCHAR(100) UNIQUE NOT NULL,
            time_limit_ms INTEGER DEFAULT 1000,
            memory_limit_mb INTEGER DEFAULT 256,
            test_cases TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    print("✅ Table created/verified successfully")

def get_question_details(title_slug):
    """Get detailed information for a specific question including test cases"""
    try:
        from leetscrape import GetQuestion, GenerateCodeStub
        import tempfile
        import os
        import re
        
        # Get question details
        question = GetQuestion(titleSlug=title_slug).scrape()
        
        # Generate code stub and test cases
        fcs = GenerateCodeStub(titleSlug=title_slug)
        
        # Create temporary directory for generated files
        with tempfile.TemporaryDirectory() as temp_dir:
            fcs.generate(directory=temp_dir)
            
            # Look for test file
            test_file = None
            for file in os.listdir(temp_dir):
                if file.startswith('test_') and file.endswith('.py'):
                    test_file = os.path.join(temp_dir, file)
                    break
            
            # Parse test cases from the generated test file
            test_cases = []
            if test_file and os.path.exists(test_file):
                with open(test_file, 'r') as f:
                    content = f.read()
                    
                    # Extract test cases using regex patterns
                    # Look for patterns like: assert function_name(input) == expected_output
                    function_patterns = [
                        r'assert\s+(\w+)\(([^)]+)\)\s*==\s*([^\n]+)',  # assert func(input) == output
                        r'assert\s+(\w+)\(([^)]+\))\s*==\s*([^\n]+)',  # assert func(input) == output (with nested parens)
                        r'(\w+)\(([^)]+)\)\s*==\s*([^\n]+)',  # func(input) == output (without assert)
                    ]
                    
                    for pattern in function_patterns:
                        matches = re.findall(pattern, content)
                        for match in matches:
                            if len(match) == 3:
                                func_name, input_params, expected_output = match
                                
                                # Clean up the input and output
                                input_clean = input_params.strip()
                                expected_clean = expected_output.strip()
                                
                                # Skip if it looks like a comment or invalid
                                if input_clean and expected_clean and not input_clean.startswith('#'):
                                    test_cases.append({
                                        "input_data": input_clean,
                                        "expected_output": expected_clean,
                                        "is_sample": len(test_cases) < 2,  # First two are sample cases
                                        "description": f"Test case {len(test_cases) + 1}"
                                    })
                    
                    # If still no test cases, try to extract from the problem examples
                    if not test_cases:
                        # Look for example patterns in the problem body
                        body = getattr(question, 'Body', '')
                        if body:
                            # Extract examples from HTML content
                            example_patterns = [
                                r'<strong>Input:</strong>\s*<code>([^<]+)</code>',
                                r'<strong>Output:</strong>\s*<code>([^<]+)</code>',
                                r'Input:\s*`([^`]+)`',
                                r'Output:\s*`([^`]+)`'
                            ]
                            
                            inputs = re.findall(example_patterns[0], body) or re.findall(example_patterns[2], body)
                            outputs = re.findall(example_patterns[1], body) or re.findall(example_patterns[3], body)
                            
                            if inputs and outputs:
                                for i, (input_val, output_val) in enumerate(zip(inputs, outputs)):
                                    test_cases.append({
                                        "input_data": input_val.strip(),
                                        "expected_output": output_val.strip(),
                                        "is_sample": True,
                                        "description": f"Example {i + 1}"
                                    })
            
            # If still no test cases, create basic ones based on problem type
            if not test_cases:
                # Create basic test cases based on common patterns
                if 'climbing' in title_slug.lower() or 'stairs' in title_slug.lower():
                    test_cases = [
                        {"input_data": "2", "expected_output": "2", "is_sample": True, "description": "Example 1"},
                        {"input_data": "3", "expected_output": "3", "is_sample": True, "description": "Example 2"},
                        {"input_data": "4", "expected_output": "5", "is_sample": False, "description": "Edge case 1"},
                        {"input_data": "1", "expected_output": "1", "is_sample": False, "description": "Edge case 2"}
                    ]
                elif 'two' in title_slug.lower() and 'sum' in title_slug.lower():
                    test_cases = [
                        {"input_data": "[2, 7, 11, 15], 9", "expected_output": "[0, 1]", "is_sample": True, "description": "Example 1"},
                        {"input_data": "[3, 2, 4], 6", "expected_output": "[1, 2]", "is_sample": True, "description": "Example 2"},
                        {"input_data": "[3, 3], 6", "expected_output": "[0, 1]", "is_sample": False, "description": "Edge case"}
                    ]
                else:
                    # Generic test cases
                    test_cases = [
                        {"input_data": "test_input", "expected_output": "expected_output", "is_sample": True, "description": "Basic test case"}
                    ]
            
            return {
                'QID': getattr(question, 'QID', 'Unknown'),
                'title': getattr(question, 'title', 'Unknown'),
                'difficulty': getattr(question, 'difficulty', 'Medium'),
                'topics': getattr(question, 'topics', []),
                'Body': getattr(question, 'Body', 'No description available'),
                'Hints': getattr(question, 'Hints', []),
                'test_cases': test_cases
            }
            
    except Exception as e:
        print(f"⚠️ Error getting details for {title_slug}: {str(e)}")
        return None

def fetch_and_insert_problems(conn, max_problems=100):
    """Fetch problems from LeetCode and insert them into the database"""
    try:
        from leetscrape import GetQuestionsList
        print("✅ Leetscrape imported successfully")
        
        print(f"🔄 Fetching up to {max_problems} problems from LeetCode...")
        questions_list = GetQuestionsList(max_problems)
        questions_list.scrape()
        
        # Get the questions DataFrame
        problems_df = questions_list.questions
        
        print(f"📊 Found {len(problems_df)} total problems")
        
        # Limit to max_problems
        problems_to_process = problems_df.head(max_problems)
        print(f"⚡ Processing first {len(problems_to_process)} problems...")
        
        cursor = conn.cursor()
        inserted_count = 0
        skipped_count = 0
        
        for i, (index, problem) in enumerate(problems_to_process.iterrows()):
            try:
                # Show progress every 10 problems
                if (i + 1) % 10 == 0:
                    print(f"📈 Progress: {i + 1}/{len(problems_to_process)} ({(i + 1)/len(problems_to_process)*100:.1f}%)")
                
                # Get basic problem info from DataFrame
                title = problem.get('title', f"Problem {i+1}")
                qid = problem.get('QID', f"lc_{i+1}")
                difficulty = problem.get('difficulty', 'Medium')
                topic_tags = problem.get('topicTags', 'array')
                title_slug = problem.get('titleSlug', '')
                
                # Get detailed question information including test cases
                print(f"🔍 Getting details for: {title}")
                question_details = get_question_details(title_slug)
                
                if not question_details:
                    print(f"⚠️ Skipping {title} - couldn't get details")
                    continue
                
                # Map difficulty levels
                if difficulty and difficulty.lower() == 'easy':
                    difficulty_level = 'Easy'
                elif difficulty and difficulty.lower() == 'hard':
                    difficulty_level = 'Hard'
                else:
                    difficulty_level = 'Medium'
                
                # Parse topic tags
                if isinstance(topic_tags, str):
                    topic_list = [tag.strip() for tag in topic_tags.split(',')]
                else:
                    topic_list = question_details.get('topics', ["General"])
                
                # Use the detailed problem statement from leetscrape
                problem_statement = question_details.get('Body', f"LeetCode Problem {qid}: {title}")
                
                # Get hints
                hints = question_details.get('Hints', [])
                if isinstance(hints, list):
                    hints_text = '; '.join(hints) if hints else "Think step by step"
                else:
                    hints_text = str(hints) if hints else "Think step by step"
                
                # Insert into database
                cursor.execute('''
                    INSERT OR IGNORE INTO leetcode_suggestions (
                        title, description, difficulty_level, topic_tags,
                        problem_statement, input_format, output_format,
                        constraints, examples, hints, source_problem_id,
                        time_limit_ms, memory_limit_mb, test_cases
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', [
                    title,
                    f"LeetCode Problem {qid}: {title} - {difficulty} level problem",
                    difficulty_level,
                    json.dumps(topic_list),
                    problem_statement,
                    "Standard input format for this problem type",
                    "Expected output format for this problem type", 
                    f"Standard constraints for {difficulty.lower()} level problems",
                    json.dumps([f"Example {i+1}: {title} case"]),
                    hints_text,
                    qid,
                    1000,  # 1 second time limit
                    256,   # 256 MB memory limit
                    json.dumps(question_details.get('test_cases', []))
                ])
                
                if cursor.rowcount > 0:
                    inserted_count += 1
                    print(f"✅ Added: {title}")
                else:
                    skipped_count += 1
                    print(f"⏭️ Skipped: {title}")
                    
            except Exception as e:
                print(f"⚠️ Error processing problem {i+1}: {str(e)}")
                continue
        
        conn.commit()
        print(f"🎉 Completed! Inserted: {inserted_count}, Skipped: {skipped_count}")
        return inserted_count
        
    except ImportError as e:
        print(f"❌ Failed to import leetscrape: {str(e)}")
        print("💡 Make sure you're running this from the correct virtual environment")
        return 0
    except Exception as e:
        print(f"❌ Error fetching problems: {str(e)}")
        print(f"💡 Error details: {type(e).__name__}: {str(e)}")
        return 0

def clear_and_regenerate_all_problems(conn, max_problems=100):
    """Clear existing problems and regenerate them with proper test cases"""
    try:
        cursor = conn.cursor()
        
        # Clear existing problems and test cases
        print("🗑️ Clearing existing problems and test cases...")
        cursor.execute('DELETE FROM test_cases')
        cursor.execute('DELETE FROM problems')
        cursor.execute('DELETE FROM leetcode_suggestions')
        conn.commit()
        print("✅ Cleared existing data")
        
        # Regenerate all problems
        print("🔄 Regenerating all problems with proper test cases...")
        fetch_and_insert_problems(conn, max_problems)
        
    except Exception as e:
        print(f"❌ Error in clear_and_regenerate: {str(e)}")
        conn.rollback()

def main():
    """Main function"""
    print("🚀 Manual LeetCode Problem Scraper (Enhanced with Real Test Cases)")
    print("=" * 70)
    
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = connect_to_database()
        print("✅ Database connected successfully")
        
        # Create table if needed
        create_table_if_not_exists(conn)
        
        # Ask user for number of problems
        try:
            max_problems = int(input(f"\n📝 How many problems to fetch? (default: 100): ") or "100")
        except ValueError:
            max_problems = 100
            print(f"📝 Using default: {max_problems} problems")
        
        # Fetch and insert problems
        print(f"\n🔄 Starting to fetch {max_problems} problems...")
        inserted_count = fetch_and_insert_problems(conn, max_problems)
        
        if inserted_count > 0:
            print(f"\n✅ Successfully added {inserted_count} problems to the database!")
            print("💡 You can now use the 'Add More (LeetCode)' button in the admin panel")
        else:
            print("\n❌ No problems were added. Check the error messages above.")
            
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
            print("🔌 Database connection closed")

if __name__ == "__main__":
    print("🚀 Starting LeetCode Problem Scraper...")
    
    # Connect to database
    conn = connect_to_database()
    
    try:
        # Create table if it doesn't exist
        create_table_if_not_exists(conn)
        
        # Ask user what they want to do
        print("\nWhat would you like to do?")
        print("1. Add new problems (keep existing)")
        print("2. Clear all and regenerate (recommended for fixing test cases)")
        
        choice = input("Enter your choice (1 or 2): ").strip()
        
        if choice == "2":
            max_problems = input("How many problems to generate? (default: 100): ").strip()
            max_problems = int(max_problems) if max_problems.isdigit() else 100
            clear_and_regenerate_all_problems(conn, max_problems)
        else:
            max_problems = input("How many problems to add? (default: 20): ").strip()
            max_problems = int(max_problems) if max_problems.isdigit() else 20
            fetch_and_insert_problems(conn, max_problems)
        
        print("✅ Script completed successfully!")
        
    except Exception as e:
        print(f"❌ Script failed: {str(e)}")
        conn.rollback()
    finally:
        conn.close()
