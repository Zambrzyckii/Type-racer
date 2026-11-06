using TypeRacerServer.Core.Application.Models.RoomResults;

namespace TypeRacerServer.Core.Application.Models.PostGameResults;

public record PerformCleanupResult
{
    public bool isRemoved {get; set;}
    public bool isRommEmpty {get; set;}
    public RoomState? roomStateInfo {get; set;}
    public string roomCode {get; set;} = string.Empty;
}