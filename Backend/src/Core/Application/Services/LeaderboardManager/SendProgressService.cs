using TypeRacerServer.Core.Application.Models.PostGameResults;
using TypeRacerServer.Core.Domain.Constant;
using TypeRacerServer.Core.Domain.State;

namespace TypeRacerServer.Core.Application.Services.LeaderboardManager;

public class SendProgressService(GameState _gameState)
{
    public SendProgressResult SendProgress(string currentInput, string connectionId)
    {
        var  result = new SendProgressResult();
        if (!_gameState.Sessions.TryGetValue(connectionId, out var player) || !_gameState.Rooms.TryGetValue(player.RoomCode, out var room)) return result;
        result.RoomCode = player.RoomCode;
        result.PlayerNick = player.Nickname;
        if (player.FreezeEnd.HasValue && DateTime.Now < player.FreezeEnd) return result;
        if (player.FinishTime.HasValue) return result;
        if (string.IsNullOrEmpty(player.TargetText)) return result;

        player.FreezeEnd = null;
        player.Keystrokes++;

        if (currentInput.Length == 1 && !player.StartTime.HasValue)
            player.StartTime = DateTime.Now;

        int correctLength = 0;
        while (correctLength < currentInput.Length && correctLength < player.TargetText.Length && currentInput[correctLength] == player.TargetText[correctLength])
        {
            correctLength++;
        }

        bool isError = currentInput.Length > correctLength;
        if (isError) player.Errors++;

        player.Progress = (correctLength * 100) / player.TargetText.Length;

        if (player.PowerUpProgress < correctLength)
        {
            player.PowerUpProgress = correctLength;
            if (room.PowerUpsEnabled)
            {
                if (correctLength % 5 == 0) result.PowerUpGrant = PowerUp.PowerUps[Random.Shared.Next(PowerUp.PowerUps.Length)];
                if (correctLength % 10 == 0) result.BuffToGrant = Buffs.Buff[Random.Shared.Next(Buffs.Buff.Length)];
            }
        }

        if (isError && room.HardMode)
        {
            player.TargetText = string.Empty;
            result.TriggerHardModeFail = true;
            result.Progress = player.Progress;
            result.HasError = true;
            result.IsDone = true;
            result.Wpm = 0;
            result.IsSuccess = true;
            bool anyoneAlive = room.Players.Keys.Any(pId => _gameState.Sessions.TryGetValue(pId, out var s) && !string.IsNullOrEmpty(s.TargetText) && !s.FinishTime.HasValue);
            if (!anyoneAlive && room.GameStarted) result.ShouldEndGameImmediately = true;
            return result;
        }

        if (currentInput == player.TargetText && room.GameStarted)
        {
            player.FinishTime = DateTime.Now;

            int activePlayers = room.Players.Keys.Count(p => _gameState.Sessions.TryGetValue(p, out var s) && !string.IsNullOrEmpty(s.TargetText));
            int finishedCount = room.Players.Keys.Count(p => _gameState.Sessions.TryGetValue(p, out var s) && s.FinishTime.HasValue);

            if (finishedCount == 1)
            {
                if (room.SecondsToEnd > 0)
                {
                    result.ShouldStartEndGameTimer = true;
                    result.SecondsToEnd = room.SecondsToEnd;
                }
                else result.ShouldEndGameImmediately = true;
            }
            else if (finishedCount >= activePlayers)
            {
                result.ShouldEndGameImmediately = true;
            }
        }

        int currentWpm = 0;
        if (player.StartTime.HasValue)
        {
            var elapsedSeconds = (DateTime.Now - player.StartTime.Value).TotalSeconds;
            if (elapsedSeconds > 0) currentWpm = (int)((correctLength / 5.0) / (elapsedSeconds / 60.0));
        }

        if(currentWpm > 300) return result;

        result.Progress = player.Progress;
        result.HasError = isError;
        result.IsDone = player.FinishTime.HasValue;
        result.Wpm = currentWpm;
        result.IsSuccess = true;
        return result;
    }
}