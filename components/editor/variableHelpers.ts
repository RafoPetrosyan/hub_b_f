/**
 * Converts HTML string with variable placeholders to HTML with variable nodes
 * Example: "Hello {{name}}" -> "Hello <span data-type='variable' data-key='name'>{{name}}</span>"
 */
export function convertVariablesToHtml(html: string): string {
  if (!html) return '';

  // Match {{variable}} patterns
  const variableRegex = /\{\{([^}]+)\}\}/g;

  return html.replace(variableRegex, (match, key) => {
    // Extract the variable key (trim whitespace)
    const variableKey = key.trim();
    // Create the variable node HTML
    return `<span data-type="variable" data-key="${variableKey}" data-label="${variableKey}" class="variable-node">{{${variableKey}}}</span>`;
  });
}

/**
 * Converts HTML with variable nodes back to plain HTML with {{variable}} placeholders
 */
export function convertHtmlToVariables(html: string): string {
  if (!html) return '';

  // Match variable nodes
  const variableNodeRegex = /<span[^>]*data-type="variable"[^>]*data-key="([^"]+)"[^>]*>.*?<\/span>/gi;

  return html.replace(variableNodeRegex, (match, key) => {
    return `{{${key}}}`;
  });
}




