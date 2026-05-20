namespace TypeRacerServer.Core.Application.Models.PostGameResults;

public record SendProgressResult
{
    public int Progress {get; set;} = 0;
    public int Wpm {get; set;} = 0;
    public bool HasError {get; set;} = false;
    public bool IsSuccess {get; set;} = false;
    public bool IsDone {get; set;} = false;
    public string? PowerUpGrant {get; set;} = null;
    public string? BuffToGrant {get; set;} = null;
    public bool TriggerHardModeFail {get; set;} = false;
    public bool ShouldEndGameImmediately {get; set;} = false;
    public bool ShouldStartEndGameTimer {get; set;} = false;
    public int SecondsToEnd {get; set;} = 0;
    public string RoomCode {get; set;} = string.Empty;
    public string PlayerNick {get; set;} = string.Empty;
}