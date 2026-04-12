import { create, load, search } from '/js/orama/index.js';

const TYPE_LABELS = {
  characters: 'Character',
  sessions: 'Session',
  locations: 'Location',
  npcs: 'NPC',
  rumors: 'Rumor',
  factions: 'Faction',
  items: 'Item',
  creatures: 'Creature',
  storylines: 'Storyline',
  documents: 'Document',
};

function highlightTerms(text, terms) {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  if (!pattern) return escaped;
  return escaped.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

function getSnippet(text, terms, contextChars = 80) {
  const lowerText = text.toLowerCase();
  let bestIndex = -1;

  for (const term of terms) {
    const idx = lowerText.indexOf(term);
    if (idx !== -1) {
      bestIndex = idx;
      break;
    }
  }

  if (bestIndex === -1) return '';

  const start = Math.max(0, bestIndex - contextChars);
  const end = Math.min(text.length, bestIndex + contextChars);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = `\u2026${snippet}`;
  if (end < text.length) snippet = `${snippet}\u2026`;

  return highlightTerms(snippet, terms);
}

(async () => {
  const searchForm = document.querySelector('#search-form');
  const searchInput = document.querySelector('#search-input');
  const searchResults = document.querySelector('#search-results');
  const resultsList = document.querySelector('#search-results-list');
  const filtersContainer = document.querySelector('#search-filters');
  const searchDismiss = searchResults.querySelector('.search-close');

  let db;
  let lastResults = [];
  let lastQueryTerms = [];
  let activeFilter = null;
  let initState = 'idle'; // idle | loading | ready | error

  const { promise: searchReady, resolve: makeSearchReady } =
    Promise.withResolvers();

  const SCHEMA = {
    url: 'string',
    type: 'string',
    title: 'string',
    metadata: 'string',
    content: 'string',
  };

  searchForm.removeAttribute('hidden');

  async function initializeSearch() {
    if (initState === 'loading' || initState === 'ready') return;
    initState = 'loading';
    searchForm.querySelector('button[type="submit"]').disabled = false;

    try {
      const response = await fetch('/searchindex.json');
      const rawData = await response.json();

      db = create({ schema: SCHEMA });
      load(db, rawData);

      initState = 'ready';
      makeSearchReady();
    } catch {
      initState = 'error';
    }
  }

  function renderResults() {
    const filtered = activeFilter
      ? lastResults.filter((r) => r.type === activeFilter)
      : lastResults;

    resultsList.innerHTML = '';
    const count = filtered.length;
    const status = document.createElement('li');
    status.className = 'search-status';
    status.textContent = count
      ? `${count} result${count !== 1 ? 's' : ''} found`
      : activeFilter
        ? `No ${TYPE_LABELS[activeFilter] || activeFilter} results`
        : 'No results found';
    resultsList.append(status);

    if (count) {
      for (const result of filtered) {
        const li = document.createElement('li');
        li.className = 'search-result';

        const typeLabel = TYPE_LABELS[result.type] || result.type;

        li.innerHTML = `
          <a class="search-result-title" href="${result.url}">${highlightTerms(result.title, lastQueryTerms)}</a>
          <span class="tag">${typeLabel}</span>
          ${result.snippet ? `<p class="search-result-snippet">${result.snippet}</p>` : ''}
        `;
        resultsList.append(li);
      }
    }
  }

  function renderFilters() {
    const typeCounts = {};
    for (const result of lastResults) {
      typeCounts[result.type] = (typeCounts[result.type] || 0) + 1;
    }

    filtersContainer.innerHTML = '';
    const allOption = document.createElement('option');
    allOption.value = '';
    allOption.textContent = `All types (${lastResults.length})`;
    filtersContainer.append(allOption);

    for (const [type, count] of Object.entries(typeCounts)) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = `${TYPE_LABELS[type] || type} (${count})`;
      filtersContainer.append(option);
    }

    filtersContainer.value = activeFilter || '';
  }

  async function doSearch(event) {
    event.preventDefault();

    const query = new FormData(event.target).get('query').trim();
    if (!query) return;

    activeFilter = null;
    resultsList.innerHTML = '';
    filtersContainer.innerHTML = '';
    const loading = document.createElement('li');
    loading.innerText = 'Loading search\u2026';
    resultsList.append(loading);
    searchResults.showModal();

    if (initState === 'error') {
      await initializeSearch();
    }

    if (initState === 'error') {
      resultsList.innerHTML = '';
      const errorMsg = document.createElement('li');
      errorMsg.textContent = 'Search unavailable. Please try again later.';
      resultsList.append(errorMsg);
      return;
    }

    await searchReady;

    const { hits } = search(db, {
      term: query,
      properties: ['title', 'metadata', 'content'],
      boost: { title: 5, metadata: 2 },
      tolerance: 1,
      threshold: 0.6,
      limit: 50,
    });

    lastQueryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    lastResults = hits.map((hit) => {
      const doc = hit.document;
      return {
        ...doc,
        snippet: getSnippet(doc.content, lastQueryTerms),
      };
    });

    renderFilters();
    renderResults();
  }

  searchInput.addEventListener('focus', initializeSearch);
  searchForm.addEventListener('submit', doSearch);
  searchDismiss.addEventListener('click', () => searchResults.close());
  filtersContainer.addEventListener('change', () => {
    activeFilter = filtersContainer.value || null;
    renderResults();
  });
})();
