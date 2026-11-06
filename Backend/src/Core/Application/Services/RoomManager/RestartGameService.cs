using TypeRacerServer.Core.Application.Models.PostGameResults;
using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Application.Services.RoomManager;

public class RestartGameService(GameState _gameState)
{
    public RestartGameResult RestartGame(string connectionId)
    {
        RestartGameResult result = new  RestartGameResult();
        if (_gameState.Sessions.TryGetValue(connectionId, out var session) &&
            _gameState.Rooms.TryGetValue(session.RoomCode, out var room) && connectionId == room.HostConnection)
        {
            room.GameStarted = false;
            foreach (var PlayerID in room.Players.Keys)
            {
                if (_gameState.Sessions.TryGetValue(PlayerID, out var player))
                {
                    player.StartTime = null;
                    player.TargetText = string.Empty;
                    player.PowerUpProgress = 0;
                    player.FinishTime = null;
                }
            }
            result.isDone = true;
            result.roomCode = session.RoomCode;
        }

        return result;
    }
}