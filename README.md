const socket = io();

const state = {
  user: null,
  rooms: [],
  room: null,
  currentTurnId: null
};

const els = {
  walletDisplay: document.getElementById("walletDisplay"),
  usernameInput: document.getElementById("usernameInput"),
  registerBtn: document.getElementById("registerBtn"),
  loginBtn: document.getElementById("loginBtn"),
  claimCoinsBtn: document.getElementById("claimCoinsBtn"),
  userStatus: document.getElementById("userStatus"),
  roomNameInput: document.getElementById("roomNameInput"),
  entryFeeInput: document.getElementById("entryFeeInput"),
  createRoomBtn: document.getElementById("createRoomBtn"),
  refreshRoomsBtn: document.getElementById("refreshRoomsBtn"),
  roomsList: document.getElementById("roomsList"),
  roomMeta: document.getElementById("roomMeta"),
  gameMessage: document.getElementById("gameMessage"),
  playersBoard: document.getElementById("playersBoard"),
  startGameBtn: document.getElementById("startGameBtn"),
  rollDiceBtn: document.getElementById("rollDiceBtn"),
  diceFace: document.getElementById("diceFace")
};

function renderWallet() {
  els.walletDisplay.textContent = `${state.user ? state.user.coins : 0} coins`;
}

function renderUserStatus() {
  if (!state.user) {
    els.userStatus.textContent = "Not logged in";
    return;
  }
  els.userStatus.textContent = `Logged in as ${state.user.username} (ID: ${state.user.id})`;
}

function renderRoomMeta() {
  if (!state.room) {
    els.roomMeta.textContent = "Select a room";
    return;
  }

  const players = state.room.players.length;
  els.roomMeta.textContent = `${state.room.name} • ${state.room.status} • ${players}/${state.room.maxPlayers} players • Entry ${state.room.entryFee} coins`;
}

function renderPlayers() {
  if (!state.room) {
    els.playersBoard.innerHTML = "";
    return;
  }

  els.playersBoard.innerHTML = state.room.players
    .map((player) => {
      const active = state.currentTurnId === player.id ? "active" : "";
      return `
        <div class="player-card ${active}">
          <span class="label">${player.username}</span>
          <div class="score">${player.score}</div>
        </div>
      `;
    })
    .join("");
}

function renderRooms() {
  if (!state.rooms.length) {
    els.roomsList.innerHTML = "<div class='room-card'><div class='meta'>No rooms yet. Create one to start.</div></div>";
    return;
  }

  els.roomsList.innerHTML = state.rooms
    .map((room) => {
      const joinDisabled = !state.user || room.status !== "waiting" || room.players.length >= room.maxPlayers;
      return `
        <div class="room-card">
          <strong>${room.name}</strong>
          <div class="meta">${room.players.length}/${room.maxPlayers} players • ${room.status} • entry ${room.entryFee} coins</div>
          <button data-room-id="${room.id}" ${joinDisabled ? "disabled" : ""}>Join room</button>
        </div>
      `;
    })
    .join("");

  els.roomsList.querySelectorAll("button[data-room-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const roomId = button.getAttribute("data-room-id");
      socket.emit("join-room", { roomId });
    });
  });
}

async function refreshRooms() {
  try {
    const res = await fetch("/api/rooms");
    const data = await res.json();
    state.rooms = data.rooms || [];
    renderRooms();
  } catch (err) {
    console.error(err);
  }
}

function showMessage(text) {
  els.gameMessage.textContent = text;
}

function updateSelectedRoom(room) {
  state.room = room;
  state.currentTurnId = room?.players?.[room.turnIndex]?.id || null;
  renderRoomMeta();
  renderPlayers();

  if (!room) {
    els.gameMessage.textContent = "No match started yet.";
    els.diceFace.textContent = "🎲";
    return;
  }

  if (room.status === "finished" && room.winnerId) {
    const winner = room.players.find((player) => player.id === room.winnerId);
    els.gameMessage.textContent = `${winner ? winner.username : "Winner"} wins the match and earns ${room.payout || 0} virtual coins.`;
    els.diceFace.textContent = "🏆";
  }
}

els.registerBtn.addEventListener("click", () => {
  const username = els.usernameInput.value.trim();
  if (!username) return showMessage("Please enter a username.");
  socket.emit("register", { username });
});

els.loginBtn.addEventListener("click", () => {
  const username = els.usernameInput.value.trim();
  if (!username) return showMessage("Please enter a username.");
  socket.emit("login", { username });
});

els.claimCoinsBtn.addEventListener("click", async () => {
  if (!state.user) return showMessage("Please login first.");
  try {
    const res = await fetch("/api/wallet/claim-demo-coins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: state.user.id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unable to claim coins");
    state.user = data.user;
    renderWallet();
    renderUserStatus();
    showMessage("Added 500 demo coins to your wallet.");
  } catch (err) {
    showMessage(err.message);
  }
});

els.createRoomBtn.addEventListener("click", () => {
  if (!state.user) return showMessage("Please login first.");
  const name = document.getElementById("roomNameInput").value.trim() || "Dice Arena";
  const entryFee = Number(document.getElementById("entryFeeInput").value || 20);
  socket.emit("create-room", { name, entryFee });
});

els.refreshRoomsBtn.addEventListener("click", () => refreshRooms());

els.startGameBtn.addEventListener("click", () => {
  if (!state.room) return showMessage("Create or join a room first.");
  socket.emit("start-game", { roomId: state.room.id });
});

els.rollDiceBtn.addEventListener("click", () => {
  if (!state.room) return showMessage("Create or join a room first.");
  socket.emit("roll-dice", { roomId: state.room.id });
});

socket.on("auth:success", ({ user }) => {
  state.user = user;
  socket.emit("set-user", { userId: user.id });
  renderUserStatus();
  renderWallet();
  showMessage(`Logged in as ${user.username}.`);
});

socket.on("auth:error", ({ message }) => {
  showMessage(message);
});

socket.on("lobby:update", (rooms) => {
  state.rooms = rooms || [];
  renderRooms();
});

socket.on("room:error", ({ message }) => {
  showMessage(message);
});

socket.on("room:update", (room) => {
  if (state.room && state.room.id === room.id) {
    state.room = room;
    updateSelectedRoom(room);
  }
  refreshRooms();
});

socket.on("game:update", ({ room, winner, payout, lastRoll, onTurn, message }) => {
  state.room = room;
  state.currentTurnId = onTurn || room.players[room.turnIndex]?.id || null;

  if (lastRoll) {
    els.diceFace.textContent = String(lastRoll.roll);
  }

  if (winner) {
    showMessage(`${winner} wins the match. Prize: ${payout} virtual coins.`);
  } else if (message) {
    showMessage(message);
  }

  renderRoomMeta();
  renderPlayers();
  refreshRooms();
});

renderWallet();
renderUserStatus();
refreshRooms();
