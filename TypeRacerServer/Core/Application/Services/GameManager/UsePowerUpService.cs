using TypeRacerServer.Core.Domain.State;
namespace TypeRacerServer.Core.Application.Services.GameManager;

public class PowerUpService(GameState _gameState)
{
    public bool PowerUp(string roomCode, string TargetNick, string Power, out string targetID)
    {
        targetID = null;
        if (_gameState.Rooms.TryGetValue(roomCode, out var room) && room.GameStarted)
        {
            targetID = room.Players.FirstOrDefault(x => x.Value == TargetNick).Key;
            if (targetID != null && _gameState.Sessions.TryGetValue(targetID, out var targetPlayer))
            {
                targetPlayer.DebuffsReceived++;
                if(Power == "freeze") targetPlayer.FreezeEnd = DateTime.Now.AddSeconds(3);
                return true;
            }
        }

        return false;
    }
}