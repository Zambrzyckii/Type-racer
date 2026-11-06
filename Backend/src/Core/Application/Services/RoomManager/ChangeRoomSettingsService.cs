using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Application.Services.RoomManager;

public class ChangeRoomSettingsService(GameState _gameState)
{
    public bool ChangeRoomSettings(string roomCode, bool powerUpsEnabled, bool hardMode, int secondsToEnd,string connectionId)
    {
        if (_gameState.Rooms.TryGetValue(roomCode, out var room) && room.HostConnection == connectionId)
        {
            room.PowerUpsEnabled = powerUpsEnabled;
            room.HardMode = hardMode;
            room.SecondsToEnd = secondsToEnd;
            return true;
        }

        return false;
    }
}