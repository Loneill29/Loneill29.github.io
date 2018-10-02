$('#mbr-form').submit(function(e) {
  var name = document.getElementById('#name-form1-3'),
  email = document.getElementById('#email-form1-3'),
  subject = document.getElementById('#subject-form1-3'),
  message = document.getElementById('#message-form1-3');

  if (!name.value || !email.value || !subject.value || !message.value ) {
    alertify.error('Please enter a value')
  } else {
    $ajax({
      url: "https://formspree.io/oneill.linda21@gmail.com",
      method: "POST",
      data: $(this).serialize(),
      dataType: "json"
    });
    e.preventDefault()
    $(this).get(0)reset()
    alertify.success('Message sent!')
  }
});
