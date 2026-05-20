using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Requests.AccountManager;

public class RegisterRequestByMe{
    public string Username {get; set;} = string.Empty;
    public string Password {get; set;} = string.Empty;
}