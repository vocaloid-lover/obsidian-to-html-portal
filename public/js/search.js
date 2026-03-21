(async function () {
  const input = document.getElementById("search-input");
  const tagFilter = document.getElementById("tag-filter");
  const clearButton = document.getElementById("search-clear");
  const searchPanel = document.getElementById("search-panel");
  const recentPanel = document.getElementById("recent-panel");
  const searchResults = document.getElementById("search-results");
  const searchStatus = document.getElementById("search-status");
  const searchSummary = document.getElementById("search-summary");

  if (!input || !tagFilter || !searchPanel || !recentPanel || !searchResults) {
    return;
  }

  try {
    const response = await fetch("/search/index.json");

    if (!response.ok) {
      throw new Error(`Search index request failed: ${response.status}`);
    }

    const docs = (await response.json()).map(function (doc, index) {
      const title = doc.title || "未命名笔记";
      const tags = Array.isArray(doc.tags) ? doc.tags.filter(Boolean) : [];
      const content = doc.content || "";
      const snippet = doc.content_snippet || "";
      const dateValue = Number.isNaN(Date.parse(doc.date)) ? 0 : Date.parse(doc.date);
      const permalink = normalizePermalink(doc.permalink || "/notes/");

      return {
        ...doc,
        order: index,
        title,
        tags,
        content,
        content_snippet: snippet,
        permalink,
        dateValue,
        titleNorm: normalizeText(title),
        tagsNorm: normalizeText(tags.join(" ")),
        contentNorm: normalizeText(content),
        searchable: normalizeText([title, tags.join(" "), content].join(" ")),
      };
    });

    populateTagOptions(docs, tagFilter);

    const renderState = function () {
      const query = input.value.trim();
      const selectedTag = tagFilter.value;
      const isFiltering = Boolean(query || selectedTag);
      const results = getResults(docs, query, selectedTag);

      clearButton.hidden = !isFiltering;
      searchPanel.hidden = !isFiltering;
      recentPanel.hidden = isFiltering;

      if (!isFiltering) {
        searchResults.replaceChildren();
        updateStatus("当前展示最近更新的 10 篇笔记。输入关键词或选择主题后，将切换到独立结果区。");
        updateSummary("这里会显示关键词或标签对应的笔记结果。");
        return;
      }

      renderResults(results, query, selectedTag, searchResults);
      updateStatus(buildStatusMessage(results.length, query, selectedTag));
      updateSummary(buildSummaryMessage(results.length, query, selectedTag));
    };

    input.addEventListener("input", renderState);
    tagFilter.addEventListener("change", renderState);
    clearButton.addEventListener("click", function () {
      input.value = "";
      tagFilter.value = "";
      renderState();
      input.focus();
    });

    renderState();
  } catch (error) {
    console.error("无法加载搜索索引:", error);
    searchPanel.hidden = false;
    recentPanel.hidden = true;
    searchResults.replaceChildren(createEmptyState("搜索索引加载失败，请稍后重试。"));

    if (searchStatus) {
      searchStatus.textContent = "搜索暂时不可用，但站点内容没有丢失。";
    }

    if (searchSummary) {
      searchSummary.textContent = "请检查 `/search/index.json` 是否已成功生成。";
    }
  }

  function populateTagOptions(docs, select) {
    const tags = new Set();

    docs.forEach(function (doc) {
      doc.tags.forEach(function (tag) {
        tags.add(tag);
      });
    });

    Array.from(tags)
      .sort(function (left, right) {
        return left.localeCompare(right, "zh-Hans-CN");
      })
      .forEach(function (tag) {
        const option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        select.appendChild(option);
      });
  }

  function getResults(docs, query, tag) {
    const terms = tokenize(query);
    const tagValue = normalizeText(tag);

    const filtered = docs.filter(function (doc) {
      const matchesTag = !tagValue || doc.tags.some(function (item) {
        return normalizeText(item) === tagValue;
      });

      if (!matchesTag) {
        return false;
      }

      if (!terms.length) {
        return true;
      }

      return terms.every(function (term) {
        return doc.searchable.includes(term);
      });
    });

    return filtered.sort(function (left, right) {
      const leftScore = scoreDoc(left, query, terms);
      const rightScore = scoreDoc(right, query, terms);

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      if (right.dateValue !== left.dateValue) {
        return right.dateValue - left.dateValue;
      }

      return left.order - right.order;
    });
  }

  function scoreDoc(doc, query, terms) {
    if (!terms.length) {
      return doc.dateValue;
    }

    const normalizedQuery = normalizeText(query);
    let score = 0;

    if (normalizedQuery && doc.titleNorm.includes(normalizedQuery)) {
      score += 120;
    }

    if (normalizedQuery && doc.tagsNorm.includes(normalizedQuery)) {
      score += 80;
    }

    terms.forEach(function (term) {
      if (doc.titleNorm.includes(term)) {
        score += 36;
      }

      if (doc.tagsNorm.includes(term)) {
        score += 28;
      }

      if (doc.contentNorm.includes(term)) {
        score += 12;
      }
    });

    return score + doc.dateValue / 1e11;
  }

  function renderResults(results, query, selectedTag, container) {
    const terms = tokenize(query);
    container.replaceChildren();

    if (!results.length) {
      container.appendChild(createEmptyState(buildEmptyMessage(query, selectedTag)));
      return;
    }

    const fragment = document.createDocumentFragment();

    results.forEach(function (doc) {
      fragment.appendChild(createResultCard(doc, terms, query, selectedTag));
    });

    container.appendChild(fragment);
  }

  function createResultCard(doc, terms, query, selectedTag) {
    const card = document.createElement("article");
    card.className = "note-card note-card--result";

    const body = document.createElement("div");
    body.className = "note-card__body";

    const eyebrow = document.createElement("p");
    eyebrow.className = "note-card__eyebrow";
    eyebrow.textContent = query ? "匹配结果" : `主题筛选：${selectedTag}`;

    const title = document.createElement("h3");
    title.className = "note-card__title";

    const link = document.createElement("a");
    link.href = doc.permalink;
    link.innerHTML = highlightHtml(doc.title, terms);

    title.appendChild(link);

    const meta = document.createElement("p");
    meta.className = "note-card__meta";
    meta.textContent = doc.date || "";

    const excerpt = document.createElement("p");
    excerpt.className = "note-card__excerpt";
    excerpt.innerHTML = highlightHtml(buildSnippet(doc, query), terms);

    body.appendChild(eyebrow);
    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(excerpt);

    if (doc.tags.length) {
      const tags = document.createElement("div");
      tags.className = "note-card__tags";

      doc.tags.forEach(function (tag) {
        const badge = document.createElement("span");
        badge.className = "tag-pill";
        badge.textContent = tag;
        tags.appendChild(badge);
      });

      body.appendChild(tags);
    }

    card.appendChild(body);
    return card;
  }

  function createEmptyState(message) {
    const node = document.createElement("div");
    node.className = "empty-state";

    const title = document.createElement("h3");
    title.textContent = "没有找到匹配内容";

    const description = document.createElement("p");
    description.textContent = message;

    node.appendChild(title);
    node.appendChild(description);

    return node;
  }

  function buildSnippet(doc, query) {
    const source = String(doc.content || doc.content_snippet || "").trim();

    if (!source) {
      return "这篇笔记暂时没有可展示的摘要。";
    }

    if (!query) {
      return truncate(source, 180);
    }

    const lowerSource = source.toLowerCase();
    const terms = tokenize(query);
    let matchIndex = -1;

    terms.forEach(function (term) {
      const currentIndex = lowerSource.indexOf(term.toLowerCase());
      if (currentIndex !== -1 && (matchIndex === -1 || currentIndex < matchIndex)) {
        matchIndex = currentIndex;
      }
    });

    if (matchIndex === -1) {
      return truncate(doc.content_snippet || source, 180);
    }

    const start = Math.max(0, matchIndex - 42);
    const end = Math.min(source.length, matchIndex + 128);
    let snippet = source.slice(start, end).trim();

    if (start > 0) {
      snippet = `…${snippet}`;
    }

    if (end < source.length) {
      snippet = `${snippet}…`;
    }

    return snippet;
  }

  function buildStatusMessage(count, query, tag) {
    if (query && tag) {
      return `找到 ${count} 条结果，当前关键词为“${query}”，主题筛选为“${tag}”。`;
    }

    if (query) {
      return `找到 ${count} 条与“${query}”相关的结果。`;
    }

    return `当前展示主题“${tag}”下的 ${count} 篇笔记。`;
  }

  function buildSummaryMessage(count, query, tag) {
    if (!count) {
      return buildEmptyMessage(query, tag);
    }

    if (query && tag) {
      return "关键词检索与主题过滤同时生效，结果按匹配度和日期综合排序。";
    }

    if (query) {
      return "结果按标题匹配、标签匹配和正文匹配综合排序。";
    }

    return "当前处于纯主题筛选状态，结果按日期倒序展示。";
  }

  function buildEmptyMessage(query, tag) {
    if (query && tag) {
      return `没有找到同时包含“${query}”且属于“${tag}”主题的笔记。`;
    }

    if (query) {
      return `没有找到与“${query}”相关的笔记。可以试试更短的关键词或切换主题筛选。`;
    }

    return `当前没有归入“${tag}”主题的笔记。`;
  }

  function updateStatus(message) {
    if (searchStatus) {
      searchStatus.textContent = message;
    }
  }

  function updateSummary(message) {
    if (searchSummary) {
      searchSummary.textContent = message;
    }
  }

  function tokenize(query) {
    return normalizeText(query)
      .split(/\s+/)
      .filter(Boolean);
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function normalizePermalink(value) {
    return String(value || "/")
      .replace(/index\.html$/, "")
      .replace(/\/{2,}/g, "/");
  }

  function truncate(value, maxLength) {
    const text = String(value || "").trim();
    if (text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, maxLength).trim()}…`;
  }

  function highlightHtml(text, terms) {
    const escaped = escapeHtml(text);
    const safeTerms = Array.from(new Set(terms.filter(Boolean))).sort(function (left, right) {
      return right.length - left.length;
    });

    if (!safeTerms.length) {
      return escaped;
    }

    const pattern = safeTerms.map(escapeRegExp).join("|");
    return escaped.replace(new RegExp(`(${pattern})`, "gi"), "<mark>$1</mark>");
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
})();
