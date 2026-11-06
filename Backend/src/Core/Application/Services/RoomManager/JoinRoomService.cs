using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Application.Services.RoomManager;

public class JoinRoomService(GameState _gameState)
{
    public JoinRoomResult JoinRoom(string HostCode,string connectionId, string playerName)
    {
        string currentPlayer = playerName;
        var result = new JoinRoomResult();
        string newCid = connectionId;
        var room = _gameState.Rooms.GetOrAdd(HostCode, _ => new RoomState());
        Console.WriteLine($"New player in lobby: {newCid}, Host code: {HostCode} with nickname : {currentPlayer}");
        var oldSessionEntry = _gameState.Sessions.FirstOrDefault(s => s.Value.Nickname == currentPlayer && s.Value.RoomCode == HostCode);
        if (oldSessionEntry.Key != null)
        {
            string oldCid = oldSessionEntry.Key;
            var sessionData = oldSessionEntry.Value;

            _gameState.Sessions.TryRemove(oldCid, out _);
            _gameState.Sessions.TryAdd(newCid, sessionData);

            room.Players.TryRemove(oldCid, out _);
            if (room.HostConnection == oldCid) room.HostConnection = newCid;
        }

        if (!_gameState.Sessions.ContainsKey(newCid))
        {
            _gameState.Sessions.TryAdd(newCid, new PlayerSession { Nickname = currentPlayer, RoomCode = HostCode });
        }

        if (room.Players.Count == 0)
        {
            room.HostConnection = newCid;
            result.isSucces = true;
            result.NeedsLobbySetup = true;
            result.State = room;

        }

        if (room.GameStarted && oldSessionEntry.Key == null)
        {
            result.isSucces = false;
            return result;
        }

        room.Players.TryAdd(newCid, currentPlayer);

        result.isSucces = true;
        result.State = room;

        if (room.GameStarted && _gameState.Sessions.TryGetValue(newCid, out var pSession) && !string.IsNullOrEmpty(pSession.TargetText))
        {
            result.TextToLoad = pSession.TargetText;
        }

        return result;
    }
}