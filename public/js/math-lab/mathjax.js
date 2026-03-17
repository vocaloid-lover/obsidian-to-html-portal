export const typesetMath = (element) => {
  if (typeof window === "undefined") return Promise.resolve();
  const mj = window.MathJax;
  if (!mj || typeof mj.typesetPromise !== "function") return Promise.resolve();

  if (typeof mj.typesetClear === "function") {
    mj.typesetClear([element]);
  }

  return mj.typesetPromise([element]);
};
