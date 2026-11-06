namespace TypeRacerServer.Core.Application.Models.RoomResults;

public record JoinRoomResult
{
    public bool isSucces {get; set;}
    public bool NeedsLobbySetup {get; set;}
    public RoomState? State {get; set;}
    public string? TextToLoad {get; set;}
}