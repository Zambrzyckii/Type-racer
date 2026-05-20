using TypeRacerServer.Core.Application.Models.PreGameResults;
using TypeRacerServer.Core.Domain.Constant;
using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Application.Services.RoomManager;

public class StartRoomGameService(GameState _gameState)
{

    public StartRoomGameResult StartRoomGame(string HostCode, string ConnectionId)
    {
        var startRoomGameResult = new StartRoomGameResult();
        if (!_gameState.Rooms.TryGetValue(HostCode, out var room) || ConnectionId != room.HostConnection || room.GameStarted)
            return startRoomGameResult;

        room.TargetText = GameQuotes.Quotes[Random.Shared.Next(GameQuotes.Quotes.Length)];
        room.CurrentGameId = Guid.NewGuid();
        room.GameStarted = true;

        foreach (var cid in room.Players.Keys)
        {
            if (_gameState.Sessions.TryGetValue(cid, out var player))
            {
                player.TargetText = room.TargetText;
                player.Progress = 0;
                player.Errors = 0;
                player.Keystrokes = 0;
                player.DebuffsReceived = 0;
                player.FinishTime = null;
                player.StartTime = null;
                player.PowerUpProgress = 0;
            }
        }

        startRoomGameResult.isSucces = true;
        startRoomGameResult.TargetText = room.TargetText;
        return  startRoomGameResult;
    }
}