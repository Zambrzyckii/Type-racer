import { Fragment, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";

// A long token may wrap after one of these, once it is past its 14th character.
const BREAK_AFTER = ".(,=>/";
const NOTE_TTL = 2800;
const NOTE_LEAVE = 400;
const MAX_NOTES = 3;

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export const useGameLogic = () => {
  const [connection, setConnection] = useState(null);
  const inputRef = useRef(null);
  const [session, setSession] = useState(() => {
    const t = localStorage.getItem("token"), u = localStorage.getItem("username");
    const isAuth = !!t && t !== "undefined" && !!u && u !== "undefined";
    return { isAuth, username: isAuth ? u : "" };
  });
  const [room, setRoom] = useState({ code: "", isJoined: false, players: [], chat: [], opponents: {}, host: "", joinError: "", settings: { powerUpsEnabled: false, hardMode: false, secondsToEnd: 0 } });
  const [game, setGame] = useState({ status: "lobby", text: "Loading...", countdown: 0, winner: "", leaderboard: [], timeRemaining: null });
  const [player, setPlayer] = useState({ input: "", progress: 0, wpm: 0, hasError: false, totalKeys: 0, wrongKeys: 0, powerUp: null, swaps: 0, blocked: 0, debuff: null, buff: null });

  const [notes, setNotes] = useState([]);
  const noteId = useRef(0);
  const latest = useRef(null);
  latest.current = { room, player };

  const addNote = useCallback((note) => {
    const id = ++noteId.current;
    setNotes(list => [...list.slice(1 - MAX_NOTES), { ...note, id }]);
    setTimeout(() => setNotes(list => list.map(n => (n.id === id ? { ...n, leaving: true } : n))), NOTE_TTL);
    setTimeout(() => setNotes(list => list.filter(n => n.id !== id)), NOTE_TTL + NOTE_LEAVE);
  }, []);

  const powerUpProgress = useMemo(() => {
    if (player.powerUp) return 100;
    let correct = 0;
    while (correct < player.input.length && player.input[correct] === game.text[correct]) correct++;
    return correct > 0 && correct % 5 === 0 ? 100 : ((correct % 5) / 5) * 100;
  }, [player.input, game.text, player.powerUp]);

  const accuracy = player.totalKeys > 0 ? Math.round(((player.totalKeys - player.wrongKeys) / player.totalKeys) * 100) : 100;

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
      UpdatePlayersList: (d) => {
        const players = d.players || d.Players || [], known = latest.current.room.players;
        if (known.length) players.filter(p => !known.includes(p)).forEach(p => addNote({ kind: "info", label: p, value: "joined the room" }));
        setRoom(r => ({ ...r, players, host: d.host || d.Host || "" }));
      },
      BackToLobby: () => {
        setGame(g => ({ ...g, status: "lobby", countdown: 0, winner: "", text: "Loading...", timeRemaining: null }));
        setPlayer({ input: "", progress: 0, wpm: 0, hasError: false, totalKeys: 0, wrongKeys: 0, powerUp: null, swaps: 0, blocked: 0, debuff: null, buff: null });
        setRoom(r => ({ ...r, opponents: {} }));
      },
      GameOver: (w) => setGame(g => ({ ...g, winner: w, status: "finished" })),
      PowerUpGranted: (p) => setPlayer(pl => ({ ...pl, powerUp: p, swaps: pl.powerUp ? pl.swaps + 1 : 0 })),
      SetUpLobby: (s) => setRoom(r => ({ ...r, settings: { powerUpsEnabled: s.powerUpsEnabled ?? s.PowerUpsEnabled, hardMode: s.hardMode ?? s.HardMode, secondsToEnd: s.secondsToEnd ?? s.SecondsToEnd } })),
      SettingsUpdate: (s) => setRoom(r => ({ ...r, settings: { powerUpsEnabled: s.powerUpsEnabled ?? s.PowerUpsEnabled, hardMode: s.hardMode ?? s.HardMode, secondsToEnd: s.secondsToEnd ?? s.SecondsToEnd } })),
      ReceiveAttack: (t, pwr) => {
        addNote(latest.current.player.buff === "shield"
          ? { kind: "blocked", power: pwr, label: "Shield blocked", value: capitalize(pwr) }
          : { kind: "hit", power: pwr, label: "You were hit", value: capitalize(pwr) });
        setPlayer(pl => {
        	if (pl.buff === "shield") return { ...pl, buff:null, blocked: pl.blocked + 1 };
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
        setPlayer({ input: "", progress: 0, wpm: 0, hasError: false, totalKeys: 0, wrongKeys: 0, powerUp: null, swaps: 0, blocked: 0, debuff: null, buff: null });
        setRoom(r => ({ ...r, opponents: {} }));
      }
    };
    connection.start().then(() => Object.entries(handlers).forEach(([k, v]) => connection.on(k, v))).catch(console.error);
    return () => Object.keys(handlers).forEach(k => connection.off(k));
  }, [connection, addNote]);

  const invoke = (m, ...a) => connection?.state === "Connected" && connection.invoke(m, ...a);

  const actions = {
    setIsAuthenticated: v => setSession(s => ({ ...s, isAuth: v })),
    setCurrentPlayer: v => setSession(s => ({ ...s, username: v })),
    setRoomCode: v => setRoom(r => ({ ...r, code: v, joinError: "" })),
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
    handleUsePowerUp: (t) => {
      const power = player.powerUp;
      invoke("UsePowerUp", room.code, session.username, t, power);
      setPlayer(p => ({ ...p, powerUp: null }));
      addNote({ kind: "sent", power, label: `Sent to ${t}`, value: capitalize(power) });
    },
    handleRestart: () => invoke("RestartGame"),
    sendChatMessage: m => invoke("SendChatMessage", room.code, session.username, m),
    handleJoinRooms: async () => {
      const joined = room.code.trim() && (await invoke("JoinRoom", room.code));
      setRoom(r => ({ ...r, isJoined: !!joined, joinError: joined ? "" : "Game already started" }));
    },
    handleStart: () => invoke("StartRoomGame", room.code),
    handleChangeSettings: (p, h, s) => session.username === room.host && invoke("ChangeRoomSettings", room.code, p, h, s),
    renderHighlightedText: () => {
      let errIdx = player.input.length;
      for (let i = 0; i < player.input.length; i++) if (player.input[i] !== game.text[i]) { errIdx = i; break; }
      const stateAt = (i) => i >= player.input.length ? "todo" : i < errIdx ? "ok" : "bad";
      let at = 0;
      return game.text.split(/( )/).map((part) => {
        const from = at;
        at += part.length;
        if (part === " ") return <span key={from} className="tr-c" data-s={stateAt(from)}> </span>;
        return (
          <span key={from} className="tr-w">
            {part.split("").map((char, k) => (
              <Fragment key={k}>
                <span className="tr-c" data-s={stateAt(from + k)}>{char}</span>
                {k >= 14 && k < part.length - 1 && BREAK_AFTER.includes(char) && <wbr />}
              </Fragment>
            ))}
          </span>
        );
      });
    }
  };

  return { session, room, game, player, notes, computed: { accuracy, powerUpProgress }, actions, inputRef };
};
