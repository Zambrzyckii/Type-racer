import React from 'react';
import Auth from './Auth';
import Scene from './Scene';
import Icon from './Icon';
import { useGameLogic } from './GameLogic';
import { useSwap } from './Swap';
import './App.css';

const SNOWFLAKES = [9, 81, 34, 58, 22, 70, 46, 90];
const STATUS_HEIGHT = 64;
const RESULT_GAP = 12;
const SETTLE_TIME = 2200;

const laneStatus = ({ progress, hasError, isDone }, struck, isMoving) => {
    if (isDone && hasError) return 'out';
    if (isDone || progress >= 100) return 'done';
    if (struck === 'freeze') return 'frozen';
    if (struck || hasError) return 'hit';
    return isMoving ? 'run' : 'idle';
};

const Bar = ({ block, idx, progress, status }) => (
    <div className="tr-bar" data-block={block} data-idx={idx} data-status={status} style={{ '--p': progress / 100 }}>
        <div className="tr-bar-fill" />
        <div className="tr-runner"><i className="tr-sprite" /></div>
    </div>
);

// The caret is one element moved over the text: its place is read from the layout after every render.
const Quote = ({ position, showCaret, children }) => {
    const quoteRef = React.useRef(null);

    React.useLayoutEffect(() => {
        const chars = quoteRef.current.querySelectorAll('.tr-c');
        if (!chars.length) return;
        const char = chars[Math.min(position, chars.length - 1)];
        const pastEnd = position >= chars.length ? char.offsetWidth : 0;
        quoteRef.current.style.setProperty('--caret-x', `${char.offsetLeft + pastEnd}px`);
        quoteRef.current.style.setProperty('--caret-y', `${char.offsetTop}px`);
    });

    return (
        <div className="tr-quote" ref={quoteRef}>
            {children}
            {showCaret && <i className="tr-caret" aria-hidden="true" />}
        </div>
    );
};

