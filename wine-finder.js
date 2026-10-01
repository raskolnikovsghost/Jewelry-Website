(function () {
  'use strict';

  var RECENT_KEY = 'wf_recent_searches';
  var MAX_RECENT = 8;

  var form = document.getElementById('wfForm');
  var nameInput = document.getElementById('wfName');
  var vintageInput = document.getElementById('wfVintage');
  var regionInput = document.getElementById('wfRegion');

  var resultsSection = document.getElementById('wfResults');
  var resultsTitle = document.getElementById('wfResultsTitle');
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

  // Each entry: name, description, urlFn(query, name, vintage, region) -> url
  var COMPARE_SOURCES = [
    {
      name: 'Wine-Searcher',
      desc: 'Aggregates prices across hundreds of AU & global sellers',
      url: function (q) {
        return 'https://www.wine-searcher.com/find/' + encodeURIComponent(q);
      }
    },
    {
      name: 'Google Shopping (AU)',
      desc: 'Compare listings across many Australian stores',
      url: function (q) {
        return 'https://www.google.com/search?tbm=shop&gl=au&hl=en&q=' + encodeURIComponent(q);
      }
    }
  ];

  var RETAILERS = [
    {
      name: "Dan Murphy's",
      desc: "Australia's largest liquor retailer",
      url: function (q) {
        return 'https://www.danmurphys.com.au/search?query=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Vintage Cellars',
      desc: 'Premium & fine wine specialist chain',
      url: function (q) {
        return 'https://www.vintagecellars.com.au/search?query=' + encodeURIComponent(q);
      }
    },
    {
      name: 'BWS',
      desc: 'Beer Wine Spirits — wide local availability',
      url: function (q) {
        return 'https://bws.com.au/search?query=' + encodeURIComponent(q);
      }
    },
    {
      name: 'First Choice Liquor',
      desc: 'Coles Group liquor retailer',
      url: function (q) {
        return 'https://www.firstchoiceliquor.com.au/search?query=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Liquorland',
      desc: 'National bottle shop chain',
      url: function (q) {
        return 'https://www.liquorland.com.au/search?query=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Dan Murphy’s eBay/Marketplace',
      desc: 'Third-party AU sellers on eBay',
      url: function (q) {
        return 'https://www.ebay.com.au/sch/i.html?_nkw=' + encodeURIComponent(q) + '&_sacat=0';
      }
    }
  ];

  var SPECIALISTS = [
    {
      name: 'Nicks Wine Merchants',
      desc: 'Fine & rare Australian wine specialist',
      url: function (q) {
        return 'https://www.nicks.com.au/catalogsearch/result/?q=' + encodeURIComponent(q);
      }
    },
    {
      name: 'CellarHand',
      desc: 'Boutique & small-producer importer',
      url: function (q) {
        return 'https://cellarhand.com.au/?s=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Wine Selectors',
      desc: 'Curated Australian wine club & shop',
      url: function (q) {
        return 'https://www.wineselectors.com.au/search?q=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Kemenys',
      desc: 'Sydney fine wine merchant',
      url: function (q) {
        return 'https://www.kemenys.com.au/search?q=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Prince Wine Store',
      desc: 'Melbourne fine wine specialist',
      url: function (q) {
        return 'https://www.princewinestore.com.au/search?q=' + encodeURIComponent(q);
      }
    }
  ];

  var AUCTIONS = [
    {
      name: 'Langton’s Fine Wine Auctions',
      desc: 'Australia’s leading fine wine auction house',
      url: function (q) {
        return 'https://www.langtons.com.au/search?q=' + encodeURIComponent(q);
      }
    },
    {
      name: 'Mr Wolf / Grays Wine Auctions',
      desc: 'Online wine auctions in Australia',
      url: function (q) {
        return 'https://www.grays.com/search/' + encodeURIComponent(q);
      }
    }
  ];

  function makeLinkCard(source, query, name, vintage, region) {
    var a = document.createElement('a');
    a.className = 'wf-link-card';
    a.href = source.url(query, name, vintage, region);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    var left = document.createElement('span');
    var title = document.createElement('span');
    title.className = 'wf-link-name';
    title.textContent = source.name;
    var desc = document.createElement('span');
    desc.className = 'wf-link-desc';
    desc.textContent = source.desc;
    left.appendChild(title);
    left.appendChild(desc);

    var arrow = document.createElement('span');
    arrow.className = 'wf-link-arrow';
    arrow.textContent = '↗';
    arrow.setAttribute('aria-hidden', 'true');

    a.appendChild(left);
    a.appendChild(arrow);
    return a;
  }

  function renderGrid(container, sources, query, name, vintage, region) {
    container.innerHTML = '';
    sources.forEach(function (source) {
      container.appendChild(makeLinkCard(source, query, name, vintage, region));
    });
  }

  function loadRecent() {
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecent(list) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    } catch (e) {
      /* localStorage unavailable — silently skip persistence */
    }
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
    if (!list.length) {
      recentSection.hidden = true;
      return;
    }
    recentSection.hidden = false;
    list.forEach(function (item) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'wf-recent-chip';
      var label = item.name;
      if (item.vintage) label += ' · ' + item.vintage;
      chip.textContent = label;
      chip.addEventListener('click', function () {
        nameInput.value = item.name;
        vintageInput.value = item.vintage || '';
        regionInput.value = item.region || '';
        runSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      recentList.appendChild(chip);
    });
  }

  function runSearch() {
    var name = nameInput.value.trim();
    var vintage = vintageInput.value.trim();
    var region = regionInput.value.trim();

    if (!name) {
      nameInput.focus();
      return;
    }

    var query = buildQuery(name, vintage, region);
    var title = name;
    if (vintage) title += ' (' + vintage + ')';
    resultsTitle.textContent = 'Results for ' + title;

    renderGrid(compareGrid, COMPARE_SOURCES, query, name, vintage, region);
    renderGrid(retailersGrid, RETAILERS, query, name, vintage, region);
    renderGrid(specialistsGrid, SPECIALISTS, query, name, vintage, region);
    renderGrid(auctionsGrid, AUCTIONS, query, name, vintage, region);

    resultsSection.hidden = false;
    addRecent(name, vintage, region);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    runSearch();
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderRecent();
})();
