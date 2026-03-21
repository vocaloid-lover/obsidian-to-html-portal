import { isIntegral, isMul, isNumber, createMul, hasApplicableIntegral, transformFirstIntegral } from "../expr.js";

const analyze = (integral) => {
  if (!isIntegral(integral)) return null;
  const integrand = integral.integrand;
  if (!isMul(integrand)) return null;

  let constant = 1;
  const rest = [];
  integrand.factors.forEach((factor) => {
    if (isNumber(factor)) {
      constant *= factor.value;
    } else {
      rest.push(factor);
    }
  });

  if (constant === 1 || rest.length === 0) return null;

  return {
    constant,
    variable: integral.variable,
    rest: createMul(rest)
  };
};

const applyToIntegral = (integral) => {
  const result = analyze(integral);
  if (!result) return null;

  return createMul([
    { type: "number", value: result.constant },
    { type: "integral", variable: result.variable, integrand: result.rest }
  ]);
};

export default {
  id: "extract-constant",
  name: "常数提取",
  description: "将积分中的常数因子提出积分号外。",
  isApplicable(expr) {
    return hasApplicableIntegral(expr, analyze);
  },
  apply(expr) {
    const { expr: next, changed } = transformFirstIntegral(expr, applyToIntegral);
    if (!changed) return { expression: expr, explanation: "未找到可提取的常数因子。" };
    return {
      expression: next,
      explanation: "常数因子可以提出积分号外。"
    };
  }
};
