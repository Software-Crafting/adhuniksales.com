/* Auto-grow: data-ds-textarea-autogrow. Counter: data-ds-textarea-counter="<id of counter>" with native maxlength. */
(() => {
  const grow = (textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight}px`;
  };

  const count = (textarea) => {
    const counter = document.getElementById(textarea.dataset.dsTextareaCounter);
    if (!counter) throw new Error(`textarea: no counter with id "${textarea.dataset.dsTextareaCounter}"`);
    if (textarea.maxLength < 0) throw new Error("textarea: a counter needs maxlength on the textarea");
    counter.textContent = `${textarea.value.length} of ${textarea.maxLength} characters`;
  };

  const update = (textarea) => {
    if (textarea.hasAttribute("data-ds-textarea-autogrow")) grow(textarea);
    if (textarea.dataset.dsTextareaCounter) count(textarea);
  };

  document.addEventListener("input", (event) => {
    if (event.target.matches("textarea.ds-textarea")) update(event.target);
  });
  document.querySelectorAll("textarea.ds-textarea").forEach(update);
})();
