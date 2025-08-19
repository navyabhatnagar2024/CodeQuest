# LLM Integration for Test Case Interpretation

This document explains the new LLM (Large Language Model) integration that enhances test case execution by intelligently interpreting and formatting test case inputs for different programming languages.

## Overview

The platform now uses the **Qwen 3 Coder** model via OpenRouter to:
1. Interpret test case inputs from the problem description format
2. Format them appropriately for specific programming languages
3. Provide language-specific input parsing guidance
4. Fallback to basic formatting if LLM fails

## Features

### 🧠 Smart Test Case Interpretation
- **Language-Aware**: Understands how different languages handle input
- **Context-Aware**: Uses problem description to better understand input format
- **Intelligent Parsing**: Converts problem-style inputs to executable program inputs

### 🔄 Fallback System
- **Graceful Degradation**: Falls back to basic formatting if LLM is unavailable
- **Language-Specific Rules**: Applies basic formatting rules for each language
- **Error Handling**: Continues execution even if interpretation fails

### 🌐 Multi-Language Support
- **Supported Languages**: C, C++, Java, Python, JavaScript, Ruby, C#, Go, Rust, PHP, R
- **Removed Languages**: Swift, Kotlin, Haskell, Scala, Perl, Bash, Dart, Elixir, Clojure (for better LLM focus)

## Setup

### 1. Environment Variables
Add to your `.env` file:
```bash
# OpenRouter API Configuration (for LLM service)
OPENROUTER_API_KEY=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
```

### 2. Install Dependencies
```bash
cd server
npm install axios
```

### 3. Restart Server
```bash
npm start
```

## Usage

### Frontend
The ProblemDetail page now has two test buttons:

1. **"Run & Test Code"** - Traditional testing without LLM
2. **"Run & Test with LLM 🧠"** - Enhanced testing with LLM interpretation

### Backend API
New endpoint: `POST /api/problems/:id/test-llm`

```javascript
// Example request
const response = await fetch('/api/problems/123/test-llm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    code: 'your_code_here',
    language: 'python'
  })
});
```

## How It Works

### 1. Test Case Input
Original test case input: `nums1 = [1,3], nums2 = [2]`

### 2. LLM Interpretation
The LLM receives:
- Test case input and expected output
- Programming language context
- Problem description

### 3. Formatted Output
LLM returns formatted input suitable for the language:
- **Python**: `[1,3]\n[2]`
- **C++**: `2\n1 3\n1\n2`
- **Java**: `2\n1 3\n1\n2`

### 4. Execution
The formatted input is passed to Judge0 for execution.

## Example Workflow

```mermaid
graph TD
    A[User Clicks "Run & Test with LLM"] --> B[Fetch Test Cases]
    B --> C[LLM Interprets Each Test Case]
    C --> D[Format Input for Language]
    D --> E[Execute Code with Formatted Input]
    E --> F[Compare Output with Expected]
    F --> G[Display Results with LLM Info]
```

## Testing

### Run the Test Script
```bash
cd server
node test_llm.js
```

This will test:
- LLM service health
- Single test case interpretation
- Multiple test case processing
- Language-specific formatting

### Manual Testing
1. Go to any problem page
2. Write some code
3. Click "Run & Test with LLM 🧠"
4. Check the results for LLM interpretation details

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Code tested successfully with LLM interpretation",
  "results": [
    {
      "testCase": { ... },
      "status": "PASSED",
      "output": "2.0",
      "expected": "2.0",
      "executionTime": 15,
      "memory": 1024,
      "llmInterpretation": {
        "success": true,
        "formatted_input": "[1,3]\n[2]",
        "input_format": "Two arrays on separate lines",
        "language_specific_notes": "Use input().split() for parsing"
      },
      "usedInput": "[1,3]\n[2]"
    }
  ],
  "llmEnabled": true
}
```

## Error Handling

### LLM Service Unavailable
- Falls back to basic formatting
- Continues execution normally
- Logs warning messages

### API Key Issues
- Health check fails
- Service marked as unhealthy
- Graceful degradation

### Rate Limiting
- OpenRouter has rate limits
- Service handles timeouts gracefully
- Fallback to basic formatting

## Configuration

### LLM Model
Currently using: `qwen/qwen3-coder:free`
- Free tier available
- Good performance for code-related tasks
- Configurable in `llmService.js`

### Temperature
Set to `0.1` for consistent, deterministic output
- Lower values = more consistent
- Higher values = more creative (not needed for this use case)

### Max Tokens
Set to `1000` for concise responses
- Sufficient for test case formatting
- Keeps API costs low

## Monitoring

### Health Check
Endpoint: `GET /health`
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "judge0": "healthy",
    "llm": "healthy"
  }
}
```

### Logs
LLM service logs:
- Interpretation attempts
- Success/failure rates
- API response times
- Fallback usage

## Troubleshooting

### Common Issues

1. **LLM Service Unhealthy**
   - Check `OPENROUTER_API_KEY` in `.env`
   - Verify API key is valid
   - Check network connectivity

2. **Test Cases Not Interpreting**
   - Check LLM service logs
   - Verify test case format
   - Check API rate limits

3. **Fallback to Basic Formatting**
   - Normal behavior when LLM fails
   - Check logs for specific errors
   - Verify API key permissions

### Debug Mode
Enable detailed logging by setting:
```bash
LOG_LEVEL=debug
```

## Performance Considerations

### Caching
- LLM responses are not cached (stateless)
- Each test case is interpreted fresh
- Consider caching for production use

### Rate Limiting
- OpenRouter has rate limits
- Monitor usage in OpenRouter dashboard
- Implement client-side rate limiting if needed

### Timeouts
- LLM requests timeout after 10 seconds
- Fallback to basic formatting
- No impact on code execution

## Future Enhancements

### Planned Features
1. **Response Caching**: Cache LLM interpretations
2. **Batch Processing**: Process multiple test cases in one request
3. **Custom Prompts**: Allow problem-specific prompt customization
4. **Multiple Models**: Support for different LLM providers

### Integration Ideas
1. **Problem Creation**: Use LLM to generate test cases
2. **Code Analysis**: Analyze submitted code for improvements
3. **Hint Generation**: Generate problem-solving hints
4. **Difficulty Assessment**: Automatically assess problem difficulty

## Support

For issues or questions:
1. Check the logs in `server/logs/`
2. Run the test script: `node test_llm.js`
3. Verify environment variables
4. Check OpenRouter API status

## License

This integration follows the same license as the main platform.
