import typography from "@tailwindcss/typography";

// 属性选择器 [class~=...] 会让任意 class 变化使整个后代树失效。
// 保留 Typography 的全部规则与优先级，只将排除类改成等价的精确类选择器。
export function preciseTypographySelector(selector) {
  return selector.replaceAll('[class~="not-prose"]', '.not-prose');
}

export function preciseTypographyRules(rules) {
  if (Array.isArray(rules)) return rules.map(preciseTypographyRules);
  if (!rules || typeof rules !== "object") return rules;
  return Object.fromEntries(Object.entries(rules).map(([key, value]) => [
    preciseTypographySelector(key), preciseTypographyRules(value),
  ]));
}

const upstream = typography();
const preciseTypography = {
  ...upstream,
  handler(api) {
    upstream.handler({
      ...api,
      addComponents(rules, ...options) {
        api.addComponents(preciseTypographyRules(rules), ...options);
      },
      addVariant(name, selector, ...options) {
        api.addVariant(name, typeof selector === "string" ? preciseTypographySelector(selector) : preciseTypographyRules(selector), ...options);
      },
    });
  },
};
export default preciseTypography;
