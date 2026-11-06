using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using TypeRacerServer.Core.Application.Services.GameManager;
using TypeRacerServer.Core.Application.Services.LeaderboardManager;
using TypeRacerServer.Core.Application.Services.PostGameManager;
using TypeRacerServer.Core.Application.Services.RoomManager;

namespace TypeRacerServer;

[Authorize]

public class GameHub(IHubContext<GameHub> _hubContext, JoinRoomService _joinRoomService, StartRoomGameService _startRoomGameService,PerformCleanupService _performCleanupService,
    SendProgressService _sendProgressService, PowerUpService _powerUpService, RestartGameService _restartGameService, ChangeRoomSettingsService _changeSettingsService,
    EndGameProcessService _endGameService) : Hub
{
    public async Task<bool> JoinRoom(string HostCode)
    {
        string currentPlayer = Context.User?.Identity?.Name ?? "Unknown";
        var result = _joinRoomService.JoinRoom(HostCode, Context.ConnectionId, currentPlayer);

        if (!result.isSucces) return false;

        await Groups.AddToGroupAsync(Context.ConnectionId, HostCode);

        if (result.NeedsLobbySetup)
            await Clients.Caller.SendAsync("SetUpLobby", new { PowerUpsEnabled = false, SecondsToEnd = 0, HardMode = false });

        if (result.State != null)
        {
            var roomData = new { Players = result.State.Players.Values.ToArray(), Host = result.State.Players.GetValueOrDefault(result.State.HostConnection, "") };
            await Clients.Caller.SendAsync("UpdatePlayersList", roomData);
            await Clients.GroupExcept(HostCode, Context.ConnectionId).SendAsync("UpdatePlayersList", roomData);
        }

        if (!string.IsNullOrEmpty(result.TextToLoad))
            await Clients.Caller.SendAsync("LoadText", result.TextToLoad);

        return true;
    }

    public async Task StartRoomGame(string HostCode)
    {
       var result = _startRoomGameService.StartRoomGame(HostCode,Context.ConnectionId);
       if (result.isSucces && !string.IsNullOrEmpty(result.TargetText))
       {
           await Clients.Group(HostCode).SendAsync("LoadText", result.TargetText);
       }
    }

    public async Task LeaveRoom()
    {
        var cleanupResult = _performCleanupService.PerformCleanup(Context.ConnectionId);
        if (!cleanupResult.isRemoved) return;

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, cleanupResult.roomCode);

        if (!cleanupResult.isRommEmpty && cleanupResult.roomStateInfo != null)
        {
            var roomData = new
            {
                Players = cleanupResult.roomStateInfo.Players.Values.ToArray(),
                Host = cleanupResult.roomStateInfo.Players.GetValueOrDefault(
                    cleanupResult.roomStateInfo.HostConnection, "")
            };
            await Clients.Group(cleanupResult.roomCode).SendAsync("UpdatePlayersList", roomData);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string cid = Context.ConnectionId;

        _ = Task.Run(async () =>
        {
            await Task.Delay(15000);
            var cleanupResult = _performCleanupService.PerformCleanup(cid);
            if (cleanupResult.isRemoved && !cleanupResult.isRommEmpty && cleanupResult.roomStateInfo != null)
            {
                var roomData = new
                {
                    Players = cleanupResult.roomStateInfo.Players.Values.ToArray(),
                    Host = cleanupResult.roomStateInfo.Players.GetValueOrDefault(
                        cleanupResult.roomStateInfo.HostConnection, "")
                };
                await _hubContext.Clients.Group(cleanupResult.roomCode).SendAsync("UpdatePlayersList", roomData);

                if (cleanupResult.roomStateInfo.GameStarted)
                {
                    await _hubContext.Clients.Group(cleanupResult.roomCode).SendAsync("UpdateState", new
                    {
                        playerNick = "Disconnected Player", progress = 0, hasError = true, isDone = true, wpm = 0
                    });
                }
            }
        });
    }

    public async Task SendProgress(string currentInput)
    {
        var result = _sendProgressService.SendProgress(currentInput,Context.ConnectionId);
        if (!result.IsSuccess) return;
        if (!string.IsNullOrEmpty(result.PowerUpGrant))
            await Clients.Caller.SendAsync("PowerUpGranted", result.PowerUpGrant);

        if (!string.IsNullOrEmpty(result.BuffToGrant))
            await Clients.Caller.SendAsync("ReceiveDefense", "auto", result.BuffToGrant);
        if(result.TriggerHardModeFail)
            await Clients.Group(result.RoomCode).SendAsync("ReceiveAttack", result.PlayerNick, "freeze");

        await Clients.Group(result.RoomCode).SendAsync("UpdateState", new
        {
            playerNick = result.PlayerNick, progress = result.Progress, hasError = result.HasError, isDone = result.IsDone, wpm = result.Wpm
        });

        if (result.ShouldStartEndGameTimer)
        {
            _ = Task.Run(async () =>
            {
                await Task.Delay(1000 * result.SecondsToEnd);
                await ExecuteEndGame(result.RoomCode);
            });
        }
        else if (result.ShouldEndGameImmediately)
        {
            await ExecuteEndGame(result.RoomCode);
        }

    }

    public async Task UsePowerUp(string roomCode, string AttackerNick, string TargetNick, string Power)
    {
        var result = _powerUpService.PowerUp(roomCode, TargetNick, Power,  out string? targetID);
        Console.WriteLine($"[ATTACK] Target: {TargetNick}, ConnectionId: {targetID}, Power: {Power}");
        if (result && !string.IsNullOrEmpty(targetID))
        {
            await Clients.Client(targetID).SendAsync("ReceiveAttack", TargetNick, Power);
        }
    }

    public async Task RestartGame()
    {
        var result = _restartGameService.RestartGame(Context.ConnectionId);
        if (result.isDone)
        {
            await Clients.Group(result.roomCode).SendAsync("BackToLobby");
        }
    }

    public async Task ChangeRoomSettings(string roomCode, bool powerUpsEnabled, bool hardMode, int secondsToEnd)
    {
        if (_changeSettingsService.ChangeRoomSettings(roomCode, powerUpsEnabled, hardMode, secondsToEnd, Context.ConnectionId))
        {
            await Clients.Group(roomCode).SendAsync("SettingsUpdate", new { powerUpsEnabled, hardMode, secondsToEnd });
        }
    }

    private async Task ExecuteEndGame(string roomCode)
    {
        string winner = _endGameService.EndGameProcess(roomCode);
        await _hubContext.Clients.Group(roomCode).SendAsync("GameOver", winner);
    }
}
