(function () {
  'use strict';

  var RECENT_KEY = 'wf_recent_searches';
  var MAX_RECENT = 8;
  var EXAMPLE = { name: 'Henschke Hill of Grace', vintage: '2018', region: 'Eden Valley' };

  var form = document.getElementById('wfForm');
  var nameInput = document.getElementById('wfName');
  var vintageInput = document.getElementById('wfVintage');
  var regionInput = document.getElementById('wfRegion');

  var resultsTitle = document.getElementById('wfResultsTitle');
  var exampleFlag = document.getElementById('wfExampleFlag');
  var compareGrid = document.getElementById('wfCompare');
  var retailersGrid = document.getElementById('wfRetailers');
  var specialistsGrid = document.getElementById('wfSpecialists');
  var auctionsGrid = document.getElementById('wfAuctions');

  var recentSection = document.getElementById('wfRecentSection');
  var recentList = document.getElementById('wfRecent');

  function buildQuery(name, vintage, region) {
    var parts = [name];
    if (vintage) parts.push(vintage);
    if (region) parts.push(region);
    return parts.join(' ').trim();
  }

  var COMPARE_SOURCES = [
    { name: 'Wine-Searcher', desc: 'Aggregates prices across hundreds of AU & global sellers', url: function (q) { return 'https://www.wine-searcher.com/find/' + encodeURIComponent(q); } },
    { name: 'Google Shopping (AU)', desc: 'Compare listings across many Australian stores', url: function (q) { return 'https://www.google.com/search?tbm=shop&gl=au&hl=en&q=' + encodeURIComponent(q); } }
  ];

  var RETAILERS = [
    { name: 'Dan Murphy’s', desc: 'Australia’s largest liquor retailer', url: function (q) { return 'https://www.danmurphys.com.au/search?query=' + encodeURIComponent(q); } },
    { name: 'Vintage Cellars', desc: 'Premium & fine wine specialist chain', url: function (q) { return 'https://www.vintagecellars.com.au/search?query=' + encodeURIComponent(q); } },
    { name: 'BWS', desc: 'Beer Wine Spirits — wide local availability', url: function (q) { return 'https://bws.com.au/search?query=' + encodeURIComponent(q); } },
    { name: 'First Choice Liquor', desc: 'Coles Group liquor retailer', url: function (q) { return 'https://www.firstchoiceliquor.com.au/search?query=' + encodeURIComponent(q); } },
    { name: 'Liquorland', desc: 'National bottle shop chain', url: function (q) { return 'https://www.liquorland.com.au/search?query=' + encodeURIComponent(q); } },
    { name: 'eBay Australia', desc: 'Third-party AU sellers', url: function (q) { return 'https://www.ebay.com.au/sch/i.html?_nkw=' + encodeURIComponent(q) + '&_sacat=0'; } }
  ];

  var SPECIALISTS = [
    { name: 'Nicks Wine Merchants', desc: 'Fine & rare Australian wine specialist', url: function (q) { return 'https://www.nicks.com.au/catalogsearch/result/?q=' + encodeURIComponent(q); } },
    { name: 'CellarHand', desc: 'Boutique & small-producer importer', url: function (q) { return 'https://cellarhand.com.au/?s=' + encodeURIComponent(q); } },
    { name: 'Wine Selectors', desc: 'Curated Australian wine club & shop', url: function (q) { return 'https://www.wineselectors.com.au/search?q=' + encodeURIComponent(q); } },
    { name: 'Kemenys', desc: 'Sydney fine wine merchant', url: function (q) { return 'https://www.kemenys.com.au/search?q=' + encodeURIComponent(q); } },
    { name: 'Prince Wine Store', desc: 'Melbourne fine wine specialist', url: function (q) { return 'https://www.princewinestore.com.au/search?q=' + encodeURIComponent(q); } }
  ];

  var AUCTIONS = [
    { name: 'Langton’s Fine Wine Auctions', desc: 'Australia’s leading fine wine auction house', url: function (q) { return 'https://www.langtons.com.au/search?q=' + encodeURIComponent(q); } },
    { name: 'Grays Wine Auctions', desc: 'Online wine auctions in Australia', url: function (q) { return 'https://www.grays.com/search/' + encodeURIComponent(q); } }
  ];

  function makeLinkCard(source, query) {
    var a = document.createElement('a');
    a.className = 'link-card';
    a.href = source.url(query);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    var left = document.createElement('span');
    var title = document.createElement('span');
    title.className = 'link-name';
    title.textContent = source.name;
    var desc = document.createElement('span');
    desc.className = 'link-desc';
    desc.textContent = source.desc;
    left.appendChild(title);
    left.appendChild(desc);

    var arrow = document.createElement('span');
    arrow.className = 'link-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');

    a.appendChild(left);
    a.appendChild(arrow);
    return a;
  }

  function renderGrid(container, sources, query) {
    container.innerHTML = '';
    sources.forEach(function (source) {
      container.appendChild(makeLinkCard(source, query));
    });
  }

  function loadRecent() {
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveRecent(list) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch (e) { /* unavailable */ }
  }

  function addRecent(name, vintage, region) {
    var list = loadRecent();
    var entry = { name: name, vintage: vintage, region: region };
    list = list.filter(function (item) {
      return !(item.name === name && item.vintage === vintage && item.region === region);
    });
    list.unshift(entry);
    if (list.length > MAX_RECENT) list = list.slice(0, MAX_RECENT);
    saveRecent(list);
    renderRecent();
  }

  function renderRecent() {
    var list = loadRecent();
    recentList.innerHTML = '';
    if (!list.length) { recentSection.hidden = true; return; }
    recentSection.hidden = false;
    list.forEach(function (item) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      var label = item.name;
      if (item.vintage) label += ' · ' + item.vintage;
      chip.textContent = label;
      chip.addEventListener('click', function () {
        nameInput.value = item.name;
        vintageInput.value = item.vintage || '';
        regionInput.value = item.region || '';
        runSearch({ isExample: false });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      recentList.appendChild(chip);
    });
  }

  function runSearch(opts) {
    var isExample = !!(opts && opts.isExample);
    var name = nameInput.value.trim();
    var vintage = vintageInput.value.trim();
    var region = regionInput.value.trim();
    if (!name) { nameInput.focus(); return; }

    var query = buildQuery(name, vintage, region);
    var title = name;
    if (vintage) title += ' (' + vintage + ')';
    resultsTitle.textContent = 'Results for ' + title;
    exampleFlag.hidden = !isExample;

    renderGrid(compareGrid, COMPARE_SOURCES, query);
    renderGrid(retailersGrid, RETAILERS, query);
    renderGrid(specialistsGrid, SPECIALISTS, query);
    renderGrid(auctionsGrid, AUCTIONS, query);

    if (!isExample) addRecent(name, vintage, region);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    runSearch({ isExample: false });
    document.getElementById('wfResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderRecent();

  nameInput.value = EXAMPLE.name;
  vintageInput.value = EXAMPLE.vintage;
  regionInput.value = EXAMPLE.region;
  runSearch({ isExample: true });
})();
