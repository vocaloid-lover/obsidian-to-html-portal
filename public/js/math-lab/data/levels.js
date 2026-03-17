const num = (value) => ({ type: "number", value });
const sym = (name) => ({ type: "symbol", name });
const add = (...terms) => ({ type: "add", terms });
const mul = (...factors) => ({ type: "mul", factors });
const pow = (base, exp) => ({ type: "pow", base, exp });
const func = (name, ...args) => ({ type: "func", name, args });
const integral = (variable, integrand) => ({ type: "integral", variable, integrand });

export const levels = [
  {
    id: "const-extract",
    title: "常数提取",
    difficulty: "Easy",
    tags: ["线性", "常数因子"],
    description: "把积分中的常数因子提到积分号外。",
    hint: "识别常数因子，然后移出积分号。",
    initialExpr: integral("x", mul(num(3), pow(sym("x"), num(2))))
  },
  {
    id: "split-sum",
    title: "拆分求和",
    difficulty: "Easy",
    tags: ["线性", "加法"],
    description: "将加法形式的积分拆分为多个积分之和。",
    hint: "\u222B(f+g)dx = \u222Bf dx + \u222Bg dx。",
    initialExpr: integral(
      "x",
      add(
        pow(sym("x"), num(2)),
        mul(num(2), sym("x")),
        num(1)
      )
    )
  },
  {
    id: "fixed-sub",
    title: "固定换元",
    difficulty: "Medium",
    tags: ["换元", "模式匹配"],
    description: "应用固定模式的换元规则。",
    hint: "识别 2x\u00b7cos(x^2) 的结构。",
    initialExpr: integral(
      "x",
      mul(
        num(2),
        sym("x"),
        func("cos", pow(sym("x"), num(2)))
      )
    )
  }
];
