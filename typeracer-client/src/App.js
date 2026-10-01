import React from 'react';
import Auth from './Auth';
import Scene from './Scene';
import Icon from './Icon';
import { useGameLogic } from './GameLogic';
import './App.css';

const laneStatus = ({ progress }, isMoving) => {
    if (progress >= 100) return 'done';
    return isMoving ? 'run' : 'idle';
};

const Bar = ({ block, idx, progress, status }) => (
    <div className="tr-bar" data-block={block} data-idx={idx} data-status={status} style={{ '--p': progress / 100 }}>
        <div className="tr-bar-fill" />
        <div className="tr-runner"><i className="tr-sprite" /></div>
    </div>
);

function App() {
    const {
        session,
        room,
        game,
        player,
        computed,
        actions,
        inputRef
    } = useGameLogic();

    React.useEffect(() => {
        if (game.status === 'racing' && player.debuff !== 'freeze') {
            inputRef.current?.focus();
        }
    }, [player.debuff, game.status, inputRef]);

    const screen = !session.isAuth ? 'auth' : !room.isJoined ? 'join' : game.status === 'lobby' ? 'lobby' : 'race';
    const phase = game.status === 'finished' ? 'finished'
        : game.countdown > 0 ? 'count'
        : game.timeRemaining === 0 ? 'finishing'
        : player.input.length === 0 ? 'go'
        : game.timeRemaining > 0 ? 'overtime'
        : 'typing';
    const isHost = session.username === room.host;
    const isRacing = game.status === 'racing';
    const isFinished = game.status === 'finished';
    const opponents = room.players.filter(p => p !== session.username);

    const body = !session.isAuth ? (
        <Auth onLoginSuccess={(username) => {
            actions.setIsAuthenticated(true);
            actions.setCurrentPlayer(username);
        }} />
    ) : !room.isJoined ? (
        <div className="tr-panel">
            <h2>Join a Room</h2>
            <input
                type="text"
                className="tr-input"
                data-el="code"
                value={room.code}
                onChange={(e) => actions.setRoomCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                aria-label="Room code"
                autoComplete="off"
                spellCheck={false}
            />
            {room.joinError && (
                <p className="tr-msg" data-tone="error" role="alert">{room.joinError}</p>
            )}
            <button className="tr-btn" data-v="primary" data-action="join" onClick={actions.handleJoinRooms}>
                Join game
            </button>
        </div>
    ) : game.status === 'lobby' ? (
        <div className="tr-panel">
            <h2>Room: <span data-el="room">{room.code}</span></h2>
            <p data-el="waiting">Waiting for the race to start...</p>

            <div className="tr-lobby-grid">
                <div className="tr-card">
                    <h3>{`Players (${room.players.length})`}</h3>
                    <ul className="tr-players">
                        {room.players.length > 0 ? (
                            room.players.map((p, index) => (
                                <li
                                    key={index}
                                    className="tr-player"
                                    data-role={p === room.host ? 'host' : 'guest'}
                                    data-self={p === session.username ? '1' : '0'}
                                >
                                    <span className="tr-tag">
                                        <Icon name={p === room.host ? 'host' : 'guest'} />
                                        <span>{p === room.host ? '[HOST]' : '[PILOT]'}</span>
                                    </span>
                                    <span className="tr-name" title={p}>
                                        {p.length > 15 ? p.substring(0,15) + "..." : p}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li data-el="alone">You are alone...</li>
                        )}
                    </ul>
                </div>

                <div className="tr-card">
                    <h3>Room Settings</h3>
                    <div className="tr-rows">
                        <div className="tr-row">
                            <span>Power-Ups:</span>
                            <label className="tr-toggle">
                                <input
                                    type="checkbox"
                                    aria-label="Power-ups"
                                    checked={room.settings?.powerUpsEnabled || false}
                                    disabled={!isHost}
                                    onChange={(e) => actions.handleChangeSettings(e.target.checked, room.settings.hardMode, room.settings.secondsToEnd)}
                                />
                                <span className="tr-toggle-ui"></span>
                            </label>
                        </div>

                        <div className="tr-row">
                            <span>Hard Mode:</span>
                            <label className="tr-toggle">
                                <input
                                    type="checkbox"
                                    aria-label="Hard mode"
                                    checked={room.settings?.hardMode || false}
                                    disabled={!isHost}
                                    onChange={(e) => actions.handleChangeSettings(room.settings.powerUpsEnabled, e.target.checked, room.settings.secondsToEnd)}
                                />
                                <span className="tr-toggle-ui"></span>
                            </label>
                        </div>

                        <div className="tr-row">
                            <span>Time Limit (s):</span>
                            <div className="tr-stepper">
                                <button
                                    aria-label="Decrease time limit"
                                    disabled={!isHost}
                                    onClick={() => actions.handleChangeSettings(room.settings.powerUpsEnabled, room.settings.hardMode, Math.max(0, (room.settings?.secondsToEnd || 0) - 10))}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    className="tr-input"
                                    aria-label="Time limit in seconds"
                                    min="0" max="300"
                                    value={room.settings?.secondsToEnd || 0}
                                    disabled={!isHost}
                                    onChange={(e) => actions.handleChangeSettings(room.settings.powerUpsEnabled, room.settings.hardMode, Number(e.target.value) || 0)}
                                />
                                <button
                                    aria-label="Increase time limit"
                                    disabled={!isHost}
                                    onClick={() => actions.handleChangeSettings(room.settings.powerUpsEnabled, room.settings.hardMode, (room.settings?.secondsToEnd || 0) + 10)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isHost && (
                <button className="tr-btn" data-v="start" onClick={actions.handleStart}>
                    Start race
                </button>
            )}
        </div>
    ) : (
    <>
        <div className="tr-stats">
            <div className="tr-stat" data-stat="wpm"><b>{player.wpm}</b> <span>WPM</span></div>
            <div className="tr-stat"><b>{computed.accuracy}</b><span>%</span></div>
            <div className="tr-stat"><b>{player.progress}</b><span>%</span></div>
        </div>

        <Bar block="progress" idx={0} progress={player.progress} status={laneStatus(player, isRacing && player.input.length > 0)} />

        <div className="tr-card" data-block="opponents">
            <h3>Opponents</h3>
            {opponents.length > 0 ? (
                opponents.map((opponentNick, index) => {
                    const stats = room.opponents?.[opponentNick] || { progress: 0, wpm: 0 };
                    const status = laneStatus(stats, isRacing);
                    return (
                        <div key={index} className="tr-opp" data-status={status}>
                            <div className="tr-opp-head">
                                <span className="tr-name">{opponentNick}</span>
                                <div className="tr-opp-side">
                                    {player.powerUp && !isFinished && (
                                        <button
                                            className="tr-btn"
                                            data-v="use"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => actions.handleUsePowerUp(opponentNick)}
                                        >
                                            <Icon name={player.powerUp} />
                                            {`Use ${player.powerUp}`}
                                        </button>
                                    )}
                                    <span className="tr-opp-wpm"><b>{stats.wpm}</b> WPM</span>
                                </div>
                            </div>
                            <Bar idx={index + 1} progress={stats.progress} status={status} />
                        </div>
                    );
                })
            ) : (
                <div data-el="solo">Solo run — no opponents</div>
            )}
        </div>

        {game.countdown > 0 && (
            <div style={{ textAlign: 'center', fontSize: '64px', color: 'var(--orange)', fontFamily: 'var(--mono)', fontWeight: 'bold', marginBottom: '10px', textShadow: 'var(--orange-glow)' }}>
                {game.countdown}
            </div>
        )}

        {game.countdown === 0 && player.input.length === 0 && game.status !== 'finished' && (
            <div style={{ textAlign: 'center', fontSize: '42px', color: 'var(--green)', fontFamily: 'var(--mono)', fontWeight: 'bold', marginBottom: '10px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: 'var(--green-glow)', animation: 'fadeIn 0.3s ease-out' }}>
                START!
            </div>
        )}

        {game.countdown === 0 && player.input.length > 0 && game.status !== 'finished' && (
            <div style={{ height: '86px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {game.timeRemaining !== null && game.timeRemaining > 0 && (
                    <div style={{
                        textAlign: 'center',
                        fontSize: '36px', 
                        color: 'var(--red)',
                        fontFamily: 'var(--mono)',
                        fontWeight: 'bold',
                        textShadow: 'var(--red-glow)',
                        animation: 'pulse 1s infinite'
                    }}>
                        Time to end: {game.timeRemaining}s
                    </div>
                )}
            </div>
        )}

        {game.timeRemaining === 0 && game.status !== 'finished' && (
            <div style={{ textAlign: 'center', fontSize: '28px', color: 'var(--orange)', fontFamily: 'var(--mono)', fontWeight: 'bold', animation: 'pulse 0.5s infinite' }}>
             FINISHING RACE...
            </div>
        )}

        {game.status === 'finished' && (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '30px', borderColor: game.winner === session.username ? 'var(--green)' : 'var(--orange)' }}>
                <h2 style={{ color: game.winner === session.username ? 'var(--green)' : 'var(--orange)', margin: '0 0 15px 0', fontSize: '32px', fontFamily: 'var(--mono)', textShadow: game.winner === session.username ? 'var(--green-glow)' : 'var(--orange-glow)' }}>
                    {game.winner === session.username ? "VICTORY!" : `WINNER: ${game.winner}`}
                </h2>
                <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--ui)' }}>
                    Average: <span style={{color: 'var(--cyan)', fontWeight: 'bold'}}>{player.wpm} WPM</span> &nbsp;|&nbsp; Accuracy: <span style={{color: 'var(--orange)', fontWeight: 'bold'}}>{computed.accuracy}%</span>
                </div>
            </div>
        )}

        <div className={`text-display ${player.debuff === 'chaos' ? 'chaos-active' : ''}`}>
            {actions.renderHighlightedText()}
        </div>

        {player.buff === 'shield' && game.status !== 'finished' && (
            <div style={{ color: 'var(--gold)', fontSize: '16px', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', textShadow: '0 0 10px var(--gold)', animation: 'fadeIn 0.3s ease-out', letterSpacing: '2px' }}>
                SHIELD ACTIVE! 
            </div>
        )}

        {player.debuff && game.status !== 'finished' && (
            <div style={{ color: 'var(--red)', fontSize: '16px', textAlign: 'center', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', textShadow: 'var(--red-glow)', animation: 'fadeIn 0.3s ease-out', letterSpacing: '2px' }}>
                ATTACKED WITH: {player.debuff}
            </div>
        )}

        <input
            ref={inputRef}
            type="text"
            value={player.input}
            onChange={actions.handleInputChange}
            onKeyDown={actions.handleSpecialKeys}
            disabled={game.status === 'finished' || game.countdown > 0 || player.debuff === 'freeze'}
            className={`cyber-input race-input ${player.hasError ? 'error' : ''} ${player.buff === 'shield' ? 'shield-active' : ''} ${player.debuff === 'freeze' ? 'freeze-active' : ''}`}
            style={{ opacity: game.countdown > 0 ? 0.4 : 1 }}
            placeholder={game.countdown > 0 ? "Prepare..." : "Start typing..."}
            onPaste={(e) => e.preventDefault()}
            onBlur={() => {
                if (game.status === 'racing' && player.debuff !== 'freeze') {
                    inputRef.current?.focus();
                }
            }}
            autoFocus={game.status === 'racing'}
        />

        {game.status !== 'finished' && room.settings.powerUpsEnabled && (
            <>
                <div className="progress-track" style={{ height: '4px', marginTop: '20px' }}>
                    <div
                        className="progress-fill"
                        style={{
                            width: `${computed.powerUpProgress || 0}%`,
                            background: player.powerUp ? 'var(--purple)' : 'var(--cyan)',
                            boxShadow: player.powerUp ? 'var(--purple-glow)' : 'var(--cyan-glow)'
                        }}
                    />
                </div>
                {player.powerUp && (
                    <div style={{ textAlign: 'center', color: 'var(--purple)', fontFamily: 'var(--ui)', fontSize: '13px', marginTop: '10px', fontWeight: 'bold', textTransform: 'uppercase', textShadow: 'var(--purple-glow)', animation: 'pulse 1.5s infinite', letterSpacing: '2px' }}>
                        Power-up ready: {player.powerUp} (Press CTRL)
                    </div>
                )}
            </>
        )}

        {game.status === 'finished' && (
            <>
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    {session.username === room.host && (
                        <button className="btn-start-massive" onClick={actions.handleRestart} style={{ padding: '15px 40px', width: 'auto' }}>
                            PLAY AGAIN
                        </button>
                    )}
                </div>

                {game.leaderboard.length > 0 && (
                    <div className="glass-panel" style={{ marginTop: '50px' }}>
                        <h2 className="subtitle" style={{ textAlign: 'center', marginBottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '18px' }}>GLOBAL LEADERBOARD (TOP 10)</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'rgba(255,255,255,0.8)', textAlign: 'left', fontSize: '15px', fontFamily: 'var(--mono)' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '15px 12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ui)', letterSpacing: '1px' }}>#</th>
                                    <th style={{ padding: '15px 12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ui)', letterSpacing: '1px' }}>NICKNAME</th>
                                    <th style={{ padding: '15px 12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ui)', letterSpacing: '1px' }}>PLAYED</th>
                                    <th style={{ padding: '15px 12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ui)', letterSpacing: '1px' }}>WIN RATE</th>
                                    <th style={{ padding: '15px 12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--ui)', letterSpacing: '1px' }}>BEST WPM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {game.leaderboard.map((p, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)', backgroundColor: index % 2 === 0 ? 'var(--surface-sm)' : 'transparent' }}>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.3)' }}>{index + 1}</td>
                                        <td style={{ padding: '12px', fontWeight: p.username === session.username ? 'bold' : 'normal', color: p.username === session.username ? 'var(--cyan)' : 'rgba(255,255,255,0.8)' }}>
                                            {p.username}
                                        </td>
                                        <td style={{ padding: '12px', color: 'rgba(255,255,255,0.5)' }}>{p.gamesPlayed}</td>
                                        <td style={{ padding: '12px', color: 'var(--orange)' }}>{p.winrate}%</td>
                                        <td style={{ padding: '12px', color: 'var(--green)', fontWeight: 'bold' }}>{p.highScoreWpm}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </>
        )}
    </>
    );

    return (
        <div
            className="tr-root"
            data-screen={screen}
            data-phase={screen === 'race' ? phase : undefined}
            data-debuff={player.debuff || undefined}
            data-buff={player.buff || undefined}
            data-err={player.hasError ? '1' : '0'}
        >
            <Scene />
            <div className={`tr-app ${player.debuff === 'flashbang' ? 'flashbang-active' : ''} ${player.debuff === 'bomb' ? 'bomb-active' : ''}`}>
                <header className="tr-header">
                    <h1 className="tr-title">TypeRacer</h1>
                    {session.isAuth && (
                        <div className="tr-user">
                            <span className="tr-username">{session.username}</span>
                            <button
                                className="tr-btn"
                                data-v="danger"
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('username');
                                    actions.setIsAuthenticated(false);
                                    actions.setCurrentPlayer("");
                                }}
                            >
                                <Icon name="logout" />
                                Logout
                            </button>
                        </div>
                    )}
                </header>

                <main className="tr-stage">
                    <section className="tr-screen" data-id={screen}>
                        {body}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default App;
