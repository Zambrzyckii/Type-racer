namespace TypeRacerServer.Core.Application.Models.PostGameResults;

public record RestartGameResult
{
    public bool isDone { get; set; } = false;
    public string roomCode { get; set; } = string.Empty;
}