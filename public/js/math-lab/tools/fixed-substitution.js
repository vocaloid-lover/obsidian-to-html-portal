import { isIntegral, isMul, isNumber, isSymbol, isFunc, isPow, hasApplicableIntegral, transformFirstIntegral } from "../expr.js";

const matchFixedSubstitution = (integral) => {
  if (!isIntegral(integral)) return null;
  const integrand = integral.integrand;
  if (!isMul(integrand)) return null;

  const variable = integral.variable;
  let hasTwo = false;
  let hasVar = false;
  let funcName = null;

  integrand.factors.forEach((factor) => {
    if (isNumber(factor) && factor.value === 2) {
      hasTwo = true;
      return;
    }

    if (isSymbol(factor) && factor.name === variable) {
      hasVar = true;
      return;
    }

    if (isFunc(factor) && factor.args.length === 1) {
      const arg = factor.args[0];
      if (isPow(arg) && isSymbol(arg.base) && arg.base.name === variable && isNumber(arg.exp) && arg.exp.value === 2) {
        funcName = factor.name;
      }
    }
  });

  if (!hasTwo || !hasVar || !funcName) return null;

  return {
    variable,
    funcName
  };
};

const applyToIntegral = (integral) => {
  const result = matchFixedSubstitution(integral);
  if (!result) return null;

  return {
    type: "integral",
    variable: "u",
    integrand: {
      type: "func",
      name: result.funcName,
      args: [{ type: "symbol", name: "u" }]
    }
  };
};

export default {
  id: "fixed-substitution",
  name: "固定换元",
  description: "对 2x·f(x^2) 使用固定换元模式。",
  isApplicable(expr) {
    return hasApplicableIntegral(expr, matchFixedSubstitution);
  },
  apply(expr) {
    const { expr: next, changed } = transformFirstIntegral(expr, applyToIntegral);
    if (!changed) return { expression: expr, explanation: "未匹配到固定换元模式。" };
    return {
      expression: next,
      explanation: "设 u = x^2，则 du = 2x dx，得到 \u222B f(u) du。"
    };
  }
};