function App() {
    const {
        session,
        room,
        game,
        player,
        notes,
        computed,
        actions,
        inputRef
    } = useGameLogic();
    const surfaceRef = React.useRef(null);
    const surfaceHeight = React.useRef(0);
    const [isSettling, setIsSettling] = React.useState(false);


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
    const hasWon = game.winner === session.username;
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

        <Bar block="progress" idx={0} progress={player.progress} status={laneStatus({ ...player, isDone: player.isOut }, null, isRacing && player.input.length > 0)} />

        <div className="tr-card" data-block="opponents">
            <h3>Opponents</h3>
            {opponents.length > 0 ? (
                opponents.map((opponentNick, index) => {
                    const stats = room.opponents?.[opponentNick] || { progress: 0, wpm: 0 };
                    const status = laneStatus(stats, room.struck[opponentNick], isRacing);
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

        {!isFinished && (
            <div className="tr-status" data-sk-tick={game.countdown % 2 ? 'a' : 'b'}>
                {phase === 'count' && <div data-el="count">{game.countdown}</div>}
                {phase === 'go' && <div data-el="go">START!</div>}
                {phase === 'overtime' && <div data-el="timer">Time to end: <b>{game.timeRemaining}</b>s</div>}
                {phase === 'finishing' && <div data-el="finishing">FINISHING RACE...</div>}
            </div>
        )}

        {isFinished && (
            <div className="tr-panel tr-result" data-outcome={hasWon ? 'win' : 'lose'}>
                <h2>{hasWon ? "VICTORY!" : `WINNER: ${game.winner}`}</h2>
                <div className="tr-avg">
                    Average: <b>{`${player.wpm} WPM`}</b> <span className="tr-sep">|</span> Accuracy: <b>{`${computed.accuracy}%`}</b>
                </div>
            </div>
        )}

        <div className="tr-typing">
            <Quote position={player.input.length} showCaret={isRacing && phase !== 'finishing'}>
                {actions.renderHighlightedText()}
                {player.debuff === 'freeze' && SNOWFLAKES.map((left, index) => (
                    <i key={index} className="sk-snow" aria-hidden="true" style={{ left: `${left}%`, animationDelay: `${index * 230}ms` }} />
                ))}
                {player.debuff === 'bomb' && <i className="sk-boom" aria-hidden="true" />}
            </Quote>

            <div className="tr-banners" aria-live="polite">
                {player.buff === 'shield' && !isFinished && (
                    <div data-el="shield">
                        <Icon name="shield" />
                        <span>Shield active!</span>
                    </div>
                )}
                {player.debuff && !isFinished && (
                    <div data-el="attack">
                        <Icon name={player.debuff} />
                        <span>Attacked with: <b>{player.debuff}</b></span>
                    </div>
                )}
                {player.isOut && !player.debuff && !isFinished && (
                    <div data-el="out">
                        <Icon name="error" />
                        <span>Eliminated</span>
                    </div>
                )}
            </div>

            <input
                ref={inputRef}
                type="text"
                value={player.input}
                onChange={actions.handleInputChange}
                onKeyDown={actions.handleSpecialKeys}
                disabled={isFinished || game.countdown > 0 || player.debuff === 'freeze'}
                className="tr-input tr-race"
                placeholder={game.countdown > 0 ? "Prepare..." : "Start typing..."}
                aria-label="Type the text shown above"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                onPaste={(e) => e.preventDefault()}
                onBlur={() => {
                    if (game.status === 'racing' && player.debuff !== 'freeze') {
                        inputRef.current?.focus();
                    }
                }}
                autoFocus={game.status === 'racing'}
            />
            {player.blocked > 0 && <i key={player.blocked} className="sk-ring" aria-hidden="true" />}
        </div>

        {!isFinished && room.settings.powerUpsEnabled && (
            <div
                className="tr-powerup"
                data-sk-grant={player.swaps > 0 ? 'swap' : 'first'}
                style={{ '--c': (computed.powerUpProgress || 0) / 100 }}
            >
                <div className="tr-bar"><div className="tr-bar-fill" /></div>
                {player.powerUp && (
                    <div key={player.swaps} data-el="pu-ready">
                        <Icon name={player.powerUp} />
                        <span>Power-up ready: <b>{player.powerUp}</b> <span className="tr-key">(Press CTRL)</span></span>
                    </div>
                )}
            </div>
        )}

        {isFinished && (
            <>
                <div className="tr-again">
                    {isHost && (
                        <button className="tr-btn" data-v="start" onClick={actions.handleRestart}>
                            Play again
                        </button>
                    )}
                </div>

                {game.leaderboard.length > 0 && (
                    <div className="tr-panel tr-board">
                        <h2>Global leaderboard (top 10)</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>NICKNAME</th>
                                    <th>PLAYED</th>
                                    <th>WIN RATE</th>
                                    <th>BEST WPM</th>
                                </tr>
                            </thead>
                            <tbody>
                                {game.leaderboard.map((p, index) => (
                                    <tr key={index} data-rank={index + 1} data-self={p.username === session.username ? '1' : '0'} style={{ '--sk-row': index }}>
                                        <td>{index + 1}</td>
                                        <td>{p.username}</td>
                                        <td>{p.gamesPlayed}</td>
                                        <td>{`${p.winrate}%`}</td>
                                        <td>{p.highScoreWpm}</td>
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

    const [shown, swapState, onSwapEnd] = useSwap({ id: screen, body }, screen);

    // The race surface opens up for the results instead of jumping to its new height.
    React.useLayoutEffect(() => {
        if (!isFinished) surfaceHeight.current = surfaceRef.current.offsetHeight;
    });

    React.useLayoutEffect(() => {
        const surface = surfaceRef.current;
        const result = surface.querySelector('.tr-result');
        if (!isFinished || !result || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        surface.style.setProperty('--sk-fin-shift', `${result.offsetHeight + RESULT_GAP - STATUS_HEIGHT}px`);
        surface.style.overflow = 'hidden';
        const grow = surface.animate([{ height: `${surfaceHeight.current}px` }, { height: `${surface.offsetHeight}px` }], { duration: 520, easing: 'cubic-bezier(.65, 0, .35, 1)' });
        grow.onfinish = grow.oncancel = () => { surface.style.overflow = ''; };
        setIsSettling(true);
        const timer = setTimeout(() => setIsSettling(false), SETTLE_TIME);
        return () => clearTimeout(timer);
    }, [isFinished]);

    return (
        <div
            className="tr-root"
            data-screen={screen}
            data-phase={screen === 'race' ? phase : undefined}
            data-debuff={player.debuff || undefined}
            data-buff={player.buff || undefined}
            data-err={player.hasError ? '1' : '0'}
            data-sk-fin={isSettling ? '' : undefined}
        >
            <Scene />
            <div className="tr-app">
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
                    <section className="tr-screen" ref={surfaceRef} data-id={shown.id} data-state={swapState} onAnimationEnd={onSwapEnd}>
                        {shown.body}
                    </section>
                </main>
            </div>
            <div className="tr-toasts" aria-live="polite">
                {notes.map((note) => (
                    <div key={note.id} className="tr-toast" data-kind={note.kind} data-pu={note.power} data-state={note.leaving ? 'out' : undefined}>
                        <Icon name={note.power || 'guest'} />
                        <span className="tr-toast-k">{note.label}</span>
                        <span className="tr-toast-v">{note.value}</span>
                    </div>
                ))}
            </div>
            <div className="tr-overlay" aria-hidden="true" />
        </div>
    );
}

export default App;
