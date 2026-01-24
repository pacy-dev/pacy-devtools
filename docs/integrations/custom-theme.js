export const theme = {
  name: 'custom-dark',
  type: 'dark',
  colors: {
    'editor.background': '#1a1a1a',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editor.lineHighlightBackground': '#2a2a2a',
    'editor.selectionBackground': '#264f78',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#6a9955'
      }
    },
    {
      scope: ['string', 'string.quoted'],
      settings: {
        foreground: '#ce9178'
      }
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier'],
      settings: {
        foreground: '#569cd6'
      }
    },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: {
        foreground: '#dcdcaa'
      }
    },
  ]
}; 