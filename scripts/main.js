(() => {
  const pathname = window.location.pathname.toLowerCase();
  const currentPage = pathname.endsWith('/articulos.html')
    ? 'articulos'
    : pathname.endsWith('/sobre-mi.html')
      ? 'sobre-mi'
      : 'inicio';
  const currentLink = document.querySelector(`[data-page="${currentPage}"]`);

  if (currentLink) {
    currentLink.setAttribute('aria-current', 'page');
  }

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.primary-nav');
  const mobileMenuQuery = window.matchMedia('(max-width: 760px)');
  let mobileMenuOpen = !mobileMenuQuery.matches;

  const updateNavigation = () => {
    if (!menuButton || !navigation) {
      return;
    }

    navigation.hidden = !mobileMenuOpen;
    menuButton.setAttribute('aria-expanded', String(mobileMenuOpen));
    menuButton.setAttribute('aria-label', mobileMenuOpen ? 'Ocultar navegación' : 'Mostrar navegación');
  };

  if (menuButton && navigation) {
    updateNavigation();

    menuButton.addEventListener('click', () => {
      mobileMenuOpen = !mobileMenuOpen;
      updateNavigation();
    });

    navigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (mobileMenuQuery.matches) {
          mobileMenuOpen = false;
          updateNavigation();
        }
      });
    });

    mobileMenuQuery.addEventListener('change', () => {
      mobileMenuOpen = !mobileMenuQuery.matches;
      updateNavigation();
    });
  }

  const searchForm = document.querySelector('.search-box');
  const searchInput = searchForm?.querySelector('input[type="search"]');
  const articleCards = [...document.querySelectorAll('.articles-page .searchable-card')];
  const filterButtons = document.querySelectorAll('.articles-page .filter-pill');
  const searchEmpty = document.querySelector('.articles-page .search-empty');
  const articleList = document.querySelector('.articles-page .article-list');
  const filterList = document.querySelector('.articles-page .filter-list');
  const archiveHeader = document.querySelector('.articles-page .archive-header');
  const articleDetails = document.querySelector('.articles-page .article-detail-view');
  const articleContent = document.querySelector('.articles-page .articles-inner');
  const newsletter = document.querySelector('.articles-page .archive-newsletter');
  const detailArticles = document.querySelectorAll('.articles-page .article-detail');
  const searchParams = new URLSearchParams(window.location.search);
  let searchQuery = (searchParams.get('q') || '').trim().toLocaleLowerCase('es');
  let activeFilter = 'all';

  const updateSearchResults = () => {
    let visibleCount = 0;

    articleCards.forEach((card) => {
      const title = card.querySelector('h2')?.textContent || '';
      const category = card.querySelector('.category-label')?.textContent || '';
      const description = card.querySelector('.article-body > p')?.textContent || '';
      const searchableText = `${title} ${category} ${description}`.toLocaleLowerCase('es');
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !searchQuery || searchableText.includes(searchQuery);

      card.hidden = !matchesCategory || !matchesSearch;

      if (!card.hidden) {
        visibleCount += 1;
      }
    });

    if (searchEmpty) {
      searchEmpty.hidden = visibleCount > 0;
    }
  };

  const syncSearchUrl = () => {
    const url = new URL(window.location.href);

    if (searchQuery) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }

    window.history.replaceState(null, '', url);
  };

  if (searchInput && searchQuery) {
    searchInput.value = searchParams.get('q');
  }

  if (searchInput && articleCards.length) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLocaleLowerCase('es');
      updateSearchResults();
      syncSearchUrl();
    });
  }

  if (searchForm && articleCards.length) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      searchQuery = (searchInput?.value || '').trim().toLocaleLowerCase('es');
      updateSearchResults();
      syncSearchUrl();
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      filterButtons.forEach((pill) => {
        const selected = pill === button;
        pill.classList.toggle('active', selected);
        pill.setAttribute('aria-pressed', String(selected));
      });
      updateSearchResults();
    });
  });

  if (articleCards.length) {
    updateSearchResults();
  }

  const updateArticleView = () => {
    if (!articleDetails || !articleList || !filterList || !archiveHeader || !newsletter) {
      return;
    }

    const selectedDetail = document.getElementById(window.location.hash.slice(1));
    const isDetail = selectedDetail?.classList.contains('article-detail');

    articleDetails.hidden = !isDetail;
    articleList.hidden = Boolean(isDetail);
    filterList.hidden = Boolean(isDetail);
    archiveHeader.hidden = Boolean(isDetail);
    newsletter.hidden = Boolean(isDetail);

    detailArticles.forEach((detail) => {
      detail.hidden = detail !== selectedDetail;
    });

    if (isDetail) {
      const sourceCard = document.getElementById(selectedDetail.dataset.sourceCard);
      const imageSlot = selectedDetail.querySelector('.detail-image');
      const articleImage = sourceCard?.querySelector('.article-visual');

      if (imageSlot && articleImage && !imageSlot.firstElementChild) {
        imageSlot.append(articleImage.cloneNode(true));
      }

      requestAnimationFrame(() => selectedDetail.scrollIntoView({ block: 'start' }));
    } else {
      requestAnimationFrame(() => archiveHeader.scrollIntoView({ block: 'start' }));
    }
  };

  if (articleDetails && articleContent) {
    window.addEventListener('hashchange', updateArticleView);
    window.addEventListener('popstate', updateArticleView);
    articleContent.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest('a.read-link, a.detail-back');

      if (!link) {
        return;
      }

      event.preventDefault();
      const destination = new URL(link.getAttribute('href'), window.location.href);
      window.history.pushState(null, '', destination);
      updateArticleView();
    });
    updateArticleView();
  }

  document.querySelectorAll('.bookmark-button').forEach((button) => {
    button.addEventListener('click', () => {
      const saved = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(saved));
      button.setAttribute('aria-label', saved ? 'Artículo guardado' : 'Guardar artículo');
    });
  });

  document.querySelectorAll('.newsletter-form').forEach((form) => {
    const emailInput = form.querySelector('input[type="email"]');
    const message = form.parentElement.querySelector('.newsletter-message');

    if (!emailInput || !message) {
      return;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailInput.value.trim();

      if (!email) {
        message.textContent = 'Escribe tu correo electrónico para suscribirte.';
        message.classList.add('newsletter-message--error');
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.focus();
        return;
      }

      if (!emailInput.checkValidity()) {
        message.textContent = 'Escribe un correo electrónico válido.';
        message.classList.add('newsletter-message--error');
        emailInput.setAttribute('aria-invalid', 'true');
        emailInput.focus();
        return;
      }

      message.textContent = '¡Listo! Te has suscrito a UI Talks.';
      message.classList.remove('newsletter-message--error');
      emailInput.removeAttribute('aria-invalid');
      form.reset();
    });

    emailInput.addEventListener('input', () => {
      if (emailInput.value.trim()) {
        emailInput.removeAttribute('aria-invalid');
        message.textContent = '';
        message.classList.remove('newsletter-message--error');
      }
    });
  });
})();
