import { useState, useEffect, useRef, useMemo } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

export const useGameLogic = () => {
  const [connection, setConnection] = useState(null);
  const inputRef = useRef(null);
  const [session, setSession] = useState({ isAuth: false, username: "" });
  const [room, setRoom] = useState({ code: "", isJoined: false, players: [], chat: [], opponents: {}, host: "", settings: { powerUpsEnabled: false, hardMode: false, secondsToEnd: 0 } });
  const [game, setGame] = useState({ status: "lobby", text: "Loading...", countdown: 0, winner: "", leaderboard: [], timeRemaining: null });
  const [player, setPlayer] = useState({ input: "", progress: 0, wpm: 0, hasError: false, totalKeys: 0, wrongKeys: 0, powerUp: null, debuff: null, buff: null });

  const powerUpProgress = useMemo(() => {
    if (player.powerUp) return 100;
    let correct = 0;
    while (correct < player.input.length && player.input[correct] === game.text[correct]) correct++;
    return correct > 0 && correct % 5 === 0 ? 100 : ((correct % 5) / 5) * 100;
  }, [player.input, game.text, player.powerUp]);

  const accuracy = player.totalKeys > 0 ? Math.round(((player.totalKeys - player.wrongKeys) / player.totalKeys) * 100) : 67;

  useEffect(() => {
    const t = localStorage.getItem("token"), u = localStorage.getItem("username");
    if (!t || t === "undefined" || !u || u === "undefined") {
      localStorage.removeItem("token"); localStorage.removeItem("username");
      setSession({ isAuth: false, username: "" });
    } else setSession({ isAuth: true, username: u });
  }, []);

  useEffect(() => {
    if (!session.isAuth) return;
    const conn = new HubConnectionBuilder()
      .withUrl("/gamehub", { accessTokenFactory: () => (localStorage.getItem("token") || "").replace(/[^a-zA-Z0-9_.-]/g, "") })
      .withAutomaticReconnect().build();
    setConnection(conn);
    return () => conn.stop();
  }, [session.isAuth]);

  useEffect(() => {
    if (!session.isAuth) return;
    if (game.status === "finished" && session.username) {
      fetch("/api/savescore", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify({ Username: session.username, Wpm: player.wpm, IsWinner: game.winner === session.username }) }).catch(console.error);
    }
    if (game.status === "lobby" || game.status === "finished") {
      fetch("/api/leaderboard").then(r => r.ok && r.json().then(d => setGame(g => ({ ...g, leaderboard: d })))).catch(console.error);
    }
  }, [game.status, session.isAuth, session.username, game.winner, player.wpm]);

  useEffect(() => {
    if (game.countdown > 0) {
      const t = setTimeout(() => setGame(g => ({ ...g, countdown: g.countdown - 1 })), 1000);
      return () => clearTimeout(t);
    }
    if (game.countdown === 0 && game.status === "countdown") {
      setGame(g => ({ ...g, status: "racing" }));
      inputRef.current?.focus();
    }
  }, [game.countdown, game.status]);

  useEffect(() => {
    if (player.debuff && player.debuff !== "freeze") inputRef.current?.focus();
  }, [player.debuff]);

  useEffect(() => {
    const isDone = player.progress === 100 || Object.values(room.opponents).some(o => o.progress === 100);
    if (isDone && game.status === "racing" && game.timeRemaining === null && room.settings.secondsToEnd > 0)
      setGame(g => ({ ...g, timeRemaining: room.settings.secondsToEnd }));
  }, [player.progress, room.opponents, game.status, game.timeRemaining, room.settings.secondsToEnd]);

  useEffect(() => {
    if (game.status === "racing" && game.timeRemaining > 0) {
      const t = setTimeout(() => setGame(g => ({ ...g, timeRemaining: g.timeRemaining - 1 })), 1000);
      return () => clearTimeout(t);
    }
  }, [game.timeRemaining, game.status]);

  useEffect(() => {
    if (!connection) return;
    const handlers = {
      UpdateState: (st) => {
        const n = st.playerNick || st.PlayerNick, p = st.progress ?? st.Progress, e = st.hasError ?? st.HasError, w = st.wpm ?? st.Wpm;
        if (n === localStorage.getItem("username")) setPlayer(pl => ({ ...pl, progress: p, hasError: e, wpm: w }));
        else setRoom(r => ({ ...r, opponents: { ...r.opponents, [n]: { progress: p, wpm: w } } }));
      },
      UpdatePlayersList: (d) => setRoom(r => ({ ...r, players: d.players || d.Players || [], host: d.host || d.Host || "" })),
      BackToLobby: () => {
        setGame(g => ({ ...g, status: "lobby", countdown: 0, winner: "", text: "Loading...", timeRemaining: null }));
        setPlayer({ input: "", progress: 0, wpm: 0, hasError: false, totalKeys: 0, wrongKeys: 0, powerUp: null, debuff: null, buff: null });
        setRoom(r => ({ ...r, opponents: {} }));
      },
      GameOver: (w) => setGame(g => ({ ...g, winner: w, status: "finished" })),
      PowerUpGranted: (p) => setPlayer(pl => ({ ...pl, powerUp: p })),
      SetUpLobby: (s) => setRoom(r => ({ ...r, settings: { powerUpsEnabled: s.powerUpsEnabled ?? s.PowerUpsEnabled, hardMode: s.hardMode ?? s.HardMode, secondsToEnd: s.secondsToEnd ?? s.SecondsToEnd } })),
      SettingsUpdate: (s) => setRoom(r => ({ ...r, settings: { powerUpsEnabled: s.powerUpsEnabled ?? s.PowerUpsEnabled, hardMode: s.hardMode ?? s.HardMode, secondsToEnd: s.secondsToEnd ?? s.SecondsToEnd } })),
      ReceiveAttack: (t, pwr) => {
        setPlayer(pl => {
        	if (pl.buff === "shield") return { ...pl, buff:null };
        	return pwr === "bomb" 
        	? { ...pl, input: pl.input.substring(0, Math.max(0,pl.input.length - 10)), debuff: "bomb"} : 
        	{ ...pl, debuff: pwr}; });
  			setTimeout(() => setPlayer(pl => pl.debuff === pwr ? { ...pl, debuff:null} : pl), 
  			pwr ===  "bomb" ? 1000 : 3000);      	
      },
      ReceiveDefense: (_, pwr) => { setPlayer(p => ({ ...p, buff: pwr })); setTimeout(() => setPlayer(p => ({ ...p, buff: null })), 1500); },
      ReceiveChatMessage: (s, txt) => setRoom(r => ({ ...r, chat: [...r.chat, { text: txt, sender: s, type: s === localStorage.getItem("username") ? "sent" : "received" }] })),
      LoadText: (txt) => {
        setGame(g => ({ ...g, text: txt, countdown: 3, status: "countdown", winner: "" }));
        setPlayer({ input: "", progress: 0, wpm: 0, hasError: false, totalKeys: 0, wrongKeys: 0, powerUp: null, debuff: null, buff: null });
        setRoom(r => ({ ...r, opponents: {} }));
      }
    };
    connection.start().then(() => Object.entries(handlers).forEach(([k, v]) => connection.on(k, v))).catch(console.error);
    return () => Object.keys(handlers).forEach(k => connection.off(k));
  }, [connection]);

  const invoke = (m, ...a) => connection?.state === "Connected" && connection.invoke(m, ...a);

  const actions = {
    setIsAuthenticated: v => setSession(s => ({ ...s, isAuth: v })),
    setCurrentPlayer: v => setSession(s => ({ ...s, username: v })),
    setRoomCode: v => setRoom(r => ({ ...r, code: v })),
    handleInputChange: (e) => {
      if (game.status !== "racing" || player.debuff === "freeze") return;
      const t = e.target.value;
      setPlayer(p => ({ ...p, input: t, totalKeys: p.totalKeys + (t.length > p.input.length ? 1 : 0), wrongKeys: p.wrongKeys + (t.length > p.input.length && t !== game.text.substring(0, t.length) ? 1 : 0) }));
      invoke("SendProgress", t)?.catch(console.error);
    },
    handleSpecialKeys: (e) => {
      if (e.key === "Control" && player.powerUp) {
        e.preventDefault();
        const enemies = room.players.filter(p => p !== session.username);
        if (enemies.length) actions.handleUsePowerUp(enemies[Math.floor(Math.random() * enemies.length)]);
      }
    },
    handleUsePowerUp: (t) => { invoke("UsePowerUp", room.code, session.username, t, player.powerUp); setPlayer(p => ({ ...p, powerUp: null })); },
    handleRestart: () => invoke("RestartGame"),
    sendChatMessage: m => invoke("SendChatMessage", room.code, session.username, m),
    handleJoinRooms: async () => room.code.trim() && (await invoke("JoinRoom", room.code)) ? setRoom(r => ({ ...r, isJoined: true })) : alert("Game already started"),
    handleStart: () => invoke("StartRoomGame", room.code),
    handleChangeSettings: (p, h, s) => session.username === room.host && invoke("ChangeRoomSettings", room.code, p, h, s),
    renderHighlightedText: () => {
      let errIdx = player.input.length;
      for (let i = 0; i < player.input.length; i++) if (player.input[i] !== game.text[i]) { errIdx = i; break; }
      return game.text.split("").map((char, i) => (
        <span key={i} style={{
          color: i < player.input.length ? (i < errIdx ? "#4caf50" : "#ffffff") : (i === player.input.length && game.status === "racing" ? "#ffffff" : "#777"),
          backgroundColor: i < player.input.length && i >= errIdx ? "#f44336" : "transparent",
          borderBottom: i === player.input.length && game.status === "racing" ? "3px solid #2196f3" : "none",
          opacity: i > player.input.length ? "0.6" : "1",
          paddingBottom: "2px", borderRadius: "2px"
        }}>{char}</span>
      ));
    }
  };

  return { session, room, game, player, computed: { accuracy, powerUpProgress }, actions, inputRef };
};
