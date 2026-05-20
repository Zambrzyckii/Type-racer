using TypeRacerServer.Core.Application.Models.PlayerData;
using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Application.Services.RoomManager;
using TypeRacerServer.Core.Domain.State;

namespace Core.Tests.Application.Services.RoomManager;

public class JoinRoomServiceTests
{
    [Fact]
    public void JoinRoom_FirstPlayerInRoom_BecomesHostAndNeedsSetup()
    {
        var gameState = new GameState(); 
        var service = new JoinRoomService(gameState);

        var result = service.JoinRoom("XYZ", "conn_1", "HostPlayer");

        Assert.True(result.isSucces);
        Assert.True(result.NeedsLobbySetup);
        
        var room = gameState.Rooms["XYZ"];
        Assert.Equal("conn_1", room.HostConnection);
        Assert.Single(room.Players); 
    }

    [Fact]
    public void JoinRoom_GameAlreadyStartedAndNewPlayer_ReturnsFalse()
    {
        var gameState = new GameState();
        var activeRoom = new RoomState { GameStarted = true };
        
        activeRoom.Players.TryAdd("conn_old", "ProGamer");
        gameState.Rooms.TryAdd("RUNNING_GAME", activeRoom);

        var service = new JoinRoomService(gameState);

        var result = service.JoinRoom("RUNNING_GAME", "conn_late", "LateGuy");

        Assert.False(result.isSucces);
        
        Assert.Single(gameState.Rooms["RUNNING_GAME"].Players); 
    }

    [Fact]
    public void JoinRoom_ExistingPlayerReconnects_SwapsConnectionId()
    {
        var gameState = new GameState();
        
        var oldSession = new PlayerSession { Nickname = "Bob", RoomCode = "ROOM1", Progress = 50 };
        gameState.Sessions.TryAdd("old_conn_id", oldSession);

        var room = new RoomState();
        room.Players.TryAdd("old_conn_id", "Bob");
        room.HostConnection = "old_conn_id";
        gameState.Rooms.TryAdd("ROOM1", room);

        var service = new JoinRoomService(gameState);

        var result = service.JoinRoom("ROOM1", "new_conn_id", "Bob");

        Assert.True(result.isSucces);
        
        Assert.False(gameState.Rooms["ROOM1"].Players.ContainsKey("old_conn_id"));
        Assert.True(gameState.Rooms["ROOM1"].Players.ContainsKey("new_conn_id"));
        
        Assert.False(gameState.Sessions.ContainsKey("old_conn_id"));
        Assert.True(gameState.Sessions.ContainsKey("new_conn_id"));
        Assert.Equal(50, gameState.Sessions["new_conn_id"].Progress); 
        
        Assert.Equal("new_conn_id", gameState.Rooms["ROOM1"].HostConnection);
    }
}