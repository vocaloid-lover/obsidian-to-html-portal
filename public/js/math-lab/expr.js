export const isNumber = (expr) => expr && expr.type === "number";
export const isSymbol = (expr) => expr && expr.type === "symbol";
export const isAdd = (expr) => expr && expr.type === "add";
export const isMul = (expr) => expr && expr.type === "mul";
export const isPow = (expr) => expr && expr.type === "pow";
export const isFunc = (expr) => expr && expr.type === "func";
export const isIntegral = (expr) => expr && expr.type === "integral";

export const cloneExpr = (expr) => JSON.parse(JSON.stringify(expr));

export const createAdd = (terms) => {
  const flat = [];
  terms.forEach((term) => {
    if (isAdd(term)) {
      flat.push(...term.terms);
    } else {
      flat.push(term);
    }
  });
  if (flat.length === 1) return flat[0];
  return { type: "add", terms: flat };
};

export const createMul = (factors) => {
  const flat = [];
  factors.forEach((factor) => {
    if (isMul(factor)) {
      flat.push(...factor.factors);
    } else {
      flat.push(factor);
    }
  });
  if (flat.length === 1) return flat[0];
  return { type: "mul", factors: flat };
};

export const containsSymbol = (expr, name) => {
  if (!expr) return false;
  if (isSymbol(expr)) return expr.name === name;
  if (isIntegral(expr)) return containsSymbol(expr.integrand, name);
  if (isAdd(expr)) return expr.terms.some((term) => containsSymbol(term, name));
  if (isMul(expr)) return expr.factors.some((factor) => containsSymbol(factor, name));
  if (isPow(expr)) return containsSymbol(expr.base, name) || containsSymbol(expr.exp, name);
  if (isFunc(expr)) return expr.args.some((arg) => containsSymbol(arg, name));
  return false;
};

export const hasApplicableIntegral = (expr, predicate) => {
  if (!expr) return false;
  if (isIntegral(expr)) return Boolean(predicate(expr));
  if (isAdd(expr)) return expr.terms.some((term) => hasApplicableIntegral(term, predicate));
  if (isMul(expr)) return expr.factors.some((factor) => hasApplicableIntegral(factor, predicate));
  if (isPow(expr)) return hasApplicableIntegral(expr.base, predicate) || hasApplicableIntegral(expr.exp, predicate);
  if (isFunc(expr)) return expr.args.some((arg) => hasApplicableIntegral(arg, predicate));
  return false;
};

export const transformFirstIntegral = (expr, transformer) => {
  if (!expr) return { expr, changed: false };
  if (isIntegral(expr)) {
    const next = transformer(expr);
    if (next) return { expr: next, changed: true };
    return { expr, changed: false };
  }

  if (isAdd(expr)) {
    for (let i = 0; i < expr.terms.length; i += 1) {
      const result = transformFirstIntegral(expr.terms[i], transformer);
      if (result.changed) {
        const nextTerms = expr.terms.slice();
        nextTerms[i] = result.expr;
        return { expr: createAdd(nextTerms), changed: true };
      }
    }
    return { expr, changed: false };
  }

  if (isMul(expr)) {
    for (let i = 0; i < expr.factors.length; i += 1) {
      const result = transformFirstIntegral(expr.factors[i], transformer);
      if (result.changed) {
        const nextFactors = expr.factors.slice();
        nextFactors[i] = result.expr;
        return { expr: createMul(nextFactors), changed: true };
      }
    }
    return { expr, changed: false };
  }

  if (isPow(expr)) {
    const baseResult = transformFirstIntegral(expr.base, transformer);
    if (baseResult.changed) {
      return { expr: { ...expr, base: baseResult.expr }, changed: true };
    }
    const expResult = transformFirstIntegral(expr.exp, transformer);
    if (expResult.changed) {
      return { expr: { ...expr, exp: expResult.expr }, changed: true };
    }
    return { expr, changed: false };
  }

  if (isFunc(expr)) {
    for (let i = 0; i < expr.args.length; i += 1) {
      const result = transformFirstIntegral(expr.args[i], transformer);
      if (result.changed) {
        const nextArgs = expr.args.slice();
        nextArgs[i] = result.expr;
        return { expr: { ...expr, args: nextArgs }, changed: true };
      }
    }
  }

  return { expr, changed: false };
};
