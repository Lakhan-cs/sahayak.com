(function () {
    const role = document.body.dataset.chatRole;
    const panel = document.getElementById("chatPanel");
    const launcher = document.getElementById("chatLauncher");
    const messages = document.getElementById("chatMessages");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const typing = document.getElementById("chatTyping");
    const error = document.getElementById("chatError");

    if (!panel || !launcher || typeof io !== "function") return;

    let socket = null;
    let gigId = null;
    let typingTimer;
    let unread = 0;
    const defaultTitle = document.title;

    const badge = document.createElement("span");
    badge.className = "chat-unread";
    badge.hidden = true;
    badge.textContent = "0";
    launcher.appendChild(badge);

    const connection = document.createElement("span");
    connection.className = "chat-connection";
    connection.textContent = "Connecting...";
    panel.querySelector(".chat-head")?.appendChild(connection);

    function activeBookingId() {
        try {
            return JSON.parse(localStorage.getItem("nabhiActiveBooking") || "null")?.id;
        } catch (_) {
            return null;
        }
    }

    function updateUnread() {
        badge.textContent = unread > 9 ? "9+" : String(unread);
        badge.hidden = unread === 0;
        document.title = document.hidden && unread ? `(${unread}) New message | ${defaultTitle}` : defaultTitle;
    }

    function notifyIncoming(message) {
        if (message.senderRole === role) return;
        const chatOpen = !panel.hidden && document.hasFocus();
        if (!chatOpen) {
            unread += 1;
            updateUnread();
            launcher.classList.add("chat-pulse");
            setTimeout(() => launcher.classList.remove("chat-pulse"), 900);
        }
    }

    function connect() {
        if (socket) return true;
        gigId = activeBookingId();
        if (!gigId) {
            error.textContent = "Chat becomes available after the worker is assigned.";
            return false;
        }

        socket = io();
        socket.on("connect", () => {
            connection.textContent = "Live chat";
            connection.classList.add("online");
            socket.emit("joinRoom", { gigId });
        });
        socket.on("disconnect", () => {
            connection.textContent = "Reconnecting...";
            connection.classList.remove("online");
        });
        socket.on("chatHistory", history => {
            messages.innerHTML = "";
            if (!history.length) {
                messages.innerHTML = '<div class="chat-empty">Start the conversation about this service.</div>';
            } else {
                history.forEach(render);
            }
        });
        socket.on("message", message => {
            render(message);
            notifyIncoming(message);
        });
        socket.on("typing", data => {
            typing.textContent = data.role === role ? "" : "The other person is typing...";
        });
        socket.on("stopTyping", data => {
            if (data.role !== role) typing.textContent = "";
        });
        socket.on("chatError", message => {
            error.textContent = message;
            setTimeout(() => { error.textContent = ""; }, 3000);
        });
        return true;
    }

    function openChat() {
        if (!connect()) return;
        unread = 0;
        updateUnread();
        launcher.classList.remove("chat-pulse");
        panel.hidden = false;
        launcher.hidden = true;
        input.focus();
        messages.scrollTop = messages.scrollHeight;
    }

    function closeChat() {
        panel.hidden = true;
        launcher.hidden = false;
    }

    function render(message) {
        messages.querySelector(".chat-empty")?.remove();
        const item = document.createElement("div");
        item.className = "chat-message" + (message.senderRole === role ? " mine" : "");
        item.textContent = message.text;
        const time = document.createElement("small");
        time.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        item.appendChild(time);
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
    }

    launcher.onclick = openChat;
    document.getElementById("chatClose").onclick = closeChat;
    form.onsubmit = event => {
        event.preventDefault();
        if (!socket || !socket.connected) return;
        const text = input.value.trim();
        if (!text) return;
        socket.emit("chatMessage", { gigId, senderRole: role, text });
        input.value = "";
        socket.emit("stopTyping", { gigId, role });
    };
    input.oninput = () => {
        if (!socket?.connected) return;
        socket.emit("typing", { gigId, role });
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => socket.emit("stopTyping", { gigId, role }), 900);
    };

    if (activeBookingId()) connect();
})();
