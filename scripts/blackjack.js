//blackjack.js
//the sum of the card values is referenced as "scores" throughout the code.
// var = bj, bj=blackjack
var bj = {
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
    bj.hdstand = document.getElementById("deal-stand");
    bj.hdscores = document.getElementById("deal-scores");
    bj.hdhand = document.getElementById("deal-cards");
    bj.hpstand = document.getElementById("play-stand");
    bj.hpscores = document.getElementById("play-scores");
    bj.hphand = document.getElementById("play-cards");
    bj.hpcon = document.getElementById("play-control");
  //what happens when buttons are clicked?
    document.getElementById("playc-start").onclick = bj.start;
    document.getElementById("playc-hit").onclick = bj.hit;
    document.getElementById("playc-stand").onclick = bj.stand;
  },

  // restarting
  start : () => {
    bj.deck = [];  bj.dealer = [];  bj.player = [];
    bj.dscores = 0;  bj.pscores = 0;
    bj.dstand = false;  bj.pstand = false;
    bj.hdscores.innerHTML = "?"; bj.hpscores.innerHTML = 0;
    bj.hdhand.innerHTML = ""; bj.hphand.innerHTML = "";
    bj.hdstand.classList.remove("stood");
    bj.hpstand.classList.remove("stood");
    bj.hpcon.classList.add("started");

    // Shuffle deck
    for (let i=0; i<4; i++) { for (let j=1; j<14; j++) {
      bj.deck.push({s : i, n : j});
    }}
    for (let i=bj.deck.length - 1; i>0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = bj.deck[i];
      bj.deck[i] = bj.deck[j];
      bj.deck[j] = temp;
    }

    // draw 2 cards for each player
    bj.turn = 0; bj.draw(); bj.turn = 1; bj.draw();
    bj.turn = 0; bj.draw(); bj.turn = 1; bj.draw();
    // if 21 on first draw, game ends
    bj.turn = 0; bj.scores();
    bj.turn = 1; bj.scores();
    var winner = bj.check();
    if (winner==null) { bj.turn = 0; }
  },
  // draw next card if hit
  dsymbols : ["&hearts;", "&diams;", "&clubs;", "&spades;"], // HTML symbols for cards
  dnum : { 1 : "A", 11 : "J", 12 : "Q", 13 : "K" }, // Card numbers
  draw : () => {
    // depending on who's turn it is, add next card to them provided they hit.
    var card = bj.deck.pop(),
        cardh = document.createElement("div"),
        cardv = (bj.dnum[card.n] ? bj.dnum[card.n] : card.n) + bj.dsymbols[card.s];
    cardh.className = "bj-card";
    cardh.innerHTML = cardv ;

    //dealer's first card is hidden
    if (bj.turn) {
      if (bj.dealer.length==0) {
        cardh.id = "deal-first";
        cardh.innerHTML = `<div class="back">?</div><div class="front">${cardv}</div>`;
      }
      bj.dealer.push(card);
      bj.hdhand.appendChild(cardh);
    }

    else {
      bj.player.push(card);
      bj.hphand.appendChild(cardh);
    }
  },

  // calculating scores
  scores : () => {
    // Number cards take numerical value, royals are 10 and ace is calculated later as 1 or 11.
    var aces = 0, scores = 0;
    for (let i of (bj.turn ? bj.dealer : bj.player)) {
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
    if (bj.turn) { bj.dscores = scores; }
    else {
      bj.pscores = scores;
      bj.hpscores.innerHTML = scores;
    }
  },

  // Checking for winners
  check : () => {
    var winner = null, message = "";

   // when 21 upon intial card deal
    if (bj.player.length==2 && bj.dealer.length==2) {
      // both players have 21
      if (bj.pscores==21 && bj.dscores==21) {
        winner = 2; message = "It's a tie with Blackjacks";
      }
      // player has 21
      if (winner==null && bj.pscores==21) {
        winner = 0; message = "Player wins with a Blackjack!";
      }
      // dealer has 21
      if (winner==null && bj.dscores==21) {
        winner = 1; message = "Dealer wins with a Blackjack!";
      }
    }

    // Going bust
    if (winner == null) {
      if (bj.pscores>21) {
        winner = 1; message = "Player has gone bust - Dealer wins!";
      }
      if (bj.dscores>21) {
        winner = 0; message = "Dealer has gone bust - Player wins!";
      }
    }

    // case when both players stand
    if (winner == null && bj.dstand && bj.pstand) {
      // dealer has higher score below 21
      if (bj.dscores > bj.pscores) {
        winner = 1; message = "Dealer wins with " + bj.dscores + "!";
      }
      //player has the better score
      else if (bj.dscores < bj.pscores) {
        winner = 0; message = "Player wins with " + bj.pscores + "!";
      }
      // same score
      else {
        winner = 2; message = "It's a tie.";
      }
    }

    if (winner != null) {
      // show all cards
      bj.hdscores.innerHTML = bj.dscores;
      document.getElementById("deal-first").classList.add("show");

      // resetting
      bj.hpcon.classList.remove("started");
      alert(message);
    }
    return winner;
  },

  // when hitting
  hit : () => {
    bj.draw(); bj.scores();

     // if 21 is reached the player or dealer stand
    if (bj.turn==0 && bj.pscores==21 && !bj.pstand) {
      bj.pstand = true; bj.hpstand.classList.add("stood");
    }
    if (bj.turn==1 && bj.dscores==21 && !bj.dstand) {
      bj.dstand = true; bj.hdstand.classList.add("stood");
    }

    // no winner at the end of the round
    var winner = bj.check();
    if (winner==null) { bj.next(); }
  },

  // Standing
  stand : () => {
    if (bj.turn) {
      bj.dstand = true; bj.hdstand.classList.add("stood");
    } else {
      bj.pstand = true; bj.hpstand.classList.add("stood");
    }

    // when to end game
    var winner = (bj.pstand && bj.dstand) ? bj.check() : null ;
    if (winner==null) { bj.next(); }
  },

  // (I) WHO'S NEXT?
  next : () => {
    bj.turn = bj.turn==0 ? 1 : 0 ;

    // dealer's turn
    if (bj.turn==1) {
      if (bj.dstand) { bj.turn = 0; } 
      else { bj.ai(); }
    }

    // player's turn
    else {
      if (bj.pstand) { bj.turn = 1; bj.ai(); } 
    }
  },
  // computer stands on 17+
  ai : () => { if (bj.turn) {
    if (bj.dscores >= bj.safety) { bj.stand(); }
    else { bj.hit(); }
  }}
};
window.addEventListener("DOMContentLoaded", bj.init);
