// File that checks matches.json for consistency
// `node check.js`

const matches = require("./matches.json")
let fail = false

// Check for duplicate match IDs
const ids = matches.map(match => match.id)
const uniqueIds = ids.reduce((prev, cur) => {
  if (!prev.includes(cur)) {
    prev.push(cur)
  }
  return prev
}, [])
if (ids.length != uniqueIds.length) {
  console.warn("Warning: There are duplicate match IDs.")
}

for (const match of matches) {

  // 1. Check if player IDs are different
  const player1 = match.player1.id
  const player2 = match.player2.id
  if (player1 === player2) {
    console.warn(`Error: Same player ID in match ${match.id}.`)
    fail = true
  }

  // 2. Check if fromMatch for both players is either both null or both not null
  if ((match.player1.fromMatch === null && match.player2.fromMatch !== null) || (match.player1.fromMatch !== null && match.player2.fromMatch === null)) {
    console.warn(`Error: Mismatch in fromMatch in match ${match.id}.`)
    fail = true
  }

  // 3. Check if games are consistent
  for (const game of match.games) {
    if (!game.scores[player1] || !game.scores[player2]) {
      console.warn(`Error: Missing score in game in match ${match.id}.`)
      fail = true
    }
    if (game.scores[player1] > game.scores[player2] && game.winner != player1) {
      console.warn(`Error: Mistake in game in match ${match.id}.`)
      fail = true
    }
    if (game.scores[player2] > game.scores[player1] && game.winner != player2) {
      console.warn(`Error: Mistake in game in match ${match.id}.`)
      fail = true
    }
  }

  // 4. Check if correct player won and gamesToWin is fulfilled
  const winnerWins = match.games.filter(game => game.winner === match.winner).length
  const loserWins = match.games.filter(game => game.winner === match.loser).length
  if (winnerWins <= loserWins) {
    console.warn(`Error: Loser won too many games in match ${match.id}.`)
    fail = true
  }
  if (match.gamesToWin !== winnerWins) {
    console.warn(`Error: gamesToWin is not fulfilled in match ${match.id}.`)
    fail = true
  }

  // 5. Find root matches
  const findRoot = (match, player) => {
    if (match[player].fromMatch === null) {
      return true
    }
    const previousMatch = matches.find(m => m.id === match[player].fromMatch)
    if (!previousMatch) {
      return false
    }
    return findRoot(previousMatch, player)
  }
  if (!findRoot(match, "player1")) {
    console.warn(`Error: Could not find root match for player 1 in match ${match.id}.`)
    fail = true
  }
  if (!findRoot(match, "player2")) {
    console.warn(`Error: Could not find root match for player 2 in match ${match.id}.`)
    fail = true
  }

}

if (!fail) {
  console.log("Everything's looking good!")
}
