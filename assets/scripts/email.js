$('#mbr-form').submit(function(e) {
  var name = document.getElementById('#inputName'),
  var email = document.getElementById('#inputEmail'),
  var subject = document.getElementById('#inputSubject'),
  var message = document.getElementById('#inputMessage');

  if (!name.value || !email.value || !subject.value || !message.value ) {
    alertify.error('Please enter a value')
  } else {
    $ajax({
      url: "https://formspree.io/oneill.linda21@gmail.com",
      method: "post",
      data: $(this).serialize(),
      dataType: "json"
    });
    e.preventDefault()
    $(this).get(0)reset()
    alertify.success('Message sent!')
  }
});
