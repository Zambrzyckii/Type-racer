using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;

public interface IRegisterRepository
{
    Task<bool> Exists(string Username);
    Task SaveNewUser(string nickname, string password);
}