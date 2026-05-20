using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Domain.State;
using TypeRacerServer.Core.Application.Services.RoomManager;

namespace Core.Tests.Application.Services.RoomManager;

public class RestartGameServiceTests
{
    [Fact]
    public void RestartGame_ASHost_ResetAllPlaeyrsInRoom()
    {
        GameState _gameState = new GameState();

        string roomCode = "Code";
        string hostID = "HostID";
        string guestID = "GuestID";

        var hostSession = new PlayerSession
        {
            RoomCode = roomCode,
            FinishTime = DateTime.Now,
            TargetText = "done"
        };
        var guestSession = new PlayerSession
        {
            RoomCode = roomCode,
            FinishTime = null,
            TargetText = "not"
        };
        _gameState.Sessions.TryAdd(hostID, hostSession);
        _gameState.Sessions.TryAdd(guestID, guestSession);
        var room = new RoomState
        {
            GameStarted = true,
            HostConnection = hostID
        };
        
        room.Players.TryAdd(hostID, "Host Name");
        room.Players.TryAdd(guestID, "Guest Name");
        _gameState.Rooms.TryAdd(roomCode, room);

        var service = new RestartGameService(_gameState);
        
        var result = service.RestartGame(hostID);
        
        Assert.True(result.isDone);
        Assert.Equal(roomCode,result.roomCode);
        Assert.False(room.GameStarted);
        Assert.Null(hostSession.FinishTime);
        Assert.Equal(string.Empty, hostSession.TargetText);
    
        Assert.Null(guestSession.FinishTime);
        Assert.Equal(string.Empty, guestSession.TargetText);
    }

    [Fact]
    public void RestartGame_AsGuest_DoesNothing()
    {
        GameState _gameState = new GameState();
        string hostID = "hostID";
        string guestID = "guestID";
        var room = new RoomState
        {
            GameStarted = true,
            HostConnection = hostID
        };
        _gameState.Rooms.TryAdd("ROOM", room);
        _gameState.Sessions.TryAdd(guestID, new PlayerSession {RoomCode = "ROOM"});
        var service = new RestartGameService(_gameState);
        var result = service.RestartGame(guestID);
        
        Assert.False(result.isDone);
        Assert.True(room.GameStarted);
    }
}