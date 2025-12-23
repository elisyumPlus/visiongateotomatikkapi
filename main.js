// Basit interaktivite: mobil menü ve modal
document.addEventListener('DOMContentLoaded', function(){
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const heroOpen = document.getElementById('open-quote');
  const heroOpen2 = document.getElementById('open-quote-2');
  const modal = document.getElementById('quoteModal');
  const closeModal = document.getElementById('closeModal');
  const modalCancel = document.getElementById('modalCancel');
  const quoteForm = document.getElementById('quoteForm');

  function toggleMenu(){
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    if(!expanded){
      mobileMenu.style.display = 'block';
      mobileMenu.setAttribute('aria-hidden','false');
    } else {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden','true');
    }
  }
  hamburger && hamburger.addEventListener('click', toggleMenu);

  function openModal(){
    modal.setAttribute('aria-hidden','false');
  }
  function closeModalFn(){
    modal.setAttribute('aria-hidden','true');
  }

  heroOpen && heroOpen.addEventListener('click', openModal);
  heroOpen2 && heroOpen2.addEventListener('click', openModal);
  closeModal && closeModal.addEventListener('click', closeModalFn);
  modalCancel && modalCancel.addEventListener('click', closeModalFn);

  // simple client-side mock submission
  quoteForm && quoteForm.addEventListener('submit', function(e){
    e.preventDefault();
    // burada gerçek backend yok; demo amaçlı success mesajı göster
    alert('Teklif talebiniz alındı. En kısa sürede dönüş yapacağız (demo).');
    closeModalFn();
    quoteForm.reset();
  });
});
