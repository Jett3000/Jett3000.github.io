export class Board {
    constructor() {
        // ---------- Create and shuffle deck ----------
        // Card IDs: 0–51 → suit*13 + (rank-1)
        this.deck = [];
        for (let suit = 0; suit < 4; suit++) {
            for (let rank = 1; rank <= 13; rank++) {
                this.deck.push(suit * 13 + (rank - 1));
            }
        }
        this._shuffle(this.deck);

        // ---------- deal tableau ----------
        // columns[i] = array of card IDs, from top of column to bottom
        this.columns = Array.from({ length: 7 }, (_, i) => {
            const cards = [];
            for (let j = 0; j <= i; j++) {
                cards.push(this.deck.pop());
            }
            return cards; // each column starts as array of card IDs
        });

        // ---------- build piles ----------
        // each pile simply stores its high card
        this.buildpiles = [-2, -3, -4, -5] // special flags for each initial buildpile

        // ---------- draw pile ----------
        // Initially empty; we reveal from deck
        this.drawpile = [];

        // ---------- deck slot (bank) ----------
        // -1 = empty
        this.deckslot = -1;

        // ---------- remaining deck (hidden cards) ----------
        // after dealing tableau, remaining cards go into the hidden deck
        this.deck = [...this.deck];
    }
    clone() {
        const b = new Board();

        // overwrite fresh constructor state
        b.columns = this.columns.map(col => [...col]);
        b.buildpiles = [...this.buildpiles];
        b.drawpile = [...this.drawpile];
        b.deck = [...this.deck];
        b.deckslot = this.deckslot;

        return b;
    }
    hashString() {
        // let s = '';
        // for (const m of this.findAllLegalMoves()) {
        //     s += m.toString();
        // }
        // return s + this.deck.length;


        return JSON.stringify({
            columns: this.columns,
            buildpiles: this.buildpiles,
            drawpile: this.drawpile,
            deck: this.deck,
            deckslot: this.deckslot
        });
    }

    gatherSources() {
        const sources = [];

        // === Tableau stacks ===
        for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
            const col = this.columns[colIndex];
            if (col[0] < 0) continue;   // skip freespace entirely

            // Bottom card in column
            sources.push({
                type: "tableau",
                colIndex,
                pos: col.length - 1,
                card: col[col.length - 1],
                col: col,
                toString() { return cardToString(this.card); }
            });

            // Look for deep movable sub-stack
            if (col.length >= 2 && covers(col[col.length - 1], col[col.length - 2])) {
                let i = col.length - 1;
                while (i > 0 && covers(col[i], col[i - 1])) i--;

                sources.push({
                    type: "tableau",
                    colIndex,
                    pos: i,
                    card: col[i],
                    col: col,
                    toString() { return cardToString(this.card); }
                });
            }
        }

        // === Draw pile ===
        if (this.drawpile.length > 0) {
            sources.push({
                type: "drawpile",
                card: this.drawpile[this.drawpile.length - 1],
                toString() { return cardToString(this.card); }
            });
        }

        // === Deckslot ===
        if (this.deckslot > 0) {
            sources.push({
                type: "deckslot",
                card: this.deckslot,
                toString() { return cardToString(this.card); }
            });
        }

        // === Build piles ===
        for (let pileIndex = 0; pileIndex < this.buildpiles.length; pileIndex++) {
            const top = this.buildpiles[pileIndex];
            if (top < 2) continue;
            sources.push({
                type: "buildpile",
                pileIndex,
                card: top,
                toString() { return cardToString(this.card); }
            });
        }

        return sources;
    }

    gatherDestinations() {
        const dests = [];
        let freespaceUsed = false;

        // === Tableau destinations ===
        for (let colIndex = 0; colIndex < this.columns.length; colIndex++) {
            const col = this.columns[colIndex];

            // Only allow one freespace destination per move set
            if (col[0] === -1) {
                if (freespaceUsed) continue;
                freespaceUsed = true;
            }

            dests.push({
                type: "tableau",
                colIndex,
                card: col[col.length - 1]   // may be -1
            });
        }

        // === Build piles ===
        for (let pileIndex = 0; pileIndex < this.buildpiles.length; pileIndex++) {
            dests.push({
                type: "buildpile",
                pileIndex,
                card: this.buildpiles[pileIndex]
            });
        }

        // === Deckslot (only if empty and deck empty) ===
        if (this.deck.length === 0 && this.deckslot === -1) {
            dests.push({
                type: "deckslot",
                card: -1
            });
        }

        return dests;
    }

    findAllLegalMoves() {
        const sources = this.gatherSources()
        const destinations = this.gatherDestinations()

        const moves = [];
        for (const src of sources) {
            for (const rule of RULES) {
                if (!rule.sourceTypes.includes(src.type)) continue;
                for (const dest of destinations) {
                    if (!rule.destTypes.includes(dest.type)) continue;
                    if (!rule.condition(src, dest)) continue;

                    moves.push(rule.create(src, dest));
                }
            }
        }
        if (this.deck.length > 0) moves.push(new Move(
            `reveal cards`, // each move needs a human readable sentence
            (board) => {
                let c = 3;
                while (c--) {
                    board.drawpile.push(board.deck.pop())
                }
            }));

        return moves.sort();
    }

    performMove(move) {
        move.execute(this);
    }

    inWinState() {
        return this.score() == 51;
    }

    score() {
        return this.buildpiles.reduce((sum, curr) => { return sum += cardRank(curr) });
    }

    // ---------------- Shuffle helper ----------------
    _shuffle(array) {
        let m = array.length, i, temp;
        while (m > 0) {
            i = Math.floor(Math.random() * m--);
            temp = array[m];
            array[m] = array[i];
            array[i] = temp;
        }
        return array;
    }


    toString() {
        var string = "";

        // ----- Build Piles -----
        const suits = ["♠", "♦", "♣", "♥"];
        const buildPileStr = this.buildpiles.map((bp, i) => {
            if (bp < 0) return `[${suits[i]}]`; // empty build pile with suit
            return cardToString(bp);          // top card if present
        }).join("\t");
        console.log("\t\t\t" + buildPileStr + "\n");
        string += "\t\t\t" + buildPileStr + "\n";


        // ----- Draw Pile / Deck Slot -----
        let drawSectionString = (this.deck.length > 0 ? `${this.deck.length}` : `${cardToString(this.deckslot)}`) + ' | ';
        this.drawpile.forEach((card, i) => { drawSectionString += cardToString(card) + ', ' });
        console.log(drawSectionString + '\n');
        string += drawSectionString + '\n'


        // ----- Tableau -----
        const maxColHeight = Math.max(...this.columns.map(col => col.length));
        for (let row = 0; row < maxColHeight; row++) {
            let line = "";
            for (let col = 0; col < this.columns.length; col++) {
                const cardID = this.columns[col][row];
                if (cardID !== undefined) {
                    line += cardToString(cardID) + "\t";
                } else {
                    line += " \t";
                }
            }
            console.log(line);
            string += line + '\n'
        }
        console.log();
        string += '\n'
        return string;
    }


    toHTML(element) {
        element.innerHTML = '';
        let span = document.createElement('span');

        // ----- Build Piles -----
        element.innerHTML += '&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp'
        const suits = ["♠", "♦", "♣", "♥"];
        this.buildpiles.forEach((bp, i) => {
            let s = bp < 0 ? `[${suits[i]}]` : cardToString(bp, false);
            span.innerHTML = s + '&nbsp&nbsp';
            if (isRed(bp)) {
                span.style.color = 'red';
            }
            element.appendChild(span);
            span = document.createElement('span')
        });
        element.innerHTML += '<br>-<br>'


        // ----- Draw Pile / Deck Slot -----
        let deckString = (this.deck.length > 0 ? `${this.deck.length}` : `${cardToString(this.deckslot, false)}`) + ' | ';
        span = document.createElement('span')
        span.innerHTML = deckString;
        element.appendChild(span);

        for (const card of this.drawpile) {
            let span = document.createElement('span')
            span.innerHTML = cardToString(card, false) + ', '
            if (isRed(card)) {
                span.style.color = 'red';
            }
            element.appendChild(span);
        }
        element.innerHTML += '<br>-<br>'


        // ----- Tableau -----
        const maxColHeight = Math.max(...this.columns.map(col => col.length));
        for (let row = 0; row < maxColHeight; row++) {
            for (let col = 0; col < this.columns.length; col++) {
                const card = this.columns[col][row];

                let span = document.createElement('span')
                if (card == undefined) {
                    span.innerHTML = '&nbsp&nbsp&nbsp&nbsp&nbsp';
                } else {
                    span.innerHTML = cardToString(card, false) + '&nbsp&nbsp'
                }

                if (isRed(card)) {
                    span.style.color = 'red';
                }
                element.appendChild(span);
            }

            element.innerHTML += '<br>'
        }
        element.innerHTML += '<br>'
    }
}


