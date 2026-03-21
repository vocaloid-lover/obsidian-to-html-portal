import { isIntegral, isAdd, createAdd, hasApplicableIntegral, transformFirstIntegral } from "../expr.js";

const analyze = (integral) => {
  if (!isIntegral(integral)) return null;
  const integrand = integral.integrand;
  if (!isAdd(integrand)) return null;
  if (integrand.terms.length < 2) return null;
  return {
    variable: integral.variable,
    terms: integrand.terms
  };
};

const applyToIntegral = (integral) => {
  const result = analyze(integral);
  if (!result) return null;

  const nextTerms = result.terms.map((term) => ({
    type: "integral",
    variable: result.variable,
    integrand: term
  }));

  return createAdd(nextTerms);
};

export default {
  id: "split-sum",
  name: "拆分求和",
  description: "将加法形式拆分为多个积分之和。",
  isApplicable(expr) {
    return hasApplicableIntegral(expr, analyze);
  },
  apply(expr) {
    const { expr: next, changed } = transformFirstIntegral(expr, applyToIntegral);
    if (!changed) return { expression: expr, explanation: "当前表达式不适合拆分。" };
    return {
      expression: next,
      explanation: "利用积分的线性性质拆分求和。"
    };
  }
};
