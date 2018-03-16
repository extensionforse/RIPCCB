let search = $('#lst-ib');

if (search) {
  checkSearch(search);
}

function checkSearch(search) {
  let searchItem = search.val();
  //send search item in background script
  chrome.extension.sendMessage(searchItem, function (response) {
    //when search item are detected start function for highlight text
    function replaceText(selector, text, newText, flags) {
      var matcher = new RegExp(text, flags);
      $(selector).each(function () {
        var $this = $(this);
        if (!$this.children().length)
          $this.html($this.html().replace(matcher, newText));
      });
    }

    function replaceAllText() {
      replaceText('*', response, '<span class="yellow">' + response + '</span>', 'g');
      document.title = "Google";
    }

    //when document ready highlight text
    $(document).ready(replaceAllText);
    $('html').ajaxStop(replaceAllText);
  });
}

//add checkboxes
function addCheckBoxes() {
  $('.sh-dgr__content').append('<div class="ch-box"><input type="checkbox"></div>');
}

$(document).ready(function () {
  addCheckBoxes();
  addHandlerButton();
});


//add submit button
function addHandlerButton() {
  $('.sh-dgr__grid-result:last').append('<div class="submit"><input type="submit"></div>')
}
