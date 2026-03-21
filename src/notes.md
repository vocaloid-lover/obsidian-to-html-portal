---
layout: base.njk
title: "所有笔记"
description: "按时间倒序浏览全部笔记。"
pageClass: "page page--archive"
---

<div class="page page--archive">
  <section class="page-hero page-hero--archive">
    <div class="container">
      <div class="archive-hero">
        <p class="eyebrow">Archive</p>
        <h1>所有笔记</h1>
        <p class="archive-hero__lead">按时间倒序浏览完整内容集合。这里不再承担首页“引导”职责，而是作为稳定、清晰的笔记目录页。</p>
        <p class="archive-hero__meta">当前共 {{ collections.notes | length }} 篇笔记。</p>
      </div>
    </div>
  </section>

  <section class="page-section">
    <div class="container">
      <ul class="notes-grid notes-grid--archive">
        {% for note in collections.notes | reverse %}
        <li class="note-card">
          <article class="note-card__body">
            <p class="note-card__eyebrow">笔记条目</p>
            <h2 class="note-card__title">
              <a href="{{ note.url }}">{{ note.data.title }}</a>
            </h2>
            <p class="note-card__meta">
              <span>{{ note.data.date }}</span>
              {% if note.data.tags and note.data.tags | length %}
              <span>·</span>
              <span>{{ note.data.tags | join(' · ') }}</span>
              {% endif %}
            </p>
            <p class="note-card__excerpt">{{ note.templateContent | excerpt(176) }}</p>
            {% if note.data.tags and note.data.tags | length %}
            <div class="note-card__tags">
              {% for tag in note.data.tags %}
              <span class="tag-pill">{{ tag }}</span>
              {% endfor %}
            </div>
            {% endif %}
          </article>
        </li>
        {% endfor %}
      </ul>
    </div>
  </section>
</div>
