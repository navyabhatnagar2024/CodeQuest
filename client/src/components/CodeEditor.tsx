import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  height?: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  onChange,
  height = '300px',
  readOnly = false
}) => {
  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  const getLanguageId = (language: string): string => {
    const languageMap: { [key: string]: string } = {
      'c': 'c',
      'cpp': 'cpp',
      'java': 'java',
      'python': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'py': 'python'
    };
    return languageMap[language.toLowerCase()] || 'plaintext';
  };

  return (
    <Editor
      height={height}
      language={getLanguageId(language)}
      value={value}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        readOnly: readOnly,
        automaticLayout: true,
        wordWrap: 'on',
        wordBasedSuggestions: 'allDocuments',
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabCompletion: 'on',
        quickSuggestions: true,
        parameterHints: {
          enabled: true,
          cycle: true
        }
      }}
    />
  );
};

export default CodeEditor;
