// widget.js (Dummy Version für Outreach)
(function(){
  const widgetDiv = document.getElementById('botura-chat-widget');

  const messages = document.createElement('div');
  messages.style = "height:300px; overflow-y:auto; border-top:1px solid #ccc; margin-top:10px; padding-top:5px;";
  widgetDiv.appendChild(messages);

  const input = document.createElement('input');
  input.placeholder = "Schreib was...";
  input.style = "width:100%; padding:5px; margin-top:5px;";
  widgetDiv.appendChild(input);

  input.addEventListener('keypress', function(e){
    if(e.key==='Enter' && input.value.trim()!==''){
      const msg = document.createElement('div');
      msg.textContent = 'User: '+input.value;
      messages.appendChild(msg);

      const botMsg = document.createElement('div');
      botMsg.textContent = 'Bot: Prototyp-Antwort 😉';
      botMsg.style.color='blue';
      messages.appendChild(botMsg);

      messages.scrollTop = messages.scrollHeight;
      input.value='';
    }
  });
})();
