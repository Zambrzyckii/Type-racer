using TypeRacerServer.Core.Application.Models.PreGameResults;
using TypeRacerServer.Core.Application.Models.RoomResults;
using TypeRacerServer.Core.Domain.Constant;
using TypeRacerServer.Core.Domain.State;
using TypeRacerServer.Core.Application.Services.RoomManager;

namespace Core.Tests.Application.Services.RoomManager;

public class StartRoomGameServiceTests
{
    [Fact]
    public void StartRoomGame_AsNonHost_ReturnsFailure()
    {
        GameState _gameState = new GameState();
        var room = new RoomState { HostConnection = "conn_host", GameStarted = false };
        _gameState.Rooms.TryAdd("Room1", room);
        var service = new StartRoomGameService(_gameState);
        var result = service.StartRoomGame("Room1","conn_guest");
        Assert.False(result.isSucces);
        Assert.False(room.GameStarted);
    }

    [Fact]
    public void StartRoomGame_AsHost_ReturnsSuccess()
    {
        //TODO 
    }
}