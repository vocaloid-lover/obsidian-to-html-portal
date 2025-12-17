---
layout: base.njk
title: "所有笔记"
---

# 所有笔记

按日期排序的笔记列表：

<ul>
{% for note in collections.notes | reverse %}
    <li>
        <a href="{{ note.url }}">{{ note.data.title }}</a>
        {% if note.data.date %}
        - <time datetime="{{ note.data.date }}">{{ note.data.date }}</time>
        {% endif %}
    </li>
{% endfor %}
</ul>