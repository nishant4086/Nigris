/**
 * Simple template renderer that replaces {{variable}} with values from the variables object.
 * @param {string} template - The HTML or text template.
 * @param {object} variables - The object containing variable values.
 * @returns {string} - The rendered template.
 */
export const renderTemplate = (template, variables = {}) => {
  if (!template) return "";
  
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
};

/**
 * Extracts variable names from a template.
 * @param {string} template 
 * @returns {string[]}
 */
export const extractVariables = (template) => {
  if (!template) return [];
  const matches = template.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
  const variables = new Set();
  for (const match of matches) {
    variables.add(match[1]);
  }
  return Array.from(variables);
};
