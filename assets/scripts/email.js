$(document).ready(function() {
  $('#mbr-form').submit(function(e) {
    var name    = document.getElementById('name-form1-3')
    var email   = document.getElementById('email-form1-3')
    var subject = document.getElementById('subject-form1-3')
    var message = document.getElementById('message-form1-3')

    if (!name.value || !email.value || !subject.value || !message.value) {
      alertify.error("Please make a valid entry");
      return false;
    } else {
      $.ajax({
        method: 'POST',
        url: '//formspree.io/oneill.linda21@gmail.com',
        data: $('#mbr-form').serialize(),
        datatype: 'json'
      });
      e.preventDefault();
      $(this).get(0).reset();
      alertify.success("Message sent!");
    }
  });
});
