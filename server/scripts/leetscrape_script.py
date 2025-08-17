#!/usr/bin/env python3
"""
LeetCode Problem Fetcher using leetscrape
Fetches problems with basic information and creates sample test cases
"""

import json
import sys
from datetime import datetime
import time
import os

# Redirect stdout to stderr for leetscrape output
original_stdout = sys.stdout
sys.stdout = sys.stderr

def fetch_leetcode_problems():
    """Fetch problems from LeetCode using leetscrape"""
    try:
        # Import leetscrape
        from leetscrape import GetQuestionsList
        
        print("Fetching LeetCode problems using leetscrape...", file=sys.stderr)
        
        # Get all available problems
        ls = GetQuestionsList()
        ls.scrape()
        problems = ls.questions
        print(f"Found {len(problems)} problems", file=sys.stderr)
        
        # Limit to first 100 problems for performance (can be adjusted)
        limited_problems = problems.head(100)
        print(f"Processing first {len(limited_problems)} problems...", file=sys.stderr)
        
        detailed_problems = []
        
        for i, problem in limited_problems.iterrows():
            try:
                print(f"Processing problem {i+1}/{len(limited_problems)}: {problem['QID']}", file=sys.stderr)
                
                # Map difficulty levels
                difficulty_map = { 'Easy': 'Easy', 'Medium': 'Medium', 'Hard': 'Hard' }
                
                # Create sample test cases based on problem type
                test_cases = []
                
                # Add a basic test case
                test_cases.append({
                    'input': '1 2 3',
                    'output': '6',
                    'is_sample': True,
                    'explanation': 'Basic test case'
                })
                
                # Add edge case test case
                test_cases.append({
                    'input': '0',
                    'output': '0',
                    'is_sample': False,
                    'explanation': 'Edge case with zero'
                })
                
                # Parse topic tags
                topic_tags = []
                if 'topicTags' in problem and problem['topicTags']:
                    if isinstance(problem['topicTags'], str):
                        topic_tags = [tag.strip() for tag in problem['topicTags'].split(',')]
                    elif isinstance(problem['topicTags'], list):
                        topic_tags = problem['topicTags']
                
                problem_data = {
                    'id': f"lc_{problem['QID']}",
                    'title': problem['title'],
                    'difficulty_level': difficulty_map.get(problem['difficulty'], 'Medium'),
                    'topic_tags': topic_tags,
                    'source_platform': 'LeetCode',
                    'source_problem_id': str(problem['QID']),
                    'problem_statement': f"Problem: {problem['title']}\n\nThis is a {problem['difficulty'].lower()} level problem from LeetCode.",
                    'input_format': "Standard input format",
                    'output_format': "Standard output format",
                    'constraints': "Standard constraints apply",
                    'examples': [],
                    'hints': "",
                    'test_cases': test_cases,
                    'solution': "",
                    'related_topics': topic_tags,
                    'acceptance_rate': problem.get('acceptanceRate', 0),
                    'likes': 0,
                    'dislikes': 0,
                    'time_limit_ms': 1000,  # Default time limit
                    'memory_limit_mb': 256   # Default memory limit
                }
                
                detailed_problems.append(problem_data)
                
            except Exception as e:
                print(f"Error processing problem {problem['QID']}: {str(e)}", file=sys.stderr)
                continue
        
        return detailed_problems
        
    except ImportError:
        print("leetscrape package not found. Please install it with: pip install leetscrape", file=sys.stderr)
        return []
    except Exception as e:
        print(f"Error using leetscrape: {str(e)}", file=sys.stderr)
        return []

def main():
    """Main function to fetch LeetCode problems"""
    try:
        print("Fetching LeetCode problems...", file=sys.stderr)
        problems = fetch_leetcode_problems()
        
        if not problems:
            error_result = {
                'success': False,
                'error': 'No problems fetched. Please check leetscrape installation.',
                'timestamp': datetime.now().isoformat()
            }
            print(json.dumps(error_result, indent=2), file=sys.stderr)
            sys.exit(1)
        
        # Ensure all problems have required fields
        for problem in problems:
            problem['created_at'] = datetime.now().isoformat()
            problem['updated_at'] = datetime.now().isoformat()
            if 'test_cases' not in problem:
                problem['test_cases'] = []
            if 'solution' not in problem:
                problem['solution'] = ""
            if 'topic_tags' not in problem:
                problem['topic_tags'] = []
        
        result = {
            'success': True,
            'problems': problems,
            'total': len(problems),
            'timestamp': datetime.now().isoformat(),
            'source': 'LeetCode via leetscrape'
        }
        
        # Restore stdout and output JSON
        sys.stdout = original_stdout
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"An unexpected error occurred: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
