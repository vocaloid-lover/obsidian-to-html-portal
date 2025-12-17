// 客户端搜索入口，依赖 lunr.js（通过 CDN 在页面加载）
(async function(){
  if (!window.fetch) return;
  try {
    const res = await fetch('/search/index.json');
    const docs = await res.json();

    // build lunr index
    const idx = lunr(function(){
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('content');
      this.field('tags');

      docs.forEach(function (doc) { this.add(doc) }, this);
    });

    const $input = document.getElementById('search-input');
    const $results = document.getElementById('search-results');
    const $tagFilter = document.getElementById('tag-filter');
    const notesList = Array.from(document.querySelectorAll('.note-item'));

    // 填充标签下拉
    const tagSet = new Set();
    docs.forEach(d => { if (d.tags && d.tags.length) d.tags.forEach(t=> tagSet.add(t)); });
    if ($tagFilter) {
      Array.from(tagSet).sort().forEach(tag => {
        const opt = document.createElement('option'); opt.value = tag; opt.textContent = tag; $tagFilter.appendChild(opt);
      });
      $tagFilter.addEventListener('change', function(){
        const tag = this.value;
        // 若有查询，先执行搜索再按标签过滤结果
        const q = $input.value.trim();
        if (q) {
          try { const results = idx.search(q + '*'); renderResults(results.filter(r => {
            const doc = docs.find(d => d.id==r.ref);
            return !tag || (doc.tags || []).includes(tag);
          })); } catch(e){ console.error(e); }
        } else {
          // 无查询时过滤页面列表
          notesList.forEach(li => {
            const tags = (li.getAttribute('data-tags')||'').split(',').map(s=>s.trim()).filter(Boolean);
            if (!tag || tags.includes(tag)) li.style.display = '';
            else li.style.display = 'none';
          });
          $results.innerHTML = '';
        }
      });
    }

    function renderResults(results){
      $results.innerHTML = '';
      if (!results || results.length === 0) { $results.innerHTML = '<p>未找到结果。</p>'; return; }
      const ul = document.createElement('ul');
      results.forEach(r => {
        const doc = docs.find(d => d.id == r.ref);
        const li = document.createElement('li');
        li.className = 'search-item';
        li.innerHTML = `<a href="${doc.permalink}"><strong>${escapeHtml(doc.title)}</strong></a> <small class="meta">${doc.date} ${doc.tags && doc.tags.length? '- ' + doc.tags.join(', '):''}</small><p>${escapeHtml(doc.content_snippet)}</p>`;
        ul.appendChild(li);
      });
      $results.appendChild(ul);
    }

    function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    $input.addEventListener('input', function(e){
      const q = e.target.value.trim();
      const selectedTag = $tagFilter ? $tagFilter.value : '';
      if (!q) { $results.innerHTML = ''; return; }
      try{
        let results = idx.search(q + '*');
        if (selectedTag) {
          results = results.filter(r => {
            const doc = docs.find(d => d.id==r.ref);
            return (doc.tags || []).includes(selectedTag);
          });
        }
        renderResults(results);
      }catch(err){
        console.error(err);
      }
    });

  } catch (err) {
    console.error('无法加载搜索索引:', err);
  }
})();
