using TypeRacerServer.Core.Application.Interfaces.AccountManagerInterfaces;
using TypeRacerServer.Core.Application.Requests.AccountManager;
using TypeRacerServer.Core.Domain.ValueObjects;

namespace TypeRacerServer.Core.Application.Services.AccountManager;

public class RegisterService(IRegisterRepository _repository)
{
    public async Task RegisterHandler(RegisterRequestByMe request)
    {
        bool isNicknameTaken = await _repository.Exists(request.Username);
        if(isNicknameTaken){
            throw new InvalidOperationException("Username already exists");
        }
        
        var usernameSave = request.Username;
        var  passwordSave = request.Password;
        await _repository.SaveNewUser(usernameSave, BCrypt.Net.BCrypt.HashPassword(passwordSave));
    }
}