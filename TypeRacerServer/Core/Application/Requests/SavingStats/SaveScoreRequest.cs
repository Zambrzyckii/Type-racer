using TypeRacerServer.Core.Domain.ValueObjects;
namespace TypeRacerServer.Core.Application.Requests.SavingStats;

public class SaveScoreRequest{
    public string Username {get; set;} = string.Empty;
    public uint WPM {get; set;}
    public bool isWinner {get; set;}
}
