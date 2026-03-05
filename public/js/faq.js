// FAQ Accordion Toggle
function toggleFaq(element) {
  const faqItem = element.parentElement;
  const allFaqItems = document.querySelectorAll('.faq-item');
  
  // Close all other FAQ items
  allFaqItems.forEach(item => {
    if (item !== faqItem && item.classList.contains('active')) {
      item.classList.remove('active');
    }
  });
  
  // Toggle current FAQ item
  faqItem.classList.toggle('active');
}

// Add keyboard accessibility
document.addEventListener('DOMContentLoaded', () => {
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.setAttribute('tabindex', '0');
    question.setAttribute('role', 'button');
    question.setAttribute('aria-expanded', 'false');
    
    question.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFaq(question);
        const isExpanded = question.parentElement.classList.contains('active');
        question.setAttribute('aria-expanded', isExpanded);
      }
    });
  });
});
