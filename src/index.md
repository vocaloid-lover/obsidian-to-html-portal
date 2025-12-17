---
layout: base.njk
title: "我的知识库门户"
---

# 我的Obsidian笔记库

欢迎来到我的知识库！这里包含了我所有的学习笔记。

<section class="portal">
    <div class="portal-controls">
        <input id="search-input" placeholder="搜索笔记（支持关键词）" aria-label="搜索笔记" />
        <div class="filters">
            <label>按标签:</label>
            <select id="tag-filter">
                <option value="">全部</option>
            </select>
        </div>
        <button id="theme-toggle" aria-label="切换主题" aria-pressed="false" title="点击切换主题，右键显示更多选项">
            <span class="theme-icon">🌙</span>
        </button>
    </div>

    <div class="notes-list">
        <h2>按日期最近排序</h2>
        <ul>
        {% assign notes_sorted = collections.notes | sort: "data.date" %}
        {% assign notes_sorted = notes_sorted | reverse %}
        {% for note in notes_sorted %}
            {% assign tags_str = "" %}
            {% if note.data.tags %}
                {% assign tags_str = note.data.tags | join: ", " %}
            {% endif %}
            <li class="note-item" data-tags="{{ tags_str | default: "" }}">
                <a href="{{ note.url }}"><strong>{{ note.data.title }}</strong></a>
                <div class="meta">{{ note.data.date }}{% if tags_str != "" %} • {{ tags_str }}{% endif %}</div>
                <p class="excerpt">{{ note.templateContent | strip_html | truncate: 200 }}</p>
            </li>
        {% endfor %}
        </ul>
    </div>
  
    <div id="search-results" class="search-results" aria-live="polite"></div>
</section>

{% block scripts %}
    <script src="/js/theme.js"></script>
    <script src="https://unpkg.com/lunr/lunr.js"></script>
    <script src="/js/search.js"></script>
{% endblock %}