// card helpers
function cardToString(cardId, addTerminalColor = true) {
    if (cardId < 0) return cardId === -1 ? "F S" : "--"; // empty or invalid
    const suits = ["♠", "♦", "♣", "♥"]
    const rank = cardRank(cardId);
    const suit = suits[cardSuit(cardId)];
    const rankStr = rank === 1 ? "A" :
        rank == 10 ? "T" :
            rank === 11 ? "J" :
                rank === 12 ? "Q" :
                    rank === 13 ? "K" : rank;
    const colString = addTerminalColor && isRed(cardId) ? `\x1b[31m${rankStr} ${suit}\x1b[0m` : `${rankStr} ${suit}`;
    return colString
}

function cardSuit(cardId) {
    return Math.floor(cardId / 13);
}

function isRed(cardId) {
    if (cardId < 0) return false;
    const suit = cardSuit(cardId)
    return suit === 1 || suit === 3; // Diamonds or Hearts
}

function covers(lowCard, highCard) {
    if (highCard == -1) return true // can always cover free spaces
    return isRed(lowCard) != isRed(highCard) && cardRank(highCard) - cardRank(lowCard) == 1;
}

function buildsOn(card, pile) {
    if (pile < 0 && cardRank(card) == 1 && -2 - cardSuit(card) == pile) return true; // empty build pile special cases
    return cardSuit(card) == cardSuit(pile) && cardRank(pile) == cardRank(card) - 1;
}

