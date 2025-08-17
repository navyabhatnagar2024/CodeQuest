# Server Setup

## Python Dependencies

This server uses Python scripts to fetch problems from LeetCode using leetscrape. To set up the Python environment:

### 1. Install Python Dependencies

```bash
# Install required Python packages
pip install -r requirements.txt

# Or install individually:
pip install leetscrape
```

### 2. Verify Python Installation

Make sure Python is available in your PATH:
```bash
python --version
# or
python3 --version
```

### 3. Test the Script

```bash
# Test the problem fetching script
python scripts/leetscrape_script.py
```

## External Problem Sources

### LeetCode
- Uses leetscrape package to fetch problems
- Includes full problem statements, test cases, and solutions
- Provides difficulty levels and topic tags
- Fetches acceptance rates, likes/dislikes, and related topics

## Code Execution with Judge0

The system integrates with Judge0 for code execution and test case validation:

### 1. Judge0 Setup

You can use either:
- **Public Judge0 instance**: `https://judge0-ce.p.rapidapi.com` (requires RapidAPI key)
- **Self-hosted Judge0**: Set `JUDGE0_URL` environment variable

### 2. Environment Variables

```bash
# For public Judge0 instance
JUDGE0_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here

# For self-hosted Judge0
JUDGE0_URL=http://localhost:2358
JUDGE0_API_KEY=
```

### 3. Supported Languages

The system supports 25+ programming languages including:
- Python, JavaScript, Java, C++, C
- Go, Rust, PHP, Ruby, Swift
- Kotlin, Scala, TypeScript, and more

## Syncing Problems

To sync problems from LeetCode:

1. Make sure you're logged in as an admin user
2. Call the sync endpoint: `POST /api/problems/sync`
3. The system will fetch and store problems in the database

## Database Schema

The system stores:
- Problem metadata (title, difficulty, topics, etc.)
- Full problem statements and examples
- Test cases with input/output pairs
- Solutions and hints
- Submission results and execution details

## Troubleshooting

### Python Script Errors
- Ensure Python is installed and in PATH
- Check that leetscrape is installed: `pip install leetscrape`
- Verify the script has execute permissions

### Judge0 Integration Errors
- Check Judge0 service availability
- Verify API keys and endpoints
- Check network connectivity and rate limits

### Database Errors
- Ensure the database is running and accessible
- Check that all required tables exist
- Verify database permissions

## API Endpoints

### Problems
- `GET /api/problems` - List problems with filtering
- `GET /api/problems/:id` - Get problem details
- `POST /api/problems/sync` - Sync problems from LeetCode (admin only)

### Submissions
- `POST /api/problems/:id/submit` - Submit solution
- `GET /api/problems/:id/test-cases` - Get test cases

### Topics
- `GET /api/problems/topics/available` - Get available topics
