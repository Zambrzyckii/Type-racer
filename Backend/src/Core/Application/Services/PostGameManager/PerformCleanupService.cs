using TypeRacerServer.Core.Application.Models.PostGameResults;
using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Application.Services.PostGameManager;

public class PerformCleanupService(GameState _gameState)
{
    public PerformCleanupResult PerformCleanup(string connectionId)
    {
        var result = new PerformCleanupResult();
        if (_gameState.Sessions.TryGetValue(connectionId, out var session))
        {
            var roomCode = session.RoomCode;
            result.roomCode = roomCode;
            if (_gameState.Rooms.TryGetValue(roomCode, out var room))
            {
                _gameState.Sessions.TryRemove(connectionId, out _);
                room.Players.TryRemove(connectionId, out _);
                if (room.HostConnection == connectionId)
                {
                    room.HostConnection = room.Players.Keys.FirstOrDefault() ?? string.Empty;
                }

                if (room.Players.Count == 0)
                {
                    _gameState.Rooms.TryRemove(roomCode, out _);
                    result.isRommEmpty = true;
                }
                else
                {
                    result.roomStateInfo = room;
                }
                result.isRemoved = true;
            }
        }

        return result;
    }
}