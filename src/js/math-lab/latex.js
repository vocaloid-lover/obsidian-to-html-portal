import { isAdd, isMul, isPow, isFunc, isIntegral, isNumber, isSymbol } from "./expr.js";

const funcMap = {
  sin: "\\sin",
  cos: "\\cos",
  tan: "\\tan",
  ln: "\\ln",
  exp: "\\exp"
};

const wrapIfNeeded = (expr, latex) => {
  if (isAdd(expr)) return `\\left(${latex}\\right)`;
  return latex;
};

const renderFunc = (expr) => {
  const name = funcMap[expr.name] || `\\mathrm{${expr.name}}`;
  const args = expr.args.map((arg) => toLatex(arg)).join(", ");
  return `${name}\\left(${args}\\right)`;
};

export const toLatex = (expr) => {
  if (!expr) return "";
  if (isNumber(expr)) return String(expr.value);
  if (isSymbol(expr)) return expr.name;

  if (isAdd(expr)) {
    return expr.terms.map((term) => toLatex(term)).join(" + ");
  }

  if (isMul(expr)) {
    return expr.factors
      .map((factor) => wrapIfNeeded(factor, toLatex(factor)))
      .join(" \\cdot ");
  }

  if (isPow(expr)) {
    const base = wrapIfNeeded(expr.base, toLatex(expr.base));
    const exp = toLatex(expr.exp);
    return `${base}^{${exp}}`;
  }

  if (isFunc(expr)) {
    return renderFunc(expr);
  }

  if (isIntegral(expr)) {
    const integrand = toLatex(expr.integrand);
    return `\\int ${integrand} \\, d${expr.variable}`;
  }

  return "";
};
