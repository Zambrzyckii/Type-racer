import React from 'react';
import Auth from './Auth';
import { useGameLogic } from './GameLogic';
import './App.css'; 

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

    return (
        <div className={`game-container ${player.debuff === 'flashbang' ? 'flashbang-active' : ''} ${player.debuff === 'bomb' ? 'bomb-active' : ''}`}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 className="title-glow" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '10px 20px', borderRadius: '10px' }}>TypeRacer</h1>
                {session.isAuth && (
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: 'var(--cyan)', fontSize: '16px', fontFamily: 'var(--mono)' }}>{session.username}</span>
                        <button 
                            className="btn btn-danger"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                actions.setIsAuthenticated(false);
                                actions.setCurrentPlayer("");
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>

            {!session.isAuth ? (
                <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '400px', margin: '60px auto', padding: '40px 30px' }}>
                    <Auth onLoginSuccess={(username) => {
                        actions.setIsAuthenticated(true);
                        actions.setCurrentPlayer(username);
                    }} /> 
                </div>
            ) : !room.isJoined ? (
                <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
                    <h2 className="subtitle" style={{ color: 'var(--cyan)' }}>Join a Room</h2>
                    <input
                        type="text"
                        className="cyber-input"
                        value={room.code}
                        onChange={(e) => actions.setRoomCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        style={{ width: '80%', margin: '20px auto', display: 'block', textAlign: 'center', fontSize: '24px', letterSpacing: '4px' }}
                    />
                    <button className="btn btn-primary" onClick={actions.handleJoinRooms} style={{ fontSize: '1.2rem', padding: '15px 40px', marginTop: '10px' }}>
                        JOIN GAME
                    </button>
                </div>
            ) : game.status === 'lobby' ? (
                <div className="glass-panel" style={{ textAlign: 'center' }}>
                    <h2 className="subtitle" style={{ fontSize: '28px' }}>
                        Room: <span style={{ color: 'var(--cyan)', letterSpacing: '4px' }}>{room.code}</span>
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '30px', animation: 'pulse 2s infinite' }}>Waiting for the race to start...</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        
                        <div className="glass-panel-sm" style={{ flex: '1 1 300px', textAlign: 'left' }}>
                            <h3 style={{ color: 'var(--green)', marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Players ({room.players.length})
                            </h3>
                            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, maxHeight: '150px', overflowY: 'auto' }}>
                                {room.players.length > 0 ? (
                                    room.players.map((p, index) => (
                                        <li key={index} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', color: p === room.host ? 'var(--orange)' : 'rgba(255,255,255,0.8)', fontSize: '16px', display: 'flex', alignItems: 'center', fontFamily: 'var(--mono)' }}>
                                            <span style={{ marginRight: '10px', fontSize: '12px', opacity: 0.8, color: p === room.host ? 'var(--orange)' : 'var(--cyan)' }}>
                                                {p === room.host ? '[HOST]' : '[PILOT]'}
                                            </span>
                                            {p.length > 15 ? p.substring(0,15) + "..." : p}
                                        </li>
                                    ))
                                ) : (
                                    <li style={{ color: 'rgba(255,255,255,0.3)', padding: '10px', fontStyle: 'italic' }}>You are alone...</li>
                                )}
                            </ul>
                        </div>

                        <div className="glass-panel-sm" style={{ flex: '1 1 300px', textAlign: 'left' }}>
                            <h3 style={{ color: 'var(--cyan)', marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '10px', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                Room Settings
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.8)' }}>
                                    <span>Power-Ups:</span>
                                    <label className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={room.settings?.powerUpsEnabled || false} 
                                            disabled={session.username !== room.host}
                                            onChange={(e) => actions.handleChangeSettings(e.target.checked, room.settings.hardMode, room.settings.secondsToEnd)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.8)' }}>
                                    <span>Hard Mode:</span>
                                    <label className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={room.settings?.hardMode || false} 
                                            disabled={session.username !== room.host}
                                            onChange={(e) => actions.handleChangeSettings(room.settings.powerUpsEnabled, e.target.checked, room.settings.secondsToEnd)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgba(255,255,255,0.8)' }}>
                                    <span>Time Limit (s):</span>
                                    <div className="time-control-wrapper">
                                        <button 
                                            className="cyber-arrow-btn"
                                            disabled={session.username !== room.host}
                                            onClick={() => actions.handleChangeSettings(room.settings.powerUpsEnabled, room.settings.hardMode, Math.max(0, (room.settings?.secondsToEnd || 0) - 10))}
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number"
                                            className="cyber-input"
                                            min="0" max="300"
                                            value={room.settings?.secondsToEnd || 0} 
                                            disabled={session.username !== room.host}
                                            onChange={(e) => actions.handleChangeSettings(room.settings.powerUpsEnabled, room.settings.hardMode, Number(e.target.value) || 0)}
                                            style={{ width: '60px', padding: '8px', textAlign: 'center' }}
                                        />
                                        <button 
                                            className="cyber-arrow-btn"
                                            disabled={session.username !== room.host}
                                            onClick={() => actions.handleChangeSettings(room.settings.powerUpsEnabled, room.settings.hardMode, (room.settings?.secondsToEnd || 0) + 10)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {session.username === room.host && (
                        <button className="btn-start-massive" onClick={actions.handleStart}>
                            START RACE
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>
                        <div style={{ color: 'var(--cyan)', width: '33%' }}>{player.wpm} WPM</div>
                        <div style={{ color: 'var(--orange)', width: '33%', textAlign: 'center' }}>{computed.accuracy}%</div>
                        <div style={{ color: 'var(--green)', width: '33%', textAlign: 'right' }}>{player.progress}%</div>
                    </div>

                    <div className="progress-track" style={{ marginBottom: '30px' }}>
                        <div className="progress-fill" style={{ width: `${player.progress}%` }} />
                    </div>

                    <div className="glass-panel-sm" style={{ marginBottom: '30px' }}>
                        <h3 style={{ color: 'rgba(255,255,255,0.4)', marginTop: 0, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                            Opponents
                        </h3>
                        {room.players.filter(p => p !== session.username).length > 0 ? (
                            room.players.filter(p => p !== session.username).map((opponentNick, index) => {
                                const stats = room.opponents?.[opponentNick] || { progress: 0, wpm: 0 };
                                return (
                                    <div key={index} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontFamily: 'var(--ui)' }}>
                                            <span style={{ fontWeight: 'bold' }}>{opponentNick}</span>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                {player.powerUp && game.status !== 'finished' && (
                                                    <button 
                                                        className="btn btn-primary"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => actions.handleUsePowerUp(opponentNick)}
                                                        style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'var(--purple)', color: 'var(--purple)' }}
                                                    >
                                                        USE {player.powerUp.toUpperCase()}
                                                    </button>
                                                )}
                                                <span style={{ fontFamily: 'var(--mono)', color: 'var(--orange)' }}>{stats.wpm} WPM</span>
                                            </div>
                                        </div>
                                        <div className="progress-track" style={{ height: '6px' }}>
                                            <div className="progress-fill" style={{ width: `${stats.progress}%`, background: 'var(--orange)', boxShadow: 'var(--orange-glow)' }} />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', fontStyle: 'italic' }}>
                                Solo run — no opponents
                            </div>
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
            )}
        </div>
    );
}

export default App;