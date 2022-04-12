//blackjack.js
//the sum of the card values is referenced as "scores" throughout the code.
// var = vb, vb=vanilla blackjack

var vb = {
  
//HTML references. hd = dealer, hp = player
  
  hdstand : null, 
  hdscores : null, 
  hdhand : null,  
  hpstand : null, 
  hpscores : null, 
  hphand : null, 
  hpcon : null,
  deck : [],      // current deck of cards
  dealer : [],    // dealer's hand
  player : [],    // player's hand
  dscores : 0,    // dealer's scores
  pscores : 0,    // player's scores
  safety : 17,    // dealer will stand at 17 or above
  dstand : false, // dealer stands
  pstand : false, // player stands
  turn : 0,       // 0 = player's turn, 1 = dealer's turn
  
//Starting the game.
  
  init : () => {
    
 // Elements from the html 
    
    vb.hdstand = $("#deal-stand")[0];
    vb.hdscores = $("#deal-scores")[0];
    vb.hdhand = $("deal-cards")[0];
    vb.hpstand = $("play-stand")[0];
    vb.hpscores = $("play-scores")[0];
    vb.hphand = $("play-cards")[0];
    vb.hpcon = $("play-control")[0];
    
  //what happens when buttons are clicked?
    
    $("playc-start").onclick = vb.start;
    $("playc-hit").onclick = vb.hit;
    $("playc-stand").onclick = vb.stand;
  },
  
  // restarting
  
  start : () => {
    vb.deck = [];  vb.dealer = [];  vb.player = [];
    vb.dscores = 0;  vb.pscores = 0;
    vb.dstand = false;  vb.pstand = false;
    vb.hdscores.innerHTML = "?"; vb.hpscores.innerHTML = 0;
    vb.hdhand.innerHTML = ""; vb.hphand.innerHTML = "";
    vb.hdstand.classList.remove("stood");
    vb.hpstand.classList.remove("stood");
    vb.hpcon.classList.add("started");
    
    // Shuffle deck
    
    for (let i=0; i<4; i++) { for (let j=1; j<14; j++) {
      vb.deck.push({s : i, n : j});
    }}
    for (let i=vb.deck.length - 1; i>0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = vb.deck[i];
      vb.deck[i] = vb.deck[j];
      vb.deck[j] = temp;
    }
    
    // draw 2 cards for each player
    
    vb.turn = 0; vb.draw(); vb.turn = 1; vb.draw();
    vb.turn = 0; vb.draw(); vb.turn = 1; vb.draw();
    // if 21 on first draw, game ends
    vb.turn = 0; vb.scores();
    vb.turn = 1; vb.scores();
    var winner = vb.check();
    if (winner==null) { vb.turn = 0; }
  },

  // draw next card if hit
  
  dsymbols : ["&hearts;", "&diams;", "&clubs;", "&spades;"], // HTML symbols for cards
  dnum : { 1 : "A", 11 : "J", 12 : "Q", 13 : "K" }, // Card numbers
  draw : () => {
    
    // depending on who's turn it is, add next card to them provided they hit.
    
    var card = vb.deck.pop(),
        cardh = document.createElement("div"),
        cardv = (vb.dnum[card.n] ? vb.dnum[card.n] : card.n) + vb.dsymbols[card.s];
    cardh.className = "vb-card";
    cardh.innerHTML = cardv ;

    //dealer's first card should be hidden
    
    if (vb.turn) {
      if (vb.dealer.length==0) {
        cardh.id = "deal-first";
        cardh.innerHTML = `<div class="back">?</div>`;
      }
      vb.dealer.push(card);
      vb.hdhand.appendChild(cardh);
    }
    else {
      vb.player.push(card);
      vb.hphand.appendChild(cardh);
    }
  },
  
  // calculating scores
  
  scores : () => {
    // Number cards take numerical value, royals are 10 and ace is calculated later as 1 or 11.
    var aces = 0, scores = 0;
    for (let i of (vb.turn ? vb.dealer : vb.player)) {
      if (i.n == 1) { aces++; }
      else if (i.n>=11 && i.n<=13) { scores += 10; }
      else { scores += i.n; }
    }
    
    // Ace logic
    
    if (aces!=0) {
      var minmax = [];
      for (let elevens=0; elevens<=aces; elevens++) {
        let calc = scores + (elevens * 11) + (aces-elevens * 1);
        minmax.push(calc);
      }
      scores = minmax[0];
      for (let i of minmax) {
        if (i > scores && i <= 21) { scores = i; }
      }
    }
    
    // new scores
    
    if (vb.turn) { vb.dscores = scores; }
    else {
      vb.pscores = scores;
      vb.hpscores.innerHTML = scores;
    }
  },
  
  // Checking for winners
  
  check : () => {
    var winner = null, message = "";
   // when 21 upon intial card deal
    if (vb.player.length==2 && vb.dealer.length==2) {
      // both players have 21
      if (vb.pscores==21 && vb.dscores==21) {
        winner = 2; message = "It's a tie with Blackjacks";
      }
      
   // player has 21
      
      if (winner==null && vb.pscores==21) {
        winner = 0; message = "Player wins with a Blackjack!";
      }
      
      // dealer has 21
      
      if (winner==null && vb.dscores==21) {
        winner = 1; message = "Dealer wins with a Blackjack!";
      }
    }
    
    // Going bust
    
    if (winner == null) {
      if (vb.pscores>21) {
        winner = 1; message = "Player has gone bust - Dealer wins!";
      }
      if (vb.dscores>21) {
        winner = 0; message = "Dealer has gone bust - Player wins!";
      }
    }
    
    // case when both players stand
    
    if (winner == null && vb.dstand && vb.pstand) {
      
      // dealer has higher score below 21
      
      if (vb.dscores > vb.pscores) {
        winner = 1; message = "Dealer wins with " + vb.dscores + "!";
      }
      
      //player has the better score
      
      else if (vb.dscores < vb.pscores) {
        winner = 0; message = "Player wins with " + vb.pscores + "!";
      }
      
      // same score
      
      else {
        winner = 2; message = "It's a tie.";
      }
    }
    if (winner != null) {
      // show all cards
      
      vb.hdscores.innerHTML = vb.dscores;
      document.getElementById("deal-first").classList.add("show");
      
      // resetting
      
      vb.hpcon.classList.remove("started");
      alert(message);
    }
    return winner;
  },
  
  // when hitting
  
  hit : () => {
    vb.draw(); vb.scores();
     // if 21 is reached the player or dealer stand
    if (vb.turn==0 && vb.pscores==21 && !vb.pstand) {
      vb.pstand = true; vb.hpstand.classList.add("stood");
    }
    if (vb.turn==1 && vb.dscores==21 && !vb.dstand) {
      vb.dstand = true; vb.hdstand.classList.add("stood");
    }
    
    // no winner at the end of the round
    
    var winner = vb.check();
    if (winner==null) { vb.next(); }
  },
  
  // Standing
  
  stand : () => {
    if (vb.turn) {
      vb.dstand = true; vb.hdstand.classList.add("stood");
    } else {
      vb.pstand = true; vb.hpstand.classList.add("stood");
    }
    
    // when to end game
    
    var winner = (vb.pstand && vb.dstand) ? vb.check() : null ;
    if (winner==null) { vb.next(); }
  },

  next : () => {
    vb.turn = vb.turn==0 ? 1 : 0 ;
    // dealer's turn
    if (vb.turn==1) {
      if (vb.dstand) { vb.turn = 0; } 
      else { vb.ai(); }
    }
    
    // player's turn
    
    else {
      if (vb.pstand) { vb.turn = 1; vb.ai(); } 
    }
  },
  
  // computer stands on 17+
  
  ai : () => { if (vb.turn) {
    if (vb.dscores >= vb.safety) { vb.stand(); }
    else { vb.hit(); }
  }}
};
window.addEventListener("DOMContentLoaded", vb.init);