function cardRank(cardID) {
    if (cardID < 0) return cardID;
    return (cardID % 13) + 1;
}


const RULES = [
    // ===== move cards or stacks of cards within the tableau =====
    {
        sourceTypes: ["tableau"],
        destTypes: ["tableau"],
        condition: (src, dest) =>
            covers(src.card, dest.card) && // solitaire alternating pattern
            cardRank(src.card) !== 1 && // no moving aces
            !(src.pos == 0 && dest.card == -1) && // no bouncing between freespaces
            !(covers(src.card, src.col[src.pos - 1]) && dest.card > 0), // no moving off the stack unless to free space

        create: (src, dest) => new Move(
            `move ${cardToString(src.card)} onto ${cardToString(dest.card)}`,
            (board) => {
                const from = board.columns[src.colIndex];
                const to = board.columns[dest.colIndex];

                if (to[0] === -1) to.pop();                  // freespace consumed
                to.push(...from.splice(src.pos));            // move stack

                if (from.length === 0) from.push(-1);        // src becomes freespace
            }
        )
    },

    // ===== pop a single card from a tableau column =====
    {
        sourceTypes: ["tableau"],
        destTypes: ["buildpile"],
        condition: (src, dest) =>
            buildsOn(src.card, dest.card) &&
            src.pos == src.col.length - 1,
        create: (src, dest) => new Move(
            `deposit ${cardToString(src.card)} to build pile`,
            (board) => {
                const from = board.columns[src.colIndex];
                board.buildpiles[dest.pileIndex] = from.pop();

                if (from.length === 0) from.push(-1);
            }
        )
    },
    {
        sourceTypes: ["tableau"],
        destTypes: ["deckslot"],
        condition: (src, dest) =>
            cardRank(src.card) > 1 &&       // dont bank aces
            src.pos == src.col.length - 1,  // only the last card in each column is valid
        create: (src, dest) => new Move(
            `bank ${cardToString(src.card)} in deckslot`,
            (board) => {
                const from = board.columns[src.colIndex];
                board.deckslot = from.pop();

                if (from.length === 0) from.push(-1);
            }
        )
    },

    // ===== draw from the top of the draw pile =====
    {
        sourceTypes: ["drawpile"],
        destTypes: ["tableau"],
        condition: (src, dest) => covers(src.card, dest.card) && cardRank(src.card) > 1,
        create: (src, dest) => new Move(
            `draw ${cardToString(src.card)} onto ${cardToString(dest.card)}`,
            (board) => {
                const to = board.columns[dest.colIndex];
                if (dest.card === -1) to.pop();             // consuming blank
                to.push(board.drawpile.pop());
            }
        )
    },
    {
        sourceTypes: ["drawpile"],
        destTypes: ["deckslot"],
        condition: () => true,
        create: (src, dest) => new Move(
            `draw ${cardToString(src.card)} to deckslot`,
            (board) => { board.deckslot = board.drawpile.pop(); }
        )
    },
    {
        sourceTypes: ["drawpile"],
        destTypes: ["buildpile"],
        condition: (src, dest) => buildsOn(src.card, dest.card),
        create: (src, dest) => new Move(
            `draw ${cardToString(src.card)} to build pile`,
            (board) => {
                board.buildpiles[dest.pileIndex] = board.drawpile.pop();
            })
    },

    // ===== move cards out of the deck slot =====
    {
        sourceTypes: ["deckslot"],
        destTypes: ["tableau"],
        condition: (src, dest) => covers(src.card, dest.card),
        create: (src, dest) => new Move(
            `free ${cardToString(src.card)} onto ${cardToString(dest.card)}`,
            (board) => {
                const to = board.columns[dest.colIndex];
                if (dest.card == -1) to.pop();
                to.push(board.deckslot);
                board.deckslot = -1;
            })
    },
    {
        sourceTypes: ["deckslot"],
        destTypes: ["buildpile"],
        condition: (src, dest) => buildsOn(src.card, dest.card),
        create: (src, dest) => new Move(
            `free ${cardToString(src.card)} to build pile`,
            (board) => {
                board.buildpiles[dest.pileIndex] = board.deckslot;
                board.deckslot = -1;
            })
    },

];

class Move {
    constructor(string, execute) {
        this.string = string;
        this.execute = execute;
    }

    toString() {
        return this.string;
    }
}