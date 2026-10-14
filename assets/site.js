(function(){
  const images = window.VISION_GATE_IMAGES || {};
  const services = window.SERVICE_DETAILS || {};
  const translations = window.EN_TRANSLATIONS || {};
  const altTranslations = window.EN_ALT_TEXT || {};
  const captionTranslations = window.EN_CAPTIONS || {};
  let currentLanguage = 'tr';

  function previewImageSource(source){
    if(!source.startsWith('https://images.pexels.com/')) return source;
    return source
      .replace(/([?&](?:w|h)=)\d+/, function(match, prefix){ return prefix + '1600'; })
      .replace(/([?&]fm=)png\b/, function(match, prefix){ return prefix + 'jpg'; }) + '&q=84';
  }

  function fullImageSource(source){
    if(!source || !source.startsWith('https://images.pexels.com/')) return source;
    return source.replace(/([?&]fm=)png\b/, function(match, prefix){ return prefix + 'jpg'; }) + '&q=88';
  }

  function addImageBrandMark(container){
    if(!container || container.querySelector('.image-brand-mark')) return;
    const mark = document.createElement('span');
    mark.className = 'image-brand-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = 'VISION GATE';
    container.appendChild(mark);
  }

  document.querySelectorAll('img[data-image-key]').forEach(function(image){
    const source = images[image.dataset.imageKey];
    if(source) image.src = image.dataset.imageKey === 'hero' ? source : previewImageSource(source);
    if(image.dataset.imageKey !== 'hero'){
      addImageBrandMark(image.closest('.service-card, .home-feature-card, .home-project-card, .about-photo, .gallery-item'));
    }
  });
  document.querySelectorAll('[data-full-image-key]').forEach(function(item){
    item.dataset.full = fullImageSource(images[item.dataset.fullImageKey] || '');
  });
  document.querySelectorAll('.service-dialog-image').forEach(addImageBrandMark);
  const galleryFigure = document.querySelector('#gallery-lightbox figure');
  if(galleryFigure) addImageBrandMark(galleryFigure);

  const originalTextNodes = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while((textNode = walker.nextNode())){
    if(textNode.parentElement && !textNode.parentElement.closest('script,style') && textNode.nodeValue.trim()){
      originalTextNodes.push({node:textNode,original:textNode.nodeValue});
    }
  }

  function updateSupportLinks(language){
    const messages = {
      maintenance:{tr:'Merhaba Vision Gate, sistemim için periyodik bakım talep etmek istiyorum.\nSistem türü: \nŞehir: ',en:'Hello Vision Gate, I would like to request routine maintenance.\nSystem type: \nCity: '},
      repair:{tr:'Merhaba Vision Gate, arıza desteği almak istiyorum.\nSistem türü: \nŞehir: \nSorun: ',en:'Hello Vision Gate, I need repair support.\nSystem type: \nCity: \nIssue: '},
      technical:{tr:'Merhaba Vision Gate, teknik destek almak istiyorum.\nKonu: ',en:'Hello Vision Gate, I would like technical support.\nTopic: '}
    };
    document.querySelectorAll('[data-support]').forEach(function(link){
      const support = messages[link.dataset.support];
      if(support) link.href = 'https://wa.me/905393500356?text=' + encodeURIComponent(support[language]);
    });
  }

  function updateServiceDialog(force){
    const dialog = document.querySelector('#service-dialog');
    if(!dialog || (!force && !dialog.open) || !dialog.dataset.service) return;
    const detail = services[dialog.dataset.service];
    if(!detail) return;
    const copy = currentLanguage === 'en' ? detail.en : detail;
    document.querySelector('#service-dialog-title').textContent = copy.title;
    document.querySelector('#service-dialog-description').textContent = copy.description;
    document.querySelector('#service-dialog-points').innerHTML = copy.points.map(function(point){
      return '<li><i class="fa-solid fa-check" aria-hidden="true"></i><span>' + point + '</span></li>';
    }).join('');
    const sourceImage = document.querySelector('[data-image-key="' + detail.imageKey + '"]');
    const image = dialog.querySelector('.service-dialog-image img');
    image.src = fullImageSource(images[detail.imageKey] || '');
    image.alt = currentLanguage === 'en' ? ((sourceImage && altTranslations[sourceImage.alt]) || copy.title) : copy.title;
  }

  function setLanguage(language){
    currentLanguage = language;
    try { window.localStorage.setItem('visionGateLanguage', language); } catch(error) {}
    document.documentElement.lang = language;
    originalTextNodes.forEach(function(entry){
      const trimmed = entry.original.trim();
      const translation = language === 'en' ? translations[trimmed] : null;
      if(translation){
        const leading = entry.original.match(/^\s*/)[0];
        const trailing = entry.original.match(/\s*$/)[0];
        entry.node.nodeValue = leading + translation + trailing;
      } else {
        entry.node.nodeValue = entry.original;
      }
    });

    const finderTitle = document.querySelector('#finder-title');
    if(finderTitle) finderTitle.innerHTML = language === 'en'
      ? 'Find the right<br><span class="accent">system for you.</span>'
      : 'İhtiyacınıza uygun<br><span class="accent">sistemi bulun.</span>';

    const body = document.body;
    const title = language === 'en' ? body.dataset.titleEn : body.dataset.titleTr;
    const description = language === 'en' ? body.dataset.descriptionEn : body.dataset.descriptionTr;
    if(title) document.title = title;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if(descriptionMeta && description) descriptionMeta.content = description;
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if(keywordsMeta) keywordsMeta.content = language === 'en'
      ? 'automatic shutters, doors, barriers, roller shutters, glass systems, Vision Gate'
      : 'otomatik kepenk, kapı, bariyer, panjur, cam sistemleri, Vision Gate';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if(ogTitle) ogTitle.content = document.title;
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if(ogDescription && description) ogDescription.content = description;
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if(ogLocale) ogLocale.content = language === 'en' ? 'en_US' : 'tr_TR';
    ['twitter:title','twitter:description'].forEach(function(name){
      const meta = document.querySelector('meta[name="' + name + '"]');
      if(meta){
        const source = name.endsWith('title') ? ogTitle : ogDescription;
        if(source) meta.content = source.content;
      }
    });

    const toggle = document.querySelector('#language-toggle');
    if(toggle){
      toggle.textContent = language === 'tr' ? 'EN' : 'TR';
      toggle.setAttribute('aria-label', language === 'tr' ? 'Switch to English' : 'Türkçeye geç');
      toggle.title = language === 'tr' ? 'English' : 'Türkçe';
    }
    const nav = document.querySelector('#site-nav');
    if(nav) nav.setAttribute('aria-label', language === 'tr' ? 'Ana menü' : 'Main menu');
    document.querySelectorAll('.brand').forEach(function(brand){
      brand.setAttribute('aria-label', language === 'tr' ? 'Vision Gate ana sayfa' : 'Vision Gate home');
    });
    const phoneLink = document.querySelector('.nav-contact[href^="tel:"]');
    if(phoneLink) phoneLink.setAttribute('aria-label', language === 'tr' ? 'Vision Gate\'i ara: 0539 350 03 56' : 'Call Vision Gate: 0539 350 03 56');
    const whatsappNav = document.querySelector('.nav-contact.whatsapp');
    if(whatsappNav) whatsappNav.setAttribute('aria-label', language === 'tr' ? 'Vision Gate ile WhatsApp üzerinden iletişime geç' : 'Contact Vision Gate on WhatsApp');
    const menu = document.querySelector('.menu-toggle');
    if(menu){
      const isOpen = nav && nav.classList.contains('open');
      menu.setAttribute('aria-label', language === 'tr' ? (isOpen ? 'Menüyü kapat' : 'Menüyü aç') : (isOpen ? 'Close menu' : 'Open menu'));
    }
    const placeholders = [
      ['#full-name', 'Adınız ve soyadınız', 'Your full name'],
      ['#phone', '05xx xxx xx xx', 'Your phone number'],
      ['#city', 'Örn. İzmir', 'e.g. Izmir'],
      ['#details', 'Uygulama alanı ve beklentiniz hakkında kısaca bilgi verin.', 'Briefly describe the space and what you need.']
    ];
    placeholders.forEach(function(item){
      const field = document.querySelector(item[0]);
      if(field) field.placeholder = language === 'en' ? item[2] : item[1];
    });
    const heroTrust = document.querySelector('.hero-trust');
    if(heroTrust) heroTrust.setAttribute('aria-label', language === 'tr' ? 'Hizmet özellikleri' : 'Service highlights');
    const galleryFilters = document.querySelector('.gallery-filters');
    if(galleryFilters) galleryFilters.setAttribute('aria-label', language === 'tr' ? 'Görselleri filtrele' : 'Filter images');
    const backTop = document.querySelector('.back-top');
    if(backTop) backTop.setAttribute('aria-label', language === 'tr' ? 'Sayfanın başına dön' : 'Back to top');
    const lightboxDialog = document.querySelector('#gallery-lightbox');
    if(lightboxDialog) lightboxDialog.setAttribute('aria-label', language === 'tr' ? 'Proje görseli' : 'Project image');
    const lightboxClose = document.querySelector('.lightbox-close');
    if(lightboxClose) lightboxClose.setAttribute('aria-label', language === 'tr' ? 'Görseli kapat' : 'Close image');
    const serviceDialogClose = document.querySelector('.service-dialog-close');
    if(serviceDialogClose) serviceDialogClose.setAttribute('aria-label', language === 'tr' ? 'Detay penceresini kapat' : 'Close details');
    const result = document.querySelector('#finder-result');
    if(result && !result.hidden && result.dataset.service && services[result.dataset.service]){
      const detail = services[result.dataset.service];
      const copy = language === 'en' ? detail.en : detail;
      document.querySelector('#finder-result-title').textContent = copy.title;
      document.querySelector('#finder-result-copy').textContent = copy.description;
    }
    document.querySelectorAll('img[alt]').forEach(function(image){
      if(!Object.prototype.hasOwnProperty.call(image.dataset, 'originalAlt')) image.dataset.originalAlt = image.alt;
      image.alt = language === 'en' ? (altTranslations[image.dataset.originalAlt] || image.dataset.originalAlt) : image.dataset.originalAlt;
    });
    const lightbox = document.querySelector('#gallery-lightbox');
    if(lightbox && lightbox.open && lightbox.dataset.caption){
      lightbox.querySelector('figcaption').textContent = language === 'en'
        ? (captionTranslations[lightbox.dataset.caption] || lightbox.dataset.caption)
        : lightbox.dataset.caption;
    }
    updateSupportLinks(language);
    updateServiceDialog();
  }

  const initialLanguage = (function(){
    try { return window.localStorage.getItem('visionGateLanguage') === 'en' ? 'en' : 'tr'; }
    catch(error) { return 'tr'; }
  })();
  setLanguage(initialLanguage);

  const languageToggle = document.querySelector('#language-toggle');
  if(languageToggle) languageToggle.addEventListener('click', function(){ setLanguage(currentLanguage === 'tr' ? 'en' : 'tr'); });

  const nav = document.querySelector('#site-nav');
  const menuButton = document.querySelector('.menu-toggle');
  if(nav && menuButton){
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    nav.querySelectorAll('a').forEach(function(link){
      if(new URL(link.href, window.location.href).pathname.split('/').pop() === currentPage){
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
    menuButton.addEventListener('click', function(){
      const isOpen = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', currentLanguage === 'tr' ? (isOpen ? 'Menüyü kapat' : 'Menüyü aç') : (isOpen ? 'Close menu' : 'Open menu'));
      menuButton.innerHTML = isOpen ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });
    nav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', function(){
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', currentLanguage === 'tr' ? 'Menüyü aç' : 'Open menu');
        menuButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });
  }

  document.querySelectorAll('.faq-list details').forEach(function(item){
    item.addEventListener('toggle', function(){
      if(item.open) document.querySelectorAll('.faq-list details').forEach(function(other){ if(other !== item) other.open = false; });
    });
  });

  const galleryItems = document.querySelectorAll('.gallery-item');
  const filters = document.querySelectorAll('.filter-btn');
  filters.forEach(function(button){
    button.addEventListener('click', function(){
      filters.forEach(function(filter){ filter.setAttribute('aria-pressed', String(filter === button)); });
      galleryItems.forEach(function(item){ item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter; });
    });
  });
  const lightbox = document.querySelector('#gallery-lightbox');
  if(lightbox){
    const lightboxImage = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('figcaption');
    galleryItems.forEach(function(item){
      item.addEventListener('click', function(){
        const image = item.querySelector('img');
        lightboxImage.src = item.dataset.full;
        lightboxImage.dataset.originalAlt = image.dataset.originalAlt || image.alt;
        lightboxImage.alt = lightboxImage.dataset.originalAlt;
        lightbox.dataset.caption = item.dataset.caption;
        lightboxCaption.textContent = currentLanguage === 'en' ? (captionTranslations[item.dataset.caption] || item.dataset.caption) : item.dataset.caption;
        lightbox.showModal();
      });
    });
    lightbox.querySelector('.lightbox-close').addEventListener('click', function(){ lightbox.close(); });
    lightbox.addEventListener('click', function(event){ if(event.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('close', function(){ lightboxImage.src = ''; });
  }

  const serviceDialog = document.querySelector('#service-dialog');
  if(serviceDialog){
    const image = serviceDialog.querySelector('.service-dialog-image img');
    document.querySelectorAll('.service-card[data-service]').forEach(function(card){
      function open(){
        const detail = services[card.dataset.service];
        if(!detail) return;
        serviceDialog.dataset.service = card.dataset.service;
        updateServiceDialog(true);
        serviceDialog.showModal();
      }
      card.addEventListener('click', open);
      card.addEventListener('keydown', function(event){
        if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); open(); }
      });
    });
    serviceDialog.querySelector('.service-dialog-close').addEventListener('click', function(){ serviceDialog.close(); });
    serviceDialog.addEventListener('click', function(event){ if(event.target === serviceDialog) serviceDialog.close(); });
    serviceDialog.addEventListener('close', function(){ image.src = ''; });
    const quoteLink = serviceDialog.querySelector('#service-quote-link');
    if(quoteLink) quoteLink.addEventListener('click', function(event){
      event.preventDefault();
      window.location.href = 'teklif.html?service=' + encodeURIComponent(serviceDialog.dataset.service || '');
    });
  }

  const productFinder = document.querySelector('#product-finder');
  if(productFinder){
    let recommendedService = '';
    productFinder.addEventListener('submit', function(event){
      event.preventDefault();
      if(!productFinder.reportValidity()) return;
      const area = document.querySelector('#finder-area').value;
      const goal = document.querySelector('#finder-goal').value;
      if(area === 'store') recommendedService = 'kepenk';
      else if(area === 'garage') recommendedService = 'kapi';
      else if(area === 'parking') recommendedService = 'bariyer';
      else if(area === 'window') recommendedService = 'panjur';
      else if(area === 'balcony') recommendedService = goal === 'open-close' ? 'giyotin-cam' : 'cam-balkon';
      else if(area === 'cafe') recommendedService = goal === 'glass' || goal === 'open-close' ? 'giyotin-cam' : 'cam-balkon';
      const detail = services[recommendedService];
      if(!detail) return;
      const copy = currentLanguage === 'en' ? detail.en : detail;
      document.querySelector('#finder-result-title').textContent = copy.title;
      document.querySelector('#finder-result-copy').textContent = copy.description;
      const result = document.querySelector('#finder-result');
      result.dataset.service = recommendedService;
      result.hidden = false;
      result.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
    const detailsButton = document.querySelector('#finder-details');
    if(detailsButton) detailsButton.addEventListener('click', function(){
      const detailButton = document.querySelector('#finder-result');
      const detail = services[detailButton.dataset.service];
      if(!detail || !serviceDialog) return;
      serviceDialog.dataset.service = detailButton.dataset.service;
      updateServiceDialog(true);
      serviceDialog.showModal();
    });
    const quoteButton = document.querySelector('#finder-quote');
    if(quoteButton) quoteButton.addEventListener('click', function(event){
      if(!recommendedService) return;
      event.preventDefault();
      window.location.href = 'teklif.html?service=' + encodeURIComponent(recommendedService);
    });
  }

  const quoteForm = document.querySelector('#quote-form');
  if(quoteForm){
    const serviceSelect = document.querySelector('#service');
    const requestedService = new URLSearchParams(window.location.search).get('service');
    if(requestedService && serviceSelect){
      const matchingOption = serviceSelect.querySelector('[data-product="' + requestedService + '"]');
      if(matchingOption) serviceSelect.value = matchingOption.value;
    }
    quoteForm.addEventListener('submit', function(event){
      event.preventDefault();
      if(!quoteForm.reportValidity()) return;
      const values = new FormData(quoteForm);
      const message = currentLanguage === 'en' ? [
        'Hello Vision Gate, I would like a quote through your website.', '',
        'Name: ' + values.get('name'), 'Phone: ' + values.get('phone'),
        'City / region: ' + values.get('city'), 'Service: ' + values.get('service'),
        'Project details: ' + (values.get('details') || 'Not provided')
      ].join('\n') : [
        'Merhaba Vision Gate, web sitenizden teklif almak istiyorum.', '',
        'Ad Soyad: ' + values.get('name'), 'Telefon: ' + values.get('phone'),
        'Şehir / Bölge: ' + values.get('city'), 'Hizmet: ' + values.get('service'),
        'Proje detayları: ' + (values.get('details') || 'Belirtilmedi')
      ].join('\n');
      const toast = document.querySelector('#form-toast');
      if(toast){
        toast.classList.add('show');
        window.setTimeout(function(){ toast.classList.remove('show'); }, 6500);
      }
      const whatsappWindow = window.open('https://wa.me/905393500356?text=' + encodeURIComponent(message), '_blank');
      if(whatsappWindow) whatsappWindow.opener = null;
      else window.location.assign('https://wa.me/905393500356?text=' + encodeURIComponent(message));
    });
  }

  const backTop = document.querySelector('.back-top');
  if(backTop) window.addEventListener('scroll', function(){ backTop.classList.toggle('visible', window.scrollY > 450); }, {passive:true});
  if(window.AOS) window.AOS.init({duration:700,once:true,offset:45,disable:function(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches;}});
})();
