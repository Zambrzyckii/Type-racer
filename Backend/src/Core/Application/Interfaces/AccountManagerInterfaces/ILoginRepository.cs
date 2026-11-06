using TypeRacerServer.Core.Domain.Entities;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;

public interface ILoginRepository
{
     Task<User?> Login(string Nickname);
}