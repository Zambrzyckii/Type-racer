namespace TypeRacerServer.Core.Application.Models.PreGameResults;

public record StartRoomGameResult
{
    public bool isSucces {get; set;}
    public string? TargetText {get; set;}
}